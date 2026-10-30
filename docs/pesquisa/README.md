# Pesquisa de serviços de IA, profissões e documentos para o Teravs

Consulta e organização: **30 de outubro de 2026**. Esta é uma pesquisa para orientar o produto, não uma declaração de que todos os recursos estão implementados.

## Arquivos entregues

- **[Planilha completa com filtros](Teravs-pesquisa-servicos-profissoes.xlsx)**: serviços, áreas, documentos, ocupações CBO, sinônimos, grupos ISCO, índice internacional e fontes.
- [70 serviços e seus requisitos](SERVICOS.md), também em [CSV](servicos-ia.csv).
- [81 áreas e suas rotinas/documentos](ROTINAS.md), também em [CSV](areas-e-rotinas.csv).
- [486 sugestões de documentos, uma por linha](documentos-por-area.csv).
- [Catálogo estruturado em JSON](catalogo.json) e [resumo de contagens](resumo.json).
- Bases de referência: [ocupações brasileiras](bases/cbo-ocupacoes.csv), [sinônimos brasileiros](bases/cbo-sinonimos.csv), [grupos internacionais](bases/isco-estrutura.csv) e [índice de títulos internacionais](bases/isco-indice.csv).
- [Fontes e finalidade de cada referência](fontes.json) e [proveniência dos downloads](bases/proveniencia.json).

## O que “todos os empregos e profissões” significa nesta pesquisa

Não há um cadastro mundial único que contenha todos os nomes locais, novas funções, especialidades, cargos internos e combinações de trabalho. Também não há uma lista universal de documentos diários para cada profissão. As classificações oficiais permitem organizar a cobertura sem inventar uma lista pretensamente completa.

A **CBO** identifica ocupações brasileiras para fins classificatórios. O arquivo de ocupações obtido no endereço público do MTE contém **2.694 códigos**; o de sinônimos contém **7.778 entradas**, todas associadas a códigos presentes nessa cópia. Estes números descrevem o download consultado, não uma afirmação de que nenhuma atualização posterior ou nomenclatura alternativa exista. O próprio MTE distingue a classificação da regulamentação de uma profissão. [Downloads CBO](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads/downloads), [finalidade da CBO](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo).

