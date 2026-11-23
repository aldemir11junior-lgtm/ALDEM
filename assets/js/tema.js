(function () {
  var html = document.documentElement;
  var link = document.getElementById('tema-claro');
  var LOGO = { claro: 'assets/img/logo-aldem-principal.png', escuro: 'assets/img/logo-aldem.png' };

  var header = document.querySelector('.site-header');
  var faixas = document.querySelectorAll('#projetos, #como-trabalhamos, .site-footer');
  // Cabeçalho sobre uma faixa azul-marinho: usa o visual escuro (logo branca, fundo escuro)
  function marcarCabecalho() {
    if (!header) return;
    var y = header.offsetHeight / 2, sobre = false;
    faixas.forEach(function (f) { var r = f.getBoundingClientRect(); if (r.top <= y && r.bottom > y) sobre = true; });
    var escuro = html.dataset.tema === 'escuro' || sobre;
    header.classList.toggle('sobre-escuro', sobre);
    document.querySelectorAll('.site-header .brand-logo').forEach(function (img) { img.src = escuro ? LOGO.escuro : LOGO.claro; });
  }
  window.addEventListener('scroll', marcarCabecalho, { passive: true });
  window.addEventListener('resize', marcarCabecalho);

  function aplicar(t) {
    html.dataset.tema = t;
    link.disabled = (t === 'escuro');
    marcarCabecalho();
  }

  aplicar('claro');

})();

/* Método PDCA: a linha do tempo se desenha e as etapas 1, 2, 3 e 4 aparecem uma de cada vez */
(function () {
  var tl = document.querySelector('.pdca-tl');
  if (!tl) return;
  if (!('IntersectionObserver' in window)) return;
  tl.classList.add('pdca-pre');
  var io = new IntersectionObserver(function (es) {
    if (es[0].isIntersecting) { tl.classList.remove('pdca-pre'); tl.classList.add('pdca-run'); io.disconnect(); }
  }, { threshold: 0.45 });
  io.observe(tl);
})();

/* Menu (Início, Serviços…) flutua no topo quando a página desce */
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;
  function checar() { header.classList.toggle('nav-flutua', window.scrollY > header.offsetHeight - 30); }
  addEventListener('scroll', checar, { passive: true });
  addEventListener('resize', checar);
  checar();
})();
