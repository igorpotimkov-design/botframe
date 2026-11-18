/* BotFrame Studio — форма заявки. Адрес приёма: атрибут data-leads-url у формы (Google Apps Script /exec). */
(function () {
  'use strict';
  var form = document.getElementById('zayavka-form');
  if (!form) return;

  var success = document.getElementById('zayavka-success');
  var failure = document.getElementById('zayavka-error');
  var button = form.querySelector('button[type="submit"]');
  var buttonText = button.textContent;
  var lang = document.documentElement.lang || 'uk';
  var TEXT = lang === 'en'
    ? { required: 'Please fill in this field', sending: 'Sending…' }
    : { required: 'Заповніть це поле', sending: 'Надсилаємо…' };
  var TIMEOUT_MS = 20000;
  var firstTouch = 0;

  // В статистику идут только факты действий, текст полей туда не попадает
  function track(name, props) { if (window.bfTrack) window.bfTrack(name, props); }

  ['focusin', 'input', 'pointerdown'].forEach(function (name) {
    form.addEventListener(name, function () {
      if (firstTouch) return;
      firstTouch = Date.now();
      track('form_start');
    });
  });

  function setError(input, on) {
    var field = input.closest('.field');
    var note = field.querySelector('.field__error');
    field.classList.toggle('field--error', on);
    if (on) { input.setAttribute('aria-invalid', 'true'); } else { input.removeAttribute('aria-invalid'); }
    if (on && !note) {
      note = document.createElement('span');
      note.className = 'field__error';
      note.id = input.id + '-error';
      note.textContent = TEXT.required;
      field.appendChild(note);
      input.setAttribute('aria-describedby', note.id);
    } else if (!on && note) {
      note.remove();
      input.removeAttribute('aria-describedby');
    }
  }

  function validate() {
    var firstBad = null;
    form.querySelectorAll('[required]').forEach(function (input) {
      var bad = !input.value.trim();
      setError(input, bad);
      if (bad && !firstBad) firstBad = input;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  form.addEventListener('input', function (e) {
    if (e.target.required && e.target.value.trim()) setError(e.target, false);
  });

  function setBusy(on) {
    button.disabled = on;
    button.textContent = on ? TEXT.sending : buttonText;
  }

  function showSuccess() {
    form.hidden = true;
    failure.hidden = true;
    success.hidden = false;
    success.setAttribute('tabindex', '-1');
    success.focus();
  }

  function showFailure() {
    track('form_error');
    failure.hidden = false;
    setBusy(false);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    failure.hidden = true;
    if (!validate()) return;

    var data = new FormData(form);
    if (data.get('website')) { showSuccess(); return; }

    var url = form.getAttribute('data-leads-url');
    if (!url) { showFailure(); return; }

    var lead = {
      name: data.get('name'),
      contact: data.get('contact'),
      business: data.get('business'),
      need: data.get('need'),
      comment: data.get('comment'),
      lang: lang,
      ms: firstTouch ? Date.now() - firstTouch : undefined
    };

    setBusy(true);
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);

    // text/plain: Apps Script принимает такой запрос без предварительной проверки браузера
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(lead),
      signal: controller.signal
    })
      .then(function (r) { return r.json(); })
      .then(function (answer) {
        if (answer && answer.ok) {
          track('form_submit', { need: lead.need });
          showSuccess();
        } else {
          showFailure();
        }
      })
      .catch(showFailure)
      .then(function () { clearTimeout(timer); });
  });
})();
