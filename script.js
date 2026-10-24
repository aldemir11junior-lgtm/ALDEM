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
const secoes = ['inicio', 'sobre', 'servicos', 'resultados', 'contato']
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
