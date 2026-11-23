# -*- coding: utf-8 -*-
"""Gera as páginas /criacao-de-sites/<cidade>/ + índice, sitemap.xml e robots.txt.

Uso (na pasta do projeto):
    python _ferramentas/gerar-cidades.py https://seudominio.com.br

Sem o endereço, as páginas são geradas SEM canonical/sitemap (para não apontar para um endereço errado).
Para mudar o texto de uma cidade, edite a lista CIDADES abaixo e rode de novo.
"""
import os, re, sys, html, json, unicodedata
from urllib.parse import quote

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOMINIO = (sys.argv[1].rstrip('/') if len(sys.argv) > 1 else '')
WHATS = '5567996896426'

# nome, UF, região, perfil da economia local, segmentos comuns, gancho de venda
CIDADES = [
 ('Campinas', 'SP', 'interior paulista', 'Campinas reúne um dos maiores polos de tecnologia e pesquisa do estado, com universidades, indústrias e um comércio muito ativo.', ['clínicas e consultórios', 'empresas de tecnologia e serviços', 'lojas e restaurantes', 'indústrias e fornecedores'], 'Em um mercado tão competitivo, quem tem site rápido e claro ganha a atenção do cliente antes de ele ligar para o concorrente.'),
 ('Ribeirão Preto', 'SP', 'interior paulista', 'Ribeirão Preto é referência em agronegócio, saúde e serviços, com muitos profissionais liberais e empresas de médio porte.', ['clínicas e profissionais de saúde', 'empresas do agronegócio', 'lojas e serviços', 'escritórios e consultorias'], 'Quem pesquisa um serviço na cidade costuma comparar dois ou três sites antes de chamar: o seu precisa passar confiança logo na primeira tela.'),
 ('Sorocaba', 'SP', 'região de Sorocaba', 'Sorocaba tem forte base industrial e de serviços, com muitos fornecedores, lojas e prestadores atendendo a região.', ['indústrias e fornecedores', 'comércio e lojas', 'prestadores de serviço', 'restaurantes e delivery'], 'Um site bem feito ajuda a empresa a ser encontrada por clientes e parceiros que ainda não a conhecem.'),
 ('São José dos Campos', 'SP', 'Vale do Paraíba', 'São José dos Campos é um polo de tecnologia, indústria e aeroespacial no Vale do Paraíba, com um público bastante exigente.', ['empresas de tecnologia e engenharia', 'indústrias e fornecedores', 'clínicas e consultórios', 'comércio e serviços'], 'Para quem vende para empresas, o site é o cartão de visitas: precisa explicar rápido o que a empresa faz e como falar com ela.'),
 ('São José do Rio Preto', 'SP', 'noroeste paulista', 'São José do Rio Preto é o principal polo de comércio e serviços do noroeste paulista, com muita atividade na área da saúde.', ['clínicas e hospitais', 'lojas e comércio', 'imobiliárias e serviços', 'indústrias de semijoias e alimentos'], 'Com tanta oferta na cidade, um site profissional ajuda o seu negócio a ser lembrado e a transformar a busca em contato no WhatsApp.'),
 ('Jundiaí', 'SP', 'região de Jundiaí', 'Jundiaí combina logística, indústria e comércio, perto da capital e de Campinas, com muitas empresas de médio porte.', ['empresas de logística e indústria', 'comércio e restaurantes', 'clínicas e serviços', 'escritórios e consultorias'], 'Quem está entre duas grandes cidades disputa clientes de fora: o site é o que mostra que a empresa é séria e está pronta para atender.'),
 ('Piracicaba', 'SP', 'região de Piracicaba', 'Piracicaba tem indústria forte, ligação com o agro e a cana, e uma cena universitária que movimenta o comércio e os serviços.', ['indústrias e metalúrgicas', 'empresas do agro', 'comércio e lojas', 'clínicas e serviços'], 'Muito cliente decide pelo celular: um site leve, com orçamento a um toque, faz diferença na hora da escolha.'),
 ('Bauru', 'SP', 'centro-oeste paulista', 'Bauru é centro de comércio e serviços do centro-oeste paulista, com universidades, saúde e muitos prestadores.', ['comércio e lojas', 'clínicas e consultórios', 'serviços e escritórios', 'restaurantes e lanchonetes'], 'Para o comércio local, um site claro, com os serviços e o botão do WhatsApp, facilita o contato e reduz o vai e vem de mensagens.'),
 ('São Paulo', 'SP', 'capital paulista', 'São Paulo é o maior mercado do país: a concorrência é intensa e o cliente pesquisa muito antes de decidir.', ['pequenas empresas e comércios de bairro', 'prestadores de serviço e profissionais liberais', 'restaurantes e delivery', 'consultorias e startups'], 'Na capital, quem se destaca é quem tem uma presença digital organizada: site claro, rápido e com contato fácil.'),
 ('Campo Grande', 'MS', 'capital sul-mato-grossense', 'Campo Grande é a capital de Mato Grosso do Sul, com comércio e serviços fortes e muito ligada ao agronegócio do estado.', ['comércio e lojas', 'clínicas e consultórios', 'empresas do agro e fornecedores', 'restaurantes e delivery'], 'Com tantos negócios disputando o mesmo público, ter site próprio dá autonomia para vender sem depender só de redes sociais.'),
 ('Dourados', 'MS', 'sul de Mato Grosso do Sul', 'Dourados é o segundo maior polo do estado, com agronegócio, comércio e serviços atendendo uma grande região.', ['empresas do agronegócio', 'comércio e lojas', 'clínicas e serviços', 'indústrias e fornecedores'], 'Quem atende uma região inteira precisa ser encontrado por clientes de outras cidades: o site é a vitrine que trabalha 24 horas.'),
 ('Três Lagoas', 'MS', 'leste de Mato Grosso do Sul', 'Três Lagoas tem uma economia industrial forte, ligada à celulose, e um comércio que cresce junto com as empresas da região.', ['indústrias e prestadores de serviço industrial', 'comércio e lojas', 'clínicas e consultórios', 'restaurantes e hotéis'], 'Com a movimentação de empresas e profissionais de fora, ter um site claro ajuda o seu negócio a ser achado por quem chega à cidade.'),
 ('Corumbá', 'MS', 'Pantanal e fronteira', 'Corumbá está na fronteira com a Bolívia, no Pantanal, com turismo, mineração, logística e comércio.', ['turismo, pousadas e passeios', 'comércio e serviços', 'logística e transporte', 'restaurantes'], 'No turismo e no comércio de fronteira, o site com fotos, informações e contato direto é o primeiro passo para o cliente reservar.'),
 ('Ponta Porã', 'MS', 'fronteira com o Paraguai', 'Ponta Porã faz fronteira com Pedro Juan Caballero, com um comércio dinâmico e muito movimento de clientes dos dois lados.', ['lojas e comércio', 'serviços e profissionais', 'restaurantes e hotéis', 'empresas do agro'], 'Em uma cidade de fronteira, um site simples e rápido, com WhatsApp em destaque, aproxima o negócio de quem está procurando.'),
 ('Naviraí', 'MS', 'sul de Mato Grosso do Sul', 'Naviraí tem forte atividade do agronegócio e uma rede de comércio e serviços que atende toda a região.', ['empresas do agro e fornecedores', 'comércio e lojas', 'prestadores de serviço', 'clínicas e escritórios'], 'Pequenas e médias empresas ganham muito quando aparecem organizadas na internet, mostrando o que fazem e como contratar.'),
 ('Nova Andradina', 'MS', 'leste de Mato Grosso do Sul', 'Nova Andradina tem pecuária, comércio e serviços que atendem as cidades vizinhas.', ['empresas do agro e pecuária', 'comércio e lojas', 'prestadores de serviço', 'restaurantes e hotéis'], 'Um site com os serviços e o contato facilitado ajuda a empresa a vender para além da própria cidade.'),
 ('Sidrolândia', 'MS', 'região de Campo Grande', 'Sidrolândia fica perto de Campo Grande e combina agronegócio, indústria e comércio em crescimento.', ['empresas do agro', 'indústrias e fornecedores', 'comércio e lojas', 'prestadores de serviço'], 'Estar perto da capital significa disputar clientes com ela: o site coloca o seu negócio no mesmo patamar de visibilidade.'),
 ('Maracaju', 'MS', 'região de Dourados', 'Maracaju é uma cidade ligada ao agronegócio, com comércio e prestadores que atendem produtores e moradores.', ['empresas do agro e revendas', 'comércio e lojas', 'prestadores de serviço', 'restaurantes'], 'Para quem atende o campo e a cidade, um site com produtos, serviços e contato claro economiza tempo de atendimento.'),
 ('Aquidauana', 'MS', 'região do Pantanal', 'Aquidauana combina turismo, pecuária e comércio, na porta de entrada do Pantanal.', ['turismo, pousadas e passeios', 'pecuária e agro', 'comércio e lojas', 'restaurantes'], 'Turismo vive de confiança: fotos, informações e um jeito fácil de reservar fazem o visitante escolher o seu serviço.'),
 ('Paranaíba', 'MS', 'leste de Mato Grosso do Sul', 'Paranaíba é uma cidade do leste do estado, com pecuária, comércio e serviços que atendem a região e cidades vizinhas.', ['pecuária e agro', 'comércio e lojas', 'prestadores de serviço', 'restaurantes e hotéis'], 'Com um site, o comércio local passa a ser encontrado por clientes de fora, e não só por quem já conhece.'),
 ('Chapadão do Sul', 'MS', 'nordeste de Mato Grosso do Sul', 'Chapadão do Sul é um polo agrícola, forte em grãos, com um comércio e serviços em expansão.', ['empresas do agro e fornecedores', 'comércio e lojas', 'prestadores de serviço', 'clínicas e escritórios'], 'Em uma cidade que cresce rápido, quem organiza a presença digital cedo sai na frente na hora de conquistar clientes.'),
 ('Rio Brilhante', 'MS', 'região de Dourados', 'Rio Brilhante tem agronegócio e indústria, com um comércio que atende a cidade e a região.', ['empresas do agro e indústria', 'comércio e lojas', 'prestadores de serviço', 'restaurantes e lanchonetes'], 'Um site simples, com o que a empresa oferece e o botão do WhatsApp, já resolve boa parte do atendimento inicial.'),
]


