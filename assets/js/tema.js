(function () {
  var html = document.documentElement;
  var link = document.getElementById('tema-claro');
  var btn = document.getElementById('tema-toggle');
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
    if (btn) btn.setAttribute('aria-label', t === 'escuro' ? 'Mudar para o tema claro' : 'Mudar para o tema escuro');
  }

  aplicar(html.dataset.tema === 'escuro' ? 'escuro' : 'claro');

  if (btn) btn.addEventListener('click', function () {
    var novo = html.dataset.tema === 'escuro' ? 'claro' : 'escuro';
    aplicar(novo);
    try { localStorage.setItem('aldem-tema', novo); } catch (e) {}
  });
})();
