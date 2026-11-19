# Aldem Gestão Estratégica — Site (HTML, CSS e JavaScript puros)

Site estático, em azul forte e visual tecnológico. Não precisa instalar nada: sem Node, sem npm.

## Estrutura

```
index.html              página inicial
gestao-externa.html     bloco 1: presença digital (jornada do cliente)
gestao-interna.html     bloco 2: processos (fluxo de gestão)
assets/
  css/styles.css        base: cores, tipografia, menu, botões, rodapé
  css/effects.css       efeitos visuais, primeira tela, menu em cápsula
  css/gestao.css        blocos da home, desafios, páginas de gestão, chamada final
  js/script.js          menu do celular e destaque do item ativo
  js/effects.js         partículas, revelar ao rolar, inclinação 3D, cursor, esteira
  js/gestao.js          encaixe dos blocos, conexões da jornada, chamada final
  img/                  logo-aldem.png, favicon.png, app-cover.png, email.png
_referencias/           material de consulta (NÃO faz parte do site; não publicar)
```

As páginas `.html` ficam na raiz e usam os arquivos de `assets/`. Se criar uma página nova, use os mesmos caminhos
(`assets/css/styles.css`, `assets/css/effects.css`, `assets/js/script.js`, `assets/js/effects.js`).

## Como abrir

Dê dois cliques em `index.html`. Ele abre no navegador, sem servidor.

## Como editar no VS Code

1. Abra o VS Code → Arquivo → Abrir Pasta → escolha a pasta do site.
2. Textos e seções da página inicial: `index.html`.
3. Textos das páginas de gestão: `gestao-externa.html` e `gestao-interna.html`.
4. Cores e fontes: `assets/css/styles.css` (a paleta está no topo, em `:root`). O site inteiro usa a fonte Inter.
5. Efeitos e animações: `assets/css/effects.css` e `assets/js/effects.js`.
6. Salve e atualize o navegador (F5). A extensão "Live Server" atualiza sozinha.

## Onde mudar o que mais se altera

- **Instagram:** o perfil é `@aldem.gestao`. O link fica no botão "Instagram" da chamada final de cada página
  (`https://www.instagram.com/aldem.gestao/`). Para mudar, troque o `href` desse botão nas 3 páginas.
- **WhatsApp:** o número `5567996896426` está no botão verde do topo e na chamada final (link `wa.me`).
- **E-mail:** o botão "E-mail" abre o Gmail no navegador, já preenchido (link `mail.google.com`).
- **Setores do fluxo da gestão interna:** na `gestao-interna.html`, blocos `<div class="wf-n wf-src">`.
- **Cartões dos desafios:** na `index.html`, seção `#desafios`.

## Avisos

- As ilustrações das primeiras telas (jornada do cliente e fluxo de gestão) são **exemplos ilustrativos**,
  com dados fictícios. Não representam resultados reais de clientes.
- Os textos de serviços e metodologia são sugestões: ajuste para a realidade da empresa.
- A montagem e a precificação do kit são feitas pelo comercial, fora do site.
- Para o link compartilhado no WhatsApp/LinkedIn exibir imagem, adicione uma imagem e as tags `og:image` e
  `og:url` (com o endereço final do site) no `<head>`.
- A pasta `_referencias/` guarda o PDF de portfólio e uma imagem de exemplo, só para consulta. Não envie para o ar.