def slug(t):
    t = unicodedata.normalize('NFKD', t).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')


e = html.escape
idx = open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()


def pega(ini, fim):
    a = idx.index(ini)
    b = idx.index(fim, a) + len(fim)
    return idx[a:b]


sprite = pega('<svg width="0" height="0"', '</svg>')
header0 = pega('<header class="site-header">', '</header>')
footer0 = pega('<footer class="site-footer">', '</footer>')


def ajusta(h, prefixo):
    """Reescreve os caminhos da home para uma página em subpasta (prefixo '../' ou '../../')."""
    h = h.replace('src="assets/', 'src="%sassets/' % prefixo)
    for a, d in (('#topo', prefixo), ('#servicos', prefixo + '#servicos'),
                 ('#como-trabalhamos', prefixo + '#como-trabalhamos'), ('#sobre', prefixo + '#sobre')):
        h = h.replace('href="%s"' % a, 'href="%s"' % d)
    return h.replace(' class="is-active"', '')


def whats(cidade):
    return 'https://wa.me/%s?text=%s' % (WHATS, quote('Olá, vim pelo site e gostaria de um orçamento de site para minha empresa em %s.' % cidade))


def pagina(c, todas):
    nome, uf, reg, perfil, segs, gancho = c
    s = slug(nome)
    titulo = 'Criação de Sites em %s | Aldem Gestão Estratégica' % nome
    desc = 'Criação de sites e landing pages para empresas de %s-%s. Atendimento online, orçamento pelo WhatsApp. Aldem Gestão Estratégica.' % (nome, uf)
    url = '%s/criacao-de-sites/%s/' % (DOMINIO, s) if DOMINIO else ''
    canon = ('<link rel="canonical" href="%s" />\n  <meta property="og:url" content="%s" />' % (url, url)) if DOMINIO else ''
    mesma_uf = [x for x in todas if x[0] != nome and x[1] == uf][:6]
    links = ''.join('<a href="../%s/">Sites em %s</a>' % (slug(x[0]), e(x[0])) for x in mesma_uf)
    lista = ''.join('<li>%s</li>' % e(x) for x in segs)
    faq = [
        ('Vocês atendem empresas de %s?' % nome, 'Sim. O atendimento é feito online, por WhatsApp e reunião por vídeo, então a empresa de %s não precisa se deslocar. Do briefing à publicação, tudo é acompanhado à distância.' % nome),
        ('Quanto custa um site para a minha empresa em %s?' % nome, 'O valor depende do que você precisa: site institucional, landing page ou painel. Peça um orçamento pelo WhatsApp e informe o ramo da empresa; o valor é combinado antes de começar.'),
        ('Quanto tempo leva para ficar pronto?', 'Depende do tamanho do projeto. Uma landing page simples costuma ser bem mais rápida que um site completo. O prazo é combinado no orçamento, antes de qualquer pagamento.'),
        ('O site aparece no Google quando buscam em %s?' % nome, 'Todo site é entregue com a estrutura básica para o Google entender a empresa e a cidade onde ela atua. A posição na busca depende também do conteúdo, do tempo de site e de um perfil da empresa no Google bem preenchido, e ninguém consegue garantir o primeiro lugar.'),
    ]
    faq_html = ''.join('<details><summary>%s</summary><p>%s</p></details>' % (e(q), e(a)) for q, a in faq)
    perguntas = ', '.join('{"@type": "Question", "name": %s, "acceptedAnswer": {"@type": "Answer", "text": %s}}' % (json.dumps(q, ensure_ascii=False), json.dumps(a, ensure_ascii=False)) for q, a in faq)
    ld = '''{
    "@context": "https://schema.org",
    "@graph": [
      {"@type": "ProfessionalService", "name": "Aldem Gestão Estratégica", "description": %s, "telephone": "+%s", "areaServed": {"@type": "City", "name": %s}, "serviceType": ["Criação de sites", "Landing pages", "Gestão de dados e indicadores"]%s},
      {"@type": "FAQPage", "mainEntity": [%s]}
    ]
  }''' % (json.dumps(desc, ensure_ascii=False), WHATS, json.dumps(nome, ensure_ascii=False), (', "url": "%s"' % url) if DOMINIO else '', perguntas)
    corpo = '''<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>@titulo@</title>
  <meta name="description" content="@desc@" />
  <meta name="robots" content="index, follow" />
  @canon@
  <meta property="og:title" content="@titulo@" />
  <meta property="og:description" content="@desc@" />
  <meta property="og:type" content="website" />
  <link rel="icon" href="/favicon.ico" sizes="48x48" />
  <link rel="icon" type="image/png" href="/assets/img/favicon-96.png" sizes="96x96" />
  <link rel="icon" type="image/png" href="/assets/img/favicon-192.png" sizes="192x192" />
  <link rel="apple-touch-icon" href="../../assets/img/apple-touch-icon.png" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../../assets/css/styles.css" />
  <link rel="stylesheet" href="../../assets/css/effects.css" />
  <link rel="stylesheet" href="../../assets/css/light.css" id="tema-claro" />
  <link rel="stylesheet" href="../../assets/css/tema.css" />
  <link rel="stylesheet" href="../../assets/css/cidade.css" />
  <script type="application/ld+json">
  @ld@
  </script>
  <script>document.documentElement.dataset.tema = 'claro';</script>
</head>
<body>
  @sprite@
  @header@

  <main>
    <section class="cid-hero">
      <div class="wrap">
        <p class="cid-eyebrow">@nome@ · @uf@</p>
        <h1>Criação de sites em @nome@</h1>
        <p class="cid-lead">Sites e landing pages para empresas de @nome@ e região. Atendimento online, do primeiro contato à publicação.</p>
        <div class="cid-acoes">
          <a class="btn btn-whats btn-cta" href="@zap@" target="_blank" rel="noopener noreferrer">Pedir orçamento pelo WhatsApp</a>
          <a class="cid-link" href="../../#projetos">Ver projetos</a>
        </div>
      </div>
    </section>

    <section class="cid-sec">
      <div class="wrap cid-grid">
        <div>
          <h2>O que fazemos para empresas de @nome@</h2>
          <p>@perfil@ @gancho@</p>
          <p>A Aldem Gestão Estratégica une presença digital e gestão: além do site, ajudamos a organizar os dados da empresa em painéis de indicadores, para decidir com números.</p>
        </div>
        <ul class="cid-cards">
          <li><b>Site institucional</b><span>Apresenta a empresa, os serviços e o contato, com visual profissional.</span></li>
          <li><b>Landing page</b><span>Uma página focada em um serviço ou campanha, pensada para gerar contatos.</span></li>
          <li><b>Painéis e sistemas</b><span>Indicadores e aplicativos sob medida para acompanhar a operação.</span></li>
        </ul>
      </div>
    </section>

    <section class="cid-sec cid-alt">
      <div class="wrap">
        <h2>Negócios que mais se beneficiam em @nome@</h2>
        <ul class="cid-seg">@lista@</ul>
        <p class="cid-nota">Não atende a nenhum desses ramos? Sem problema: o projeto é feito sob medida para o seu tipo de negócio.</p>
      </div>
    </section>

    <section class="cid-sec">
      <div class="wrap cid-passos">
        <h2>Como funciona o atendimento em @nome@</h2>
        <ol>
          <li><b>Conversa pelo WhatsApp</b><span>Você conta o que precisa e recebe um orçamento.</span></li>
          <li><b>Reunião por vídeo</b><span>Definimos conteúdo, visual e o que o site precisa fazer pelo seu negócio.</span></li>
          <li><b>Desenvolvimento e ajustes</b><span>Você acompanha o projeto e pede os ajustes antes de publicar.</span></li>
          <li><b>Publicação e acompanhamento</b><span>Site no ar, e acompanhamento mensal para manter tudo funcionando.</span></li>
        </ol>
      </div>
    </section>

    <section class="cid-sec cid-alt">
      <div class="wrap cid-faq">
        <h2>Perguntas frequentes</h2>
        @faq@
      </div>
    </section>

    <section class="cid-sec cid-fim">
      <div class="wrap">
        <h2>Vamos colocar a sua empresa de @nome@ na internet?</h2>
        <a class="btn btn-whats btn-cta" href="@zap@" target="_blank" rel="noopener noreferrer">Falar pelo WhatsApp</a>
        <p class="cid-outras"><span>Também atendemos:</span> @links@ <a href="../">Todas as cidades</a></p>
      </div>
    </section>
  </main>

  @footer@

  <script src="../../assets/js/script.js"></script>
  <script src="../../assets/js/tema.js"></script>
</body>
</html>
'''
    troca = dict(titulo=e(titulo), desc=e(desc), canon=canon, ld=ld, sprite=sprite,
                 header=ajusta(header0, '../../'), footer=ajusta(footer0, '../../'),
                 nome=e(nome), uf=uf, reg=e(reg), perfil=e(perfil), gancho=e(gancho),
                 lista=lista, faq=faq_html, zap=whats(nome), links=links)
    for k, v in troca.items():
        corpo = corpo.replace('@%s@' % k, v)
    return corpo


