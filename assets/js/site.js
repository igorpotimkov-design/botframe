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

  // 3. Мобильное меню: закрывать по клику на якорь
  var menu = document.querySelector('.menu');
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) { menu.removeAttribute('open'); }
    });
  }
})();
