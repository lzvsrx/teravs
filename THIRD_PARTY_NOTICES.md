# Componentes e direitos de terceiros

O aviso de direitos reservados do Teravs aplica-se aos elementos originais do projeto. Não substitui as licenças abaixo nem transfere ao criador do Teravs a autoria de componentes externos.

## Inventário de pacotes

Coleta: 30/10/2026. Licenças declaradas no package-lock.json; cópias de arquivos encontrados na raiz de cada pacote instalado. O inventário inclui dependências npm de produção e o pacote Electron. Não é uma auditoria exaustiva de componentes nativos, fontes, codecs ou dependências do sistema.

| Pacote | Versão | Licença declarada | Avisos preservados |
|---|---|---|---|
| @capacitor/android | 8.6.0 | MIT | [_capacitor_android-8.6.0-LICENSE](docs/legal/third-party/_capacitor_android-8.6.0-LICENSE) |
| @capacitor/app | 8.1.2 | MIT | [_capacitor_app-8.1.2-LICENSE](docs/legal/third-party/_capacitor_app-8.1.2-LICENSE) |
| @capacitor/core | 8.6.0 | MIT | [_capacitor_core-8.6.0-LICENSE](docs/legal/third-party/_capacitor_core-8.6.0-LICENSE) |
| @supabase/auth-js | 2.118.0 | MIT | [_supabase_auth-js-2.118.0-LICENSE](docs/legal/third-party/_supabase_auth-js-2.118.0-LICENSE) |
| @supabase/functions-js | 2.118.0 | MIT | [_supabase_functions-js-2.118.0-LICENSE](docs/legal/third-party/_supabase_functions-js-2.118.0-LICENSE) |
| @supabase/phoenix | 0.4.5 | MIT | [_supabase_phoenix-0.4.5-LICENSE.md](docs/legal/third-party/_supabase_phoenix-0.4.5-LICENSE.md) |
| @supabase/postgrest-js | 2.118.0 | MIT | [_supabase_postgrest-js-2.118.0-LICENSE](docs/legal/third-party/_supabase_postgrest-js-2.118.0-LICENSE) |
| @supabase/realtime-js | 2.118.0 | MIT | [_supabase_realtime-js-2.118.0-LICENSE](docs/legal/third-party/_supabase_realtime-js-2.118.0-LICENSE) |
| @supabase/storage-js | 2.118.0 | MIT | [_supabase_storage-js-2.118.0-LICENSE](docs/legal/third-party/_supabase_storage-js-2.118.0-LICENSE) |
| @supabase/supabase-js | 2.118.0 | MIT | [_supabase_supabase-js-2.118.0-LICENSE](docs/legal/third-party/_supabase_supabase-js-2.118.0-LICENSE) |
| electron | 45.1.0 | MIT | [electron-45.1.0-LICENSE](docs/legal/third-party/electron-45.1.0-LICENSE) |
| iceberg-js | 0.8.1 | MIT | [iceberg-js-0.8.1-LICENSE](docs/legal/third-party/iceberg-js-0.8.1-LICENSE) |
| pg | 8.23.1 | MIT | [pg-8.23.1-LICENSE](docs/legal/third-party/pg-8.23.1-LICENSE) |
| pg-cloudflare | 1.4.1 | MIT | [pg-cloudflare-1.4.1-LICENSE](docs/legal/third-party/pg-cloudflare-1.4.1-LICENSE) |
| pg-connection-string | 2.14.1 | MIT | [pg-connection-string-2.14.1-LICENSE](docs/legal/third-party/pg-connection-string-2.14.1-LICENSE) |
| pg-int8 | 1.0.1 | ISC | [pg-int8-1.0.1-LICENSE](docs/legal/third-party/pg-int8-1.0.1-LICENSE) |
| pg-pool | 3.14.0 | MIT | [pg-pool-3.14.0-LICENSE](docs/legal/third-party/pg-pool-3.14.0-LICENSE) |
| pg-protocol | 1.16.1 | MIT | [pg-protocol-1.16.1-LICENSE](docs/legal/third-party/pg-protocol-1.16.1-LICENSE) |
| pg-types | 2.2.0 | MIT | Consultar pacote original; arquivo não encontrado na raiz |
| pgpass | 1.0.5 | MIT | Consultar pacote original; arquivo não encontrado na raiz |
| postgres-array | 2.0.0 | MIT | [postgres-array-2.0.0-license](docs/legal/third-party/postgres-array-2.0.0-license) |
| postgres-bytea | 1.0.1 | MIT | [postgres-bytea-1.0.1-license](docs/legal/third-party/postgres-bytea-1.0.1-license) |
| postgres-date | 1.0.7 | MIT | [postgres-date-1.0.7-license](docs/legal/third-party/postgres-date-1.0.7-license) |
| postgres-interval | 1.2.0 | MIT | [postgres-interval-1.2.0-license](docs/legal/third-party/postgres-interval-1.2.0-license) |
| split2 | 4.2.0 | ISC | [split2-4.2.0-LICENSE](docs/legal/third-party/split2-4.2.0-LICENSE) |
| tslib | 2.8.1 | 0BSD | [tslib-2.8.1-LICENSE.txt](docs/legal/third-party/tslib-2.8.1-LICENSE.txt) |
| xtend | 4.0.2 | MIT | [xtend-4.0.2-LICENSE](docs/legal/third-party/xtend-4.0.2-LICENSE) |

## Motor e modelo

A licença retornada pelo artefato local qwen3:4b foi preservada em docs/legal/third-party/qwen3-4b-local-LICENSE.txt. Ela declara Apache License 2.0. Os pesos não são incluídos no aplicativo.

Referência do fornecedor: [Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE). A correspondência e a licença do artefato efetivamente distribuído devem ser verificadas em cada versão. Ollama é um motor separado, com seus próprios [avisos e licença](https://github.com/ollama/ollama/blob/main/LICENSE).

## Distribuição e dados

Electron inclui Chromium, Node.js e outros componentes. Preserve os arquivos de licença e avisos incluídos na distribuição do runtime, inclusive LICENSES.chromium.html quando presente; a licença MIT do pacote npm não substitui todos esses avisos. Android e serviços em nuvem também mantêm suas condições.

As bases CBO e ISCO e as fontes oficiais da pesquisa não são criações exclusivas do Teravs. Preserve a proveniência descrita em [docs/pesquisa](docs/pesquisa/README.md). Uma lista de fontes não concede direitos sobre qualquer material encontrado na internet.

Antes de distribuir novos modelos, mídias, fontes ou bibliotecas, atualize o inventário e verifique separadamente licenças de código, pesos, dados e conteúdo. Não remova avisos obrigatórios nem aplique a reserva de direitos do Teravs a elementos licenciados por terceiros.
