// Aldem Tecnologia & Estratégias — interações da página

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

// ---------- Formulário de contato ----------
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (form && formStatus) {
  const submitButton = form.querySelector('button[type="submit"]');

  function setFormStatus(message, isError) {
    formStatus.textContent = message;
    formStatus.hidden = false;
    formStatus.classList.toggle('error', isError);
    formStatus.classList.toggle('success', !isError);
  }

  function clearFieldErrors() {
    form.querySelectorAll('label').forEach(function (label) {
      label.classList.remove('has-error');
    });
  }

  function validateForm() {
    clearFieldErrors();

    const formData = new FormData(form);
    const nome = String(formData.get('nome') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const mensagem = String(formData.get('mensagem') || '').trim();
    const fields = [
      { name: 'nome', value: nome },
      { name: 'email', value: email },
      { name: 'mensagem', value: mensagem }
    ];

    for (const field of fields) {
      if (!field.value) {
        const input = form.querySelector('[name="' + field.name + '"]');
        const label = input && input.closest('label');
        if (label) label.classList.add('has-error');
        setFormStatus('Preencha todos os campos obrigatórios antes de enviar.', true);
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const input = form.querySelector('[name="email"]');
      const label = input && input.closest('label');
      if (label) label.classList.add('has-error');
      setFormStatus('Informe um e-mail válido para receber nosso retorno.', true);
      return false;
    }

    return true;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';
    }

    const nome = String(new FormData(form).get('nome') || '').trim();

    setTimeout(function () {
      form.reset();
      setFormStatus('Mensagem enviada com sucesso! Em breve entraremos em contato com você, ' + nome + '.', false);

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Iniciar uma conversa <svg class="ico" aria-hidden="true"><use href="#i-arrow-up-right" /></svg>';
      }
    }, 500);
  });
}