def pagina_home(c):
    """Página da cidade = a própria home do site, com o texto adaptado à cidade (mesmo visual, mesmas seções)."""
    nome, uf, reg, perfil, segs, gancho = c
    s = slug(nome)
    h = idx
    # caminhos relativos: a página fica em /criacao-de-sites/<cidade>/
    h = re.sub(r'(src|href)="assets/', r'\1="../../assets/', h)
    h = h.replace('href="manifest.webmanifest"', 'href="../../manifest.webmanifest"')
    # rodapé: sem o link para a lista de cidades
    h = re.sub(r' · <a href="criacao-de-sites/">[^<]*</a>', '', h)
    # título, descrição e endereço da página
    titulo = 'Criação de Sites em %s | Aldem Gestão Estratégica' % nome
    desc = 'Criação de sites e landing pages, aplicativos e painéis de indicadores para empresas de %s-%s. Atendimento online, orçamento pelo WhatsApp. Aldem Gestão Estratégica.' % (nome, uf)
    h = re.sub(r'<title>.*?</title>', '<title>%s</title>' % e(titulo), h, 1, re.S)
    h = re.sub(r'<meta name="description" content="[^"]*" />', '<meta name="description" content="%s" />' % e(desc), h, 1)
    h = re.sub(r'<meta property="og:title" content="[^"]*" />', '<meta property="og:title" content="%s" />' % e(titulo), h, 1)
    h = re.sub(r'<meta property="og:description" content="[^"]*" />', '<meta property="og:description" content="%s" />' % e(desc), h, 1)
    url = '%s/criacao-de-sites/%s/' % (DOMINIO, s) if DOMINIO else ''
    if DOMINIO:
        h = re.sub(r'<link rel="canonical" href="[^"]*" />', '<link rel="canonical" href="%s" />' % url, h, 1)
        h = re.sub(r'<meta property="og:url" content="[^"]*" />', '<meta property="og:url" content="%s" />' % url, h, 1)
    else:
        h = re.sub(r'\s*<link rel="canonical" href="[^"]*" />', '', h, 1)
        h = re.sub(r'\s*<meta property="og:url" content="[^"]*" />', '', h, 1)
    ld = '{"@context": "https://schema.org", "@type": "ProfessionalService", "name": "Aldem Gestão Estratégica", "description": %s, "telephone": "+%s", "areaServed": {"@type": "City", "name": %s}, "serviceType": ["Criação de sites", "Landing pages", "Gestão de dados e indicadores"]%s}' % (
        json.dumps(desc, ensure_ascii=False), WHATS, json.dumps(nome, ensure_ascii=False), (', "url": "%s"' % url) if DOMINIO else '')
    h = re.sub(r'(<script type="application/ld\+json">\s*).*?(\s*</script>)', lambda m: m.group(1) + ld + m.group(2), h, 1, re.S)
    # texto da primeira tela, adaptado à cidade
    h = h.replace('<b>ALDEM</b> / gestão estratégica<i class="caret">_</i>', '<b>ALDEM</b> / criação de sites em %s<i class="caret">_</i>' % e(nome), 1)
    h = h.replace('IA aplicada para empresas que querem crescer', 'IA aplicada para empresas de %s que querem crescer' % e(nome), 1)
    # parágrafo local no "Sobre" e na chamada final
    local = '<p class="about-text">%s %s</p>' % (e(perfil), e(gancho))
    m = list(re.finditer(r'<p class="about-text">.*?</p>', h, re.S))
    if m:
        k = m[-1].end()
        h = h[:k] + '\n          ' + local + h[k:]
    h = h.replace('<p class="cta-lead">Conte como funciona o seu negócio.</p>', '<p class="cta-lead">Conte como funciona o seu negócio em %s.</p>' % e(nome), 1)
    return h


