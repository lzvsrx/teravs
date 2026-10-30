# Checklist de governança e implementação

Medidas propostas para avaliação jurídica e técnica. O status descreve evidências de código e pendências, não aprovação legal. Consulta: 30/10/2026. [Escopo](README.md).

| ID | Tema | Medida | Fundamento / contexto | Situação observada | Pendência / evidência |
|---|---|---|---|---|---|
| C01 | Escopo territorial | Definir mercados, públicos e papéis antes do lançamento | Mapa regulatório e análise de aplicabilidade | Pendente | Não há matriz final de mercados autorizados |
| C02 | Transparência de identidade | Identificar interação com IA e distinguir modelo de projeto | AI Act quando aplicável; publicidade; diretriz interna | Parcial | Interface menciona IA; créditos e identidade original adicionados; marcação por modalidade exige avaliação |
| C03 | Autoria e licença | Identificar Luiz Otavio Valenzi Sousa e preservar direitos externos | Legislação de software e licenças | Adicionado nesta etapa | config/project.json, LICENSE, AUTHORSHIP.md e inventário de terceiros |
| C04 | Bases e finalidades | Documentar finalidade e fundamento de cada operação de dados | LGPD e regimes locais de dados | Pendente | Memória tem opt-in, mas não há inventário jurídico completo de tratamentos |
| C05 | Memória opcional | Permitir ativar e apagar memória por usuário | Projeto e deveres de dados aplicáveis | Código parcial | Código e SQL existem; migração online e validação real ainda pendentes |
| C06 | Treinamento | Separar treinamento de personalização e avaliar fundamento, direitos e dados | Proteção de dados e propriedade intelectual | Não implementado | Conversas não alteram pesos; não usar futuro treinamento como finalidade implícita |
| C07 | Acesso e correção | Criar atendimento a direitos de titulares conforme cada regime | LGPD, GDPR e outros regimes | Parcial | Há listagem/exclusão de memória no código; atendimento completo não foi implantado |
| C08 | Exclusão de conta | Definir autenticação da solicitação e efeitos sobre todos os sistemas | Proteção de dados aplicável | Pendente | Logout não equivale a apagar conta, registros e backups |
| C09 | Retenção e backups | Definir prazos, justificativas e restauração testada | Governança de dados e segurança | Pendente | Não há política operacional completa de retenção e backups |
| C10 | Dados sensíveis | Mapear entradas sensíveis e controles adequados | LGPD e regimes setoriais/locais | Pendente | Texto livre pode conter dados sensíveis; ausência de anexos não elimina o risco |
| C11 | Crianças e adolescentes | Definir público, avaliações e controles etários proporcionais | ECA Digital, COPPA e regras locais quando aplicáveis | Pendente | Login por e-mail não é controle etário suficiente |
| C12 | Acessibilidade | Testar fluxos com tecnologias assistivas e usuários | LBI e regimes aplicáveis; diretriz de acessibilidade | Parcial | Há ajustes e semântica; não existe certificação de cobertura universal |
| C13 | Decisões de alto impacto | Classificar usos e oferecer garantias aplicáveis | LGPD art.20, GDPR e regimes locais de IA/emprego | Pendente para esses usos | O catálogo de profissões não autoriza decisões automáticas de contratação, crédito ou saúde |
| C14 | Supervisão profissional | Definir responsável e revisão antes de uso crítico | Normas profissionais e setoriais | Parcial | Interface informa revisão; fluxo especializado de aprovação não foi implementado |
| C15 | Conteúdo sintético | Definir divulgação e marcação conforme modalidade e mercado | AI Act art.50 e regras locais aplicáveis | Pendente por modalidade | SVG identificado como gerado na interface; não há programa completo de marcação de conteúdo |
| C16 | Direitos de imagem e voz | Exigir análise de autorização, finalidade e direitos antes de personalização | Direitos de personalidade, dados e contratos | Capacidades não implementadas | Clonagem de voz e vídeo pessoal não estão disponíveis |
| C17 | Proteção contra abuso | Criar política, controles técnicos e testes de uso lesivo | Leis penais/civis, proibições de IA e diretrizes do serviço | Pendente de programa completo | Documento de diretrizes não equivale a filtro testado ou certificação |
| C18 | Autenticação | Verificar sessão para acessar IA e memória | Segurança e isolamento de dados | Implementado no código | API verifica identidade; dependências de operação online permanecem |
| C19 | Isolamento de dados | Aplicar e validar RLS e regras de acesso em ambiente real | Segurança e direitos de titulares | Código e testes locais | Migração Supabase ainda não aplicada pelo acesso disponível |
| C20 | Segredos e fornecedores | Restringir credenciais e inventariar fornecedores | Segurança e contratos | Parcial | Chave publishable é pública; faltam revisão operacional e contratos completos |
| C21 | Transferências internacionais | Mapear países e mecanismos de transferência aplicáveis | LGPD, resolução ANPD 19/2024 e regimes locais | Pendente | Ter Supabase ou Render não comprova adequação das transferências |
| C22 | Incidentes | Definir triagem, registro e notificação segundo o caso | Leis e regras de segurança/dados | Pendente | Não há plano operacional completo de resposta |
| C23 | Execução de código | Isolar execução, limitar permissões e verificar resultados | Segurança e autorização de uso | Não há executor de código de usuário | Rascunhar código não equivale a executá-lo |
| C24 | Ações externas | Obter autorização específica e confirmar ações reais | Diretrizes do serviço e responsabilidade | Agente executor não implementado | Não afirmar envio, assinatura ou pagamento sem integração e confirmação |
| C25 | Fornecedores e modelos | Inventariar versões, licenças, dados e limitações | Contratos, propriedade intelectual e governança | Inventário inicial | Arquivos de licença preservados; não é auditoria exaustiva do runtime ou de todos os dados |
| C26 | Alegações comerciais | Evitar promessa de funcionamento absoluto ou de conformidade universal | FTC Act, consumidores e transparência | Diretriz documentada | Pesquisa não valida operação em todos os países nem todos os serviços |
| C27 | Avaliação e mudança | Manter avaliações e revisão ao mudar modelo ou finalidade | Gestão de risco e regimes de IA aplicáveis | Parcial | Há testes funcionais; faltam avaliações completas de segurança, viés e impacto |
| C28 | Revisão normativa | Atualizar fontes e distinguir projeto, lei e transição | Governança de conformidade | Pesquisa datada | Não há monitoramento jurídico automático implantado |
