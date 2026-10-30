# Leis, regras de IA e direitos do Teravs

**Data de consulta: 30/10/2026.** Pesquisa internacional inicial, com fontes oficiais e indicação de natureza jurídica. É um mapa para orientar decisões do projeto; não é parecer jurídico, auditoria ou certificação de conformidade em todos os países.

**Criador do projeto e titular dos direitos sobre seus elementos originais: Luiz Otavio Valenzi Sousa**, na extensão reconhecida pela legislação aplicável. Consulte [a declaração de autoria](../../AUTHORSHIP.md), [o aviso de direitos reservados](../../LICENSE) e [as licenças de terceiros](../../THIRD_PARTY_NOTICES.md).

## Entregas

- [Mapa internacional por instrumento e jurisdição](MAPA.md), com versão [CSV](mapa-regulatorio.csv) e [JSON](mapa-regulatorio.json).
- [Planilha de consulta](Teravs-mapa-legal-e-direitos.xlsx), com mapa, controles e fontes complementares.
- [Checklist de medidas para o produto](CHECKLIST.md), distinguindo código existente de trabalho pendente.
- [Diretrizes propostas de comportamento e uso](REGRAS_TERAVS.md).
- [Inventário de componentes e cópias de avisos](../../THIRD_PARTY_NOTICES.md).

## Não há uma única “lei mundial da IA”

As regras alcançam, conforme o caso, desenvolvedor, fornecedor, implantador, controlador, operador, anunciante, profissional ou usuário. O software não é quem assume sozinho todas essas responsabilidades. O país do responsável, o mercado atendido, as pessoas cujos dados são tratados, o setor, a finalidade e o efeito das saídas podem alterar o enquadramento.

Uma interface acessível pela internet não foi automaticamente autorizada a operar em qualquer país. Regras de proteção de dados, consumidores, crianças, direitos autorais, acessibilidade, trabalho, saúde, crédito, eleições, segurança e atividades profissionais podem coexistir, mesmo onde não exista um regime horizontal específico de IA.

O mapa cobre instrumentos selecionados nas Américas, Europa, Ásia, África, Oriente Médio e Oceania. **Não examina individualmente todas as leis de todos os países, estados, cidades ou setores.** Uma jurisdição ausente não deve ser tratada como sem regulamentação. Normas locais e setoriais exigem análise adicional antes da oferta do serviço naquele mercado.

## Como ler o status de uma regra

| Categoria | Como deve ser tratada |
|---|---|
| Lei ou regulamento aplicável | Verificar alcance, versão, vigência, transições, exceções e papel do responsável |
| Lei publicada com aplicação futura | Preparar implementação sem afirmar que todas as obrigações já são exigíveis |
| Projeto de lei | Acompanhar tramitação; não apresentar como lei aprovada |
| Diretriz ou recomendação | Referência interpretativa ou de boa prática; não assumir força de lei universal |
| Tratado | Verificar entrada em vigor, ratificação, reservas e implementação no Estado relevante |
| Licença e contrato | Cumprir condições do componente ou serviço; não substituem deveres legais |

