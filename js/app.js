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

  /* jezici stranice: D.languages, npr. ['bs', 'en', 'de'] (zadano bs i en) */
  var LANGS = (D.languages && D.languages.length ? D.languages : ['bs', 'en']).filter(function (l) { return UI[l]; });
  var lang = load('planinka-lang') || LANGS[0];
  if (LANGS.indexOf(lang) === -1) lang = LANGS[0];
  /* opcionalni dijelovi: pricing (null = cijene na upit), rooms, seasons: false, heroVideo, heroLogo, theme ... */
  var P = D.pricing || null;
  var SEASONS = D.seasons !== false;
  var MAX_GUESTS = (P && P.maxGuests) || D.maxGuests || 8;
  var MIN_NIGHTS = (P && P.minNights) || D.minNights || 1;
  var season = SEASONS ? (load('planinka-season') || autoSeason()) : (D.defaultSeason === 'summer' ? 'summer' : 'winter');
  var form = { a: '', d: '', g: Math.min(4, MAX_GUESTS), room: '', name: '', phone: '', msg: '' };

  function autoSeason() {
    if (D.defaultSeason === 'winter' || D.defaultSeason === 'summer') return D.defaultSeason;
    var m = new Date().getMonth() + 1;
    return [11, 12, 1, 2, 3, 4].indexOf(m) !== -1 ? 'winter' : 'summer';
  }

  /* ---------------- pomoćne ---------------- */
  function t(key, vars) {
    /* D.ui može promijeniti bilo koji tekst interfejsa, npr. ui: { aboutTitle: { bs: 'O nama', en: 'About us' } } */
    if (D.ui && D.ui[key]) { var o = L(D.ui[key]); return vars ? o.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ''; }) : o; }
    var parts = key.split('.'), v = UI[lang];
    for (var i = 0; i < parts.length; i++) v = v && v[parts[i]];
    if (v == null) v = key;
    if (vars && typeof v === 'string') v = v.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ''; });
    return v;
  }
  /* tekst na trenutnom jeziku; ako njemački fali, pokaže engleski, pa bosanski */
  function L(v) {
    if (v == null) return '';
    if (typeof v !== 'object' || Array.isArray(v)) return v;
    if (v[lang] != null) return v[lang];
    if (lang !== 'bs' && v.en != null) return v.en;
    return v.bs;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function plural(forms, n) {
    if (lang !== 'bs') return (n === 1 ? forms.one : forms.other).replace('{n}', n);
    var m10 = n % 10, m100 = n % 100;
    var f = (m10 === 1 && m100 !== 11) ? 'one' : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) ? 'few' : 'other';
    return (forms[f] || forms.other).replace('{n}', n);
  }
  function money(n) {
    var s = String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'en' ? ',' : '.');
    return s;
  }
  function parseDate(s) { if (!s) return null; var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function fmtDate(d) {
    if (lang === 'en') return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    if (lang === 'de') return d.getDate() + '. ' + ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'][d.getMonth()] + ' ' + d.getFullYear();
    return d.getDate() + '. ' + (d.getMonth() + 1) + '. ' + d.getFullYear() + '.';
  }
  function sceneOrImage(item, cls) {
    if (item.image) return '<img src="' + esc(item.image) + '" alt="' + esc(L(item.label)) + '" loading="lazy" decoding="async" class="' + (cls || '') + '">';
    return SC[item.scene] ? SC[item.scene]() : '';
  }
  function section(id, eyebrow, title, lead, body, cls) {
    return '<section class="sec ' + (cls || '') + '" id="' + id + '" aria-labelledby="' + id + '-t">' +
      '<div class="wrap">' +
      '<header class="sec-head reveal">' + (eyebrow ? '<p class="eyebrow">' + esc(eyebrow) + '</p>' : '') +
      '<h2 id="' + id + '-t" class="split">' + splitWords(title) + '</h2>' + (lead ? '<p class="lead">' + esc(lead) + '</p>' : '') + '</header>' +
      body + '</div></section>';
  }

  /* riječi naslova u zasebnim span-ovima, da se pojavljuju jedna za drugom */
  function splitWords(text) {
    return String(text).split(/\s+/).map(function (w, i) {
      return '<span class="w"><span style="--i:' + i + '">' + esc(w) + '</span></span>';
    }).join(' ');
  }

  /* ---------------- dijelovi stranice ---------------- */
  function topbar() {
    var keys = ['gallery'].concat(D.rooms && D.rooms.length ? ['rooms'] : [], ['about'], P ? ['prices'] : [], ['location', 'contact']);
    var nav = keys.map(function (k) {
      return '<a href="#' + k + '">' + esc(t('nav.' + k)) + '</a>';
    }).join('');
    return '<div class="topbar-in">' +
      '<a class="brand' + (D.brandLogo ? ' has-logo' : '') + '" href="#top" aria-label="' + esc(L(D.title)) + '"><span class="brand-mark" aria-hidden="true">' + brandMark() + '</span><span class="brand-name">' + esc(D.name) + '</span></a>' +
      '<nav class="topnav" aria-label="Navigacija">' + nav + '<span class="topnav-pill" aria-hidden="true"></span></nav>' +
      '<div class="toggles">' + (SEASONS ? seasonToggle() : '') + langToggle() + '</div>' +
      '<a class="btn btn-primary top-cta" href="#calc">' + ic('calendar') + '<span>' + esc(t('dockCta')) + '</span></a>' +
      '<button type="button" class="menu-btn" aria-haspopup="dialog" aria-expanded="false" aria-controls="guide" aria-label="' + esc(t('menu')) + '">' +
      '<span class="mb-lines" aria-hidden="true"><i></i><i></i></span><span class="mb-label">' + esc(t('menu')) + '</span></button></div>';
  }
  function brandMark(onDark) {
    /* D.brandLogo: { light: 'logo za tamnu pozadinu (bijeli)', dark: 'logo za svijetlu pozadinu' } */
    if (D.brandLogo) {
      if (onDark) return '<img class="brand-logo" src="' + esc(D.brandLogo.light) + '" alt="">';
      return '<img class="brand-logo brand-logo-light" src="' + esc(D.brandLogo.light) + '" alt=""><img class="brand-logo brand-logo-dark" src="' + esc(D.brandLogo.dark) + '" alt="">';
    }
    return '<svg viewBox="0 0 32 32"><path d="M3 26L16 6l13 20z" fill="currentColor"/><path d="M11 26l5-8 5 8z" fill="var(--bg)"/></svg>';
  }
  function seasonToggle() {
    return '<div class="seg seg-season" role="group" aria-label="' + esc(t('seasonLabel')) + '">' +
      '<button type="button" data-season="winter" aria-pressed="' + (season === 'winter') + '" title="' + esc(t('seasonWinter')) + '">' + ic('snow') + '<span>' + esc(t('seasonWinter')) + '</span></button>' +
      '<button type="button" data-season="summer" aria-pressed="' + (season === 'summer') + '" title="' + esc(t('seasonSummer')) + '">' + ic('sun') + '<span>' + esc(t('seasonSummer')) + '</span></button>' +
      '<span class="seg-thumb" aria-hidden="true"></span></div>';
  }
  function langToggle() {
    if (LANGS.length < 2) return '';
    return '<div class="seg seg-lang" role="group" aria-label="' + esc(t('langLabel')) + '">' +
      LANGS.map(function (l) { return '<button type="button" data-lang="' + l + '" aria-pressed="' + (lang === l) + '" lang="' + l + '">' + l.toUpperCase() + '</button>'; }).join('') +
      '<span class="seg-thumb" aria-hidden="true" style="--n:' + LANGS.length + ';--k:' + LANGS.indexOf(lang) + '"></span></div>';
  }

  function heroArt() {
    if (D.heroVideo) {
      return '<video class="hero-img hero-video" autoplay muted playsinline preload="auto"' + (D.heroVideoLoop === false ? '' : ' loop') + (D.heroPoster ? ' poster="' + esc(D.heroPoster) + '"' : '') + ' aria-hidden="true">' +
        '<source src="' + esc(D.heroVideo) + '" type="video/mp4">' +
        (D.heroVideoWebm ? '<source src="' + esc(D.heroVideoWebm) + '" type="video/webm">' : '') + '</video>';
    }
    return D.heroImage ? '<img src="' + esc(D.heroImage) + '" alt="" class="hero-img">' : SC.exterior();
  }
  function heroTitle() {
    var lg = D.heroLogo;
    if (lg) {
      /* animirani logo: znak se otkrije iz kruga, ime se "ispiše" slijeva nadesno */
      return '<h1 class="hero-logo"><span class="sr-only">' + esc(L(D.title)) + '</span>' +
        (lg.mark ? '<img class="hl-mark" src="' + esc(lg.mark) + '" alt="" aria-hidden="true">' : '') +
        '<img class="hl-word" src="' + esc(lg.word) + '" alt="" aria-hidden="true"></h1>';
    }
    /* slova se pojavljuju jedno za drugim; razmak ostaje običan da se dugo ime može prelomiti u dva reda */
    var letters = D.name.split('').map(function (ch, i) { return ch === ' ' ? ' ' : '<span style="--i:' + i + '">' + esc(ch) + '</span>'; }).join('');
    return '<h1 class="hero-h1"><span class="h1-small">' + esc(L(D.kind)) + '</span><span class="sr-only">' + esc(D.name) + '</span><span class="h1-name" aria-hidden="true">' + letters + '</span><span class="h1-place">' + esc(D.place) + '</span></h1>';
  }
  function hero() {
    return '<div class="hero-art">' + heroArt() + '</div>' +
      '<canvas class="fx" aria-hidden="true"></canvas>' +
      '<div class="hero-shade" aria-hidden="true"></div>' +
      '<div class="wrap hero-in"><div class="hero-top">' +
      '<p class="badge reveal">' + ic(season === 'winter' ? 'snow' : 'sun') + esc(L(D.badge) || t('heroBadge')) + ' · ' + esc(D.place) + '</p>' +
      heroTitle() +
      '<p class="hero-tag reveal">' + esc(L(D.tagline)) + '</p></div>' +
      (D.heroChips && D.heroChips.length ? '<ul class="hero-chips reveal" aria-label="' + esc(t('factsTitle')) + '">' + D.heroChips.map(function (c, i) {
        return '<li style="--d:' + i + '">' + ic(c.icon) + esc(L(c.label)) + '</li>';
      }).join('') + '</ul>' : '') +
      '<div class="hero-ctas reveal"><a class="btn btn-primary" href="#calc">' + ic('calendar') + esc(t(P ? 'heroCta' : 'heroCtaInquiry')) + '</a>' +
      '<a class="btn btn-ghost" href="#gallery">' + esc(t('heroSecondary')) + '</a></div>' +
      '</div>' +
      '<a class="scroll-cue" href="#main" aria-label="' + esc(t('scrollMore')) + '"><span>' + esc(t('scrollMore')) + '</span>' + ic('down') + '</a>';
  }

  function facts() {
    return '<section class="facts" aria-label="' + esc(t('factsTitle')) + '"><div class="wrap"><ul class="fact-list">' +
      D.facts.map(function (f, i) {
        var num = f.value && /^\d+$/.test(String(f.value));
        return '<li class="fact reveal" style="--d:' + i + '"><span class="fact-ic">' + ic(f.icon) + '</span><span>' + (f.value ? '<b' + (num ? ' data-count="' + esc(f.value) + '"' : '') + '>' + esc(f.value) + '</b> ' : '') + esc(L(f.label)) + '</span></li>';
      }).join('') + '</ul></div></section>';
  }

  function gallery() {
    /* zadnja slika popuni ostatak reda (mobitel: 2 kolone, desktop: 3 kolone, prva slika je velika) */
    var n = D.gallery.length;
    var spanM = 2 - ((2 + n - 2) % 2), spanD = 3 - ((4 + n - 2) % 3);
    var items = D.gallery.map(function (g, i) {
      var last = i === n - 1 && i > 0;
      return '<li class="g-item reveal' + (i === 0 ? ' g-wide' : '') + (last ? ' g-last' + (spanM === 2 ? ' g-pano-m' : '') + (spanD === 3 ? ' g-pano-d' : '') : '') + '" style="--d:' + i + (last ? ';--span-m:' + spanM + ';--span-d:' + spanD : '') + '">' +
        '<button type="button" class="g-btn" data-g="' + i + '" aria-label="' + esc(t('galleryOpen')) + ': ' + esc(L(g.label)) + '">' +
        '<span class="g-art">' + sceneOrImage(g) + '</span><span class="g-cap">' + esc(L(g.label)) + '</span></button></li>';
    }).join('');
    return section('gallery', null, t('galleryTitle'), t('galleryLead'), '<ul class="gallery">' + items + '</ul>');
  }

  function about() {
    var body = '<div class="about-grid"><div class="about-text">' + L(D.about).map(function (p, i) {
      return '<p class="reveal" style="--d:' + i + '">' + esc(p) + '</p>';
    }).join('') + '</div><div class="about-art reveal"><div class="frame">' + (D.aboutImages ? sceneOrImage(D.aboutImages[0]) : SC.living()) + '</div><div class="frame frame-2">' + (D.aboutImages ? sceneOrImage(D.aboutImages[1]) : SC.view()) + '</div></div></div>';
    return section('about', t('aboutEyebrow'), t('aboutTitle'), null, body);
  }

  function rooms() {
    if (!D.rooms || !D.rooms.length) return '';
    var body = '<ul class="rooms">' + D.rooms.map(function (r, i) {
      return '<li class="room spot reveal" style="--d:' + i + '">' +
        '<div class="room-art">' + sceneOrImage(r) + '</div>' +
        '<div class="room-body"><h3>' + esc(L(r.title)) + '</h3>' +
        '<p class="room-beds">' + ic('bed') + esc(L(r.beds)) + (r.guests ? ' · ' + ic('guests') + esc(t('upToGuests', { n: r.guests })) : '') + '</p>' +
        (r.text ? '<p class="room-text">' + esc(L(r.text)) + '</p>' : '') +
        '<a class="btn btn-small btn-outline" href="#calc" data-room="' + i + '">' + esc(t('askRoom')) + ic('arrow') + '</a></div></li>';
    }).join('') + '</ul>';
    return section('rooms', null, t('roomsTitle'), L(D.roomsLead) || t('roomsLead'), body);
  }

  /* traka koja polako klizi: sadržaji vikendice (D.ribbon: false je isključuje) */
  function ribbon() {
    if (D.ribbon === false || !D.amenities || !D.amenities.length) return '';
    var items = D.amenities.map(function (a) { return '<li>' + ic(a.icon) + esc(L(a.label)) + '</li>'; }).join('');
    return '<div class="ribbon" aria-hidden="true"><ul class="ribbon-track">' + items + items + '</ul></div>';
  }

  function amenities() {
    var body = '<ul class="amen">' + D.amenities.map(function (a, i) {
      return '<li class="amen-i spot reveal" style="--d:' + (i % 6) + '"><span class="amen-ic">' + ic(a.icon) + '</span>' + esc(L(a.label)) + '</li>';
    }).join('') + '</ul>';
    return section('amenities', null, t('amenitiesTitle'), t('amenitiesLead'), body, 'sec-alt');
  }

  /* doručak (opcionalno): D.breakfast = { title, text, items: [{bs,en}], image | scene, note } */
  function breakfast() {
    var B = D.breakfast;
    if (!B) return '';
    var body = '<div class="bf-grid"><div class="bf-art reveal">' + sceneOrImage(B.image ? B : { scene: B.scene || 'breakfast' }) + '</div>' +
      '<div class="bf-text reveal">' + (B.text ? '<p class="bf-lead">' + esc(L(B.text)) + '</p>' : '') +
      (B.items ? '<ul class="bf-items">' + B.items.map(function (x, i) { return '<li style="--d:' + i + '">' + ic('check') + esc(L(x)) + '</li>'; }).join('') + '</ul>' : '') +
      (B.time ? '<p class="bf-time">' + ic('coffee') + esc(L(B.time)) + '</p>' : '') +
      (B.note ? '<p class="muted small">' + esc(L(B.note)) + '</p>' : '') + '</div></div>';
    return section('breakfast', t('breakfastEyebrow'), L(B.title) || t('breakfastTitle'), null, body, 'sec-alt');
  }

  /* Instagram (opcionalno): D.instagramFeed = { images: [{ image, label }] } + D.contact.instagram */
  function instagram() {
    var F = D.instagramFeed, h = D.contact && D.contact.instagram;
    if (!F || !h) return '';
    var url = 'https://instagram.com/' + h;
    var body = '<ul class="ig-grid">' + F.images.map(function (g, i) {
      return '<li class="reveal" style="--d:' + i + '"><a href="' + esc(url) + '" target="_blank" rel="noopener" aria-label="Instagram: ' + esc(L(g.label)) + '">' + sceneOrImage(g) + '<span class="ig-hover">' + ic('insta') + '</span></a></li>';
    }).join('') + '</ul>' +
      '<p class="center ig-cta reveal"><a class="btn btn-primary" href="' + esc(url) + '" target="_blank" rel="noopener">' + ic('insta') + esc(t('igFollow', { h: '@' + h })) + '</a></p>';
    return section('instagram', t('igEyebrow'), t('igTitle'), t('igLead'), body);
  }

  /* vrijeme uživo (opcionalno): D.weather = { lat, lon } - podaci sa open-meteo.com (besplatno, bez ključa) */
  function weatherBox() {
    if (!D.weather) return '';
    return '<div class="wx reveal" id="wx" aria-live="polite" hidden></div>';
  }

  function prices() {
    if (!P) return '';
    var p = P;
    function card(kind) {
      return '<div class="price-card spot price-' + kind + ' reveal">' +
        '<div class="price-top">' + ic(kind === 'winter' ? 'snow' : 'sun') + '<div><h3>' + esc(t(kind + 'Season')) + '</h3><p>' + esc(t(kind + 'Months')) + '</p></div></div>' +
        '<p class="price-num"><b' + (p[kind] < 1000 ? ' data-count="' + p[kind] + '"' : '') + '>' + money(p[kind]) + '</b> ' + esc(p.currency) + ' <span>' + esc(t('perNight')) + '</span></p>' +
        '<p class="price-sub">' + esc(t('upTo', { n: p.baseGuests })) + ' · ' + esc(t('extraGuest', { p: p.extraGuest, c: p.currency })) + '</p></div>';
    }
    var body = '<div class="price-grid">' + card('winter') + card('summer') +
      '<div class="price-inc reveal"><h3>' + esc(t('includedTitle')) + '</h3><ul>' +
      L(p.included).map(function (x) { return '<li>' + ic('check') + esc(x) + '</li>'; }).join('') + '</ul>' +
      '<p class="price-note">' + esc(t('minNights', { n: p.minNights })) + '. ' + esc(L(p.note)) + '</p></div></div>';
    return section('prices', null, t('pricesTitle'), t('pricesLead'), body);
  }

  /* padajući meni (umjesto sistemskog <select>, da izgleda lijepo svuda) */
  function dropdown(id, label, opts, value) {
    var cur = opts.filter(function (o) { return String(o.v) === String(value); })[0] || opts[0];
    return '<div class="field"><span id="' + id + '-l">' + esc(label) + '</span><div class="dd" id="' + id + '" data-value="' + esc(cur.v) + '">' +
      '<button type="button" class="dd-btn" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="' + id + '-l ' + id + '-v"><span class="dd-val" id="' + id + '-v">' + esc(cur.t) + '</span>' + ic('down', 'dd-chev') + '</button>' +
      '<ul class="pop dd-list" role="listbox" aria-labelledby="' + id + '-l" hidden>' +
      opts.map(function (o) { return '<li role="option" tabindex="-1" data-v="' + esc(o.v) + '" aria-selected="' + (String(o.v) === String(cur.v)) + '">' + esc(o.t) + ic('check', 'dd-check') + '</li>'; }).join('') +
      '</ul></div></div>';
  }
  function guestOpts() {
    var o = []; for (var g = 1; g <= MAX_GUESTS; g++) o.push({ v: g, t: plural(t('guestsN'), g) });
    return o;
  }
  function roomOpts() {
    return [{ v: '', t: t('anyRoom') }].concat((D.rooms || []).map(function (r, i) { return { v: i, t: L(r.title) }; }));
  }
  function dateLabel(v) { return v ? fmtDate(parseDate(v)) : t('pickDate'); }

  function calc() {
    var roomSel = D.rooms && D.rooms.length ? dropdown('dd-r', t('roomType'), roomOpts(), form.room) : '';
    var out = P
      ? '<div class="calc-out" aria-live="polite"><p class="calc-line" id="calc-line">' + esc(t('calcHint')) + '</p>' +
        '<p class="calc-total"><span>' + esc(t('total')) + '</span><b><span id="calc-total">0</span> ' + esc(P.currency) + '</b></p>' +
        '<p class="calc-dep" id="calc-dep"></p></div>'
      : '<div class="calc-out" aria-live="polite"><p class="calc-line" id="calc-line">' + esc(t('calcHint')) + '</p>' +
        '<p class="calc-total calc-onreq"><span>' + esc(t('priceLabel')) + '</span><b>' + esc(t('onRequest')) + '</b></p>' +
        '<p class="calc-dep">' + esc(t('onRequestNote')) + '</p></div>';
    var body = '<div class="calc-grid">' +
      '<form class="calc-card reveal" id="calc-form" novalidate>' +
      '<div class="field field-dates"><span>' + esc(t('dates')) + ' <i class="req" aria-hidden="true">*</i></span>' +
      '<div class="dates" id="dates">' +
      '<button type="button" class="date-btn" data-cal="a" aria-haspopup="dialog" aria-expanded="false">' + ic('calendar') + '<span><small>' + esc(t('arrival')) + '</small><b id="lbl-a">' + esc(dateLabel(form.a)) + '</b></span></button>' +
      '<button type="button" class="date-btn" data-cal="d" aria-haspopup="dialog" aria-expanded="false">' + ic('calendar') + '<span><small>' + esc(t('departure')) + '</small><b id="lbl-d">' + esc(dateLabel(form.d)) + '</b></span></button>' +
      '</div><input type="hidden" id="f-a" value="' + esc(form.a) + '"><input type="hidden" id="f-d" value="' + esc(form.d) + '">' +
      '<div class="pop cal-pop" id="cal" role="dialog" aria-label="' + esc(t('dates')) + '" hidden></div></div>' +
      dropdown('dd-g', t('guests'), guestOpts(), form.g) +
      roomSel + out +
      '</form>' +
      '<form class="inq-card reveal" id="inq-form" novalidate><h3>' + esc(t('inquiryTitle')) + '</h3><p class="muted">' + esc(t('inquiryLead')) + '</p>' +
      '<label class="field"><span>' + esc(t('name')) + ' <i class="req" aria-hidden="true">*</i></span><input type="text" id="f-n" autocomplete="name" required value="' + esc(form.name) + '"></label>' +
      '<label class="field"><span>' + esc(t('phone')) + ' <i class="req" aria-hidden="true">*</i></span><input type="tel" id="f-p" autocomplete="tel" inputmode="tel" required value="' + esc(form.phone) + '"></label>' +
      '<label class="field"><span>' + esc(t('message')) + '</span><textarea id="f-m" rows="2">' + esc(form.msg) + '</textarea></label>' +
      '<div class="need" id="need"><p>' + esc(t('needTitle')) + '</p><ul>' +
      '<li data-need="dates">' + ic('check') + esc(t('needDatesItem')) + '</li>' +
      '<li data-need="name">' + ic('check') + esc(t('needNameItem')) + '</li>' +
      '<li data-need="phone">' + ic('check') + esc(t('needPhoneItem')) + '</li></ul>' +
      '<p class="need-why">' + esc(t('needWhy')) + '</p></div>' +
      '<p class="form-err" id="inq-err" role="alert"></p>' +
      '<div class="inq-btns"><a class="btn btn-viber" id="send-viber" href="#">' + ic('viber') + esc(t('sendViber')) + '</a>' +
      '<a class="btn btn-wa" id="send-wa" href="#" target="_blank" rel="noopener">' + ic('whatsapp') + esc(t('sendWhatsapp')) + '</a></div>' +
      '<p class="muted small">' + esc(t('inquiryNote')) + '</p></form></div>';
    return section('calc', null, t(P ? 'calcTitle' : 'datesTitle'), t(P ? 'calcLead' : 'datesLead'), body, 'sec-alt');
  }

  function location() {
    var signs = (D.distances || []).map(function (d, i) {
      return '<li class="sign reveal" style="--d:' + i + '">' + ic(d.icon) + '<span class="sign-place">' + esc(L(d.place)) + '</span><span class="sign-time">' + esc(L(d.time)) + '</span></li>';
    }).join('');
    var map = '<div class="map reveal">' + (D.locationImage ? '<img src="' + esc(D.locationImage) + '" alt="' + esc(t('locationTitle')) + '" loading="lazy" class="map-img">' : mapSvg()) + '<a class="btn btn-small map-btn" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(D.mapQuery) + '" target="_blank" rel="noopener">' + ic('pin') + esc(t('openMaps')) + '</a></div>';
    return section('location', null, t('locationTitle'), L(D.locationLead) || t('locationLead'), '<div class="loc-grid">' + map + (signs ? '<ul class="signs">' + signs + '</ul>' : '') + '</div>' + directions());
  }
  /* kako doći (opcionalno): D.directions = { destination: 'lat,lon' ili adresa, steps: [{ icon, text }], tip } */
  function directions() {
    var R = D.directions;
    if (!R) return '';
    var nav = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(R.destination || D.mapQuery);
    return '<div class="dirs reveal"><div class="dirs-head"><h3>' + esc(t('dirTitle')) + '</h3>' +
      '<a class="btn btn-primary" href="' + esc(nav) + '" target="_blank" rel="noopener">' + ic('nav') + esc(t('dirNavigate')) + '</a></div>' +
      '<ol class="dirs-steps">' + (R.steps || []).map(function (st, i) {
        return '<li style="--d:' + i + '"><span class="dirs-ic">' + ic(st.icon || 'road') + '</span><p>' + esc(L(st.text)) + '</p></li>';
      }).join('') + '</ol>' +
      (R.tip ? '<p class="dirs-tip">' + ic('snow') + '<span>' + esc(L(R.tip)) + '</span></p>' : '') + '</div>';
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
    if (!A) return '';
    var body = weatherBox() + '<div class="act-cols"><div class="act-col act-winter"><h3 class="act-h">' + ic('snow') + esc(t('doWinter')) + '</h3><ul>' + list(A.winter) + '</ul></div>' +
      '<div class="act-col act-summer"><h3 class="act-h">' + ic('sun') + esc(t('doSummer')) + '</h3><ul>' + list(A.summer) + '</ul></div></div>' +
      '<div class="food reveal">' + ic('cheese') + '<div><h3>' + esc(L(A.food.title)) + '</h3><p>' + esc(L(A.food.text)) + '</p></div></div>';
    return section('activities', null, t('doTitle'), null, body, 'sec-alt');
  }

  function reviews() {
    if (!D.reviews || !D.reviews.length) return '';
    var body = '<ul class="reviews">' + D.reviews.map(function (r, i) {
      var stars = '';
      for (var s = 0; s < 5; s++) stars += '<span class="' + (s < r.rating ? 'on' : '') + '">' + ic('star') + '</span>';
      return '<li class="review spot reveal" style="--d:' + i + '"><div class="stars" aria-label="' + r.rating + '/5">' + stars + '</div>' +
        '<blockquote>' + esc(L(r.text)) + '</blockquote><p class="who"><b>' + esc(r.name) + '</b> · ' + esc(L(r.from)) + '</p></li>';
    }).join('') + '</ul>' + (D.demo ? '<p class="muted small center">' + esc(t('reviewsDemo')) + '</p>' : '');
    return section('reviews', null, t('reviewsTitle'), null, body);
  }

  function faq() {
    if (!D.faq || !D.faq.length) return '';
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
    ].filter(function (l) { return l[3] && !/undefined/.test(l[2]); }).map(function (l, i) {
      return '<li class="reveal" style="--d:' + i + '"><a class="contact-card spot" href="' + esc(l[2]) + '"' + (/^https/.test(l[2]) ? ' target="_blank" rel="noopener"' : '') + '>' + ic(l[0]) + '<span><b>' + esc(l[1]) + '</b><small>' + esc(l[3]) + '</small></span></a></li>';
    }).join('');
    return section('contact', null, t('contactTitle'), t('contactLead'), '<ul class="contact-grid">' + links + '</ul>');
  }

  function footer() {
    return '<div class="wrap foot-in"><p class="foot-brand">' + brandMark(true) + esc(L(D.title)) + '</p>' +
      (D.demo ? '<p class="demo-note">' + esc(L(D.demoNote) || t('demoNote')) + '</p>' : '') +
      (D.credit ? '<p class="credit">' + esc(t('madeBy')) + ': <a href="' + esc(D.credit.url) + '" target="_blank" rel="noopener">' + esc(D.credit.name) + '</a></p>' : '') +
      '<p class="muted small">© ' + new Date().getFullYear() + ' ' + esc(D.name) + '. ' + esc(t('footerRights')) + '</p></div>';
  }

  function toTop() {
    return '<a class="to-top" id="to-top" href="#top" aria-label="' + esc(t('toTop')) + '" title="' + esc(t('toTop')) + '">' +
      '<svg class="to-top-ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22"/><circle cx="24" cy="24" r="22" class="to-top-prog" id="to-top-prog"/></svg>' + ic('up') + '</a>';
  }

  function dock() {
    var c = D.contact;
    return '<a class="dock-btn" href="tel:' + esc(c.phone.replace(/\s/g, '')) + '">' + ic('phone') + esc(t('call')) + '</a>' +
      '<a class="dock-btn dock-viber" href="viber://chat?number=' + encodeURIComponent(c.viber) + '">' + ic('viber') + esc(t('viber')) + '</a>' +
      '<a class="dock-btn dock-cta" href="#calc">' + ic('calendar') + '<span>' + esc(t('dockCta')) + '</span></a>';
  }

  /* ---------------- vodič (meni): pločice sa svim dijelovima stranice ---------------- */
  var GUIDE_ICONS = { gallery: 'image', rooms: 'bed', about: 'home', amenities: 'spark', breakfast: 'coffee', prices: 'tag', calc: 'calendar', location: 'pin', activities: 'ski', reviews: 'star', faq: 'chat', instagram: 'insta', contact: 'phone' };
  function guideMeta(id) {
    var c = D.contact || {};
    switch (id) {
      case 'gallery': return plural(t('guidePhotos'), D.gallery.length);
      case 'rooms': return plural(t('guideRooms'), D.rooms.length);
      case 'about': return t('aboutEyebrow');
      case 'amenities': return plural(t('guideAmen'), D.amenities.length);
      case 'breakfast': return L(D.breakfast.time) || t('breakfastEyebrow');
      case 'prices': return t('guideFrom', { p: money(Math.min(P.winter, P.summer)), c: P.currency });
      case 'calc': return t('guideCalc');
      case 'location': return D.distances && D.distances[0] ? L(D.distances[0].place) + ' · ' + L(D.distances[0].time) : L(D.place);
      case 'activities': return t('doWinter') + ' · ' + t('doSummer');
      case 'reviews':
        var sum = D.reviews.reduce(function (a, r) { return a + r.rating; }, 0);
        return t('guideReviews', { r: (sum / D.reviews.length).toFixed(1).replace('.', lang === 'en' ? '.' : ',') });
      case 'faq': return plural(t('guideFaq'), D.faq.length);
      case 'instagram': return '@' + c.instagram;
      case 'contact': return c.phone || '';
    }
    return '';
  }
  function guideHtml() {
    var c = D.contact || {};
    var secs = [].slice.call(document.querySelectorAll('#main section.sec[id]'));
    var calc = secs.filter(function (x) { return x.id === 'calc'; });
    secs = calc.concat(secs.filter(function (x) { return x.id !== 'calc'; }));
    var tiles = secs.map(function (sec, i) {
      var h = sec.querySelector('h2'), id = sec.id;
      return '<li style="--i:' + i + '"><a class="gd-tile' + (id === 'calc' ? ' gd-feat' : '') + '" href="#' + id + '" data-go="' + id + '">' +
        '<span class="gd-num">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="gd-ic">' + ic(GUIDE_ICONS[id] || 'arrow') + '</span>' +
        '<span class="gd-txt"><b>' + esc(h ? h.textContent.replace(/\s+/g, ' ').trim() : id) + '</b><small>' + esc(guideMeta(id)) + '</small></span>' +
        '<span class="gd-here">' + esc(t('guideHere')) + '</span>' + (id === 'calc' ? ic('arrow', 'gd-go') : '') + '</a></li>';
    }).join('');
    var quick = [
      c.phone ? '<a class="gd-q" href="tel:' + esc(c.phone.replace(/\s/g, '')) + '">' + ic('phone') + '<span>' + esc(t('call')) + '</span></a>' : '',
      c.viber ? '<a class="gd-q gd-q-viber" href="viber://chat?number=' + encodeURIComponent(c.viber) + '">' + ic('viber') + '<span>' + esc(t('viber')) + '</span></a>' : '',
      c.whatsapp ? '<a class="gd-q gd-q-wa" href="https://wa.me/' + esc(c.whatsapp) + '" target="_blank" rel="noopener">' + ic('whatsapp') + '<span>' + esc(t('whatsapp')) + '</span></a>' : ''
    ].join('');
    return '<div class="guide-bg" aria-hidden="true"><svg viewBox="0 0 1200 300" preserveAspectRatio="none"><path class="gb-1" d="M0 300V190l120-70 90 50 140-110 120 90 110-60 160 120 130-80 140 70 190-100v200z"/><path class="gb-2" d="M0 300V240l160-60 120 40 150-80 130 70 170-50 140 60 160-70 170 50v100z"/></svg></div>' +
      '<div class="guide-in">' +
      '<div class="guide-top"><span class="guide-brand">' + brandMark(true) + '<span>' + esc(D.name) + '</span></span>' +
      '<button type="button" class="menu-btn is-x" data-guide-close>' + '<span class="mb-lines" aria-hidden="true"><i></i><i></i></span><span class="mb-label">' + esc(t('menuClose')) + '</span></button></div>' +
      '<div class="guide-grid"><div class="guide-side">' +
      '<p class="eyebrow">' + esc(t('guideEyebrow', { name: D.name })) + '</p>' +
      '<h2 id="guide-t" class="guide-h">' + esc(t('guideTitle')) + '</h2>' +
      '<p class="guide-lead">' + esc(L(D.tagline)) + '</p></div>' +
      '<ol class="gd-tiles">' + tiles + '</ol>' +
      '<div class="guide-side guide-extra">' +
      (quick ? '<p class="guide-label">' + esc(t('guideQuick')) + '</p><div class="gd-quick">' + quick + '</div>' : '') +
      '<p class="guide-label">' + esc(t('guideSettings')) + '</p><div class="gd-toggles">' + (SEASONS ? seasonToggle() : '') + langToggle() + '</div>' +
      '</div></div></div>';
  }
  var Guide = (function () {
    var el = null, last = null, isOpen = false;
    function build() {
      el = document.getElementById('guide');
      if (!el) { el = document.createElement('div'); el.id = 'guide'; el.className = 'guide'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'guide-t'); el.hidden = true; document.body.appendChild(el); }
      el.innerHTML = guideHtml();
      markHere();
    }
    function origin(btn) {
      var r = btn ? btn.getBoundingClientRect() : { left: window.innerWidth - 40, top: 30, width: 0, height: 0 };
      el.style.setProperty('--ox', Math.round(r.left + r.width / 2) + 'px');
      el.style.setProperty('--oy', Math.round(r.top + r.height / 2) + 'px');
    }
    function open(instant) {
      if (isOpen) return;
      isOpen = true;
      last = document.activeElement;
      var btn = document.querySelector('.topbar .menu-btn');
      origin(btn);
      el.hidden = false;
      el.classList.toggle('instant', !!instant);
      root.classList.add('guide-open');
      document.body.classList.add('locked');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('open'); }); });
      var here = el.querySelector('.gd-tile.is-here') || el.querySelector('.gd-tile');
      setTimeout(function () { (el.querySelector('[data-guide-close]')).focus({ preventScroll: true }); }, instant ? 0 : 60);
      if (here) here.scrollIntoView({ block: 'nearest' });
    }
    function close(noFocus) {
      if (!isOpen) return;
      isOpen = false;
      var btn = document.querySelector('.topbar .menu-btn');
      if (btn) { btn.setAttribute('aria-expanded', 'false'); origin(btn); }
      el.classList.remove('open', 'instant');
      root.classList.remove('guide-open');
      document.body.classList.remove('locked');
      setTimeout(function () { if (!isOpen) el.hidden = true; }, reduced ? 0 : 700);
      if (!noFocus) {
        var back = last && last !== document.body && document.contains(last) ? last : btn;
        if (back) back.focus({ preventScroll: true });
      }
    }
    function markHere() {
      if (!el) return;
      el.querySelectorAll('.gd-tile').forEach(function (a) { a.classList.toggle('is-here', a.getAttribute('data-go') === Spy.current); });
    }
    document.addEventListener('click', function (e) {
      if (e.target.closest('.topbar .menu-btn')) { open(false); return; }
      if (!isOpen) return;
      if (e.target.closest('[data-guide-close]')) { close(); return; }
      var tile = e.target.closest('[data-go]');
      if (tile) {
        e.preventDefault();
        var target = document.getElementById(tile.getAttribute('data-go'));
        close(true);
        setTimeout(function () {
          if (!target) return;
          target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
          var h = target.querySelector('h2');
          if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
        }, reduced ? 0 : 420);
      }
    });
    document.addEventListener('keydown', function (e) {
      if (!isOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') {
        var f = [].slice.call(el.querySelectorAll('a[href], button')).filter(function (x) { return x.offsetParent !== null; });
        var first = f[0], lastF = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastF.focus(); }
        else if (!e.shiftKey && document.activeElement === lastF) { e.preventDefault(); first.focus(); }
      }
    });
    return { build: build, open: open, close: close, markHere: markHere, isOpen: function () { return isOpen; } };
  })();

  /* ---------------- gdje je gost na stranici (aktivni link u meniju) ---------------- */
  var Spy = (function () {
    var obs = null, api = { current: 'top', start: start, update: update };
    function update() {
      document.querySelectorAll('.topnav a').forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + api.current); });
      var nav = document.querySelector('.topnav'), pill = nav && nav.querySelector('.topnav-pill'), act = nav && nav.querySelector('a.is-active');
      if (pill) {
        if (act) { pill.style.width = act.offsetWidth + 'px'; pill.style.transform = 'translateX(' + act.offsetLeft + 'px)'; pill.style.opacity = '1'; }
        else pill.style.opacity = '0';
      }
      Guide.markHere();
    }
    function start() {
      if (obs) obs.disconnect();
      if (!('IntersectionObserver' in window)) return;
      obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { api.current = en.target.id; update(); } });
      }, { rootMargin: '-45% 0px -50% 0px' });
      document.querySelectorAll('#top, #main section.sec[id]').forEach(function (s) { obs.observe(s); });
    }
    window.addEventListener('resize', function () { update(); });
    return api;
  })();

  /* brojevi koji "odbroje" do vrijednosti kad se pojave */
  function countUp(box) {
    box.querySelectorAll('[data-count]').forEach(function (b) {
      var to = +b.getAttribute('data-count'); b.removeAttribute('data-count');
      if (reduced || to < 2) return;
      var t0 = performance.now();
      (function step(now) {
        var k = Math.min(1, (now - t0) / 900), e = 1 - Math.pow(1 - k, 3);
        b.textContent = String(Math.max(1, Math.round(to * e)));
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    });
  }

  /* svjetlo koje prati miš preko kartica (samo računar) */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest('.spot');
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---------------- crtanje ---------------- */
  function render() {
    root.lang = lang;
    root.setAttribute('data-season', season);
    root.classList.toggle('no-seasons', !SEASONS);
    if (D.theme) Object.keys(D.theme).forEach(function (k) { root.style.setProperty('--' + k, D.theme[k]); });
    document.title = L(D.title) + ' | ' + L(D.tagline);
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', L(D.tagline));
    document.querySelector('.skip').textContent = t('skip');
    document.getElementById('topbar').innerHTML = topbar();
    document.getElementById('top').innerHTML = hero();
    document.getElementById('main').innerHTML = facts() + gallery() + rooms() + about() + ribbon() + amenities() + breakfast() + prices() + calc() + location() + activities() + reviews() + faq() + instagram() + contact();
    document.getElementById('foot').innerHTML = footer();
    document.getElementById('dock').innerHTML = dock();
    var tt = document.getElementById('to-top-wrap');
    if (!tt) { tt = document.createElement('div'); tt.id = 'to-top-wrap'; document.body.appendChild(tt); }
    tt.innerHTML = toTop();
    Guide.build();
    bindCalc();
    updateCalc(false);
    loadWeather();
    observeReveal();
    Spy.start();
    FX.start(document.querySelector('.fx'));
  }

  /* ---------------- kalkulator i upit ---------------- */
  function compute() {
    var p = P, a = parseDate(form.a), d = parseDate(form.d), g = +form.g;
    if (!a || !d) return { ok: false, msg: t('calcHint') };
    var today = parseDate(iso(new Date()));
    if (a < today) return { ok: false, msg: t('errPast') };
    if (d <= a) return { ok: false, msg: t('errOrder') };
    var nights = Math.round((d - a) / 86400000);
    if (nights < MIN_NIGHTS) return { ok: false, msg: t('errMin', { n: MIN_NIGHTS }) };
    if (!p) return { ok: true, nights: nights, a: a, d: d, g: g, line: plural(t('nights'), nights) + ' · ' + fmtDate(a) + ' – ' + fmtDate(d) };
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
    if (!P) return;
    var target = r.ok ? r.total : 0;
    dep.textContent = r.ok ? t('deposit', { p: P.depositPercent }) + ': ' + money(r.total * P.depositPercent / 100) + ' ' + P.currency : '';
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
      if (P) lines.push(t('msgTotal', { t: money(r.total), c: P.currency }));
    }
    if (form.room !== '' && D.rooms && D.rooms[+form.room]) lines.push(t('msgRoom', { r: L(D.rooms[+form.room].title) }));
    if (form.name || form.phone) lines.push(t('msgFrom', { n: form.name, p: form.phone }));
    if (form.msg) lines.push(form.msg);
    return { ok: r.ok, text: lines.join('\n') };
  }

  /* šta još fali za upit: datumi, ime, telefon */
  function missing() {
    var r = compute(), m = [];
    if (!r.ok) m.push('dates');
    if (!form.name.trim()) m.push('name');
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 6) m.push('phone');
    return m;
  }
  function updateNeed() {
    var m = missing(), box = document.getElementById('need');
    if (!box) return;
    box.querySelectorAll('[data-need]').forEach(function (li) { li.classList.toggle('ok', m.indexOf(li.getAttribute('data-need')) === -1); });
    box.classList.toggle('all-ok', !m.length);
    ['send-viber', 'send-wa'].forEach(function (id) {
      var b = document.getElementById(id);
      b.classList.toggle('is-locked', !!m.length);
      b.setAttribute('aria-disabled', String(!!m.length));
    });
    if (!m.length) document.getElementById('inq-err').textContent = '';
  }

  function setDates(a, d) {
    form.a = a || ''; form.d = d || '';
    document.getElementById('f-a').value = form.a;
    document.getElementById('f-d').value = form.d;
    document.getElementById('lbl-a').textContent = dateLabel(form.a);
    document.getElementById('lbl-d').textContent = dateLabel(form.d);
    updateCalc(true);
    updateNeed();
  }

  function bindCalc() {
    ['f-n', 'f-p', 'f-m'].forEach(function (id, i) {
      document.getElementById(id).addEventListener('input', function (e) { form[['name', 'phone', 'msg'][i]] = e.target.value; updateNeed(); });
    });
    function go(kind, e) {
      var m = missing(), err = document.getElementById('inq-err');
      if (m.length) {
        e.preventDefault();
        err.textContent = t(m[0] === 'dates' ? 'needDates' : 'needName');
        if (m[0] === 'dates') { document.getElementById('dates').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); setTimeout(function () { Cal.open(form.a ? 'd' : 'a'); }, reduced ? 0 : 650); }
        else document.getElementById(m[0] === 'name' ? 'f-n' : 'f-p').focus();
        return;
      }
      err.textContent = '';
      var msg = message(), c = D.contact;
      e.currentTarget.href = kind === 'viber'
        ? 'viber://chat?number=' + encodeURIComponent(c.viber) + '&draft=' + encodeURIComponent(msg.text)
        : 'https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(msg.text);
    }
    document.getElementById('send-viber').addEventListener('click', function (e) { go('viber', e); });
    document.getElementById('send-wa').addEventListener('click', function (e) { go('wa', e); });
    updateNeed();
  }

  /* ---------------- vrijeme uživo (open-meteo.com) ---------------- */
  var WX_CODES = [
    [[0], 'sun', { bs: 'Vedro', en: 'Clear', de: 'Klar' }],
    [[1, 2], 'cloudsun', { bs: 'Djelimično oblačno', en: 'Partly cloudy', de: 'Teilweise bewölkt' }],
    [[3], 'cloud', { bs: 'Oblačno', en: 'Cloudy', de: 'Bewölkt' }],
    [[45, 48], 'fog', { bs: 'Magla', en: 'Fog', de: 'Nebel' }],
    [[51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82], 'rain', { bs: 'Kiša', en: 'Rain', de: 'Regen' }],
    [[71, 73, 75, 77, 85, 86], 'snow', { bs: 'Snijeg', en: 'Snow', de: 'Schnee' }],
    [[95, 96, 99], 'storm', { bs: 'Grmljavina', en: 'Thunderstorm', de: 'Gewitter' }]
  ];
  function wxInfo(code) {
    for (var i = 0; i < WX_CODES.length; i++) if (WX_CODES[i][0].indexOf(code) !== -1) return { icon: WX_CODES[i][1], text: L(WX_CODES[i][2]) };
    return { icon: 'cloud', text: '' };
  }
  var wxData = null;
  function drawWeather() {
    var el = document.getElementById('wx');
    if (!el || !wxData) return;
    var c = wxData.current, d = wxData.daily, now = wxInfo(c.weather_code);
    var DAYS = { bs: ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'], en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'] };
    var n = Math.min(4, d.time.length), lo = Infinity, hi = -Infinity, i;
    for (i = 0; i < n; i++) { lo = Math.min(lo, d.temperature_2m_min[i]); hi = Math.max(hi, d.temperature_2m_max[i]); }
    var span = Math.max(1, hi - lo), days = '';
    for (i = 1; i < n; i++) {
      var w = wxInfo(d.weather_code[i]), dt = parseDate(d.time[i]);
      var mn = d.temperature_2m_min[i], mx = d.temperature_2m_max[i];
      days += '<li style="--d:' + i + '"><span class="wx-dn">' + esc(i === 1 ? t('wxTomorrow') : DAYS[lang][dt.getDay()]) + '</span>' + ic(w.icon) +
        '<span class="wx-range"><small>' + Math.round(mn) + '°</small><i style="--a:' + ((mn - lo) / span * 100).toFixed(1) + '%;--b:' + ((hi - mx) / span * 100).toFixed(1) + '%"></i><b>' + Math.round(mx) + '°</b></span></li>';
    }
    var chips = '<span class="wx-chip">' + ic('wind') + Math.round(c.wind_speed_10m) + ' km/h</span>';
    if (c.snow_depth != null && c.snow_depth > 0.01) chips += '<span class="wx-chip">' + ic('snow') + esc(t('wxSnow', { cm: Math.round(c.snow_depth * 100) })) + '</span>';
    if (d.temperature_2m_max && d.temperature_2m_max.length) chips += '<span class="wx-chip">' + esc(t('wxToday')) + ' ' + Math.round(d.temperature_2m_max[0]) + '° / ' + Math.round(d.temperature_2m_min[0]) + '°</span>';
    var feels = c.apparent_temperature != null ? '<span class="wx-feels">' + esc(t('wxFeels', { t: Math.round(c.apparent_temperature) })) + '</span>' : '';
    var title = D.weather.title ? L(D.weather.title) : t('wxTitle', { place: D.place });
    el.className = 'wx reveal in wx-' + now.icon + (c.is_day === 0 ? ' wx-night' : '');
    el.innerHTML = '<div class="wx-sky" aria-hidden="true"><span class="wx-fall"></span><span class="wx-fall wx-fall-2"></span><span class="wx-glow"></span>' +
      '<svg class="wx-mtn" viewBox="0 0 600 120" preserveAspectRatio="none"><path d="M0 120 L0 78 L70 40 L120 66 L190 18 L250 58 L300 34 L370 76 L430 30 L500 64 L560 44 L600 60 L600 120Z"/><path class="wx-mtn-2" d="M0 120 L0 96 L90 70 L160 92 L240 62 L330 94 L420 72 L520 98 L600 80 L600 120Z"/></svg></div>' +
      '<div class="wx-now"><p class="wx-label"><span class="wx-live"></span>' + esc(title) + '</p>' +
      '<div class="wx-main"><span class="wx-icon">' + ic(now.icon, 'wx-big') + '</span><div><b class="wx-temp">' + Math.round(c.temperature_2m) + '<sup>°C</sup></b>' +
      '<span class="wx-cond">' + esc(now.text) + '</span>' + feels + '</div></div>' +
      '<p class="wx-meta">' + chips + '</p></div>' +
      '<div class="wx-next"><p class="wx-next-t">' + esc(t('wxNext')) + '</p><ul class="wx-days">' + days + '</ul></div>';
    el.hidden = false;
  }
  function loadWeather() {
    if (!D.weather) return;
    if (wxData) { drawWeather(); return; }
    var key = 'planinka-wx2-' + D.weather.lat + ',' + D.weather.lon;
    try {
      var cached = JSON.parse(sessionStorage.getItem(key) || 'null');
      if (cached && Date.now() - cached.t < 30 * 60 * 1000) { wxData = cached.d; drawWeather(); return; }
    } catch (e) { /* nema sessionStorage */ }
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + D.weather.lat + '&longitude=' + D.weather.lon +
      '&current=temperature_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,snow_depth&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FSarajevo&forecast_days=4';
    fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j || !j.current) return;
      wxData = j;
      try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: j })); } catch (e) { /* ništa */ }
      drawWeather();
    }).catch(function () { /* bez interneta ili API ne radi: kartica ostaje skrivena */ });
  }

  /* ---------------- kalendar za datume ---------------- */
  var Cal = (function () {
    var month = null, picking = 'a', openEl = null;
    var MONTHS = {
      bs: ['januar', 'februar', 'mart', 'april', 'maj', 'juni', 'juli', 'august', 'septembar', 'oktobar', 'novembar', 'decembar'],
      en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
    };
    var DAYS = { bs: ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'], en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] };
    function today() { return parseDate(iso(new Date())); }
    function draw() {
      var el = document.getElementById('cal');
      var y = month.getFullYear(), mo = month.getMonth();
      var first = new Date(y, mo, 1), startDow = (first.getDay() + 6) % 7, days = new Date(y, mo + 1, 0).getDate();
      var td = today(), a = parseDate(form.a), d = parseDate(form.d);
      var minEnd = a ? new Date(a.getFullYear(), a.getMonth(), a.getDate() + MIN_NIGHTS) : null;
      var canPrev = new Date(y, mo, 1) > new Date(td.getFullYear(), td.getMonth(), 1);
      var cells = '';
      for (var i = 0; i < startDow; i++) cells += '<span></span>';
      for (var dd = 1; dd <= days; dd++) {
        var day = new Date(y, mo, dd), v = iso(day);
        var dis = day < td || (picking === 'd' && a && minEnd && day < minEnd && day > a);
        var cls = ['cal-day'];
        if (+day === +td) cls.push('is-today');
        if (a && +day === +a) cls.push('is-start');
        if (d && +day === +d) cls.push('is-end');
        if (a && d && day > a && day < d) cls.push('is-range');
        cells += '<button type="button" class="' + cls.join(' ') + '" data-day="' + v + '"' + (dis ? ' disabled' : '') + ' aria-label="' + esc(fmtDate(day)) + '">' + dd + '</button>';
      }
      var r = compute();
      el.innerHTML =
        '<div class="cal-head"><button type="button" class="cal-nav" data-cal-nav="-1"' + (canPrev ? '' : ' disabled') + ' aria-label="‹">' + ic('left') + '</button>' +
        '<b>' + MONTHS[lang][mo] + ' ' + y + '</b>' +
        '<button type="button" class="cal-nav" data-cal-nav="1" aria-label="›">' + ic('right') + '</button></div>' +
        '<p class="cal-hint">' + esc(t(picking === 'a' ? 'pickArrival' : 'pickDeparture')) + '</p>' +
        '<div class="cal-dow">' + DAYS[lang].map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div>' +
        '<div class="cal-grid">' + cells + '</div>' +
        '<div class="cal-foot"><span>' + esc(r.ok ? plural(t('nights'), r.nights) : '') + '</span>' +
        '<button type="button" class="cal-clear" data-cal-clear>' + esc(t('clear')) + '</button>' +
        '<button type="button" class="btn btn-small btn-primary" data-cal-done>' + esc(t('done')) + '</button></div>';
    }
    function open(which) {
      var el = document.getElementById('cal');
      picking = which === 'd' && form.a ? 'd' : 'a';
      var base = parseDate(picking === 'd' ? (form.d || form.a) : form.a) || today();
      month = new Date(base.getFullYear(), base.getMonth(), 1);
      el.hidden = false; openEl = el;
      document.querySelectorAll('.date-btn').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); b.classList.toggle('is-active', b.getAttribute('data-cal') === picking); });
      draw();
      requestAnimationFrame(function () {
        el.classList.add('open');
        var f = el.querySelector('.is-start, .is-today, .cal-day:not([disabled])'); if (f) f.focus({ preventScroll: true });
        el.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
      });
    }
    function close() {
      if (!openEl) return;
      var el = openEl; openEl = null;
      el.classList.remove('open');
      document.querySelectorAll('.date-btn').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); b.classList.remove('is-active'); });
      setTimeout(function () { if (!openEl) el.hidden = true; }, reduced ? 0 : 180);
    }
    function pick(v) {
      var day = parseDate(v), a = parseDate(form.a);
      if (picking === 'a' || !a || day <= a) {
        setDates(v, '');
        picking = 'd';
      } else {
        setDates(form.a, v);
        draw();
        setTimeout(close, reduced ? 0 : 260);
        return;
      }
      document.querySelectorAll('.date-btn').forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-cal') === picking); });
      draw();
      var nb = document.querySelector('#cal .cal-day:not([disabled]):not(.is-start)');
      if (nb) nb.focus({ preventScroll: true });
    }
    document.addEventListener('click', function (e) {
      var db = e.target.closest('.date-btn');
      if (db) { e.preventDefault(); if (openEl && db.classList.contains('is-active')) close(); else open(db.getAttribute('data-cal')); return; }
      if (!openEl) return;
      var day = e.target.closest('.cal-day');
      if (day && !day.disabled) { pick(day.getAttribute('data-day')); return; }
      var nav = e.target.closest('[data-cal-nav]');
      if (nav) { month = new Date(month.getFullYear(), month.getMonth() + (+nav.getAttribute('data-cal-nav')), 1); draw(); return; }
      if (e.target.closest('[data-cal-clear]')) { setDates('', ''); picking = 'a'; draw(); return; }
      if (e.target.closest('[data-cal-done]')) { close(); return; }
      if (!e.target.closest('#cal')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!openEl) return;
      if (e.key === 'Escape') { close(); var b = document.querySelector('.date-btn[data-cal="' + picking + '"]'); if (b) b.focus(); return; }
      var f = document.activeElement;
      if (!f || !f.classList.contains('cal-day')) return;
      var step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (!step) return;
      e.preventDefault();
      var all = [].slice.call(openEl.querySelectorAll('.cal-day:not([disabled])')), i = all.indexOf(f);
      var n = all[i + step];
      if (n) n.focus();
    });
    return { open: open, close: close };
  })();

  /* ---------------- padajući meniji ---------------- */
  (function () {
    var openDd = null;
    function close(focusBtn) {
      if (!openDd) return;
      var dd = openDd; openDd = null;
      var list = dd.querySelector('.dd-list'), btn = dd.querySelector('.dd-btn');
      list.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); dd.classList.remove('is-open');
      setTimeout(function () { if (openDd !== dd) list.hidden = true; }, reduced ? 0 : 160);
      if (focusBtn) btn.focus();
    }
    function open(dd) {
      if (openDd && openDd !== dd) close(false);
      openDd = dd;
      var list = dd.querySelector('.dd-list');
      list.hidden = false; dd.classList.add('is-open');
      dd.querySelector('.dd-btn').setAttribute('aria-expanded', 'true');
      requestAnimationFrame(function () {
        list.classList.add('open');
        (list.querySelector('[aria-selected="true"]') || list.querySelector('li')).focus({ preventScroll: true });
        list.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
      });
    }
    function choose(dd, li) {
      var v = li.getAttribute('data-v');
      dd.setAttribute('data-value', v);
      dd.querySelector('.dd-val').textContent = li.textContent;
      dd.querySelectorAll('li').forEach(function (x) { x.setAttribute('aria-selected', String(x === li)); });
      if (dd.id === 'dd-g') { form.g = +v; updateCalc(true); }
      if (dd.id === 'dd-r') form.room = v;
      close(true);
    }
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.dd-btn');
      if (btn) { var dd = btn.closest('.dd'); if (openDd === dd) close(false); else open(dd); return; }
      var li = e.target.closest('.dd-list li');
      if (li) { choose(li.closest('.dd'), li); return; }
      if (openDd && !e.target.closest('.dd')) close(false);
    });
    document.addEventListener('keydown', function (e) {
      var btn = e.target.closest && e.target.closest('.dd-btn');
      if (btn && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); open(btn.closest('.dd')); return; }
      if (!openDd) return;
      var items = [].slice.call(openDd.querySelectorAll('li')), i = items.indexOf(document.activeElement);
      if (e.key === 'Escape' || e.key === 'Tab') { if (e.key === 'Escape') e.preventDefault(); close(e.key === 'Escape'); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); (items[i + 1] || items[0]).focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); (items[i - 1] || items[items.length - 1]).focus(); }
      else if ((e.key === 'Enter' || e.key === ' ') && i !== -1) { e.preventDefault(); choose(openDd, items[i]); }
    });
  })();

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
    var els = document.querySelectorAll('.reveal, .sec-head, .ribbon');
    if (reduced || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    if (io) io.disconnect();
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); countUp(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
    /* kartica sa činjenicama viri na dnu prvog ekrana: prikaži je odmah */
    setTimeout(function () { document.querySelectorAll('.fact.reveal:not(.in)').forEach(function (e) { e.classList.add('in'); countUp(e); io.unobserve(e); }); }, 700);
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
    var y = window.scrollY, wasOpen = Guide.isOpen();
    if (wasOpen) Guide.close(true);
    render();
    if (wasOpen) Guide.open(true);
    document.querySelectorAll('.reveal').forEach(function (e) { e.classList.add('in'); });
    window.scrollTo(0, y);
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-season]');
    if (b) { setSeason(b.getAttribute('data-season')); return; }
    var lgb = e.target.closest('button[data-lang]');
    if (lgb) { setLang(lgb.getAttribute('data-lang')); return; }
    var rb = e.target.closest('[data-room]');
    if (rb) {
      form.room = rb.getAttribute('data-room');
      var ddr = document.getElementById('dd-r'), opt = ddr && ddr.querySelector('li[data-v="' + form.room + '"]');
      if (opt) { ddr.setAttribute('data-value', form.room); ddr.querySelector('.dd-val').textContent = opt.textContent; ddr.querySelectorAll('li').forEach(function (x) { x.setAttribute('aria-selected', String(x === opt)); }); }
    }
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
  var ticking = false, sEls = {};
  function scrollEls() { sEls = { prog: document.getElementById('to-top-prog'), art: document.querySelector('.hero-art'), hin: document.querySelector('.hero-in'), bar: document.getElementById('topbar') }; }
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY;
      root.classList.toggle('scrolled', y > 40);
      root.classList.toggle('past-hero', y > window.innerHeight * 0.6);
      root.classList.toggle('show-top', y > window.innerHeight * 1.2);
      if (!sEls.prog || !document.contains(sEls.prog)) scrollEls();
      var prog = sEls.prog;
      if (prog) { var max = document.documentElement.scrollHeight - window.innerHeight; prog.style.strokeDashoffset = String(138.2 * (1 - Math.min(1, y / Math.max(1, max)))); }
      var max2 = document.documentElement.scrollHeight - window.innerHeight;
      if (sEls.bar) sEls.bar.style.setProperty('--progress', String(Math.min(1, y / Math.max(1, max2))));
      var art = sEls.art, hin = sEls.hin;
      if (!reduced && y < window.innerHeight) {
        if (art) art.style.transform = 'translateY(' + (y * 0.25) + 'px) scale(1.04)';
        if (hin) { hin.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.75))); hin.style.transform = 'translateY(' + (y * -0.12) + 'px)'; }
      }
    });
  }, { passive: true });

  /* povratak na vrh: glatko, i fokus na početak stranice (pristupačnost) */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('.to-top');
    if (!a) return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    var brand = document.querySelector('.brand');
    if (brand) setTimeout(function () { brand.focus({ preventScroll: true }); }, reduced ? 0 : 600);
  });

  render();
})();
