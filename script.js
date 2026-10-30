// Aldem Gestão Estratégica — interações da página

const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (menuToggle && mobileMenu) {
  const iconMenu = menuToggle.querySelector('.icon-menu');
  const iconClose = menuToggle.querySelector('.icon-close');

  function setMenuState(isOpen) {
    mobileMenu.hidden = !isOpen;
    if (iconMenu) iconMenu.style.display = isOpen ? 'none' : '';
    if (iconClose) iconClose.style.display = isOpen ? '' : 'none';
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  }

  function fecharMenu() {
    setMenuState(false);
  }

  menuToggle.addEventListener('click', function () {
    setMenuState(mobileMenu.hidden);
  });

  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', fecharMenu);
  });

  document.addEventListener('click', function (event) {
    const clickedInsideMenu = mobileMenu.contains(event.target);
    const clickedToggle = menuToggle.contains(event.target);

    if (!clickedInsideMenu && !clickedToggle && !mobileMenu.hidden) {
      fecharMenu();
    }
  });
}

// ---------- Destaque do item ativo no menu (conforme a rolagem) ----------
const navLinks = document.querySelectorAll('.nav-links a');
const secoes = ['inicio', 'desafios', 'servicos', 'como-trabalhamos', 'sobre']
  .map(function (id) { return document.getElementById(id); })
  .filter(Boolean);

function setActiveLink(targetId) {
  navLinks.forEach(function (link) {
    const isActive = link.getAttribute('href') === '#' + targetId;
    link.classList.toggle('is-active', isActive);
  });
}

if (secoes.length) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          setActiveLink(entrada.target.id);
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });

    secoes.forEach(function (secao) { observer.observe(secao); });
  } else {
    const handleScrollFallback = function () {
      let currentSection = secoes[0];

      secoes.forEach(function (secao) {
        const rect = secao.getBoundingClientRect();
        if (rect.top <= 180) {
          currentSection = secao;
        }
      });

      setActiveLink(currentSection.id);
    };

    window.addEventListener('scroll', handleScrollFallback, { passive: true });
    handleScrollFallback();
  }
}

// ---------- Dashboard do topo: alterna Dados ⇄ Landing page (8 s cada) ----------
(function () {
  var views = document.querySelectorAll('.dash-view');
  if (views.length < 2) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var atual = 0;

  function duracao(view) {
    return Number(view.getAttribute('data-duration')) || 8000;
  }

  function agendar() {
    setTimeout(trocar, duracao(views[atual]));
  }

  function trocar() {
    if (document.hidden) { agendar(); return; }
    var saindo = views[atual];
    atual = (atual + 1) % views.length;
    var entrando = views[atual];

    views.forEach(function (v) { v.classList.remove('is-entering', 'is-leaving'); });
    saindo.classList.add('is-leaving');
    entrando.classList.add('is-active', 'is-entering');

    setTimeout(function () {
      saindo.classList.remove('is-active', 'is-leaving');
      entrando.classList.remove('is-entering');
    }, 750);

    agendar();
  }

  agendar();
})();

// ---------- Botão flutuante de e-mail: aparece ao chegar em "Sobre" ----------
(function () {
  var botao = document.querySelector('.float-mail');
  var sobre = document.getElementById('sobre');
  if (!botao || !sobre) return;

  function atualizar() {
    var chegou = sobre.getBoundingClientRect().top <= window.innerHeight * 0.6;
    botao.classList.toggle('is-visible', chegou);
  }

  window.addEventListener('scroll', atualizar, { passive: true });
  window.addEventListener('resize', atualizar);
  atualizar();
})();

// ---------- Ao recarregar, volta para o início ----------
(function () {
  var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  var isReload = nav ? nav.type === 'reload' : (performance.navigation && performance.navigation.type === 1);
  if (!isReload || !document.querySelector('.hero')) return;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  window.scrollTo(0, 0);
  window.addEventListener('load', function () { window.scrollTo(0, 0); });
})();
