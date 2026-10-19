(function () {
  'use strict';
  var root = document.documentElement;
  function $(s, c) { return (c || document).querySelector(s) }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)) }
  function get(k) { try { return localStorage.getItem(k) } catch (e) { return null } }
  function set(k, v) { try { localStorage.setItem(k, v) } catch (e) { } }

  /* Theme */
  $('#theme').addEventListener('click', function () {
    var t = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', t); set('theme', t);
  });

  /* Language (EN / AR with RTL) */
  var langBtn = $('#lang'), items = $$('[data-ar]');
  items.forEach(function (el) { el.setAttribute('data-en', el.innerHTML) });
  function setLang(l) {
    items.forEach(function (el) { el.innerHTML = el.getAttribute(l === 'ar' ? 'data-ar' : 'data-en') });
    root.lang = l; root.dir = l === 'ar' ? 'rtl' : 'ltr';
    langBtn.textContent = l === 'ar' ? 'EN' : 'AR';
    set('lang', l);
  }
  langBtn.addEventListener('click', function () { setLang(root.lang === 'ar' ? 'en' : 'ar') });
  if (get('lang') === 'ar') setLang('ar');

  /* Mobile menu */
  var links = $('#links');
  $('#burger').addEventListener('click', function () { links.classList.toggle('open') });
  $$('#links a').forEach(function (a) { a.addEventListener('click', function () { links.classList.remove('open') }) });

  /* Reveal on scroll with robust fallbacks */
  var rev = $$('.reveal');
  rev.forEach(function (el, i) { el.style.setProperty('--d', (i % 4) * 0.12 + 's') });
  function counters(el) {
    $$('[data-n]', el).forEach(function (c) {
      if (c.done) return; c.done = 1;
      var end = +c.getAttribute('data-n'), s = c.getAttribute('data-s') || '', t0 = null;
      (function step(t) { t0 = t0 || t; var p = Math.min((t - t0) / 1200, 1); c.textContent = Math.round(end * p) + s; if (p < 1) requestAnimationFrame(step) })(performance.now());
    });
    $$('[data-w]', el).forEach(function (b) { b.style.width = b.getAttribute('data-w') + '%' });
  }
  function show(el) { el.classList.add('in'); counters(el) }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target) } }) }, { threshold: .12 });
    rev.forEach(function (el) { io.observe(el) });
  } else { rev.forEach(show) }
  /* Fallbacks: reveal anything already in view shortly after load, and everything after 2.5s */
  setTimeout(function () { rev.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight) show(el) }) }, 300);
  setTimeout(function () { root.classList.add('show-all'); rev.forEach(show) }, 2500);
  /* Counters/bars outside .reveal (safety) */
  $$('[data-n],[data-w]').forEach(function (el) { if (!el.closest('.reveal')) counters(el.parentNode) });

  /* Active nav link + back-to-top */
  var secs = $$('main section[id]'), top = $('#top');
  function onScroll() {
    var y = scrollY + 120, cur = 'home';
    secs.forEach(function (s) { if (s.offsetTop <= y) cur = s.id });
    $$('#links a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + cur) });
    top.classList.toggle('show', scrollY > 500);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  top.addEventListener('click', function () { scrollTo({ top: 0, behavior: 'smooth' }) });

  /* Project images: hide broken ones so the gradient + number placeholder shows */
  $$('.thumb img').forEach(function (img) {
    img.addEventListener('error', function () { img.style.display = 'none' });
  });

  /* Contact form: validates, then opens the visitor's mail app with the message */
  var form = $('#form'), st = $('#status');
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var f = [$('#n'), $('#e'), $('#m')], ok = true, ar = root.lang === 'ar';
    f.forEach(function (i) {
      var bad = !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value));
      i.parentNode.classList.toggle('err', bad); if (bad) ok = false;
    });
    if (!ok) { st.style.color = '#ff5d73'; st.textContent = ar ? 'يرجى تعبئة جميع الحقول بشكل صحيح.' : 'Please fill in all fields correctly.'; return }
    var body = 'Name: ' + f[0].value + '\nEmail: ' + f[1].value + '\n\n' + f[2].value;
    location.href = 'mailto:bodynabilewis@gmail.com?subject=' + encodeURIComponent('Portfolio message from ' + f[0].value) + '&body=' + encodeURIComponent(body);
    st.style.color = '#22c55e'; st.textContent = ar ? 'شكراً لك! تم فتح تطبيق البريد لإرسال رسالتك.' : 'Thank you! Your mail app is opening to send the message.';
    form.reset();
  });

  $('#yr').textContent = new Date().getFullYear();
})();
