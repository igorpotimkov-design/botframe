/* BotFrame Studio — анонимная статистика в PostHog (EU).
   Без cookie, без записи на устройство, без профилей людей. Текст формы сюда не попадает.
   Ключ публичный и только для записи. Данные этого сайта в PostHog отмечены site = botframe. */
(function () {
  'use strict';
  var HOST = 'https://eu.i.posthog.com/i/v0/e/';
  var KEY = 'phc_tEY65kgjECFK3gtNS3nLgnJn7DnKES4XcCGjyRcKjQUT';
  var isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var visit = 'anon-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  var query = new URLSearchParams(location.search);

  function short(name) { return (query.get(name) || '').slice(0, 60); }

  function referrerHost() {
    try { return document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) { return ''; }
  }

  function track(event, extra) {
    try {
      var properties = {
        site: isLocal ? 'botframe-test' : 'botframe',
        lang: document.documentElement.lang || '',
        path: location.pathname,
        utm_source: short('utm_source'),
        utm_medium: short('utm_medium'),
        utm_campaign: short('utm_campaign'),
        utm_content: short('utm_content'),
        referrer_host: referrerHost(),
        $current_url: location.origin + location.pathname,
        $process_person_profile: false
      };
      Object.keys(extra || {}).forEach(function (k) { properties[k] = extra[k]; });
      var body = JSON.stringify({ api_key: KEY, event: event, distinct_id: visit, properties: properties });
      // sendBeacon успевает отправить событие, даже если человек сразу уходит со страницы
      if (!(navigator.sendBeacon && navigator.sendBeacon(HOST, body))) {
        fetch(HOST, { method: 'POST', body: body, keepalive: true, headers: { 'Content-Type': 'text/plain;charset=UTF-8' } })
          .catch(function () {});
      }
    } catch (e) { /* статистика не должна ломать страницу */ }
  }

  window.bfTrack = track;
  track('$pageview');

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    var place = link.closest('header') ? 'header' : link.closest('footer') ? 'footer' :
      link.closest('.sticky-cta') ? 'sticky' : (link.closest('section[id]') || {}).id || 'other';
    if (href === '#zayavka') track('cta_click', { place: place });
    else if (href.indexOf('t.me/barbershopdemotestbot') !== -1) track('demo_click', { place: place });
    else if (href.indexOf('t.me/paty_1l') !== -1) track('telegram_click', { place: place });
    else if (link.hasAttribute('hreflang')) track('lang_switch', { to: link.getAttribute('hreflang') });
  });

  var formBlock = document.getElementById('zayavka');
  if (formBlock && 'IntersectionObserver' in window) {
    var seen = new IntersectionObserver(function (entries) {
      if (entries.some(function (x) { return x.isIntersecting; })) {
        track('form_view');
        seen.disconnect();
      }
    }, { rootMargin: '0px 0px -30% 0px' });
    seen.observe(formBlock);
  }
})();
