"""Build the dated, non-exhaustive legal research artifacts from authored rows."""
import csv
import json
from pathlib import Path
from urllib.parse import urlparse
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'legal'

def read(name):
    with (OUT / name).open(encoding='utf-8-sig', newline='') as source:
        return list(csv.DictReader(source, delimiter='|'))

def csv_out(name, rows):
    with (OUT / name).open('w', encoding='utf-8-sig', newline='') as target:
        writer = csv.DictWriter(target, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

def main():
    instruments = read('mapa-fonte.csv')
    controls = read('controles-fonte.csv')
    for collection in [instruments, controls]:
        assert len({row['id'] for row in collection}) == len(collection)
        assert all(all(value.strip() for value in row.values()) for row in collection)
    for row in instruments:
        assert urlparse(row['fonte_oficial']).scheme == 'https'
        row['consultado_em'] = '2026-10-30'
    csv_out('mapa-regulatorio.csv', instruments)
    csv_out('controles.csv', controls)
    meta = {'consultado_em': '2026-10-30', 'instrumentos_selecionados': len(instruments), 'entradas_de_jurisdicao': len({r['jurisdicao'] for r in instruments}), 'controles_avaliados': len(controls), 'escopo': 'Pesquisa internacional inicial, não exaustiva; não certifica conformidade em todos os países nem implementação dos controles.'}
    (OUT / 'mapa-regulatorio.json').write_text(json.dumps({'metadados': meta, 'instrumentos': instruments, 'controles': controls}, indent=2, ensure_ascii=False), encoding='utf-8')
    def md(value):
        return value.replace('|', '\\|').replace('\n', ' ')
    lines = ['# Mapa internacional de regras de IA', '', 'Consulta: 30/10/2026. Recorte de instrumentos oficiais. Não é análise exaustiva de cada país, setor ou regra local. Consulte [escopo e limites](README.md).', '', '| ID | Jurisdição | Instrumento / natureza | Situação na consulta | Aplicabilidade a verificar | Medida proposta | Fonte oficial |', '|---|---|---|---|---|---|---|---|']
    for row in instruments:
        values = [row['id'], row['jurisdicao'], row['instrumento'] + ' / ' + row['natureza'], row['situacao_em_2026_10_30'], row['gatilho_de_aplicabilidade'], row['medida_a_avaliar_no_teravs'], '[Fonte](' + row['fonte_oficial'] + ')']
        lines.append('| ' + ' | '.join(map(md, values)) + ' |')
    (OUT / 'MAPA.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    lines = ['# Checklist de governança e implementação', '', 'Medidas propostas para avaliação jurídica e técnica. O status descreve evidências de código e pendências, não aprovação legal. Consulta: 30/10/2026. [Escopo](README.md).', '', '| ID | Tema | Medida | Fundamento / contexto | Situação observada | Pendência / evidência |', '|---|---|---|---|---|---|']
    for row in controls:
        lines.append('| ' + ' | '.join(md(value) for value in row.values()) + ' |')
    (OUT / 'CHECKLIST.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    wb = Workbook()
    intro = wb.active
    intro.title = 'LEIA-ME'
    for key, value in meta.items():
        intro.append([key, value])
    intro.append(['Criador e titular dos elementos originais', 'Luiz Otavio Valenzi Sousa; sujeito ao escopo da declaração AUTHORSHIP.md e aos direitos de terceiros.'])
    for name, rows in [('Mapa regulatorio', instruments), ('Controles', controls)]:
        sheet = wb.create_sheet(name)
        sheet.append(list(rows[0]))
        for row in rows:
            sheet.append(list(row.values()))
        sheet.auto_filter.ref = sheet.dimensions
        sheet.freeze_panes = 'A2'
    for sheet in wb:
        for cell in sheet[1]:
            cell.fill = PatternFill('solid', fgColor='183D35')
            cell.font = Font(bold=True, color='FFFFFF')
        for column in sheet.columns:
            sheet.column_dimensions[column[0].column_letter].width = 48
            for cell in column:
                cell.alignment = Alignment(wrap_text=True, vertical='top')
                if isinstance(cell.value, str):
                    cell.data_type = 's'
                    if cell.value.startswith('https://'):
                        cell.hyperlink = cell.value
        for i in range(2, sheet.max_row + 1):
            sheet.row_dimensions[i].height = 85
    filename = OUT / 'Teravs-mapa-legal-e-direitos.xlsx'
    wb.save(filename)
    check = load_workbook(filename, read_only=True)
    assert check['Mapa regulatorio'].max_row == len(instruments) + 1
    assert check['Controles'].max_row == len(controls) + 1
    check.close()
    print(json.dumps(meta, ensure_ascii=True))

if __name__ == '__main__':
    main()
