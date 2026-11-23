(function () {
  var html = document.documentElement;
  var link = document.getElementById('tema-claro');
  // caminho das imagens relativo a este script (funciona também nas páginas de cidade, em subpastas)
  var IMG = document.currentScript && document.currentScript.src ? new URL('../img/', document.currentScript.src).href : 'assets/img/';
  var LOGO = { claro: IMG + 'logo-aldem-principal.png', escuro: IMG + 'logo-aldem.png' };

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

/* Formulário de contato: ao enviar, abre o e-mail (Gmail) já escrito com os dados preenchidos, como o botão de e-mail fazia */
(function () {
  var form = document.getElementById('form-contato');
  if (!form) return;
  var status = form.querySelector('.cta-status');
  var EMAIL = 'aldem.gestao@gmail.com';
  var BR = '\r\n';
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var f = form.elements;
    var nome = f.nome.value.trim(), email = f.email.value.trim(), empresa = f.empresa.value.trim(), mensagem = f.mensagem.value.trim();
    var corpo = 'Olá, equipe Aldem!' + BR + BR +
      'Nome: ' + nome + BR +
      'E-mail: ' + (email || '-') + BR +
      'Empresa: ' + (empresa || '-') + BR + BR +
      'Mensagem:' + BR + mensagem;
    var url = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(EMAIL) +
      '&su=' + encodeURIComponent('Contato pelo site: ' + nome + (empresa ? ' (' + empresa + ')' : '')) +
      '&body=' + encodeURIComponent(corpo);
    var w = window.open(url, '_blank', 'noopener');
    status.className = 'cta-status ok';
    if (w) {
      status.textContent = 'Abrimos o seu e-mail com a mensagem pronta. É só clicar em Enviar por lá.';
    } else {
      status.innerHTML = 'Seu navegador bloqueou a janela. <a href="' + url + '" target="_blank" rel="noopener noreferrer">Clique aqui para abrir o e-mail</a>.';
    }
  });
})();
