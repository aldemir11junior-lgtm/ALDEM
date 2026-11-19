// Aldem — efeitos visuais (inspirados na lista do naocodei.com)
// Cada bloco é independente: se o elemento não existir na página, ele simplesmente não roda.

(function () {
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mouseFino = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---------- Barra de progresso de leitura ----------
  var barra = document.createElement('div');
  barra.className = 'scroll-progress';
  barra.setAttribute('aria-hidden', 'true');
  document.body.appendChild(barra);

  // ---------- Menu em cápsula: destaque que desliza até o link ----------
  var nav = document.querySelector('.nav-links');
  var cabecalho = document.querySelector('.site-header');
  if (nav) {
    var pilula = document.createElement('span');
    pilula.className = 'nav-pill';
    pilula.setAttribute('aria-hidden', 'true');
    nav.insertBefore(pilula, nav.firstChild);
    var links = nav.querySelectorAll('a');

    function moverPara(link) {
      if (!link) { pilula.style.opacity = '0'; return; }
      pilula.style.opacity = '1';
      pilula.style.width = link.offsetWidth + 'px';
      pilula.style.transform = 'translateX(' + link.offsetLeft + 'px)';
    }
    function ativo() { return nav.querySelector('a.is-active, a.is-current'); }

    links.forEach(function (a) {
      a.addEventListener('mouseenter', function () { moverPara(a); });
      a.addEventListener('focus', function () { moverPara(a); });
    });
    nav.addEventListener('mouseleave', function () { moverPara(ativo()); });

    // o script.js troca a classe "is-active" conforme a rolagem: acompanhamos essa troca
    if ('MutationObserver' in window) {
      var obsNav = new MutationObserver(function () { if (!nav.matches(':hover')) moverPara(ativo()); });
      links.forEach(function (a) { obsNav.observe(a, { attributes: true, attributeFilter: ['class'] }); });
    }
    window.addEventListener('resize', function () { moverPara(ativo()); });
    // espera a fonte carregar para medir a largura certa dos links
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moverPara(ativo()); });
    moverPara(ativo());
  }
  // cabeçalho ganha um fundo suave só depois de rolar um pouco
  if (cabecalho) {
    var marcarCabecalho = function () { cabecalho.classList.toggle('is-scrolled', window.scrollY > 10); };
    window.addEventListener('scroll', marcarCabecalho, { passive: true });
    marcarCabecalho();
  }

  // ---------- Revelar ao rolar (com cascata entre irmãos) ----------
  var alvos = document.querySelectorAll(
    '.challenges-heading, .challenge-card, .section-heading, .service-option, ' +
    '#como-trabalhamos .eyebrow, #como-trabalhamos h2, .step, .about-grid > div:first-child, .about-point, ' +
    '.service-detail-hero, .service-detail-card, .g-reveal, .process-note'
  );
  if (!reduz && 'IntersectionObserver' in window) {
    var lista = Array.prototype.slice.call(alvos);
    lista.forEach(function (el) {
      // posição entre os irmãos que também são alvos → atraso em cascata
      var irmaos = Array.prototype.filter.call(el.parentElement.children, function (x) { return lista.indexOf(x) > -1; });
      el.classList.add('reveal');
      el.style.setProperty('--rd', (irmaos.indexOf(el) * 0.09) + 's');
    });
    var obsReveal = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('in');
        obsReveal.unobserve(el);
        // terminada a entrada, devolve o elemento ao estado normal (não atrapalha hover/tilt)
        setTimeout(function () { el.classList.remove('reveal', 'in'); el.style.removeProperty('--rd'); }, 1400);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    alvos.forEach(function (el) { obsReveal.observe(el); });
  }

  // ---------- Contadores (data-count) ----------
  var contadores = document.querySelectorAll('[data-count]');
  contadores.forEach(function (el) {
    var alvo = Number(el.getAttribute('data-count')) || 0;
    if (reduz || alvo === 0) { el.textContent = alvo; return; }
    el.textContent = '0';
    var inicio = null;
    var dur = 1400;
    function passo(t) {
      if (!inicio) inicio = t;
      var k = Math.min(1, (t - inicio) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(alvo * e);
      if (k < 1) requestAnimationFrame(passo);
    }
    setTimeout(function () { requestAnimationFrame(passo); }, 1300);
  });

  // ---------- Texto que se preenche ao rolar (Sobre) ----------
  var fillEls = [];
  var sobreH2 = document.querySelector('#sobre h2');
  if (sobreH2 && !reduz) {
    sobreH2.setAttribute('data-fill', '');
    sobreH2.innerHTML = sobreH2.textContent.trim().split(/\s+/).map(function (w) {
      return '<span class="fw">' + w + '</span>';
    }).join(' ');
    fillEls.push(sobreH2);
  }

  // ---------- Linha do tempo do PDCA ----------
  var processo = document.querySelector('.process-grid');
  var passos = processo ? processo.querySelectorAll('.step') : [];

  // ---------- Um único laço de rolagem para tudo que depende do scroll ----------
  var agendado = false;
  function aoRolar() {
    agendado = false;
    var vh = window.innerHeight;
    var doc = document.documentElement;
    var max = doc.scrollHeight - vh;
    barra.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : 0);

    if (processo) {
      var r = processo.getBoundingClientRect();
      // 0 quando o topo da grade está a 85% da tela; 1 quando chega a 35%
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.5)));
      if (reduz) p = 1;
      processo.style.setProperty('--p', p.toFixed(3));
      passos.forEach(function (s, i) { s.classList.toggle('on', p >= i / passos.length + 0.02); });
    }

    fillEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (vh * 0.45)));
      var ws = el.querySelectorAll('.fw');
      var n = Math.round(p * ws.length);
      ws.forEach(function (w, i) { w.classList.toggle('on', i < n); });
    });
  }
  function pedir() { if (!agendado) { agendado = true; requestAnimationFrame(aoRolar); } }
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  aoRolar();

  if (reduz) return; // daqui pra baixo, só efeitos de movimento

  // ---------- Luz que segue o mouse (hero) ----------
  var hero = document.querySelector('.hero');
  if (hero && mouseFino) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }

  // ---------- Partículas conectadas (hero) ----------
  var canvas = document.querySelector('.hero-canvas');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var pts = [];
    var W = 0, H = 0, dpr = 1;
    var mouse = { x: -9999, y: -9999 };
    var visivel = true;
    var LIGA = 130; // distância máxima para ligar dois pontos

    function montar() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var qtd = Math.round(Math.min(90, (W * H) / 16000));
      pts = [];
      for (var i = 0; i < qtd; i++) {
        pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3 });
      }
    }

    function quadro() {
      if (!visivel) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i];
        // o mouse empurra os pontos de leve
        var dx = a.x - mouse.x, dy = a.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { var f = 0.6 / Math.sqrt(d2 + 1); a.vx += dx * f * 0.05; a.vy += dy * f * 0.05; }
        a.vx *= 0.985; a.vy *= 0.985;
        if (Math.abs(a.vx) < 0.05) a.vx += (Math.random() - 0.5) * 0.04;
        if (Math.abs(a.vy) < 0.05) a.vy += (Math.random() - 0.5) * 0.04;
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;

        for (var j = i + 1; j < pts.length; j++) {
          var b = pts[j];
          var ex = a.x - b.x, ey = a.y - b.y, d = Math.sqrt(ex * ex + ey * ey);
          if (d < LIGA) {
            ctx.strokeStyle = 'rgba(120,180,255,' + (0.22 * (1 - d / LIGA)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(160,205,255,0.7)';
        ctx.fillRect(a.x - 1, a.y - 1, 2, 2);
      }
      requestAnimationFrame(quadro);
    }

    montar();
    window.addEventListener('resize', function () { montar(); });
    if (hero) {
      hero.addEventListener('pointermove', function (e) {
        var r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      });
      hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
    }
    // só desenha enquanto o hero está na tela
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        var antes = visivel;
        visivel = es[0].isIntersecting && !document.hidden;
        if (visivel && !antes) requestAnimationFrame(quadro);
      }).observe(canvas);
    }
    document.addEventListener('visibilitychange', function () {
      var antes = visivel;
      visivel = !document.hidden;
      if (visivel && !antes) requestAnimationFrame(quadro);
    });
    requestAnimationFrame(quadro);
  }

  if (!mouseFino) return; // efeitos abaixo só fazem sentido com mouse

  // ---------- Inclinação 3D + luz dentro do cartão ----------
  function tilt(el, alvoLuz, forca) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.classList.add('is-tilting');
      el.style.transform = 'perspective(800px) rotateX(' + ((0.5 - y) * forca) + 'deg) rotateY(' + ((x - 0.5) * forca) + 'deg) translateY(-3px)';
      var lr = alvoLuz.getBoundingClientRect();
      alvoLuz.style.setProperty('--mx', (e.clientX - lr.left) + 'px');
      alvoLuz.style.setProperty('--my', (e.clientY - lr.top) + 'px');
    });
    el.addEventListener('pointerleave', function () {
      el.classList.remove('is-tilting');
      el.style.transform = '';
    });
  }
  document.querySelectorAll('.challenge-card').forEach(function (c) { tilt(c, c, 8); });
  document.querySelectorAll('.service-option').forEach(function (o) {
    var frame = o.querySelector('.service-icon-frame');
    if (frame) tilt(frame, frame, 14);
  });

  // ---------- Botões magnéticos ----------
  document.querySelectorAll('[data-magnetic], .header-cta').forEach(function (b) {
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect();
      var x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
      b.style.transform = 'translate(' + (x * 0.25) + 'px,' + (y * 0.35) + 'px)';
    });
    b.addEventListener('pointerleave', function () { b.style.transform = ''; });
  });

  // ---------- Cursor: anel que segue com atraso ----------
  var anel = document.createElement('div');
  anel.className = 'cursor-ring';
  anel.setAttribute('aria-hidden', 'true');
  document.body.appendChild(anel);
  var cx = -100, cy = -100, ax = -100, ay = -100;
  window.addEventListener('pointermove', function (e) {
    cx = e.clientX; cy = e.clientY;
    anel.classList.add('on');
    var link = e.target.closest && e.target.closest('a, button, .challenge-card');
    anel.classList.toggle('hover', !!link);
  }, { passive: true });
  document.addEventListener('pointerleave', function () { anel.classList.remove('on'); });
  (function seguir() {
    ax += (cx - ax) * 0.18; ay += (cy - ay) * 0.18;
    anel.style.transform = 'translate(' + ax + 'px,' + ay + 'px)';
    requestAnimationFrame(seguir);
  })();
})();
