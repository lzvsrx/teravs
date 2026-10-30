Teravs 0.3 — prévia com conta de usuário e Supabase.

- Telas de login, cadastro com confirmação da senha, confirmação de e-mail e recuperação/alteração da senha.
- Interface da IA bloqueada antes do login, com verificação da sessão também no servidor.
- Memórias online por usuário e histórico local separado por conta.
- Consentimento, consulta e exclusão das memórias.
- Migração PostgreSQL com RLS e limite por usuário, testada localmente.

Configuração pública Supabase verificada. Ainda é necessário aplicar o SQL de `supabase/migrations/202610300001_teravs_memories.sql` e configurar os links de confirmação/recuperação no painel do projeto. A chave pública não concede acesso administrativo para fazer essas alterações.

Site e Android ainda dependem da publicação da API e do motor para gerar respostas. Login não substitui a infraestrutura de IA. Windows requer Ollama e qwen3:4b; a geração do executável não equivale à autorização de execução pelo Device Guard do Windows. O APK é de depuração, para testes.
