(function () {
  var html = document.documentElement;
  var link = document.getElementById('tema-claro');
  var btn = document.getElementById('tema-toggle');
  var LOGO = { claro: 'assets/img/logo-aldem-principal.png', escuro: 'assets/img/logo-aldem.png' };

  function aplicar(t) {
    html.dataset.tema = t;
    link.disabled = (t === 'escuro');
    document.querySelectorAll('.brand-logo').forEach(function (img) { img.src = LOGO[t]; });
    if (btn) btn.setAttribute('aria-label', t === 'escuro' ? 'Mudar para o tema claro' : 'Mudar para o tema escuro');
  }

  aplicar(html.dataset.tema === 'escuro' ? 'escuro' : 'claro');

  if (btn) btn.addEventListener('click', function () {
    var novo = html.dataset.tema === 'escuro' ? 'claro' : 'escuro';
    aplicar(novo);
    try { localStorage.setItem('aldem-tema', novo); } catch (e) {}
  });
})();