A **ISCO-08**, da OIT, fornece uma estrutura internacional com dez grandes grupos e **436 grupos unitários**. O índice em inglês baixado da OIT resultou em **7.017 entradas com código ISCO-08 válido**. São entradas de títulos, não uma contagem mundial de profissões únicas. As bases se sobrepõem e não devem ser somadas. [OIT — ISCO-08](https://isco.ilo.org/en/isco-08/).

O **O*NET** foi consultado como referência complementar de tarefas e contexto ocupacional nos Estados Unidos. Não foi usado como se fosse uma classificação brasileira ou uma enumeração global. Nenhuma base completa O*NET foi copiada; uma futura importação deve respeitar sua licença e atribuição. [Base](https://www.onetcenter.org/database.html), [licença](https://www.onetcenter.org/license_db.html).

### Os dez grandes grupos internacionais

| Grupo | Organização da cobertura |
|---|---|
| 0 | Ocupações das forças armadas |
| 1 | Gestores e dirigentes |
| 2 | Profissionais de nível superior e especialistas |
| 3 | Técnicos e profissionais associados |
| 4 | Apoio administrativo |
| 5 | Serviços e vendas |
| 6 | Agricultura, floresta e pesca qualificadas |
| 7 | Ofícios, construção e produção artesanal |
| 8 | Operação de instalações, máquinas e montagem |
| 9 | Ocupações elementares de diferentes setores |

Os títulos acima são uma tradução explicativa dos grandes grupos; os códigos e títulos originais estão nas bases. Cada grupo contém muitas ocupações distintas. O fato de uma ocupação estar classificada não determina quais funções uma IA pode executar sem supervisão.

## Natureza do mapeamento de documentos

Os **486 documentos e 81 agrupamentos de rotina são propostas editoriais desta pesquisa**, elaboradas para orientar modelos e formulários do Teravs. Não são uma lista oficial do MTE, da OIT ou do O*NET. A coluna de fontes indica contexto técnico/ocupacional e exemplos de requisitos a consultar; não significa que a fonte exige ou recomenda todos os documentos daquela linha.

Não foi feita validação individual dos documentos com cada um dos milhares de títulos profissionais. Também não foi criado um cruzamento automático oficial CBO↔ISCO↔documentos. Muitos documentos são semanais, mensais, por projeto ou ocasionais, e não diários. Uma função pode usar vários modelos; duas empresas podem usar formatos diferentes para a mesma atividade.

Antes de gerar um arquivo, o aplicativo deve perguntar **profissão/atividade, país e local de uso, setor, objetivo, destinatário, periodicidade, modelo da organização, dados reais disponíveis, formato e responsável pela revisão**. Para papéis novos ou não encontrados, deve aceitar descrição livre e registrar o mapeamento como provisório.

## O que uma IA pode fazer por comandos e código

O catálogo distingue quatro componentes que costumam ser confundidos:

1. **Modelo**: gera ou interpreta linguagem, imagem, áudio, vídeo ou outros dados, conforme seu treinamento e suas entradas suportadas.
2. **Programa de execução**: calcula, transforma dados, renderiza documentos, compila software ou processa mídia. Produzir um texto de código não significa tê-lo executado.
3. **Integração**: acessa bancos, calendários, correio, ERP, nuvem, dispositivos e sistemas externos com as permissões necessárias.
4. **Validação**: verifica formato, conteúdo, resultados, acessibilidade e revisão humana apropriada ao uso.

Um comando não torna um único modelo capaz de todas as modalidades. A existência de um modelo disponível publicamente tampouco certifica qualidade, direito de uso comercial ou adequação ao computador do usuário. A taxonomia de tarefas é uma referência de modalidades; pipelines de imagem, vídeo e áudio exigem seus componentes próprios. [Hugging Face — tarefas](https://huggingface.co/tasks), [Diffusers](https://huggingface.co/docs/diffusers/index).

### Famílias de serviços e saídas

| Família | Exemplos de serviço | Saídas que o sistema pode preparar com implementação adequada |
|---|---|---|
| Texto e linguagem | Redação, revisão, resumos, tradução e linguagem simples | Cartas, relatórios, roteiros, materiais didáticos e textos editáveis |
| Documentos de escritório | Preenchimento estruturado, planilhas, apresentações | DOCX, XLSX, PPTX e PDF verdadeiros, gerados por exportadores |
| Conhecimento | Pesquisa, perguntas sobre arquivos, extração e classificação | Respostas com evidências, tabelas e registros estruturados |
| Dados | Limpeza, estatística, previsão, otimização e anomalias | Dados tratados, gráficos, cenários e relatórios reproduzíveis |
| Software | Código, testes, depuração, bancos, APIs e infraestrutura | Arquivos de código e configuração; pacotes após build e testes |
| Imagem | Ilustração, edição, recorte e composição | SVG e formatos raster, conforme o modelo e o exportador |
| Áudio | Transcrição, fala, tradução de fala, música e efeitos | Texto sincronizado e arquivos de áudio; uso sujeito às licenças |
| Vídeo | Geração de clipes, edição, animação e legendas | Vídeo renderizado, legendas, capítulos e projeto de edição |
| 3D e engenharia | Malhas, texturas, esboços CAD, BIM e cálculo | Ativos 3D e arquivos técnicos revisados por ferramenta apropriada |
| Automação | Navegador, arquivos, atendimento e tarefas em sistemas | Ações verificadas, registros e confirmações de sistemas de destino |
| Acessibilidade | Texto alternativo, legendas, audiodescrição e comunicação | Conteúdos adaptados e interfaces testadas com usuários |
| Personalização | Memória autorizada, recuperação e ajuste de modelos | Contexto individual; treinamento somente em pipeline separado |

**Geração, análise, previsão e execução são capacidades diferentes.** Uma previsão precisa de dados e avaliação; uma rota viável precisa respeitar restrições e um solver; um envio precisa de uma integração e confirmação do destino. Cálculos relevantes devem ser reproduzidos em código em vez de aceitar números apenas porque o modelo os apresentou. [scikit-learn](https://scikit-learn.org/stable/supervised_learning.html), [SciPy](https://docs.scipy.org/doc/scipy/tutorial/optimize.html), [OR-Tools](https://developers.google.com/optimization).

## Quais arquivos gerar corretamente

Não basta trocar a extensão de um texto. Um `.txt` renomeado para `.docx` não é um documento Word válido; o mesmo vale para planilhas, apresentações e pacotes de aplicativos. A proposta é separar a geração de conteúdo estruturado da construção e validação do arquivo.

| Grupo de arquivo | Formatos a considerar | Verificação mínima proposta |
|---|---|---|
| Texto e escritório | TXT, MD, DOCX, ODT, PDF | Reabrir, conferir caracteres, paginação, títulos, tabelas e conteúdo |
| Planilhas e dados | XLSX, ODS, CSV, TSV, JSON, XML, Parquet | Esquema, tipos, unidades, totais e proteção contra fórmulas injetadas |
| Apresentações | PPTX, ODP, PDF | Renderizar e revisar texto, sobreposição e ordem de leitura |
| Web e código | HTML, CSS, JS, TS, PY, SQL, YAML, IPYNB | Parse, lint quando aplicável, testes, isolamento e revisão de dependências |
| Imagem | SVG, PNG, JPEG, WebP | Decodificar, inspecionar dimensões/transparência e sanitizar conteúdo ativo |
| Áudio | WAV, MP3, OGG, FLAC | Decodificar, escutar, verificar duração, cortes e inteligibilidade |
| Vídeo e legendas | MP4, WebM, SRT, VTT | Reproduzir e conferir sincronia, legendas e conteúdo ao longo do tempo |
| 3D e fabricação | GLB/glTF, OBJ, STL, STEP, DXF | Abrir na ferramenta-alvo e verificar escala, geometria e fabricação |
| Construção e geodados | IFC, GeoJSON, KML, GPX | Validar esquema, coordenadas, unidades e interpretação no software-alvo |
| Intercâmbio | ICS, VCF, XLIFF, BIB, RIS, EPUB | Validar estrutura e testar importação no aplicativo de destino |
| Entregas de software | ZIP, EXE, APK, AAB | Build real, integridade, assinatura quando necessária e teste na plataforma |

DOCX, XLSX e PPTX têm bibliotecas próprias de construção; elas não garantem a exatidão do conteúdo produzido. glTF e IFC possuem especificações específicas. A planilha desta pesquisa foi construída com openpyxl fora do aplicativo: isso não significa que o Teravs já exporta planilhas por chat. [python-docx](https://python-docx.readthedocs.io/en/latest/), [openpyxl](https://openpyxl.readthedocs.io/en/stable/), [python-pptx](https://python-pptx.readthedocs.io/en/latest/), [glTF](https://www.khronos.org/gltf/), [IFC](https://technical.buildingsmart.org/standards/IFC/).

## Exemplos de rotinas por profissão

| Contexto | Entregas úteis propostas | Condição de uso |
|---|---|---|
| Professor | Plano de aula, atividade, rubrica e comunicação às famílias | Revisão docente e contexto curricular real |
| Eletricista / engenheiro | Orçamento, lista de materiais, registro de serviço e medições fornecidas | Cálculo e liberação por responsável adequado |
| Marceneiro | Orçamento, relação de materiais e plano preliminar de corte | Medidas verificadas e revisão antes de fabricar |
| Contador | Conciliação, checklist de fechamento e relatório de diferenças | Dados reais reconciliados e revisão contábil |
| Advogado | Minuta, cronologia e resumo de documentos | Fontes e prazos conferidos; revisão jurídica |
| Profissional de saúde | Organização de registros fornecidos e material previamente validado | Não inventar atendimento, diagnóstico, resultado ou assinatura |
| Motorista / logístico | Checklist, controle de combustível, rota e relatório de entrega | Conferir trajeto e registros reais; solver e integrações quando necessários |
| Programador | Requisitos, código, testes e documentação | Compilar e executar testes em ambiente adequado |
| Trabalhador doméstico | Rotina, lista de compras e registro de atividades | Acordo com a pessoa responsável e preservação da privacidade |
| Agricultor | Caderno de campo, custos e registro de produção | Dados reais e orientação técnica para intervenções |

O detalhamento das demais áreas está na [matriz de rotinas](ROTINAS.md). Os exemplos acima são propostas operacionais, não comprovação de obrigatoriedade desses arquivos.

## Documentos regulados ou de alto impacto

Uma IA pode organizar dados e preparar minutas, mas não deve apresentar um rascunho como inspeção realizada, atendimento ocorrido, resultado laboratorial, assinatura, certidão, protocolo ou autorização fiscal que não existam.

Exemplos de fronteiras verificadas em fontes oficiais:

- **Engenharia**: a responsabilidade técnica e o registro pertinente pertencem ao profissional e ao processo aplicável, não à IA. [Confea — ART](https://www.confea.org.br/servicos-prestados/anotacao-de-responsabilidade-tecnica-art).
- **Segurança do trabalho**: o PGR envolve inventário e plano de ação, com condições e exceções. O conteúdo precisa refletir avaliação real e texto vigente, não um formulário genérico preenchido com riscos inventados. [MTE — PGR](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/pgr/), [NR-1](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-1).
- **Fiscal**: gerar uma imagem ou PDF com aparência de nota não equivale a cumprir o fluxo de emissão e autorização do documento eletrônico. [Portal Nacional da NF-e](https://www.nfe.fazenda.gov.br/portal/consulta.aspx/perguntasFrequentes.aspx?AspxAutoDetectCookieSupport=1&tipoConteudo=3Ow1nfTBzIo%3D).
- **Educação**: materiais precisam considerar currículo e contexto da turma. [MEC — BNCC](https://basenacionalcomum.mec.gov.br/).

O NIST descreve o risco de modelos produzirem respostas convincentes, porém incorretas, inclusive em contextos profissionais. A revisão precisa ser proporcional às consequências do erro; não basta acrescentar uma frase genérica ao fim do arquivo. [NIST AI 600-1](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence).

## Acessibilidade em cada serviço

Para o Teravs, a acessibilidade deve acompanhar o fluxo inteiro: entrada, revisão, correção, exportação e confirmação. Isso inclui teclado e tecnologias assistivas, ampliação, estrutura semântica, linguagem adaptável e alternativas de entrada conforme necessidade e escolha da pessoa.

Áudio e vídeo podem precisar de legendas, transcrições, descrições visuais e língua de sinais conforme o público. Gerar fala não resolve automaticamente necessidades de pessoas surdas, e gerar legendas não resolve automaticamente necessidades de pessoas cegas. Conteúdo em língua de sinais deve ser avaliado por sinalizantes e profissionais adequados; não se pode prometer atendimento a todas as deficiências apenas por habilitar uma função de voz. [W3C WAI](https://www.w3.org/WAI/tutorials/), [mídia acessível](https://www.w3.org/WAI/media/av/).

## Fluxo proposto para o produto

1. Identificar usuário, finalidade, profissão/atividade e modelo institucional.
2. Coletar apenas dados necessários, com origem, permissões e campos obrigatórios claros.
3. Produzir conteúdo estruturado; deixar ausências identificadas, sem inventar valores.
4. Executar cálculo ou ferramenta específica quando necessário, em ambiente controlado.
5. Construir o arquivo no formato correto usando exportador adequado.
6. Validar esquema, conteúdo, referências, cálculos e acessibilidade.
7. Apresentar prévia e pendências; encaminhar revisão profissional quando aplicável.
8. Exportar ou executar integração autorizada e confirmar o resultado real.
9. Registrar versão, fontes e autorizações; permitir exclusão e correção.

Exemplo de especificação de tarefa, **ainda não um contrato implementado na API atual**:

```json
{
  "atividade": "preparar_orcamento",
  "profissao": {"classificacao": "CBO", "codigo": "selecionado_da_base"},
  "pais": "BR",
  "modelo_organizacional": "modelo_aprovado_v1",
  "entradas": {"itens": "dados_reais_fornecidos", "moeda": "BRL"},
  "saida": {"formatos": ["xlsx", "pdf"], "idioma": "pt-BR"},
  "validacoes": ["campos", "calculos", "formato", "revisao_do_responsavel"],
  "acao_externa": "nenhuma",
  "memoria": {"consentimento": false}
}
```

## Prioridades sugeridas, não recursos já entregues

| Etapa | Entrega proposta | Critério para chamar de pronta |
|---|---|---|
| 1 | Publicar banco, regras de acesso, API e inferência que faltam | Login real, isolamento entre contas e geração ponta a ponta |
| 2 | Formulários profissionais e exportadores DOCX/XLSX/PDF | Arquivos reabertos, cálculos conferidos e teste com usuários |
| 3 | Ingestão de documentos, OCR, pesquisa com evidências e apresentações | Extração e referências avaliadas em exemplos reais |
| 4 | Imagem e áudio | Modelo e licença adequados, avaliação e exportação válida |
| 5 | Vídeo e 3D | Infraestrutura de renderização e testes de interoperabilidade |
| 6 | Agentes e integrações externas | Permissões, limites, trilha de ações e confirmação de execução |

No código atual existem rascunhos de texto/código/documentos, desenho SVG, pesquisa limitada à Wikipédia, recursos do dispositivo e infraestrutura de memória. A API online, migração do banco e integração de modelos continuam sujeitos às pendências já documentadas. **Esta pesquisa não instalou novos modelos nem implementou os 70 serviços.**

## Reprodução e verificação dos artefatos

```powershell
python scripts/research-download.py
python -m venv .venv-research
.\.venv-research\Scripts\python.exe -m pip install -r scripts/requirements-research.txt
.\.venv-research\Scripts\python.exe scripts/build-research.py
```

O download registra URL, tamanho e hash do arquivo recebido. A importação normaliza codificação e preserva zeros à esquerda. Na cópia do índice internacional havia uma linha com código inválido (`1`); ela foi excluída do catálogo e registrada na proveniência. A estrutura internacional foi filtrada para ISCO-08, pois o CSV de origem também continha outras versões.

O construtor confere códigos, referências, contagens e campos, gera CSV/JSON e reabre o XLSX para conferir linhas e códigos. Dados de classificações são mantidos como texto em planilha, sem transformá-los em fórmulas. Foram usados openpyxl 3.1.5 e et-xmlfile 2.0.0 no ambiente de pesquisa. Isso verifica integridade estrutural dos arquivos, não valida todas as sugestões profissionais. A matriz deve ser revisada com profissionais e atualizada quando mudarem modelos, formatos ou exigências locais.
