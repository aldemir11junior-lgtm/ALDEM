// Aldem — blocos de gestão (home), conexões da jornada (gestão externa), chamada final e animações de entrada

(function () {
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function limitar(v) { return Math.min(1, Math.max(0, v)); }
  function suavizar(t) { return 1 - Math.pow(1 - t, 3); }

  /* =====================================================================
     HOME — os dois blocos chegam pelas laterais e se encaixam no meio
     ===================================================================== */
  var palco = document.querySelector('.blocks-stage');
  var trilho = document.querySelector('.blocks-scroll');
  if (palco && trilho) {
    var blocos = palco.querySelectorAll('.g-block');
    var desktop = window.matchMedia('(min-width: 901px)');
    var juntou = false;

    function marcarEncaixe(ok) {
      if (ok && !juntou) { juntou = true; palco.classList.add('joined'); }
      if (!ok && juntou) { juntou = false; palco.classList.remove('joined'); }
    }

    function atualizarBlocos() {
      if (reduz) { palco.style.setProperty('--e', 1); marcarEncaixe(true); return; }
      var vh = window.innerHeight;

      if (desktop.matches) {
        // A seção "gruda" na tela; a rolagem dentro dela aproxima os blocos.
        blocos.forEach(function (b) { b.style.removeProperty('--e'); });
        var r = trilho.getBoundingClientRect();
        var percurso = r.height - vh;                       // quanto dá pra rolar com a seção grudada
        var inicio = vh * 0.55;                             // começa quando o topo passa de 55% da tela
        var fim = -percurso * 0.55;                         // encaixa na metade do percurso grudado
        var t = limitar((inicio - r.top) / (inicio - fim));
        var e = suavizar(t);
        palco.style.setProperty('--e', e.toFixed(4));
        marcarEncaixe(t >= 0.999);
      } else {
        // Celular: um embaixo do outro, cada um entrando do seu lado.
        palco.style.removeProperty('--e');
        var todos = true;
        blocos.forEach(function (b) {
          var rb = b.getBoundingClientRect();
          var tb = limitar((vh * 0.95 - rb.top) / (vh * 0.45));
          b.style.setProperty('--e', suavizar(tb).toFixed(4));
          if (tb < 0.999) todos = false;
        });
        marcarEncaixe(todos);
      }
    }

    var pedido = false;
    function pedir() { if (!pedido) { pedido = true; requestAnimationFrame(function () { pedido = false; atualizarBlocos(); }); } }
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    atualizarBlocos();
  }

  /* =====================================================================
     GESTÃO EXTERNA — conexões da jornada (fios, portas e pulsos de luz)
     Mede onde estão as portas dos cartões e desenha curvas entre elas.
     Os pulsos seguem o mesmo ciclo de 3,6 s dos cartões que "acendem" (CSS).
     ===================================================================== */
  (function () {
    var jr = document.querySelector('.jr');
    var svg = jr && jr.querySelector('.jr-svg');
    if (!jr || !svg) return;
    var ultima = '';

    // posição do centro de um elemento dentro do .jr, sem contar transformações (animação de entrada)
    function centro(el) {
      var x = 0, y = 0, n = el;
      while (n && n !== jr) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 };
    }
    function r1(v) { return Math.round(v * 10) / 10; }

    function desenhar() {
      var s1b = jr.querySelector('.jr-s1 .jr-pb');
      var s2t = jr.querySelector('.jr-s2 .jr-pt');
      var s2b = jr.querySelector('.jr-s2 .jr-pb');
      var cts = [].slice.call(jr.querySelectorAll('.jr-c .jr-pt'));
      var cbs = [].slice.call(jr.querySelectorAll('.jr-c .jr-pb'));
      if (!s1b || !s2t || !s2b || cts.length < 3 || cbs.length < 3) return;

      var W = jr.offsetWidth, H = jr.offsetHeight;
      var celular = window.matchMedia('(max-width: 640px)').matches;
      // [de, para, início do pulso, fim do pulso] — frações do ciclo de 3,6 s
      var fios = [[centro(s1b), centro(s2t), 0.04, 0.15]];
      if (!celular) {
        cts.forEach(function (c, i) { fios.push([centro(s2b), centro(c), 0.30 + i * 0.02, 0.46 + i * 0.02]); });
      } else {
        fios.push([centro(s2b), centro(cts[0]), 0.28, 0.38]);
        fios.push([centro(cbs[0]), centro(cts[1]), 0.42, 0.52]);
        fios.push([centro(cbs[1]), centro(cts[2]), 0.56, 0.66]);
      }

      var html = '';
      fios.forEach(function (f, i) {
        var a = f[0], b = f[1], k = Math.max(8, (b.y - a.y) * 0.6);
        var d = 'M' + r1(a.x) + ',' + r1(a.y) + ' C ' + r1(a.x) + ',' + r1(a.y + k) + ' ' + r1(b.x) + ',' + r1(b.y - k) + ' ' + r1(b.x) + ',' + r1(b.y);
        var id = 'jw' + (i + 1), s = f[2], e = f[3];
        html += '<path id="' + id + '" class="wf-w" d="' + d + '" pathLength="1" style="--d:' + (1.4 + i * 0.15).toFixed(2) + 's"/>';
        html += '<circle r="3.4" class="wf-dot" opacity="0">' +
          '<animateMotion dur="3.6s" begin="2.4s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;' + s + ';' + e + ';1"><mpath href="#' + id + '"/></animateMotion>' +
          '<animate attributeName="opacity" dur="3.6s" begin="2.4s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;' + s + ';' + e + ';1" values="0;1;0;0"/></circle>';
      });

      var sig = W + 'x' + H + '|' + html;
      if (sig === ultima) return;           // nada mudou: não redesenha (não reinicia a animação)
      ultima = sig;
      svg.setAttribute('width', W); svg.setAttribute('height', H);
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.innerHTML = html;
    }

    desenhar();
    window.addEventListener('load', desenhar);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(desenhar);
    var tmr;
    window.addEventListener('resize', function () { clearTimeout(tmr); tmr = setTimeout(desenhar, 120); });
  })();

  /* =====================================================================
     FLUXO "DECISÃO BASEADA EM DADOS" (home) — anima só quando aparece.
     Ao liberar, zera o relógio dos pulsos (SVG) para ficarem em sincronia
     com os nós que acendem (CSS), que começam a contar nesse momento.
     ===================================================================== */
  document.querySelectorAll('.wf-gate').forEach(function (wf) {
    var svgFluxo = wf.querySelector('.wf-svg');
    function liberar() {
      if (wf.classList.contains('run')) return;
      if (svgFluxo && svgFluxo.setCurrentTime) svgFluxo.setCurrentTime(0);
      wf.classList.add('run');
    }
    if (reduz || !('IntersectionObserver' in window)) { liberar(); return; }
    var obsFluxo = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { liberar(); obsFluxo.disconnect(); }
    }, { threshold: 0.35 });
    obsFluxo.observe(wf);
  });

  /* =====================================================================
     CHAMADA FINAL — desenha o sublinhado quando a seção aparece
     ===================================================================== */
  var chamada = document.querySelector('.cta-final');
  if (chamada) {
    if (reduz || !('IntersectionObserver' in window)) {
      chamada.classList.add('is-in');
    } else {
      var obsChamada = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { chamada.classList.add('is-in'); obsChamada.disconnect(); }
      }, { threshold: 0.35 });
      obsChamada.observe(chamada);
    }
  }

  /* =====================================================================
     DISPARO DE ANIMAÇÕES (.animar ganha .run quando aparece; uma vez só)
     ===================================================================== */
  document.querySelectorAll('.animar').forEach(function (bloco) {
    if (reduz || !('IntersectionObserver' in window)) { bloco.classList.add('run'); return; }
    new IntersectionObserver(function (itens, obs) {
      itens.forEach(function (it) {
        if (!it.isIntersecting) return;
        it.target.classList.add('run');
        obs.unobserve(it.target);
      });
    }, { threshold: 0.2 }).observe(bloco);
  });

})();