def indice(todas):
    blocos = ''
    for uf, nomeuf in (('MS', 'Mato Grosso do Sul'), ('SP', 'São Paulo')):
        itens = ''.join('<a href="%s/">Criação de sites em %s</a>' % (slug(c[0]), e(c[0])) for c in todas if c[1] == uf)
        blocos += '<h2>%s</h2><div class="cid-lista">%s</div>' % (nomeuf, itens)
    canon = ('<link rel="canonical" href="%s/criacao-de-sites/" />' % DOMINIO) if DOMINIO else ''
    corpo = '''<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Criação de Sites por Cidade | Aldem Gestão Estratégica</title>
  <meta name="description" content="Criação de sites e landing pages para empresas de Mato Grosso do Sul e São Paulo. Atendimento online. Aldem Gestão Estratégica." />
  @canon@
  <link rel="icon" href="/favicon.ico" sizes="48x48" />
  <link rel="icon" type="image/png" href="/assets/img/favicon-96.png" sizes="96x96" />
  <link rel="icon" type="image/png" href="/assets/img/favicon-192.png" sizes="192x192" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../assets/css/styles.css" />
  <link rel="stylesheet" href="../assets/css/effects.css" />
  <link rel="stylesheet" href="../assets/css/light.css" id="tema-claro" />
  <link rel="stylesheet" href="../assets/css/tema.css" />
  <link rel="stylesheet" href="../assets/css/cidade.css" />
  <script>document.documentElement.dataset.tema = 'claro';</script>
</head>
<body>
  @sprite@
  @header@
  <main>
    <section class="cid-hero"><div class="wrap">
      <p class="cid-eyebrow">Atendimento online</p>
      <h1>Criação de sites por cidade</h1>
      <p class="cid-lead">Escolha a sua cidade para ver como atendemos empresas da sua região.</p>
    </div></section>
    <section class="cid-sec"><div class="wrap">@blocos@</div></section>
  </main>
  @footer@
  <script src="../assets/js/script.js"></script>
  <script src="../assets/js/tema.js"></script>
</body>
</html>
'''
    troca = dict(canon=canon, sprite=sprite, header=ajusta(header0, '../'), footer=ajusta(footer0, '../'), blocos=blocos)
    for k, v in troca.items():
        corpo = corpo.replace('@%s@' % k, v)
    return corpo


pasta = os.path.join(RAIZ, 'criacao-de-sites')
os.makedirs(pasta, exist_ok=True)
for c in CIDADES:
    d = os.path.join(pasta, slug(c[0]))
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(pagina_home(c))
open(os.path.join(pasta, 'index.html'), 'w', encoding='utf-8').write(indice(CIDADES))

if DOMINIO:
    urls = [DOMINIO + '/', DOMINIO + '/criacao-de-sites/'] + ['%s/criacao-de-sites/%s/' % (DOMINIO, slug(c[0])) for c in CIDADES]
    open(os.path.join(RAIZ, 'sitemap.xml'), 'w', encoding='utf-8').write(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + ''.join('  <url><loc>%s</loc></url>\n' % u for u in urls) + '</urlset>\n')
    open(os.path.join(RAIZ, 'robots.txt'), 'w', encoding='utf-8').write('User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n' % DOMINIO)
print('OK: %d cidades%s' % (len(CIDADES), ' + sitemap/robots' if DOMINIO else ' (sem dominio: sem canonical/sitemap)'))
