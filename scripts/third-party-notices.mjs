import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'docs/legal/third-party');
await fs.mkdir(out, { recursive: true });
const lock = JSON.parse(await fs.readFile(path.join(root, 'package-lock.json'), 'utf8'));
const rows = [];
for (const [relative, info] of Object.entries(lock.packages)) {
  if (!relative.startsWith('node_modules/') || (info.dev && relative !== 'node_modules/electron')) continue;
  const name = relative.replace(/^node_modules\//, '');
  const directory = path.join(root, relative);
  const snapshots = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !/^(licen[sc]e|copying|notice)(\.|$)/i.test(entry.name)) continue;
    const dest = name.replace(/[^a-z0-9.-]/gi, '_') + '-' + info.version + '-' + entry.name;
    await fs.copyFile(path.join(directory, entry.name), path.join(out, dest)); snapshots.push(dest);
  }
  rows.push({ name, version: info.version, declaredLicense: info.license || 'Verificar no pacote', licenseFiles: snapshots });
}
let modelNotice = 'Não foi possível consultar o modelo local nesta execução; verifique a licença do artefato antes de distribuir pesos.';
try {
  const response = await fetch('http://127.0.0.1:11434/api/show', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'qwen3:4b' }), signal: AbortSignal.timeout(10000) });
  const model = await response.json();
  if (response.ok && typeof model.license === 'string' && model.license.trim()) {
    await fs.writeFile(path.join(out, 'qwen3-4b-local-LICENSE.txt'), model.license);
    modelNotice = 'A licença retornada pelo artefato local qwen3:4b foi preservada em docs/legal/third-party/qwen3-4b-local-LICENSE.txt. Ela declara Apache License 2.0. Os pesos não são incluídos no aplicativo.';
  }
} catch { /* Keep the verification limit explicit in the generated notice. */ }
await fs.writeFile(path.join(out, 'inventory.json'), JSON.stringify({ collectedOn: '2026-10-30', scope: 'Dependências npm de produção do lockfile e pacote Electron; não é auditoria exaustiva de todos os componentes binários, modelos ou fontes de dados.', packages: rows }, null, 2));
const table = rows.map(row => `| ${row.name} | ${row.version} | ${row.declaredLicense} | ${row.licenseFiles.length ? row.licenseFiles.map(name => `[${name}](docs/legal/third-party/${name})`).join(', ') : 'Consultar pacote original; arquivo não encontrado na raiz'} |`).join('\n');
await fs.writeFile(path.join(root, 'THIRD_PARTY_NOTICES.md'), `# Componentes e direitos de terceiros\n\nO aviso de direitos reservados do Teravs aplica-se aos elementos originais do projeto. Não substitui as licenças abaixo nem transfere ao criador do Teravs a autoria de componentes externos.\n\n## Inventário de pacotes\n\nColeta: 30/10/2026. Licenças declaradas no package-lock.json; cópias de arquivos encontrados na raiz de cada pacote instalado. O inventário inclui dependências npm de produção e o pacote Electron. Não é uma auditoria exaustiva de componentes nativos, fontes, codecs ou dependências do sistema.\n\n| Pacote | Versão | Licença declarada | Avisos preservados |\n|---|---|---|---|\n${table}\n\n## Motor e modelo\n\n${modelNotice}\n\nReferência do fornecedor: [Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE). A correspondência e a licença do artefato efetivamente distribuído devem ser verificadas em cada versão. Ollama é um motor separado, com seus próprios [avisos e licença](https://github.com/ollama/ollama/blob/main/LICENSE).\n\n## Distribuição e dados\n\nElectron inclui Chromium, Node.js e outros componentes. Preserve os arquivos de licença e avisos incluídos na distribuição do runtime, inclusive LICENSES.chromium.html quando presente; a licença MIT do pacote npm não substitui todos esses avisos. Android e serviços em nuvem também mantêm suas condições.\n\nAs bases CBO e ISCO e as fontes oficiais da pesquisa não são criações exclusivas do Teravs. Preserve a proveniência descrita em [docs/pesquisa](docs/pesquisa/README.md). Uma lista de fontes não concede direitos sobre qualquer material encontrado na internet.\n\nAntes de distribuir novos modelos, mídias, fontes ou bibliotecas, atualize o inventário e verifique separadamente licenças de código, pesos, dados e conteúdo. Não remova avisos obrigatórios nem aplique a reserva de direitos do Teravs a elementos licenciados por terceiros.\n`);
console.log(`Inventário gerado: ${rows.length} pacotes, com avisos de licença preservados.`);
