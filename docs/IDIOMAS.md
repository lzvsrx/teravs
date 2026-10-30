# Idiomas do Teravs

O seletor 🌐 Idioma está disponível antes e depois do login. A opção padrão segue os idiomas preferidos do aparelho quando existe um catálogo incluído; senão, usa português. A escolha manual é salva neste aparelho e pode ser alterada sem apagar campos do formulário, histórico ou memórias.

## Traduções incluídas

| Idioma | Código | Direção |
| --- | --- | --- |
| Português do Brasil | pt-BR | Esquerda para a direita |
| Inglês | en | Esquerda para a direita |
| Espanhol | es | Esquerda para a direita |
| Francês | fr | Esquerda para a direita |
| Árabe | ar | Direita para a esquerda |
| Chinês simplificado | zh-Hans | Esquerda para a direita |

Cada catálogo cobre as mesmas 255 entradas: telas, formulários, erros, avisos, acessibilidade, créditos, exemplos, instruções iniciais e textos dinâmicos. As traduções foram preparadas com assistência de IA; cobertura automatizada não equivale a revisão por tradutores nativos ou validação jurídica. As línguas listadas são as efetivamente incluídas, não uma afirmação de suporte a todas as línguas do mundo.

Os catálogos ficam em `src/locales`, com `source.json` em português e arquivos alinhados por posição. Ao adicionar uma entrada ou reordenar o catálogo, atualize todos os arquivos. Os testes verificam o tamanho, parâmetros, mudança de idioma, retorno ao português, persistência, texto pessoal e layout móvel em árabe. Não há download de tradução para esses seis idiomas. A autenticação e a IA continuam dependendo dos serviços correspondentes.

## Outros idiomas no dispositivo

A interface também oferece idiomas adicionais pela [Translator API do navegador](https://developer.chrome.com/docs/ai/translator-api). A disponibilidade é consultada no aparelho; pares sem suporte não são tratados como traduzidos. Essa API tem disponibilidade limitada e, segundo a documentação consultada em 30/10/2026, não atende Android/iOS. O aplicativo Android mantém os seis catálogos incluídos.

O usuário inicia a tradução pelo botão Aplicar idioma. O navegador pode precisar baixar modelos. Somente as 255 frases públicas do catálogo são passadas ao tradutor local: conversas, memórias, e-mail, senha e outros campos não entram nessa operação. O resultado completo é aplicado de uma vez, como texto, e pode ser guardado localmente para reutilização. O cache é invalidado quando o catálogo de origem muda. Em falha, a interface anterior é preservada. Não há serviço externo pago configurado ou chave de tradução no aplicativo.

As opções adicionais não garantem disponibilidade para todo idioma, dialeto, escrita ou língua de sinais. Oferecer um código na lista não comprova suporte pelo navegador. Catálogos novos podem ser incluídos sem depender dessa API.

## Respostas, pesquisa e conteúdo pessoal

O idioma selecionado acompanha pedidos à API de IA. O motor recebe a preferência, e a pesquisa consulta a Wikipédia nesse idioma quando há um domínio permitido. Isso orienta a geração; não garante fluência do modelo em todos os idiomas. O usuário pode pedir uma resposta em outro idioma explicitamente. A API e o motor ainda precisam estar disponíveis para conversar; esta mudança não os hospeda.

Ditado e leitura em voz alta usam o código do idioma escolhido, com suporte e vozes dependentes do sistema. Validações nativas do navegador podem seguir o idioma do próprio navegador. Mudar a interface não traduz retroativamente respostas, arquivos já gerados, memórias ou dados escritos por pessoas. Os e-mails enviados pelo Supabase seguem os templates configurados naquele serviço. Os documentos externos no GitHub também conservam seus idiomas próprios.

## Verificação

Execute `npm test`, `npm run test:server` e `npm run build`. Os testes de interface não enviam dados a um tradutor externo. A integração com a Translator API é verificada com um adaptador simulado e com falhas de disponibilidade; o sucesso em todos os dispositivos reais não é presumido.
