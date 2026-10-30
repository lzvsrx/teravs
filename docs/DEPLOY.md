# Publicação do Teravs

## Arquitetura

```text
GitHub Pages / Android / Windows
             |
             | HTTPS, sessão aleatória por dispositivo
             v
       Serviço Teravs (Node.js)
          |              |
          v              v
 PostgreSQL online   Inferência Ollama
          |
   Memórias consentidas
```

O GitHub Pages hospeda apenas os arquivos estáticos. Não executa o servidor Node, não hospeda o banco nem fornece GPU. A interface sozinha não torna a IA online.

## Código e interface no GitHub

O workflow `.github/workflows/pages.yml` compila e publica `dist/` a cada push em `main`. No repositório, configure **Settings → Pages → Source → GitHub Actions**. O workflow não precisa de um token pessoal: usa o token temporário do GitHub.

Depois de publicar o serviço de API, defina a variável pública de repositório `TERAVS_API_URL` para a origem HTTPS do serviço (sem `/api`). Reexecute o workflow. Nenhuma chave de banco ou de modelo deve entrar em variável `VITE_*`, JavaScript, APK ou repositório.

## Serviço e banco online

`render.yaml` prepara uma API Docker e um PostgreSQL separados. Ele é uma configuração pronta para aplicar, não uma implantação já realizada. Os planos indicados podem gerar cobranças no provedor. A conta de hospedagem precisa estar conectada e o endpoint de inferência precisa existir.

1. Conecte o repositório ao Render e crie o Blueprint.
2. Configure `OLLAMA_URL` com uma origem HTTPS de inferência privada/acessível ao serviço. Um endereço `127.0.0.1` em um servidor de nuvem aponta para esse servidor, não para o computador Windows.
3. Defina `ALLOWED_ORIGINS` com as origens exatas de GitHub Pages e Android. Exemplo: `https://lzvsrx.github.io,https://localhost,http://localhost`. Adicione `null` apenas quando o aplicativo desktop precisar chamar uma API remota a partir de arquivo local.
4. O Blueprint conecta `DATABASE_URL` ao PostgreSQL. As tabelas são criadas no primeiro início do serviço. SQLite serve apenas para instalação local; não use um disco efêmero para dados de produção.
5. Verifique `/api/health`, salve e apague uma memória com dois dispositivos/sessões e confirme que os dados permanecem isolados.
6. Configure a variável `TERAVS_API_URL` no GitHub e faça nova compilação.

## Android

Compile com `VITE_TERAVS_API_URL` apontando para a API HTTPS. Execute `npm run android:sync` e `gradlew.bat assembleDebug` dentro de `android/`, usando JDK 21. Sem essa configuração, o APK não alcança o serviço do computador. Não há tela para o usuário configurar provedores.

## Segurança e limites antes de distribuir amplamente

A sessão usa uma chave aleatória de 256 bits mantida no dispositivo, enviada como bearer e indexada no banco apenas por hash SHA-256. É uma credencial de dispositivo, não uma conta recuperável ou login entre aparelhos. Não há recuperação quando o armazenamento local é apagado. O usuário pode exportar o histórico e excluir memórias antes de limpar o dispositivo.

As consultas SQL são parametrizadas e filtradas pelo proprietário; dados brutos e stacks não são enviados ao cliente em erros. Histórico completo não é gravado no banco. O opt-in grava resumos por truncamento de pergunta/resposta, até 2.000 caracteres por troca e 100 registros; não é treinamento global.

O serviço limita tamanho, solicitações por sessão e gerações simultâneas. Para produção pública de grande porte, adicione login recuperável, limites globais de rede/conta, monitoramento sem registrar prompts, política de retenção, backups e avaliações de acessibilidade. CORS não substitui autenticação e uma chave de dispositivo não impede abuso de criação de novas sessões.

## IA própria

O serviço, roteamento, recuperação de memória, interface e controles são código do Teravs. O modelo de linguagem atual é **Qwen3 4B**, executado por Ollama. Não foi treinado do zero neste projeto. Treinar pesos próprios exige corpus licenciado, tokenizador, arquitetura, treinamento em hardware adequado e avaliação; renomear um modelo existente não o torna um modelo novo.

## Referências

- [GitHub Pages: hospedagem estática](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Render Blueprints](https://render.com/docs/blueprint-spec)
- [Ollama Chat API](https://docs.ollama.com/api/chat)
- [MediaWiki Search API](https://www.mediawiki.org/wiki/API:Search)
