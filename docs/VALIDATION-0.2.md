# Verificação da versão 0.2 — 30/10/2026

- TypeScript e build Vite: aprovados.
- Serviço: 7 testes aprovados (consentimento, isolamento, exclusão, validação, tratamento de erros, fontes e recuperação de memória).
- Interface: 5 testes aprovados (conversa sem configuração de provedor, persistência, acessibilidade, memória, SVG sanitizado, erro e layout móvel).
- Pesquisa real na Wikipédia: retornou páginas e URLs HTTPS.
- Electron a partir do código: abriu o serviço SQLite e recebeu resposta real de Qwen3 4B local em CPU.
- Windows portátil: gerado e disponibilizado. A execução final do binário empacotado foi bloqueada pelo Device Guard do Windows neste computador. Não houve tentativa de contornar a política. Isso limita a validação do pacote final; não impede os testes de desenvolvimento já realizados.
- Android: compilação de depuração concluída; `adb install -r` retornou `Success` no Samsung SM-A025M autorizado (serial R9QR3022J6X); atividade do aplicativo iniciada.
- Android e GitHub Pages: a conversa depende de uma API HTTPS ainda não publicada no Render. A instalação e a publicação da interface não equivalem a uma implantação completa da IA online.
- GitHub: repositório público `lzvsrx/teravs`, Pages com workflow concluído com sucesso e HTTP 200, prévia `v0.2.0` com executável, APK e hashes.
- PostgreSQL: adaptador e configuração de implantação preparados; banco online ainda não criado ou testado por falta de conexão com a conta de hospedagem.
- Acessibilidade: ainda não validada com usuários de tecnologias assistivas. Não há garantia de cobertura universal.

O serviço e a interface são código do Teravs. Os pesos de Qwen3 não foram treinados do zero neste projeto. A memória é recuperação de contexto com consentimento, não treinamento dos pesos.
