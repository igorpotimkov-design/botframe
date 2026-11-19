/* BotFrame Studio — site.js. Без зависимостей. Всё, что здесь, — улучшение: страница читается и без JS. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Мокап чата: анимация появления сообщений только при включённом движении
  var chat = document.getElementById('hero-chat');
  if (chat && !reduce) {
    window.addEventListener('load', function () { chat.classList.add('chat--animate'); }, { once: true });
  }

  // 2. Появление секций при прокрутке (.reveal → .is-visible), один раз
  var revealed = document.querySelectorAll('.reveal');
  if (revealed.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      revealed.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
      revealed.forEach(function (el) { io.observe(el); });
    }
  }

  // 4. Карта втрат: точки на лінії + панель (як у Rumo). Без JS — звичайний список.
  var leaks = document.querySelector('.leaks');
  if (leaks) {
    var leakItems = leaks.querySelectorAll('.leak');
    var map = document.createElement('div');
    map.className = 'leakmap';
    map.innerHTML = '<div class="leakmap__rail" aria-hidden="true"><span class="leakmap__fill"></span></div>';
    var pts = [];
    var pick = function (i) {
      leakItems.forEach(function (li, j) { li.hidden = j !== i; li.classList.add('is-visible'); });
      pts.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
    };
    leakItems.forEach(function (li, i) {
      li.id = li.id || 'leak-' + (i + 1);
      var h = li.querySelector('h3');
      var title = h ? h.textContent : '';
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'leakmap__pt';
      b.style.setProperty('--i', i);
      b.setAttribute('aria-controls', li.id);
      b.setAttribute('aria-label', (i + 1) + '. ' + title);
      b.innerHTML = '<span class="leakmap__n" aria-hidden="true">' + (i + 1) + '</span><span class="leakmap__t" aria-hidden="true">' + title + '</span>';
      b.addEventListener('click', function () { pick(i); });
      map.appendChild(b);
      pts.push(b);
    });
    leaks.parentNode.insertBefore(map, leaks);
    leaks.classList.add('leaks--tabs');
    pick(0);
    if (reduce || !('IntersectionObserver' in window)) {
      map.classList.add('is-on');
    } else {
      var mio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { map.classList.add('is-on'); mio.disconnect(); } });
      }, { threshold: 0.6 });
      mio.observe(map);
    }
  }

  // 5. Кроки після заявки: лінія зліва заповнюється під час прокрутки
  var tl = document.querySelector('.timeline');
  if (tl && !reduce) {
    var tlSteps = tl.querySelectorAll('.step');
    tl.classList.add('timeline--js');
    var ticking = false;
    var upd = function () {
      ticking = false;
      var r = tl.getBoundingClientRect();
      var mark = window.innerHeight * 0.6;
      var p = Math.max(0, Math.min(1, (mark - r.top) / r.height));
      tl.style.setProperty('--p', p.toFixed(3));
      tlSteps.forEach(function (s) { s.classList.toggle('is-active', s.getBoundingClientRect().top < mark); });
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    upd();
  }

  // 6. Цифри рахуються від нуля, коли їх видно (дати на кшталт 12.11 не чіпаємо)
  if (!reduce && 'IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) { return; }
        nio.unobserve(e.target);
        var el = e.target, txt = el.textContent;
        var m = txt.match(/^(\D*?)(\d+)([\s\S]*)$/);
        if (!m || /\d\.\d/.test(txt)) { return; }
        var end = parseInt(m[2], 10), t0 = null;
        el.setAttribute('aria-label', txt);
        var tick = function (t) {
          if (!t0) { t0 = t; }
          var k = Math.min(1, (t - t0) / 900);
          k = 1 - Math.pow(1 - k, 3);
          el.textContent = m[1] + Math.round(end * k) + m[3];
          if (k < 1) { requestAnimationFrame(tick); } else { el.textContent = txt; }
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.num-card__value').forEach(function (n) { nio.observe(n); });
  }

  // 3. Мобильное меню: закрывать по клику на якорь
  var menu = document.querySelector('.menu');
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) { menu.removeAttribute('open'); }
    });
  }
})();
