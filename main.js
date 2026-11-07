// Entrances: stagger the parts of each section once as they enter.
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.rise'));
  var groups = new Map();
  items.forEach(function (el) {
    var host = el.closest('section, header, footer') || document.body;
    var list = groups.get(host) || [];
    el.style.setProperty('--d', (list.length * 75) + 'ms');
    list.push(el);
    groups.set(host, list);
  });
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -4% 0px', threshold: 0.05 });
  items.forEach(function (el) {
    if (el.closest('.hero')) { requestAnimationFrame(function () { el.classList.add('in'); }); }
    else io.observe(el);
  });
})();

// The live thing: switch the example between today's site and the proposal.
(function () {
  var browser = document.querySelector('.devices');
  var buttons = document.querySelectorAll('.toggle button');
  if (!browser) return;
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var show = b.getAttribute('data-show');
      browser.setAttribute('data-state', show);
      buttons.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
    });
  });
})();
