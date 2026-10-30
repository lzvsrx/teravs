"""Download factual occupation classifications from their official public sources.

Only labels/codes are extracted. Occupational document suggestions are authored
separately and must not be represented as requirements from these classifications.
"""
import concurrent.futures
import csv
import hashlib
import io
import json
import pathlib
import re
import urllib.request
import xml.etree.ElementTree as ET
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'pesquisa' / 'bases'
OUT.mkdir(parents=True, exist_ok=True)
SOURCES = {
    'cbo-ocupacoes': ['https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads/cbo2002-ocupacao.csv'],
    'cbo-sinonimos': ['https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads/cbo2002-sinonimo.csv'],
    'isco-estrutura': ['https://www.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN.csv', 'https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN.csv'],
    'isco-indice': ['https://www.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20-88%20EN%20Index.xlsx', 'https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20-88%20EN%20Index.xlsx'],
}

def fetch(item):
    name, urls = item
    errors = []
    for url in urls:
        try:
            request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 TeravsResearch/1.0'})
            with urllib.request.urlopen(request, timeout=45) as response:
                data = response.read()
                resolved = response.url
            return name, data, {'url': url, 'resolved_url': resolved, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
        except Exception as error:
            errors.append(str(error))
    return name, None, {'errors': errors, 'attempted_urls': urls}

def read_csv(data):
    encodings = ['utf-16'] if data.startswith((b'\xff\xfe', b'\xfe\xff')) else ['utf-8-sig', 'cp1252']
    for encoding in encodings:
        try:
            text = data.decode(encoding)
            return list(csv.reader(io.StringIO(text), delimiter=';' if text.splitlines()[0].count(';') > text.splitlines()[0].count(',') else ','))
        except (UnicodeError, IndexError):
            pass
    raise ValueError('Unknown encoding')

def xlsx_rows(data):
    ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        shared = []
        if 'xl/sharedStrings.xml' in archive.namelist():
            strings = ET.fromstring(archive.read('xl/sharedStrings.xml'))
            shared = [''.join(node.itertext()) for node in strings.findall('m:si', ns)]
        root = ET.fromstring(archive.read('xl/worksheets/sheet1.xml'))
        rows = []
        for row in root.findall('m:sheetData/m:row', ns):
            values = {}
            for cell in row.findall('m:c', ns):
                letters = ''.join(c for c in cell.attrib['r'] if c.isalpha())
                col = 0
                for letter in letters:
                    col = col * 26 + ord(letter) - 64
                value = cell.findtext('m:v', '', ns)
                if cell.attrib.get('t') == 's':
                    value = shared[int(value)]
                elif cell.attrib.get('t') == 'inlineStr':
                    value = ''.join(t.text or '' for t in cell.findall('m:is//m:t', ns))
                values[col - 1] = value
            if values:
                rows.append([values.get(i, '') for i in range(max(values) + 1)])
        return rows

def run():
    manifest = {'retrieved_on': '2026-10-30', 'sources': {}}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for name, data, meta in pool.map(fetch, SOURCES.items()):
            manifest['sources'][name] = meta
            if data is None:
                print(json.dumps({'name': name, **meta}), flush=True)
                continue
            rows = xlsx_rows(data) if name == 'isco-indice' else read_csv(data)
            meta['source_rows_including_header'] = len(rows)
            if name == 'isco-estrutura':
                rows = [rows[0]] + [row for row in rows[1:] if row[0] == 'ISCO-08']
                for row in rows[1:]:
                    for index, width in [(1, 1), (3, 2), (5, 3), (7, 4)]:
                        row[index] = row[index].zfill(width)
            if name == 'isco-indice':
                rejected = [row for row in rows[1:] if not re.fullmatch(r'\d{4}', row[0])]
                meta['rejected_rows'] = rejected
                rows = [rows[0]] + [row for row in rows[1:] if re.fullmatch(r'\d{4}', row[0])]
            with (OUT / (name + '.csv')).open('w', newline='', encoding='utf-8-sig') as target:
                csv.writer(target).writerows(rows)
            meta['rows_including_header'] = len(rows)
            print(json.dumps({'name': name, 'bytes': len(data), 'rows': len(rows), 'sample': [[str(c)[:100] for c in r] for r in rows[:2]]}, ensure_ascii=True), flush=True)
    (OUT / 'proveniencia.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding='utf-8')

if __name__ == '__main__':
    run()
