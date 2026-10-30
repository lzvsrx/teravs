# Publicação do Teravs 0.3

## Arquitetura

```text
GitHub Pages / Android / Windows
    |                     |
    | login e memória     | geração de respostas
    v                     v
Supabase Auth + Postgres   Serviço Teravs -> modelo de inferência
        RLS                    |
                               +-> validação do JWT e leitura de memórias com RLS
```

O GitHub Pages hospeda apenas a interface. Não executa Node, o modelo ou o banco. Login e memórias acessam o Supabase pelo SDK oficial. Geração de conteúdo ainda exige a API e a inferência.

## Primeiro: Supabase

Siga [SUPABASE.md](SUPABASE.md), aplique a migração SQL e configure os links de confirmação. A URL e a chave publishable estão em `config/supabase-public.json`, compartilhado pelo cliente e servidor. São dados públicos; não inclua chaves secret nem senha de banco nesse arquivo.

O projeto online respondeu às verificações de API, mas a tabela não estava criada no momento da configuração. Os testes locais não substituem aplicar e validar a migração no projeto real.

## Interface

`.github/workflows/pages.yml` compila e publica a cada push em `main`, executando os testes do serviço antes do build. Em Settings → Pages, a origem deve ser GitHub Actions. O token de publicação é temporário e fornecido pelo GitHub.

Variáveis opcionais do repositório:

- `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`: sobrescrevem as configurações públicas na compilação.
- `TERAVS_API_URL`: origem HTTPS da API do Teravs, sem `/api`.

Nenhuma variável `VITE_*` pode conter credenciais administrativas: elas são incorporadas ao JavaScript distribuído.

## Serviço no Render

O `render.yaml` provisiona somente uma API Docker; o plano indicado é pago. Ele não cria um segundo banco. Sua presença no repositório não significa que a API esteja implantada.

Defina `OLLAMA_URL` para um motor de inferência acessível ao serviço e `ALLOWED_ORIGINS` com origens exatas, por exemplo `https://lzvsrx.github.io,https://localhost,http://localhost`. Um servidor de nuvem não alcança o Ollama do computador por `127.0.0.1`. É necessário um destino de inferência adequado, com recursos de memória e processamento.

Se usar outro projeto Supabase, configure `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` também no servidor. O JWT é validado por Supabase Auth. Leituras e gravações de nuvem são feitas com o JWT do usuário, sem chave secret para contornar RLS. A interface e a API exigem login para conversar ou acessar memórias. Uma chave de dispositivo antiga não substitui a conta.

`/api/health` verifica que o serviço iniciou; não certifica que o modelo, o login e a tabela estão prontos. Teste cada função separadamente. O SQLite temporário do contêiner existe somente por compatibilidade local e não deve guardar memórias de produção.

## Android e Windows

Compile Android com `VITE_TERAVS_API_URL` apontando para a API HTTPS. Rode `npm run android:sync`, depois `gradlew.bat assembleDebug` dentro de `android/` com JDK 21. Sem a API online, login e memórias podem funcionar pelo Supabase após a migração, mas a geração de respostas não funciona no Android.

No Windows, o Electron inicia o serviço local e usa o Ollama instalado na máquina. O pacote não inclui pesos de modelos ou um servidor de nuvem. As configurações públicas Supabase são distribuídas em `config/`.

## Antes de distribuir amplamente

Teste duas contas reais e confirme o isolamento e a restauração de backups. Configure recuperação de conta, monitoramento sem registrar prompts, limites de rede/conta e política de retenção. Os limites em memória do serviço e CORS não substituem proteção contra abuso de um serviço público.

O modelo atual continua Qwen3 4B; não foi treinado do zero pelo Teravs. A memória usa recuperação de contexto, sem alterar pesos.