Os princípios da [UNESCO](https://www.unesco.org/en/artificial-intelligence/recommendation-ethics) e da [OCDE](https://oecd.ai/en/ai-principles) ajudam a organizar governança, mas não são autorizações mundiais de operação. A [Convenção CETS 225](https://www.coe.int/en/web/artificial-intelligence/the-framework-convention-on-artificial-intelligence) exige análise de ratificação, vigência e implementação, sem presumir efeitos uniformes em todos os países.

## Principais conclusões para o projeto

### Brasil

O Teravs deve mapear o tratamento de e-mail, nome, sessões, conversas e memórias: finalidades, bases legais, retenção, acesso, segurança, direitos e fluxos entre prestadores. Consentimento não é a única base prevista na LGPD, nem uma caixa marcada resolve todas as obrigações. Dados sensíveis, crianças e outras situações específicas exigem exame próprio. O artigo 20 trata de revisão de decisões exclusivamente automatizadas que afetem interesses, nas condições do texto vigente. [LGPD consolidada](https://presidencia.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm).

O **PL 2338/2023** não foi tratado como lei. A API oficial da Câmara, consultada nesta pesquisa, retornou a situação **“Aguardando Parecer”**, com movimentação datada de **27/10/2026**. A tramitação deve ser consultada novamente quando houver decisão de lançamento. [Ficha da proposição](https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2487262).

A aplicação do [Estatuto Digital da Criança e do Adolescente](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15211.htm), da [Lei Brasileira de Inclusão](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm) e de regras setoriais precisa ser avaliada para os usos e públicos concretos. O produto ainda não dispõe de um programa completo de proteção etária ou de certificação de acessibilidade.

### União Europeia

É preciso distinguir fornecedor do aplicativo, fornecedor do modelo base e implantador. O uso de um modelo externo não transfere automaticamente ao Teravs todas as obrigações de quem treinou esse modelo, mas também não elimina responsabilidades de quem oferece o sistema sob seu próprio nome.

A Comissão informa aplicação faseada do AI Act e alterações do cronograma: não se deve usar automaticamente o calendário original de 2024 como se todas as regras entrassem em vigor juntas. Transparência, proibições e regras futuras de alto risco possuem enquadramentos e transições próprios. Consulte [o panorama atualizado](https://digital-strategy.ec.europa.eu/en/faqs/navigating-ai-act) e [a orientação do artigo 50](https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act). A análise de dados pessoais permanece separadamente necessária, conforme o [EDPB](https://www.edpb.europa.eu/topics/ai-and-technology/artificial-intelligence_en).

### Estados Unidos

O mapa não reduz o país a uma única regra. Há obrigações federais e regimes estaduais/locais que dependem da atividade e do enquadramento. Publicidade e alegações sobre capacidades devem respeitar o [FTC Act](https://www.ftc.gov/legal-library/browse/statutes/federal-trade-commission-act). A [COPPA](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions) tem critérios específicos de aplicação a crianças; não basta declarar em termos de uso que todos são adultos.

O exemplo do Colorado foi atualizado para **SB26-189**, evitando tratar o texto original de 2024 como se não tivesse sofrido alterações. A página legislativa identifica obrigações de documentação de desenvolvedores a partir de janeiro de 2027 e outras disposições com datas próprias. A abrangência depende das decisões consequenciais definidas na lei. [Assembleia do Colorado](https://www.leg.colorado.gov/bills/SB26-189).

Redigir uma descrição de vaga ou currículo não equivale automaticamente a operar uma ferramenta coberta de decisão de emprego. Porém, transformar o Teravs em sistema de classificação/seleção de candidatos exige nova avaliação, inclusive das regras locais como as de [Nova York](https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page).

### Demais regiões

O mapa inclui exemplos de proteção de dados e/ou regimes de IA no Canadá, Reino Unido, Suíça, China, Coreia do Sul, Japão, Índia, Singapura, Austrália, Nova Zelândia, México, Argentina, Chile, Colômbia, África do Sul, Quênia, Nigéria, Turquia, Emirados Árabes Unidos, Arábia Saudita e Vietnã. São recortes por instrumento, não pareceres completos sobre cada país.

Dois exemplos de cuidado com datas: a fonte oficial chilena fixa **01/12/2026** para a entrada em vigor da Lei 21.719, ainda futura nesta consulta; a notificação indiana das DPDP Rules estabelece fases, que não podem ser resumidas como se todas as regras já estivessem em aplicação. [Congresso do Chile](https://www.bcn.cl/balance-legislativo/detalle/ficha_LEY_21719_2024-12-13), [notificação oficial indiana](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf).

## Autoria e direitos: o que foi registrado

Foram adicionados o nome **Luiz Otavio Valenzi Sousa**, sua identificação como criador do Teravs e a reserva de direitos sobre elementos originais do projeto, respeitada a legislação aplicável. A informação aparece nos metadados, nos créditos e na documentação. A orientação de identidade do assistente também distingue o projeto Teravs do modelo Qwen3.

A declaração não concede propriedade sobre os pesos do Qwen3, o Ollama, bibliotecas, dados públicos, conteúdos dos usuários ou direitos de outras pessoas. O aviso do artefato Qwen3 local declara Apache License 2.0; uma cópia foi preservada no inventário. Outros componentes possuem suas próprias condições. [Licença do fornecedor Qwen](https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE).

Direitos sobre resultados gerados por IA não são uniformes mundialmente. Como exemplo específico, o U.S. Copyright Office distingue contribuição humana protegível de material puramente gerado por IA; isso não é apresentado como decisão automática para todas as jurisdições. [Relatório do órgão](https://www.copyright.gov/ai/).

O repositório continua público e a licença do projeto continua identificada como `UNLICENSED`, com aviso próprio de direitos reservados. Isso respeita permissões da plataforma, incluindo visualização e fork. Não foi criado registro de marca, patente ou registro de software no INPI. [GitHub — licenciamento](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository), [INPI — programas de computador](https://www.gov.br/inpi/pt-br/servicos/programas-de-computador).

## Situação real de conformidade do Teravs

**Uma pesquisa, um aviso de copyright ou uma instrução de sistema não garantem cumprimento das leis.** O checklist registra separadamente requisitos propostos e evidências de código. A existência de login e de SQL com RLS não demonstra, por si, cumprimento integral da LGPD ou de outros regimes.

Entre as pendências relevantes permanecem: aplicação e validação da migração no Supabase online, publicação da API/inferência, definição do responsável e do canal operacional de atendimento, aviso completo de privacidade, retenção e backups, direitos de titulares, programa para menores, avaliação de riscos/viés e revisão de usos profissionais. Nada nesta pesquisa declara essas etapas concluídas.

Para lançamento internacional, a análise precisa selecionar mercados, papéis, funcionalidades e públicos reais e ser validada por assessoria jurídica adequada a esses mercados. Países, regras e datas devem ser revistos antes da distribuição e quando o produto mudar de finalidade.

## Reprodução

O arquivo de origem é [mapa-fonte.csv](mapa-fonte.csv). O script `scripts/build-legal-research.py` valida identificadores e referências HTTPS e produz CSV, JSON, Markdown e planilha. O script `scripts/third-party-notices.mjs` registra metadados do lockfile e preserva os avisos encontrados nos pacotes de produção e no Electron. O inventário não substitui auditoria completa de componentes binários e licenças de novos materiais.
