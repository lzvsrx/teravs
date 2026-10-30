"""Build reviewed research tables. This does not add AI features to the app."""
import csv
import json
import pathlib
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'pesquisa'

def load(name, delimiter=','):
    with (OUT / name).open(encoding='utf-8-sig', newline='') as source:
        return list(csv.DictReader(source, delimiter=delimiter))

def write(name, rows):
    with (OUT / name).open('w', encoding='utf-8-sig', newline='') as target:
        writer = csv.DictWriter(target, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

def run():
    sources = json.loads((OUT / 'fontes.json').read_text(encoding='utf-8'))
    source_ids = {s['id'] for s in sources}
    services = load('servicos-fonte.csv', '|')
    areas = load('areas-fonte.csv', '|')
    documents = []
    for i, row in enumerate(services, 1):
        row['id'] = f'SRV{i:03}'
        row['natureza'] = 'Catálogo técnico/editorial; capacidade depende de modelos, ferramentas e avaliação'
    for i, row in enumerate(areas, 1):
        row['id'] = f'AREA{i:03}'
        row['natureza_mapeamento'] = 'Proposta editorial a validar; não é lista oficial de obrigações'
        docs = [d.strip() for d in row['documentos_sugeridos'].split(';') if d.strip()]
        assert len(docs) >= 4, row['area']
        for doc in docs:
            documents.append({
                'id': f'DOC{len(documents)+1:04}', 'area_id': row['id'], 'area': row['area'],
                'profissoes_exemplos': row['profissoes_exemplos'], 'documento': doc,
                'entradas_base_da_area': row['entradas_base'],
                'formatos_a_confirmar_para_o_documento': row['formatos_sugeridos'],
                'periodicidade': 'Conforme a atividade; confirmar com profissional, não necessariamente diário',
                'validacao_especifica': row['validacao_especifica'],
                'natureza': row['natureza_mapeamento'],
                'estado_no_teravs': 'Sugestão de catálogo; exportação e fluxo profissional ainda precisam de implementação e testes',
                'fontes_de_contexto': row['fontes']
            })
    for row in services + areas:
        assert set(row['fontes'].split(';')) <= source_ids, row
        assert all(str(v).strip() for v in row.values()), row
    cbo = load('bases/cbo-ocupacoes.csv')
    synonyms = load('bases/cbo-sinonimos.csv')
    isco = load('bases/isco-estrutura.csv')
    titles = load('bases/isco-indice.csv')
    codes = {row['CODIGO'] for row in cbo}
    isco_codes = {row['unit'] for row in isco}
    assert len(isco_codes) == 436
    assert len({row['major'] for row in isco}) == 10
    assert all(row['CODIGO'].isdigit() and len(row['CODIGO']) == 6 for row in cbo)
    assert all(row['ISCO-08'] in isco_codes for row in titles)
    assert len(codes) == len(cbo)
    unknown_synonyms = [r for r in synonyms if r['CODIGO'] not in codes]
    counts = {'consultado_em': '2026-10-30', 'servicos_catalogados': len(services), 'areas_de_rotina': len(areas), 'documentos_sugeridos': len(documents), 'ocupacoes_cbo_no_csv_obtido': len(cbo), 'sinonimos_cbo_no_csv_obtido': len(synonyms), 'grupos_isco08': len(isco), 'titulos_ingleses_isco08': len(titles), 'sinonimos_sem_codigo_correspondente_no_csv_obtido': len(unknown_synonyms), 'fontes_de_referencia': len(sources), 'observacao': 'Não somar bases para obter total único; existem sobreposições. A relação profissão-documento é editorial e não foi validada individualmente para todos os títulos.'}
    write('servicos-ia.csv', services)
    write('areas-e-rotinas.csv', areas)
    write('documentos-por-area.csv', documents)
    (OUT / 'resumo.json').write_text(json.dumps(counts, indent=2, ensure_ascii=False), encoding='utf-8')
    (OUT / 'catalogo.json').write_text(json.dumps({'metadados': counts, 'servicos': services, 'areas': areas, 'documentos': documents, 'fontes': sources}, ensure_ascii=False, indent=2), encoding='utf-8')
    def md(value):
        return str(value).replace('|', '\\|').replace('\n', ' ')
    service_lines = ['# Serviços de IA: catálogo de pesquisa', '', 'Consulta: 30/10/2026. Proposta técnica/editorial, não inventário de funções já entregues. Consulte [escopo e fontes](README.md).', '', '| ID | Família / serviço | Entradas | Saídas e formatos possíveis | Infraestrutura | Validação | Situação no Teravs | Fontes de contexto |', '|---|---|---|---|---|---|---|---|']
    for r in services:
        service_lines.append('| ' + ' | '.join(md(v) for v in [r['id'], r['categoria'] + ' / ' + r['servico'], r['entradas'], r['saidas_e_formatos'], r['infraestrutura'], r['validacao'], r['situacao_teravs'], r['fontes']]) + ' |')
    (OUT / 'SERVICOS.md').write_text('\n'.join(service_lines) + '\n', encoding='utf-8')
    area_lines = ['# Áreas de trabalho e documentos sugeridos', '', 'Estas relações são propostas editoriais: não são exigências oficiais atribuídas à CBO, à OIT ou ao O*NET. Não houve validação individual para cada título profissional. A frequência varia por atividade. Consulte [escopo, limites e fontes](README.md).', '', '| Área | Exemplos de profissionais | Documentos propostos | Dados de entrada | Revisão necessária | Formatos a confirmar | Fontes de contexto |', '|---|---|---|---|---|---|---|']
    for r in areas:
        area_lines.append('| ' + ' | '.join(md(r[k]) for k in ['area', 'profissoes_exemplos', 'documentos_sugeridos', 'entradas_base', 'validacao_especifica', 'formatos_sugeridos', 'fontes']) + ' |')
    (OUT / 'ROTINAS.md').write_text('\n'.join(area_lines) + '\n', encoding='utf-8')

    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment
    wb = Workbook()
    intro = wb.active
    intro.title = 'LEIA-ME'
    for key, value in counts.items():
        intro.append([key, value])
    intro.append(['Importante', 'Pesquisa e propostas de catálogo; não certifica geração funcional no Teravs.'])
    intro.append(['Cobertura', 'CBO: Brasil; ISCO: classificação internacional e títulos em inglês; não constituem cadastro universal de todos os nomes locais de emprego.'])
    intro.append(['Documentos', 'Os nomes e formatos de documentos são propostas editoriais. A fonte de contexto não significa obrigação legal nem confirmação individual de necessidade.'])
    tables = [('Servicos IA', services), ('Areas e rotinas', areas), ('Documentos', documents), ('CBO ocupacoes', cbo), ('CBO sinonimos', synonyms), ('ISCO grupos', isco), ('ISCO titulos', titles), ('Fontes', sources)]
    for name, rows in tables:
        sheet = wb.create_sheet(name)
        sheet.append(list(rows[0]))
        for row in rows:
            sheet.append(list(row.values()))
        sheet.freeze_panes = 'A2'
        sheet.auto_filter.ref = sheet.dimensions
    for sheet in wb:
        for cell in sheet[1]:
            cell.fill = PatternFill('solid', fgColor='183D35')
            cell.font = Font(color='FFFFFF', bold=True)
        for column in sheet.columns:
            letter = column[0].column_letter
            width = min(65, max(16, max(len(str(cell.value or '')) for cell in list(column)[:150]) * .7))
            sheet.column_dimensions[letter].width = width
            for cell in column:
                cell.alignment = Alignment(vertical='top', wrap_text=True)
                if isinstance(cell.value, str):
                    # Labels from external sources remain text, never executable formulas.
                    cell.data_type = 's'
                    if cell.value.startswith('https://'):
                        cell.hyperlink = cell.value
        if sheet.title in ['Servicos IA', 'Areas e rotinas', 'Documentos']:
            for row in range(2, sheet.max_row + 1):
                sheet.row_dimensions[row].height = 70
    intro.column_dimensions['B'].width = 100
    wb.save(OUT / 'Teravs-pesquisa-servicos-profissoes.xlsx')
    # Reopen the actual XLSX to verify row counts and preserve occupation codes.
    from openpyxl import load_workbook
    check = load_workbook(OUT / 'Teravs-pesquisa-servicos-profissoes.xlsx', read_only=True)
    assert check['CBO ocupacoes'].max_row == len(cbo) + 1
    assert check['Documentos'].max_row == len(documents) + 1
    assert check['ISCO grupos'].max_row == 437
    assert check['CBO ocupacoes']['A2'].value == cbo[0]['CODIGO']
    check.close()
    print(json.dumps(counts, ensure_ascii=True), flush=True)

if __name__ == '__main__':
    run()
