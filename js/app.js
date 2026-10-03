/*
 * Planinka - glavni JavaScript: crta sve sekcije iz data/vikendica.js i pokreće
 * prekidač zima/ljeto, jezik, galeriju, kalkulator cijene i upit na Viber/WhatsApp.
 */
(function () {
  'use strict';

  var D = window.VIKENDICA;
  var UI = window.PLANINKA_UI;
  var SC = window.PLANINKA_SCENES;
  var ic = window.PLANINKA_ICON;
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- stanje (pamti se u browseru) ---------------- */
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* privatni prozor */ } }

  var lang = load('planinka-lang') || 'bs';
  if (lang !== 'en') lang = 'bs';
  var season = load('planinka-season') || autoSeason();
  var form = { a: '', d: '', g: Math.min(4, D.pricing.maxGuests), name: '', phone: '', msg: '' };

  function autoSeason() {
    if (D.defaultSeason === 'winter' || D.defaultSeason === 'summer') return D.defaultSeason;
    var m = new Date().getMonth() + 1;
    return [11, 12, 1, 2, 3, 4].indexOf(m) !== -1 ? 'winter' : 'summer';
  }

  /* ---------------- pomoćne ---------------- */
  function t(key, vars) {
    var parts = key.split('.'), v = UI[lang];
    for (var i = 0; i < parts.length; i++) v = v && v[parts[i]];
    if (v == null) v = key;
    if (vars && typeof v === 'string') v = v.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ''; });
    return v;
  }
  function L(v) { return v == null ? '' : (typeof v === 'object' && !Array.isArray(v) ? (v[lang] != null ? v[lang] : v.bs) : v); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function plural(forms, n) {
    if (lang === 'en') return (n === 1 ? forms.one : forms.other).replace('{n}', n);
    var m10 = n % 10, m100 = n % 100;
    var f = (m10 === 1 && m100 !== 11) ? 'one' : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) ? 'few' : 'other';
    return (forms[f] || forms.other).replace('{n}', n);
  }
  function money(n) { return Math.round(n).toLocaleString(lang === 'en' ? 'en-US' : 'bs-BA').replace(/,/g, lang === 'en' ? ',' : '.'); }
  function parseDate(s) { if (!s) return null; var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function fmtDate(d) {
    if (lang === 'en') return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return d.getDate() + '. ' + (d.getMonth() + 1) + '. ' + d.getFullYear() + '.';
  }
  function sceneOrImage(item, cls) {
    if (item.image) return '<img src="' + esc(item.image) + '" alt="" loading="lazy" decoding="async" class="' + (cls || '') + '">';
    return SC[item.scene] ? SC[item.scene]() : '';
  }
  function section(id, eyebrow, title, lead, body, cls) {
    return '<section class="sec ' + (cls || '') + '" id="' + id + '" aria-labelledby="' + id + '-t">' +
      '<div class="wrap">' +
      '<header class="sec-head reveal">' + (eyebrow ? '<p class="eyebrow">' + esc(eyebrow) + '</p>' : '') +
      '<h2 id="' + id + '-t">' + esc(title) + '</h2>' + (lead ? '<p class="lead">' + esc(lead) + '</p>' : '') + '</header>' +
      body + '</div></section>';
  }

  /* ---------------- dijelovi stranice ---------------- */
  function topbar() {
    var nav = ['gallery', 'about', 'prices', 'location', 'contact'].map(function (k) {
      return '<a href="#' + k + '">' + esc(t('nav.' + k)) + '</a>';
    }).join('');
    return '<div class="topbar-in">' +
      '<a class="brand" href="#top" aria-label="' + esc(L(D.title)) + '"><span class="brand-mark" aria-hidden="true">' + brandMark() + '</span><span class="brand-name">' + esc(D.name) + '</span></a>' +
      '<nav class="topnav" aria-label="Navigacija">' + nav + '</nav>' +
      '<div class="toggles">' + seasonToggle() + langToggle() + '</div></div>';
  }
  function brandMark() {
    return '<svg viewBox="0 0 32 32"><path d="M3 26L16 6l13 20z" fill="currentColor"/><path d="M11 26l5-8 5 8z" fill="var(--bg)"/></svg>';
  }
  function seasonToggle() {
    return '<div class="seg seg-season" role="group" aria-label="' + esc(t('seasonLabel')) + '">' +
      '<button type="button" data-season="winter" aria-pressed="' + (season === 'winter') + '" title="' + esc(t('seasonWinter')) + '">' + ic('snow') + '<span>' + esc(t('seasonWinter')) + '</span></button>' +
      '<button type="button" data-season="summer" aria-pressed="' + (season === 'summer') + '" title="' + esc(t('seasonSummer')) + '">' + ic('sun') + '<span>' + esc(t('seasonSummer')) + '</span></button>' +
      '<span class="seg-thumb" aria-hidden="true"></span></div>';
  }
  function langToggle() {
    return '<div class="seg seg-lang" role="group" aria-label="' + esc(t('langLabel')) + '">' +
      ['bs', 'en'].map(function (l) { return '<button type="button" data-lang="' + l + '" aria-pressed="' + (lang === l) + '" lang="' + l + '">' + l.toUpperCase() + '</button>'; }).join('') +
      '<span class="seg-thumb" aria-hidden="true"></span></div>';
  }

  function hero() {
    var ext = D.heroImage ? '<img src="' + esc(D.heroImage) + '" alt="" class="hero-img">' : SC.exterior();
    return '<div class="hero-art">' + ext + '</div>' +
      '<canvas class="fx" aria-hidden="true"></canvas>' +
      '<div class="hero-shade" aria-hidden="true"></div>' +
      '<div class="wrap hero-in"><div class="hero-top">' +
      '<p class="badge reveal">' + ic(season === 'winter' ? 'snow' : 'sun') + esc(t('heroBadge')) + ' · ' + esc(D.place) + '</p>' +
      '<h1 class="reveal"><span class="h1-small">' + esc(L(D.kind)) + '</span>' + esc(D.name) + '<span class="h1-place">' + esc(D.place) + '</span></h1>' +
      '<p class="hero-tag reveal">' + esc(L(D.tagline)) + '</p></div>' +
      '<div class="hero-ctas reveal"><a class="btn btn-primary" href="#calc">' + ic('calendar') + esc(t('heroCta')) + '</a>' +
      '<a class="btn btn-ghost" href="#gallery">' + esc(t('heroSecondary')) + '</a></div>' +
      '</div>';
  }

  function facts() {
    return '<section class="facts" aria-label="' + esc(t('factsTitle')) + '"><div class="wrap"><ul class="fact-list">' +
      D.facts.map(function (f, i) {
        return '<li class="fact reveal" style="--d:' + i + '">' + ic(f.icon) + '<span>' + (f.value ? '<b>' + esc(f.value) + '</b> ' : '') + esc(L(f.label)) + '</span></li>';
      }).join('') + '</ul></div></section>';
  }

  function gallery() {
    var items = D.gallery.map(function (g, i) {
      return '<li class="g-item reveal' + (i === 0 ? ' g-wide' : '') + '" style="--d:' + i + '">' +
        '<button type="button" class="g-btn" data-g="' + i + '" aria-label="' + esc(t('galleryOpen')) + ': ' + esc(L(g.label)) + '">' +
        '<span class="g-art">' + sceneOrImage(g) + '</span><span class="g-cap">' + esc(L(g.label)) + '</span></button></li>';
    }).join('');
    return section('gallery', null, t('galleryTitle'), t('galleryLead'), '<ul class="gallery">' + items + '</ul>');
  }

  function about() {
    var body = '<div class="about-grid"><div class="about-text">' + L(D.about).map(function (p, i) {
      return '<p class="reveal" style="--d:' + i + '">' + esc(p) + '</p>';
    }).join('') + '</div><div class="about-art reveal"><div class="frame">' + SC.living() + '</div><div class="frame frame-2">' + SC.view() + '</div></div></div>';
    return section('about', t('aboutEyebrow'), t('aboutTitle'), null, body);
  }

  function amenities() {
    var body = '<ul class="amen">' + D.amenities.map(function (a, i) {
      return '<li class="amen-i reveal" style="--d:' + (i % 6) + '"><span class="amen-ic">' + ic(a.icon) + '</span>' + esc(L(a.label)) + '</li>';
    }).join('') + '</ul>';
    return section('amenities', null, t('amenitiesTitle'), t('amenitiesLead'), body, 'sec-alt');
  }

  function prices() {
    var p = D.pricing;
    function card(kind) {
      return '<div class="price-card price-' + kind + ' reveal">' +
        '<div class="price-top">' + ic(kind === 'winter' ? 'snow' : 'sun') + '<div><h3>' + esc(t(kind + 'Season')) + '</h3><p>' + esc(t(kind + 'Months')) + '</p></div></div>' +
        '<p class="price-num"><b>' + money(p[kind]) + '</b> ' + esc(p.currency) + ' <span>' + esc(t('perNight')) + '</span></p>' +
        '<p class="price-sub">' + esc(t('upTo', { n: p.baseGuests })) + ' · ' + esc(t('extraGuest', { p: p.extraGuest, c: p.currency })) + '</p></div>';
    }
    var body = '<div class="price-grid">' + card('winter') + card('summer') +
      '<div class="price-inc reveal"><h3>' + esc(t('includedTitle')) + '</h3><ul>' +
      L(p.included).map(function (x) { return '<li>' + ic('check') + esc(x) + '</li>'; }).join('') + '</ul>' +
      '<p class="price-note">' + esc(t('minNights', { n: p.minNights })) + '. ' + esc(L(p.note)) + '</p></div></div>';
    return section('prices', null, t('pricesTitle'), t('pricesLead'), body);
  }

  function calc() {
    var p = D.pricing;
    var today = iso(new Date());
    var guests = '';
    for (var g = 1; g <= p.maxGuests; g++) guests += '<option value="' + g + '"' + (g === form.g ? ' selected' : '') + '>' + g + '</option>';
    var body = '<div class="calc-grid">' +
      '<form class="calc-card reveal" id="calc-form" novalidate>' +
      '<div class="field-row"><label class="field"><span>' + esc(t('arrival')) + '</span><input type="date" id="f-a" min="' + today + '" value="' + esc(form.a) + '" required></label>' +
      '<label class="field"><span>' + esc(t('departure')) + '</span><input type="date" id="f-d" min="' + today + '" value="' + esc(form.d) + '" required></label></div>' +
      '<label class="field"><span>' + esc(t('guests')) + '</span><select id="f-g">' + guests + '</select></label>' +
      '<div class="calc-out" aria-live="polite"><p class="calc-line" id="calc-line">' + esc(t('calcHint')) + '</p>' +
      '<p class="calc-total"><span>' + esc(t('total')) + '</span><b><span id="calc-total">0</span> ' + esc(p.currency) + '</b></p>' +
      '<p class="calc-dep" id="calc-dep"></p></div>' +
      '</form>' +
      '<form class="inq-card reveal" id="inq-form" novalidate><h3>' + esc(t('inquiryTitle')) + '</h3><p class="muted">' + esc(t('inquiryLead')) + '</p>' +
      '<label class="field"><span>' + esc(t('name')) + '</span><input type="text" id="f-n" autocomplete="name" value="' + esc(form.name) + '"></label>' +
      '<label class="field"><span>' + esc(t('phone')) + '</span><input type="tel" id="f-p" autocomplete="tel" inputmode="tel" value="' + esc(form.phone) + '"></label>' +
      '<label class="field"><span>' + esc(t('message')) + '</span><textarea id="f-m" rows="2">' + esc(form.msg) + '</textarea></label>' +
      '<p class="form-err" id="inq-err" role="alert"></p>' +
      '<div class="inq-btns"><a class="btn btn-viber" id="send-viber" href="#">' + ic('viber') + esc(t('sendViber')) + '</a>' +
      '<a class="btn btn-wa" id="send-wa" href="#" target="_blank" rel="noopener">' + ic('whatsapp') + esc(t('sendWhatsapp')) + '</a></div>' +
      '<p class="muted small">' + esc(t('inquiryNote')) + '</p></form></div>';
    return section('calc', null, t('calcTitle'), t('calcLead'), body, 'sec-alt');
  }

  function location() {
    var signs = D.distances.map(function (d, i) {
      return '<li class="sign reveal" style="--d:' + i + '">' + ic(d.icon) + '<span class="sign-place">' + esc(L(d.place)) + '</span><span class="sign-time">' + esc(L(d.time)) + '</span></li>';
    }).join('');
    var map = '<div class="map reveal">' + mapSvg() + '<a class="btn btn-small map-btn" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(D.mapQuery) + '" target="_blank" rel="noopener">' + ic('pin') + esc(t('openMaps')) + '</a></div>';
    return section('location', null, t('locationTitle'), t('locationLead'), '<div class="loc-grid">' + map + '<ul class="signs">' + signs + '</ul></div>');
  }
  function mapSvg() {
    return '<svg viewBox="0 0 600 420" class="map-svg" aria-hidden="true">' +
      '<rect width="600" height="420" class="map-bg"/>' +
      '<path class="map-hill" d="M0 300 Q120 200 240 260 T480 220 T600 250 V420 H0Z"/>' +
      '<path class="map-hill-2" d="M0 360 Q150 300 300 340 T600 320 V420 H0Z"/>' +
      '<path class="map-contour" d="M60 240 Q200 150 340 200 T560 170 M30 280 Q200 200 360 240 T590 210"/>' +
      '<path class="map-road" d="M-10 400 Q140 330 220 300 T380 240 Q450 210 520 120 L620 40"/>' +
      '<path class="map-road-dash" d="M-10 400 Q140 330 220 300 T380 240 Q450 210 520 120 L620 40"/>' +
      '<g class="map-label"><text x="40" y="385">Travnik ↓</text><text x="470" y="70">Babanovac</text><text x="250" y="120">Paljenik ▲</text></g>' +
      '<g class="map-ski"><path d="M430 60 L470 160" /><circle cx="430" cy="60" r="6"/></g>' +
      '<g class="map-pin" transform="translate(395 205)"><circle r="34" class="pin-pulse"/><path d="M0 0 C-18 -20 -18 -44 0 -48 C18 -44 18 -20 0 0Z" class="pin-body"/><circle cy="-30" r="7" class="pin-dot"/></g>' +
      '</svg>';
  }

  function activities() {
    function list(arr) {
      return arr.map(function (a, i) {
        return '<li class="act reveal" style="--d:' + i + '"><span class="act-ic">' + ic(a.icon) + '</span><div><h3>' + esc(L(a.title)) + '</h3><p>' + esc(L(a.text)) + '</p></div></li>';
      }).join('');
    }
    var A = D.activities;
    var body = '<div class="act-cols"><div class="act-col act-winter"><h3 class="act-h">' + ic('snow') + esc(t('doWinter')) + '</h3><ul>' + list(A.winter) + '</ul></div>' +
      '<div class="act-col act-summer"><h3 class="act-h">' + ic('sun') + esc(t('doSummer')) + '</h3><ul>' + list(A.summer) + '</ul></div></div>' +
      '<div class="food reveal">' + ic('cheese') + '<div><h3>' + esc(L(A.food.title)) + '</h3><p>' + esc(L(A.food.text)) + '</p></div></div>';
    return section('activities', null, t('doTitle'), null, body, 'sec-alt');
  }

  function reviews() {
    var body = '<ul class="reviews">' + D.reviews.map(function (r, i) {
      var stars = '';
      for (var s = 0; s < 5; s++) stars += '<span class="' + (s < r.rating ? 'on' : '') + '">' + ic('star') + '</span>';
      return '<li class="review reveal" style="--d:' + i + '"><div class="stars" aria-label="' + r.rating + '/5">' + stars + '</div>' +
        '<blockquote>' + esc(L(r.text)) + '</blockquote><p class="who"><b>' + esc(r.name) + '</b> · ' + esc(L(r.from)) + '</p></li>';
    }).join('') + '</ul>' + (D.demo ? '<p class="muted small center">' + esc(t('reviewsDemo')) + '</p>' : '');
    return section('reviews', null, t('reviewsTitle'), null, body);
  }

  function faq() {
    var body = '<div class="faq">' + D.faq.map(function (f, i) {
      return '<details class="faq-i reveal" style="--d:' + i + '"><summary>' + esc(L(f.q)) + '<span class="faq-plus" aria-hidden="true">' + ic('plus') + '</span></summary><div class="faq-a"><p>' + esc(L(f.a)) + '</p></div></details>';
    }).join('') + '</div>';
    return section('faq', null, t('faqTitle'), null, body, 'sec-alt');
  }

  function contact() {
    var c = D.contact;
    var links = [
      ['phone', t('call'), 'tel:' + c.phone.replace(/\s/g, ''), c.phone],
      ['viber', t('viber'), 'viber://chat?number=' + encodeURIComponent(c.viber), c.phone],
      ['whatsapp', t('whatsapp'), 'https://wa.me/' + c.whatsapp, c.phone],
      ['mail', t('email'), 'mailto:' + c.email, c.email],
      ['insta', t('instagram'), 'https://instagram.com/' + c.instagram, '@' + c.instagram]
    ].map(function (l, i) {
      return '<li class="reveal" style="--d:' + i + '"><a class="contact-card" href="' + esc(l[2]) + '"' + (/^https/.test(l[2]) ? ' target="_blank" rel="noopener"' : '') + '>' + ic(l[0]) + '<span><b>' + esc(l[1]) + '</b><small>' + esc(l[3]) + '</small></span></a></li>';
    }).join('');
    return section('contact', null, t('contactTitle'), t('contactLead'), '<ul class="contact-grid">' + links + '</ul>');
  }

  function footer() {
    return '<div class="wrap foot-in"><p class="foot-brand">' + brandMark() + esc(L(D.title)) + '</p>' +
      (D.demo ? '<p class="demo-note">' + esc(t('demoNote')) + '</p>' : '') +
      (D.credit ? '<p class="credit">' + esc(t('madeBy')) + ': <a href="' + esc(D.credit.url) + '" target="_blank" rel="noopener">' + esc(D.credit.name) + '</a></p>' : '') +
      '<p class="muted small">© ' + new Date().getFullYear() + ' ' + esc(D.name) + '. ' + esc(t('footerRights')) + '</p></div>';
  }

  function dock() {
    var c = D.contact;
    return '<a class="dock-btn" href="tel:' + esc(c.phone.replace(/\s/g, '')) + '">' + ic('phone') + esc(t('call')) + '</a>' +
      '<a class="dock-btn dock-viber" href="viber://chat?number=' + encodeURIComponent(c.viber) + '">' + ic('viber') + esc(t('viber')) + '</a>' +
      '<a class="dock-btn dock-cta" href="#calc">' + ic('calendar') + '<span>' + esc(t('heroCta').split(' ')[0]) + '</span></a>';
  }

  /* ---------------- crtanje ---------------- */
  function render() {
    root.lang = lang;
    root.setAttribute('data-season', season);
    document.title = L(D.title) + ' | ' + L(D.tagline);
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', L(D.tagline));
    document.querySelector('.skip').textContent = t('skip');
    document.getElementById('topbar').innerHTML = topbar();
    document.getElementById('top').innerHTML = hero();
    document.getElementById('main').innerHTML = facts() + gallery() + about() + amenities() + prices() + calc() + location() + activities() + reviews() + faq() + contact();
    document.getElementById('foot').innerHTML = footer();
    document.getElementById('dock').innerHTML = dock();
    bindCalc();
    updateCalc(false);
    observeReveal();
    FX.start(document.querySelector('.fx'));
  }

  /* ---------------- kalkulator i upit ---------------- */
  function compute() {
    var p = D.pricing, a = parseDate(form.a), d = parseDate(form.d), g = +form.g;
    if (!a || !d) return { ok: false, msg: t('calcHint') };
    var today = parseDate(iso(new Date()));
    if (a < today) return { ok: false, msg: t('errPast') };
    if (d <= a) return { ok: false, msg: t('errOrder') };
    var nights = Math.round((d - a) / 86400000);
    if (nights < p.minNights) return { ok: false, msg: t('errMin', { n: p.minNights }) };
    var sum = 0, w = 0, s = 0;
    for (var i = 0; i < nights; i++) {
      var day = new Date(a.getFullYear(), a.getMonth(), a.getDate() + i);
      var winter = p.winterMonths.indexOf(day.getMonth() + 1) !== -1;
      if (winter) w++; else s++;
      sum += (winter ? p.winter : p.summer) + Math.max(0, g - p.baseGuests) * p.extraGuest;
    }
    var parts = [];
    if (w) parts.push(w + ' × ' + money(p.winter + Math.max(0, g - p.baseGuests) * p.extraGuest));
    if (s) parts.push(s + ' × ' + money(p.summer + Math.max(0, g - p.baseGuests) * p.extraGuest));
    return { ok: true, nights: nights, total: sum, a: a, d: d, g: g, line: plural(t('nights'), nights) + ': ' + parts.join(' + ') + ' ' + p.currency };
  }

  var shown = 0, anim = 0;
  function updateCalc(animate) {
    var r = compute();
    var line = document.getElementById('calc-line'), tot = document.getElementById('calc-total'), dep = document.getElementById('calc-dep');
    if (!line) return;
    line.textContent = r.ok ? r.line : r.msg;
    line.classList.toggle('is-err', !r.ok && !!(form.a && form.d));
    var target = r.ok ? r.total : 0;
    dep.textContent = r.ok ? t('deposit', { p: D.pricing.depositPercent }) + ': ' + money(r.total * D.pricing.depositPercent / 100) + ' ' + D.pricing.currency : '';
    cancelAnimationFrame(anim);
    if (!animate || reduced) { shown = target; tot.textContent = money(target); return; }
    var from = shown, t0 = performance.now();
    (function step(now) {
      var k = Math.min(1, (now - t0) / 700), e = 1 - Math.pow(1 - k, 3);
      shown = from + (target - from) * e;
      tot.textContent = money(shown);
      if (k < 1) anim = requestAnimationFrame(step);
    })(t0);
    tot.parentElement.classList.remove('bump'); void tot.offsetWidth; tot.parentElement.classList.add('bump');
  }

  function message() {
    var r = compute();
    var lines = [t('msgHello', { name: L(D.title) })];
    if (r.ok) {
      lines.push(t('msgDates', { a: fmtDate(r.a), d: fmtDate(r.d), nights: plural(t('nights'), r.nights) }));
      lines.push(t('msgGuests', { g: r.g }));
      lines.push(t('msgTotal', { t: money(r.total), c: D.pricing.currency }));
    }
    if (form.name || form.phone) lines.push(t('msgFrom', { n: form.name, p: form.phone }));
    if (form.msg) lines.push(form.msg);
    return { ok: r.ok, text: lines.join('\n') };
  }

  function bindCalc() {
    var a = document.getElementById('f-a'), d = document.getElementById('f-d'), g = document.getElementById('f-g');
    a.addEventListener('change', function () {
      form.a = a.value;
      if (form.a) {
        var min = parseDate(form.a); min.setDate(min.getDate() + D.pricing.minNights);
        d.min = iso(min);
        if (!form.d || parseDate(form.d) < min) { form.d = iso(min); d.value = form.d; }
      }
      updateCalc(true);
    });
    d.addEventListener('change', function () { form.d = d.value; updateCalc(true); });
    g.addEventListener('change', function () { form.g = +g.value; updateCalc(true); });
    ['f-n', 'f-p', 'f-m'].forEach(function (id, i) {
      document.getElementById(id).addEventListener('input', function (e) { form[['name', 'phone', 'msg'][i]] = e.target.value; });
    });
    function go(kind, e) {
      var m = message(), err = document.getElementById('inq-err');
      if (!m.ok) { e.preventDefault(); err.textContent = t('needDates'); document.getElementById('f-a').focus(); return; }
      if (!form.name.trim() || !form.phone.trim()) { e.preventDefault(); err.textContent = t('needName'); document.getElementById(form.name.trim() ? 'f-p' : 'f-n').focus(); return; }
      err.textContent = '';
      var c = D.contact;
      e.currentTarget.href = kind === 'viber'
        ? 'viber://chat?number=' + encodeURIComponent(c.viber) + '&draft=' + encodeURIComponent(m.text)
        : 'https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(m.text);
    }
    document.getElementById('send-viber').addEventListener('click', function (e) { go('viber', e); });
    document.getElementById('send-wa').addEventListener('click', function (e) { go('wa', e); });
  }

  /* ---------------- galerija (uvećanje + listanje prstom) ---------------- */
  var lb = { i: 0, el: null, last: null };
  function openLightbox(i) {
    lb.last = document.activeElement;
    lb.i = i;
    var el = document.getElementById('lightbox');
    el.hidden = false;
    el.innerHTML = '<div class="lb-stage"></div><p class="lb-cap" aria-live="polite"></p>' +
      '<button type="button" class="lb-btn lb-close" aria-label="' + esc(t('galleryClose')) + '">' + ic('close') + '</button>' +
      '<button type="button" class="lb-btn lb-prev" aria-label="' + esc(t('galleryPrev')) + '">' + ic('left') + '</button>' +
      '<button type="button" class="lb-btn lb-next" aria-label="' + esc(t('galleryNext')) + '">' + ic('right') + '</button>' +
      '<p class="lb-count"></p>';
    lb.el = el;
    showLb(0);
    document.body.classList.add('locked');
    requestAnimationFrame(function () { el.classList.add('open'); });
    el.querySelector('.lb-close').focus();
  }
  function showLb(dir) {
    var g = D.gallery[lb.i], stage = lb.el.querySelector('.lb-stage');
    stage.innerHTML = '<div class="lb-art' + (dir ? (dir > 0 ? ' from-r' : ' from-l') : '') + '">' + sceneOrImage(g) + '</div>';
    lb.el.querySelector('.lb-cap').textContent = L(g.label);
    lb.el.querySelector('.lb-count').textContent = (lb.i + 1) + ' / ' + D.gallery.length;
  }
  function stepLb(dir) { lb.i = (lb.i + dir + D.gallery.length) % D.gallery.length; showLb(dir); }
  function closeLb() {
    if (!lb.el || lb.el.hidden) return;
    lb.el.classList.remove('open');
    document.body.classList.remove('locked');
    var el = lb.el;
    setTimeout(function () { el.hidden = true; el.innerHTML = ''; }, reduced ? 0 : 250);
    if (lb.last) lb.last.focus();
  }

  /* ---------------- pojavljivanje pri skrolanju ---------------- */
  var io = null;
  function observeReveal() {
    var els = document.querySelectorAll('.reveal');
    if (reduced || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    if (io) io.disconnect();
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------------- efekti: pahulje zimi, listići i svjetlost ljeti ---------------- */
  var FX = (function () {
    var cv = null, cx = null, parts = [], raf = 0, w = 0, h = 0, dpr = 1, visible = true;
    function size() {
      if (!cv) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function make(initial) {
      var winter = season === 'winter';
      return {
        x: Math.random() * w, y: initial ? Math.random() * h : -20,
        r: winter ? 1 + Math.random() * 2.6 : 3 + Math.random() * 4,
        vy: winter ? 0.25 + Math.random() * 0.7 : 0.35 + Math.random() * 0.5,
        vx: winter ? -0.2 + Math.random() * 0.4 : 0.2 + Math.random() * 0.5,
        ph: Math.random() * 6.28, rot: Math.random() * 6.28,
        hue: ['#8db35a', '#c9a24a', '#a8c46a', '#e3b85c'][Math.floor(Math.random() * 4)]
      };
    }
    function tick() {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      cx.clearRect(0, 0, w, h);
      var winter = season === 'winter';
      parts.forEach(function (p) {
        p.ph += 0.01;
        p.y += p.vy; p.x += p.vx + Math.sin(p.ph) * (winter ? 0.3 : 0.6);
        p.rot += 0.01;
        if (p.y > h + 20 || p.x > w + 30 || p.x < -30) Object.assign(p, make(false));
        if (winter) {
          cx.globalAlpha = 0.85;
          cx.fillStyle = '#fff';
          cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();
        } else {
          cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot + Math.sin(p.ph) * 0.6);
          cx.globalAlpha = 0.8; cx.fillStyle = p.hue;
          cx.beginPath(); cx.ellipse(0, 0, p.r * 1.6, p.r * 0.7, 0, 0, 6.283); cx.fill();
          cx.restore();
        }
      });
    }
    function start(canvas) {
      cancelAnimationFrame(raf);
      if (reduced || !canvas) return;
      cv = canvas; cx = cv.getContext('2d');
      size();
      var count = season === 'winter' ? Math.round(Math.min(110, w / 7)) : Math.round(Math.min(28, w / 40));
      parts = []; for (var i = 0; i < count; i++) parts.push(make(true));
      if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(cv);
      tick();
    }
    window.addEventListener('resize', function () { size(); });
    return { start: start };
  })();

  /* ---------------- događaji ---------------- */
  function setSeason(s) {
    if (s === season) return;
    season = s; save('planinka-season', s);
    root.classList.add('season-anim');
    root.setAttribute('data-season', s);
    document.querySelectorAll('[data-season]').forEach(function (b) { if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', String(b.getAttribute('data-season') === s)); });
    var badge = document.querySelector('.badge .ic');
    if (badge) badge.outerHTML = ic(s === 'winter' ? 'snow' : 'sun');
    FX.start(document.querySelector('.fx'));
    setTimeout(function () { root.classList.remove('season-anim'); }, 1300);
  }
  function setLang(l) {
    if (l === lang) return;
    lang = l; save('planinka-lang', l);
    var y = window.scrollY;
    render();
    document.querySelectorAll('.reveal').forEach(function (e) { e.classList.add('in'); });
    window.scrollTo(0, y);
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-season]');
    if (b) { setSeason(b.getAttribute('data-season')); return; }
    var lgb = e.target.closest('button[data-lang]');
    if (lgb) { setLang(lgb.getAttribute('data-lang')); return; }
    var gb = e.target.closest('.g-btn');
    if (gb) { openLightbox(+gb.getAttribute('data-g')); return; }
    if (e.target.closest('.lb-close')) { closeLb(); return; }
    if (e.target.closest('.lb-prev')) { stepLb(-1); return; }
    if (e.target.closest('.lb-next')) { stepLb(1); return; }
    if (lb.el && !lb.el.hidden && (e.target === lb.el || e.target.classList.contains('lb-stage'))) closeLb();
  });
  document.addEventListener('keydown', function (e) {
    if (!lb.el || lb.el.hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowLeft') stepLb(-1);
    else if (e.key === 'ArrowRight') stepLb(1);
    else if (e.key === 'Tab') {
      var f = lb.el.querySelectorAll('button'), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  (function swipe() {
    var x0 = null, y0 = null;
    document.addEventListener('touchstart', function (e) { if (e.target.closest('#lightbox')) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; } }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) stepLb(dx < 0 ? 1 : -1);
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) closeLb();
      x0 = y0 = null;
    }, { passive: true });
  })();

  /* zaglavlje: prozirno na vrhu, puno kad se skrola; dock se pojavi nakon prvog ekrana */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY;
      root.classList.toggle('scrolled', y > 40);
      root.classList.toggle('past-hero', y > window.innerHeight * 0.6);
      var art = document.querySelector('.hero-art');
      if (art && !reduced && y < window.innerHeight) art.style.transform = 'translateY(' + (y * 0.25) + 'px) scale(1.04)';
    });
  }, { passive: true });

  render();
})();
