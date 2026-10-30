# Supabase do Teravs

Projeto: `pzrzemrnmexgncmciofy`. A URL e a chave publishable fornecidas pelo proprietário estão em `config/supabase-public.json`. São configurações públicas de aplicativo, não acesso administrativo. Podem ser substituídas por variáveis de ambiente. Nenhuma senha de banco, chave secret ou token de administração foi incluído.

## Verificação real realizada

A URL respondeu HTTP 200 em `/auth/v1/settings` com a chave pública, cadastro por e-mail habilitado e confirmação de e-mail obrigatória. A consulta sem linhas à tabela `teravs_memories` retornou `PGRST205`: a tabela ainda não existe no projeto. Portanto, a memória online ainda não está pronta para gravar.

## Aplicar a estrutura no banco

Abra o [SQL Editor deste projeto](https://supabase.com/dashboard/project/pzrzemrnmexgncmciofy/sql/new), copie o conteúdo de [202610300001_teravs_memories.sql](../supabase/migrations/202610300001_teravs_memories.sql) e execute. Alternativamente, uma conexão administrativa autenticada com o Supabase permite aplicar a mesma migração. A chave publishable não pode executar DDL ou administrar o projeto.

O SQL cria uma tabela separada, sem importar ou apagar registros anteriores. Inclui:

- Proprietário vinculado a `auth.users`, removendo memórias quando a conta é excluída.
- RLS para leitura, inserção e exclusão somente pelo próprio usuário autenticado.
- Nenhuma permissão para visitantes anônimos; nenhuma atualização arbitrária de conteúdo/proprietário.
- Consentimento obrigatório, conteúdo limitado a 2.000 caracteres e limite de 100 memórias por usuário, verificado também no banco.
- Controle de concorrência para que inserções paralelas não ultrapassem o limite.

## Configurar os links de confirmação

Em Authentication → URL Configuration, configure:

```text
Site URL: https://lzvsrx.github.io/teravs/?view=chat
Redirect URL permitida: https://lzvsrx.github.io/teravs/
                       https://lzvsrx.github.io/teravs/?view=chat
Redirect URLs Android: teravs://auth/callback
                       teravs://auth/callback?**
```

O cadastro solicita confirmação por e-mail. Depois da confirmação, o usuário pode entrar no site ou no aplicativo usando e-mail e senha. Em 30/10/2026, foi solicitado um link real para um endereço autorizado pelo proprietário; a API respondeu com sucesso, sem sessão autenticada. Isso comprova a aceitação da solicitação, mas o recebimento, o destino do link e a confirmação da conta ainda dependem de validação pelo destinatário. Nenhuma senha foi criada para esse teste: foi usado um link de acesso por e-mail. Ao retornar com um link do tipo `magiclink`, o aplicativo pede que a pessoa escolha sua senha.

O aplicativo preserva somente o e-mail pendente no armazenamento local, inclusive ao fechar e abrir novamente. Uma sessão autenticada remove essa informação; senha e link de confirmação não são guardados por esse fluxo. Links expirados mostram uma mensagem e têm os parâmetros removidos da URL; limites de envio mostram uma orientação para aguardar. O SDK oficial processa os links de confirmação e recuperação.

### Retorno ao aplicativo Android

O Android recebe `teravs://auth/callback` por um intent BROWSABLE restrito ao host e caminho declarados. O plugin oficial `@capacitor/app` entrega links tanto com o processo aberto quanto no início. Cadastro, reenvio e recuperação solicitados no Android usam esse retorno, com PKCE e verificador mantido pelo SDK oficial. O código recebido pelo link só cria sessão após a troca validada no Supabase; não são aceitos access tokens ou refresh tokens fornecidos no fragmento do deep link. O handler deduplica os dois eventos possíveis do mesmo link, valida o destino exato e não imprime o código.

A recuperação mantém o formulário de nova senha até salvar. Se o link for aberto em outro aparelho ou em uma instalação que não tem o verificador, o aplicativo orienta a voltar ao aparelho de origem ou entrar com senha depois de confirmar o e-mail. Links antigos podem continuar abrindo o site: o botão **Já confirmei: entrar com minha senha** preenche o e-mail pendente e permite concluir o login no app, inclusive no Windows. Para testar o novo retorno, peça uma nova confirmação na versão atualizada do Android e abra no mesmo aparelho; não reutilize um link antigo ou já consumido.

As URLs Android foram aplicadas ao projeto Supabase online. O destino solicitado pelo Android é `teravs://auth/callback?view=chat`; no site é `https://lzvsrx.github.io/teravs/?view=chat`, também configurado como Site URL. Após autenticação validada, a tela principal de conversa é selecionada e os parâmetros sensíveis são removidos da URL visível. A recuperação só abre essa tela depois de salvar a nova senha. O parâmetro `view=chat` não permite contornar o login.

Os testes automatizados verificam a troca PKCE real do SDK contra respostas simuladas, a correlação do verificador SHA-256, início a frio, app aberto, recuperação, ausência de verificador, destino inválido e deduplicação. Isso não comprova recebimento de um novo e-mail real.

Uma tentativa de configurar confirmação por código foi recusada pelo serviço com HTTP 400: alteração de template exige SMTP próprio ou upgrade no projeto gratuito com remetente padrão. O template não foi aplicado e a interface não oferece um campo de código que o e-mail atual não entrega. A correção usa o link padrão, sem desativar confirmação, mudar plano ou aumentar limites de envio.

O destinatário confirmou o recebimento do e-mail de teste, mas informou que o link levou a `localhost:3000`. Após autenticação administrativa pelo fluxo oficial do Supabase CLI, as duas URLs acima foram aplicadas ao projeto online. A comparação posterior confirmou zero alterações pendentes nesses dois campos, preservando a confirmação obrigatória e as demais configurações. Um novo pedido de e-mail foi bloqueado com HTTP 429 (`over_email_send_rate_limit`); a navegação completa por um link novo continua pendente. Links antigos podem conservar o destino anterior.

### Entrega de e-mail em produção

Diagnóstico e configuração local para Gmail sem domínio próprio: [ENVIO-EMAIL.md](ENVIO-EMAIL.md). O SMTP só estará ativo após fornecer uma credencial válida; preparar o script não ativa o serviço.

Segundo a [documentação oficial de SMTP](https://supabase.com/docs/guides/auth/auth-smtp), o remetente padrão tem restrições de destinatários e limites baixos; configure SMTP próprio para cadastro público. A alteração administrativa realizada nesta tarefa limitou-se às URLs de retorno; nenhum provedor SMTP ou template foi alterado. O sucesso de uma solicitação para um destinatário não comprova envio para todos os usuários. A chave pública não permite realizar esses ajustes administrativos.

No painel Authentication, configure um provedor SMTP com domínio/remetente verificado, mantenha a confirmação de e-mail habilitada e confira os limites de envio. Use `{{ .ConfirmationURL }}` nos botões dos templates de confirmação e recuperação, preservando o tipo do link. Nunca substitua o link por uma URL fixa do site: isso não confirma a conta. Consulte [templates](https://supabase.com/docs/guides/auth/auth-email-templates) e [redirecionamentos](https://supabase.com/docs/guides/auth/redirect-urls).

O formulário inicial permite entrar, criar conta com confirmação de senha, reenviar a confirmação e recuperar a senha. O link de recuperação abre a tela para escolher e confirmar uma nova senha. Sem login, a interface fica oculta e inativa; a API rejeita requisições de convidados à IA e às memórias.

## Validar depois de aplicar

Crie duas contas reais sob seu controle e confirme os e-mails. Entre na conta A, ative o consentimento em Minha memória e salve um registro. Confira que a conta B não pode ler ou excluir esse registro. Teste também o limite, exclusão e saída da conta. Não coloque dados reais sensíveis antes dessa validação do ambiente online.

O código de login e memória usa o SDK oficial com a chave pública e o JWT de cada pessoa. O serviço de IA verifica o token em Supabase Auth e consulta o banco com o mesmo JWT, preservando RLS. Não utiliza chave secret para ignorar regras de acesso.

## Testes locais

`npm run test:server` inclui execução do SQL em PostgreSQL embarcado (PGlite), exercitando isolamento entre dois usuários, rejeição de proprietário incorreto e ausência de consentimento, limite, exclusão e bloqueio de visitante anônimo. Isso valida a migração localmente, mas não significa que ela foi aplicada ao Supabase online.

Os testes de navegador simulam a API de autenticação e de dados, verificam login, consentimento, exclusão, cadastro com confirmação e limpeza da tela ao sair. A senha não é salva pelo código do Teravs; o SDK mantém a sessão autenticada no dispositivo.

## Implantação

O GitHub Pages pode oferecer login e memória diretamente pelo Supabase após a migração e os redirecionamentos. A geração de respostas ainda exige publicar a API Teravs e o motor de inferência; Supabase não os substitui.

O `render.yaml` agora cria somente a API, sem provisionar um segundo banco pago. Memórias de produção usam Supabase. O SQLite temporário é legado para conversas locais sem conta e não deve guardar memórias online. Históricos de convidados não são transferidos automaticamente para contas autenticadas.
