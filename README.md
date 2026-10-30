# Teravs 0.3

Assistente inclusivo para Windows, Android e web. Elo, uma órbita turquesa, é o personagem. Interface em português, estúdio criativo, apoio contextual por profissão e memória opcional.

Integração Supabase preparada com login por e-mail e senha e memória por usuário. A URL e a chave pública foram verificadas; a tabela online ainda precisa receber a [migração SQL](supabase/migrations/202610300001_teravs_memories.sql). Veja [a configuração do projeto Supabase](docs/SUPABASE.md).

O aplicativo começa na tela de login. O cadastro inclui nome, e-mail, senha e confirmação; há telas de confirmação de e-mail e recuperação/alteração de senha. A IA exige uma sessão válida, verificada também na API. Sair bloqueia novamente o aplicativo.

[Repositório](https://github.com/lzvsrx/teravs) · [Interface no GitHub Pages](https://lzvsrx.github.io/teravs/) · [Versões para download](https://github.com/lzvsrx/teravs/releases)

## O que mudou

- A tela **Conectar IA** foi removida. O aplicativo usa o serviço do Teravs; configuração de infraestrutura fica com quem publica o projeto.
- Estúdio para textos, documentos, código e ilustrações vetoriais SVG com visualização e download.
- Pesquisa online na Wikipédia com referências recuperadas pelo serviço. Não é uma busca geral de toda a internet.
- Memória consentida, listagem e exclusão. Informações de uma sessão não são usadas em outra.
- Serviço Node.js com SQLite local ou PostgreSQL online, validação de entrada, limites e isolamento por chave de dispositivo.
- Workflow de GitHub Pages e configuração Docker/Render para API e banco.

## Executar no Windows

Neste computador, Ollama e `qwen3:4b` já foram instalados. Use `Iniciar-Teravs.ps1` para iniciar o motor e o executável mais recente. A inferência foi configurada para CPU devido à incompatibilidade do driver de GPU local.

Para desenvolver, com Node.js 24 ou superior:

```powershell
npm.cmd ci
npm.cmd run dev:all
```

Para abrir o aplicativo desktop: `npm.cmd start`. O Electron inicia o serviço local automaticamente; o Ollama deve estar rodando. Preferências de acessibilidade incluem texto ampliado, alto contraste, linguagem simples, teclado e recursos de voz disponíveis no dispositivo.

## Verificar e empacotar

```powershell
npm.cmd run build
npm.cmd run test:server
npm.cmd test
npm.cmd run package:windows -- --config.compression=store
npm.cmd run android:sync
```

Android usa JDK 21, SDK 36 e Gradle. Para APK: execute `gradlew.bat assembleDebug` dentro de `android/`. APKs de depuração não são versões prontas para loja. A versão Windows não é assinada digitalmente.

## Hospedagem

Consulte [docs/DEPLOY.md](docs/DEPLOY.md). GitHub Pages hospeda a interface; o serviço de IA e o banco exigem infraestrutura separada. A presença de `render.yaml` não significa que serviços ou banco já foram criados. Para Android e web online, a API HTTPS é configurada na compilação com `VITE_TERAVS_API_URL`.

## Memória e privacidade

O histórico da interface fica no dispositivo, separado por conta. A memória online exige login e começa desativada para cada usuário. Ao autorizar, novas trocas concluídas podem ser armazenadas no Supabase, até 2.000 caracteres por troca e 100 registros por usuário. É possível consultar e apagar todos os registros. Desativar impede uso e novas gravações, mas não apaga memórias existentes. A pesquisa envia o pedido atual à Wikipédia somente no modo de pesquisa.

Memórias autorizadas e o histórico da conversa são enviados ao motor para responder. O login permite acessar memórias em aparelhos diferentes, depois de aplicar as regras do banco. Sair remove as informações da tela e preserva o histórico local da conta para o próximo login nesse dispositivo. Não há importação automática de dados anteriores de convidados. O SDK guarda a sessão; a senha não é salva pelo código do Teravs. Configurações publishable são públicas; credenciais administrativas nunca entram no aplicativo ou no Git.

## Limites reais

O código do aplicativo e do serviço é do projeto. O modelo de linguagem atual é **Qwen3 4B via Ollama**, não um modelo treinado do zero. Memória não altera pesos e não significa aprendizado global de todas as conversas. O projeto não oferece geração de fotos realistas, vídeos, música, Libras ou automação de tarefas externas. Ilustrações SVG são desenhos gerados por código. Texto de código é exibido e exportado, nunca executado automaticamente.

Não há garantia de acerto ou cobertura de todas as profissões e deficiências. Acessibilidade precisa de testes com usuários e tecnologias assistivas. Conteúdos profissionais exigem revisão humana apropriada.
