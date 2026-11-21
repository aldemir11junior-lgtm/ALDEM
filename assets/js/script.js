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
const secoes = ['inicio', 'servicos', 'como-trabalhamos', 'sobre']
  .map(function (id) { return document.getElementById(id); })
  .filter(Boolean);

function setActiveLink(targetId) {
  navLinks.forEach(function (link) {
    const href = link.getAttribute('href');
    // o link "Início" aponta para #topo, mas a seção observada é #inicio
    const isActive = href === '#' + targetId || (targetId === 'inicio' && href === '#topo');
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

// ---------- Ao abrir ou recarregar, começa no início ----------
(function () {
  var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  var tipo = nav ? nav.type : (performance.navigation && performance.navigation.type === 1 ? 'reload' : 'navigate');
  if (!document.querySelector('.hero')) return;

  var temHash = !!window.location.hash;
  // Voltar de outra página (back_forward) ou abrir com âncora (#...) mantém o comportamento normal
  if (tipo === 'back_forward' || (temHash && tipo !== 'reload')) return;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (temHash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  function topo() {
    var html = document.documentElement;
    var antes = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    html.style.scrollBehavior = antes;
  }
  topo();
  window.addEventListener('load', topo);
  window.addEventListener('pageshow', topo);
})();
