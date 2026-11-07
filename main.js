(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Entrances: hero at once, the rest as it scrolls in, staggered per section. */
  var rises = Array.prototype.slice.call(document.querySelectorAll('.rise'));
  rises.forEach(function (el) {
    var group = el.closest('section, header, footer');
    var siblings = group ? group.querySelectorAll('.rise') : [];
    var i = Array.prototype.indexOf.call(siblings, el);
    el.dataset.delay = Math.min(Math.max(i, 0), 4) * 80;
  });
  function reveal(el) {
    var d = +el.dataset.delay || 0;
    el.style.transitionDelay = d + 'ms';
    el.classList.add('in');
    setTimeout(function () { el.style.transitionDelay = ''; }, d + 1200);
  }
  if (reduce || !('IntersectionObserver' in window)) {
    rises.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.04 });
    rises.forEach(function (el) {
      if (el.closest('.hero')) requestAnimationFrame(function () { reveal(el); });
      else io.observe(el);
    });
  }

  /* Example: scale each frame so the page inside renders at its real width. */
  var stage = document.querySelector('.stage');
  if (stage) {
    var screens = stage.querySelectorAll('.screen');
    var frames = Array.prototype.slice.call(stage.querySelectorAll('iframe'));
    var fit = function (screen) {
      var w = screen.clientWidth;
      var h = screen.clientHeight;
      if (!w || !h) return;
      screen.querySelectorAll('iframe').forEach(function (f) {
        var fw = +f.dataset.w;
        var s = w / fw;
        f.style.width = fw + 'px';
        f.style.height = Math.ceil(h / s) + 'px';
        f.style.transform = 'scale(' + s + ')';
      });
    };
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function (entries) { entries.forEach(function (e) { fit(e.target); }); });
      screens.forEach(function (s) { ro.observe(s); });
    } else {
      screens.forEach(fit);
      window.addEventListener('resize', function () { screens.forEach(fit); });
    }

    /* Toggle between the site today and the proposal. */
    var buttons = document.querySelectorAll('.toggle button');
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        stage.dataset.state = b.dataset.show;
        buttons.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      });
    });

    /* Scroll the pages inside the frames together: on hover with a mouse, or once in view on touch. */
    if (!reduce) {
      var p = 0, dir = 0, raf = 0, last = 0;
      var ease = function (t) { return t * t * (3 - 2 * t); };
      var tick = function (t) {
        var dt = last ? Math.min(t - last, 48) : 16;
        last = t;
        p += dir * dt / (dir > 0 ? 15000 : 1300);
        p = Math.min(1, Math.max(0, p));
        var e = ease(p);
        frames.forEach(function (f) {
          try {
            var win = f.contentWindow, doc = f.contentDocument;
            if (!win || !doc || !doc.documentElement) return;
            var max = doc.documentElement.scrollHeight - win.innerHeight;
            if (max > 0) win.scrollTo({ top: e * max, behavior: 'instant' });
          } catch (err) { /* frame not ready */ }
        });
        if ((dir > 0 && p < 1) || (dir < 0 && p > 0)) raf = requestAnimationFrame(tick);
        else { raf = 0; last = 0; }
      };
      var go = function (d) { dir = d; if (!raf) { last = 0; raf = requestAnimationFrame(tick); } };

      if (finePointer) {
        stage.addEventListener('pointerenter', function () { go(1); });
        stage.addEventListener('pointerleave', function () { go(-1); });
      } else if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { go(e.isIntersecting ? 1 : -1); });
        }, { threshold: 0.6 }).observe(stage);
      }

      /* Tilt the devices toward the pointer. */
      if (finePointer) {
        var tilt = stage.querySelector('.tilt');
        stage.addEventListener('pointermove', function (e) {
          var r = stage.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5;
          var y = (e.clientY - r.top) / r.height - 0.5;
          tilt.style.setProperty('--ry', (-4 + x * 9).toFixed(2) + 'deg');
          tilt.style.setProperty('--rx', (2.5 - y * 6).toFixed(2) + 'deg');
        });
        stage.addEventListener('pointerleave', function () {
          tilt.style.removeProperty('--ry');
          tilt.style.removeProperty('--rx');
        });
      }
    }
  }

  /* Pricing: on wide screens the three "Allt som ingår" open together, so the plans can be compared. */
  var more = document.querySelectorAll('.plan details');
  var wide = window.matchMedia('(min-width: 901px)');
  more.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!wide.matches) return;
      more.forEach(function (o) { if (o !== d && o.open !== d.open) o.open = d.open; });
    });
  });

  /* Copy the email address. */
  var copy = document.querySelector('[data-copy]');
  if (copy && navigator.clipboard && window.isSecureContext) {
    var label = copy.querySelector('.copy-label');
    var timer;
    copy.hidden = false;
    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(copy.dataset.copy).then(function () {
        label.textContent = 'Kopierad';
        copy.classList.add('done');
        clearTimeout(timer);
        timer = setTimeout(function () { label.textContent = 'Kopiera adressen'; copy.classList.remove('done'); }, 2400);
      });
    });
  }
})();
