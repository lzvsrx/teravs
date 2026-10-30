# Envio de verificacao de e-mail

## Diagnostico em 30/10/2026

O Supabase continua com o remetente padrao, confirmacao obrigatoria e intervalo minimo de 60 segundos por destinatario. O remetente padrao tem limite compartilhado de 2 mensagens por hora e restricoes de destinatarios. Ja foi observado HTTP 429 (`over_email_send_rate_limit`). Isso impede tratar o ambiente como cadastro publico com envio pronto.

Foi verificado apenas o estado da conta do endereco autorizado pelo proprietario: ela ja esta confirmada e ja teve login. Nenhuma senha ou token foi consultado. Repetir o cadastro dessa conta nao dispara outra confirmacao; deve-se entrar com a senha ou usar recuperacao quando necessario. A resposta de cadastro na interface orienta isso de forma generica, sem revelar se um e-mail pertence a uma conta existente.

## Configurar Gmail sem dominio proprio

O script [configure-gmail-smtp.ps1](../scripts/configure-gmail-smtp.ps1) prepara um SMTP autenticado para uma conta Gmail com senha de app. Exige verificacao em duas etapas e disponibilidade de senhas de app na conta Google. Isso e uma opcao inicial de baixo volume; nao garante entrega imediata, ilimitada ou ausencia de spam. Para operacao publica maior, use um servico transacional e um dominio autenticado.

Em uma janela local do PowerShell, execute:

```powershell
cd D:\teravs
.\scripts\configure-gmail-smtp.ps1 -SenderEmail 'seu-endereco@gmail.com'
```

O script pede a senha de app localmente, com entrada oculta. Nao envie senhas pelo chat e nao use sua senha comum do Google. Ele envia um unico teste para o proprio remetente antes de mudar o Supabase. Se o Gmail rejeitar a autenticacao, o Supabase nao e alterado. A aceitacao SMTP desse teste nao comprova recebimento na caixa de entrada.

Depois do teste, aplica somente SMTP, confirmacao obrigatoria e limite inicial de 10 e-mails por hora. A autenticacao administrativa do Supabase CLI precisa estar disponivel. As URLs de retorno e as demais configuracoes sao preservadas. A senha fica em uma variavel de ambiente temporaria do processo para o CLI; o arquivo TOML usa somente `env(TERAVS_SMTP_PASSWORD)`. A saida bruta do CLI nao e exibida. O ambiente anterior e restaurado ao terminar.

Para revisar sem senha, envio ou alteracao online:

```powershell
.\scripts\configure-gmail-smtp.ps1 -SenderEmail 'seu-endereco@gmail.com' -Preview
```

Sem fornecer uma senha de app valida, o script nao configura o envio. A preparacao do script nao significa que o SMTP ja esteja ativo.

Depois de configurar, teste um cadastro novo sob seu controle, confirme o e-mail e entre. Verifique tambem recuperacao de senha, pasta de spam, limites e registros de entrega. Nao altere a confirmacao obrigatoria para mascarar falhas de entrega.

## Fontes oficiais

- [Supabase: SMTP proprio](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase: limites de autenticacao](https://supabase.com/docs/guides/auth/rate-limits)
- [Google: senhas de app](https://support.google.com/accounts/answer/185833?hl=pt-BR)
- [Google: SMTP e TLS](https://developers.google.com/workspace/gmail/imap/imap-smtp)

Alternativamente, o Brevo oferece plano gratuito e SMTP, sujeito a validacao da conta e do remetente. A documentacao descreve substituicao temporaria de remetentes de dominios gratuitos por `brevosend.com`, mas recomenda dominio autenticado. Isso exige criar e validar uma conta; nao foi provisionado automaticamente. Consulte [integracao oficial](https://developers.brevo.com/docs/supabase-smtp-integration) e [regras de remetente](https://help.brevo.com/hc/en-us/articles/16045394674066-Troubleshooting-Domain-authentication).
