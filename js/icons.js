/* Planinka - ikonice (linijske, 24x24, boja = currentColor). */
(function () {
  'use strict';
  var P = {
    guests: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16 13.6c2.8.2 5 2.2 5 5"/>',
    bed: '<path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.8"/>',
    bath: '<path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M6 12V6a2 2 0 0 1 3.6-1.2M7 19l-1 2M17 19l1 2"/>',
    fire: '<path d="M12 21c-3.6 0-6-2.4-6-5.6 0-3.4 3-5.4 3.6-9.4 2.6 1.6 3.4 3.8 3.4 5.6 1-.8 1.6-2 1.8-3.2C17 10.6 18 12.8 18 15.4 18 18.6 15.6 21 12 21z"/><path d="M12 21c-1.4 0-2.4-1-2.4-2.4 0-1.5 1.2-2.4 1.6-4 1.2.9 3.2 2.2 3.2 4 0 1.4-1 2.4-2.4 2.4z"/>',
    sauna: '<path d="M4 20h16M6 20v-6h12v6"/><path d="M9 10c-1-1.2 1-2.2 0-3.6M12 10c-1-1.2 1-2.2 0-3.6M15 10c-1-1.2 1-2.2 0-3.6"/>',
    parking: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3"/>',
    wifi: '<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.3a9.5 9.5 0 0 1 13 0M8.6 15.5a5 5 0 0 1 6.8 0"/><circle cx="12" cy="18.6" r="1.2" fill="currentColor"/>',
    paw: '<circle cx="7" cy="9" r="1.8"/><circle cx="11" cy="6" r="1.8"/><circle cx="15.5" cy="7" r="1.8"/><circle cx="18" cy="11" r="1.8"/><path d="M8 17c0-3 2-5.2 4.5-5.2S17 14 17 16.6c0 2-1.6 2.6-3 2.2-1.2-.3-1.8-.3-3 0-1.6.4-3 0-3-1.8z"/>',
    kitchen: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 21V3c-2 1-3 3.5-3 7h3"/>',
    linen: '<path d="M4 7l8-3 8 3v10l-8 3-8-3z"/><path d="M4 7l8 3 8-3M12 10v10"/>',
    grill: '<path d="M4 10h16a8 8 0 0 1-16 0z"/><path d="M8 18l-2 3M16 18l2 3M9 6c0-1 1-1.4 1-2.4M12 6c0-1 1-1.4 1-2.4M15 6c0-1 1-1.4 1-2.4"/>',
    tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
    washer: '<rect x="4" y="3" width="16" height="18" rx="3"/><circle cx="12" cy="13" r="4.5"/><path d="M7 6.5h2"/>',
    heat: '<path d="M6 4c-2 2.5 2 4.5 0 7s2 4.5 0 7M12 4c-2 2.5 2 4.5 0 7s2 4.5 0 7M18 4c-2 2.5 2 4.5 0 7s2 4.5 0 7"/>',
    ski: '<path d="M4 20l16-8M6 4l4 6 4-2 3 4"/><circle cx="15" cy="5" r="1.8"/>',
    coffee: '<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16M8 3c-.8 1 .8 2 0 3M12 3c-.8 1 .8 2 0 3"/>',
    pin: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
    car: '<path d="M4 16v-4l2-5h12l2 5v4"/><path d="M3 12h18v4H3z"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/>',
    sled: '<path d="M3 15h15a3 3 0 0 0 3-3M6 15v-3h10v3M8 12l1-4h4"/>',
    snowshoe: '<ellipse cx="8" cy="12" rx="3.5" ry="7"/><ellipse cx="16" cy="12" rx="3.5" ry="7"/><path d="M5.5 9h5M5.5 15h5M13.5 9h5M13.5 15h5"/>',
    hike: '<circle cx="13" cy="4.5" r="1.8"/><path d="M12 8l-2 6 3 3 1 4M10 14l-3 7M12 8l3 3h3M18 9v12"/>',
    view: '<path d="M2 19l6-9 4 5 3-3 7 7z"/><circle cx="17" cy="6" r="2"/>',
    bike: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-7h6l2 7M10 9l3 7h-7M14 6h3"/>',
    cheese: '<path d="M3 17l9-11 9 7v4z"/><path d="M3 17h18"/><circle cx="9" cy="14" r="1.2"/><circle cx="15" cy="15" r="1"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
    viber: '<path d="M12 3c4.8 0 8 2.4 8 7.4 0 5-3.2 7.2-8 7.2l-3 2.4v-2.7C5.6 16.4 4 14 4 10.4 4 5.4 7.2 3 12 3z"/><path d="M9.5 8.2c.3 2.4 2 4.1 4.3 4.5M12 6.4c1.8.1 3.4 1.6 3.5 3.5M12 8.2c.8.1 1.6.8 1.7 1.7"/>',
    whatsapp: '<path d="M4 20l1.2-4A8 8 0 1 1 8 18.8z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8c-1-.5-2-1.5-2.5-2.5l.8-1-1-2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/>',
    insta: '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r="1" fill="currentColor"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="currentColor" stroke="none"/>',
    snow: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 2 3-2M9 20l3-2 3 2"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    left: '<path d="M15 5l-7 7 7 7"/>',
    right: '<path d="M9 5l7 7-7 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  window.PLANINKA_ICON = function (name, cls) {
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (P[name] || P.pin) + '</svg>';
  };
})();
