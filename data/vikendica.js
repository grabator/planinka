/*
 * Planinka - SVI podaci o vikendici na jednom mjestu (bosanski i engleski).
 *
 * Za novog klijenta mijenjaš samo ovaj fajl (i slike u assets/img/, ako ih ima).
 * Svaki tekst je { bs: '...', en: '...' }. Cijene su u KM.
 * Detalji su u README.md, "Novi klijent, korak po korak".
 */
window.VIKENDICA = {
  /* --- osnovno --- */
  name: 'Planinka',
  kind: { bs: 'Vikendica', en: 'Chalet' },
  place: 'Vlašić',
  title: { bs: 'Vikendica Planinka · Vlašić', en: 'Planinka Chalet · Vlašić' },
  tagline: {
    bs: 'Mir, kamin i pogled na planinu, 5 minuta od staze.',
    en: 'Peace, a fireplace and mountain views, 5 minutes from the slopes.'
  },
  /* početna sezona: 'auto' (po mjesecu), 'winter' ili 'summer' */
  defaultSeason: 'auto',
  /* demo: prikazuje traku "Demo stranica" i noindex (vidi README) */
  demo: true,
  /* potpis u footeru (npr. { name: 'Tvoje ime', url: 'https://...' }), null = bez potpisa */
  credit: null,
  /* prava slika za prvi ekran (npr. 'assets/img/vikendica.webp'); null = ilustracija */
  heroImage: null,

  /* --- kontakt (izmišljeni podaci za demo) --- */
  contact: {
    phone: '+387 60 000 0000',
    viber: '+387600000000',
    whatsapp: '387600000000',
    email: 'info@planinka.ba',
    instagram: 'planinka.vlasic'
  },

  /* --- brze činjenice (ikonica: guests, bed, bath, fire, sauna, parking, wifi, paw) --- */
  facts: [
    { icon: 'guests', value: '8', label: { bs: 'do 8 osoba', en: 'up to 8 guests' } },
    { icon: 'bed', value: '3', label: { bs: 'spavaće sobe', en: 'bedrooms' } },
    { icon: 'bath', value: '2', label: { bs: 'kupatila', en: 'bathrooms' } },
    { icon: 'fire', label: { bs: 'kamin', en: 'fireplace' } },
    { icon: 'sauna', label: { bs: 'sauna', en: 'sauna' } },
    { icon: 'parking', label: { bs: 'parking', en: 'parking' } },
    { icon: 'wifi', label: { bs: 'brzi WiFi', en: 'fast WiFi' } },
    { icon: 'paw', label: { bs: 'ljubimci dozvoljeni', en: 'pets welcome' } }
  ],

  /* --- galerija: scene su ilustracije iz js/scenes.js, ili prava slika: { image: 'assets/img/x.webp' } --- */
  gallery: [
    { scene: 'exterior', label: { bs: 'Vikendica', en: 'The chalet' } },
    { scene: 'living', label: { bs: 'Dnevni boravak sa kaminom', en: 'Living room with fireplace' } },
    { scene: 'bedroom', label: { bs: 'Spavaća soba', en: 'Bedroom' } },
    { scene: 'kitchen', label: { bs: 'Kuhinja i trpezarija', en: 'Kitchen and dining' } },
    { scene: 'sauna', label: { bs: 'Sauna', en: 'Sauna' } },
    { scene: 'bathroom', label: { bs: 'Kupatilo', en: 'Bathroom' } },
    { scene: 'view', label: { bs: 'Pogled sa terase', en: 'View from the terrace' } }
  ],

  /* --- o vikendici --- */
  about: {
    bs: [
      'Planinka je drvena vikendica na rubu šume, mirna i topla, napravljena za dane kada samo želiš usporiti. Ujutro kafa na terasi uz pogled na vrhove, navečer kamin i dobra priča.',
      'Do staze se stiže za pet minuta, a Babanovac je odmah iza krivine. Ipak, kod nas je tiho: bez gužve, bez buke, samo jelke, snijeg ili livada, zavisno kad dođete.',
      'Tri spavaće sobe, dva kupatila i sauna čine je idealnom za porodicu ili društvo do osam osoba.'
    ],
    en: [
      'Planinka is a wooden chalet at the edge of the forest, quiet and warm, made for days when you just want to slow down. Morning coffee on the terrace with a view of the peaks, evenings by the fireplace.',
      'The slopes are five minutes away and Babanovac is just around the bend. Yet it is quiet here: no crowds, no noise, just pine trees, snow or meadows, depending on when you come.',
      'Three bedrooms, two bathrooms and a sauna make it perfect for a family or a group of up to eight.'
    ]
  },

  /* --- sadržaji --- */
  amenities: [
    { icon: 'kitchen', label: { bs: 'Opremljena kuhinja', en: 'Fully equipped kitchen' } },
    { icon: 'linen', label: { bs: 'Posteljina i peškiri', en: 'Bed linen and towels' } },
    { icon: 'fire', label: { bs: 'Kamin (drva uključena)', en: 'Fireplace (firewood included)' } },
    { icon: 'sauna', label: { bs: 'Finska sauna', en: 'Finnish sauna' } },
    { icon: 'grill', label: { bs: 'Roštilj na terasi', en: 'Terrace barbecue' } },
    { icon: 'tv', label: { bs: 'Smart TV', en: 'Smart TV' } },
    { icon: 'wifi', label: { bs: 'Brzi WiFi', en: 'Fast WiFi' } },
    { icon: 'washer', label: { bs: 'Mašina za veš', en: 'Washing machine' } },
    { icon: 'heat', label: { bs: 'Centralno grijanje', en: 'Central heating' } },
    { icon: 'ski', label: { bs: 'Ostava za skije', en: 'Ski storage' } },
    { icon: 'parking', label: { bs: 'Parking za 3 auta', en: 'Parking for 3 cars' } },
    { icon: 'coffee', label: { bs: 'Aparat za kafu', en: 'Coffee machine' } }
  ],

  /* --- cijene ---
   * winterMonths: mjeseci zimske sezone (1 = januar). Cijena se računa za svaku noć posebno.
   * baseGuests: koliko osoba je uključeno u cijenu; extraGuest: doplata po osobi po noći preko toga.
   */
  pricing: {
    currency: 'KM',
    winter: 160,
    summer: 120,
    winterMonths: [12, 1, 2, 3],
    baseGuests: 6,
    extraGuest: 15,
    maxGuests: 8,
    minNights: 2,
    depositPercent: 30,
    included: {
      bs: ['Posteljina i peškiri', 'Drva za kamin', 'Sauna', 'Parking i WiFi', 'Završno čišćenje'],
      en: ['Bed linen and towels', 'Firewood', 'Sauna', 'Parking and WiFi', 'Final cleaning']
    },
    note: {
      bs: 'Kapara 30% potvrđuje rezervaciju. Boravišna taksa nije uključena.',
      en: 'A 30% deposit confirms the booking. Tourist tax is not included.'
    }
  },

  /* --- lokacija: udaljenosti (putokazi) --- */
  distances: [
    { icon: 'ski', place: { bs: 'Ski staza', en: 'Ski slope' }, time: { bs: '5 min', en: '5 min' } },
    { icon: 'pin', place: { bs: 'Babanovac', en: 'Babanovac' }, time: { bs: '3 min', en: '3 min' } },
    { icon: 'car', place: { bs: 'Travnik', en: 'Travnik' }, time: { bs: '30 min', en: '30 min' } },
    { icon: 'car', place: { bs: 'Sarajevo', en: 'Sarajevo' }, time: { bs: '1,5 h', en: '1.5 h' } },
    { icon: 'car', place: { bs: 'Banja Luka', en: 'Banja Luka' }, time: { bs: '1,5 h', en: '1.5 h' } }
  ],
  mapQuery: 'Babanovac, Vlašić',

  /* --- šta raditi --- */
  activities: {
    winter: [
      { icon: 'ski', title: { bs: 'Skijanje', en: 'Skiing' }, text: { bs: 'Staze za početnike i iskusne, ski škola i iznajmljivanje opreme na Babanovcu.', en: 'Slopes for beginners and experts, ski school and gear rental at Babanovac.' } },
      { icon: 'sled', title: { bs: 'Sanjkanje', en: 'Sledding' }, text: { bs: 'Blagi brežuljci odmah iza vikendice, idealni za djecu.', en: 'Gentle hills right behind the chalet, perfect for kids.' } },
      { icon: 'snowshoe', title: { bs: 'Krpljanje', en: 'Snowshoeing' }, text: { bs: 'Tihe staze kroz zasniježenu šumu do vidikovca.', en: 'Quiet trails through the snowy forest to the viewpoint.' } }
    ],
    summer: [
      { icon: 'hike', title: { bs: 'Šetnje i planinarenje', en: 'Walks and hiking' }, text: { bs: 'Markirane staze kroz livade i borove šume.', en: 'Marked trails through meadows and pine forests.' } },
      { icon: 'view', title: { bs: 'Vidikovci', en: 'Viewpoints' }, text: { bs: 'Zalazak sunca sa Paljenika, pogled do Travnika.', en: 'Sunset from Paljenik, with views all the way to Travnik.' } },
      { icon: 'bike', title: { bs: 'Bicikl', en: 'Cycling' }, text: { bs: 'Planinski putevi za lagane i zahtjevne ture.', en: 'Mountain roads for easy and challenging rides.' } }
    ],
    food: {
      title: { bs: 'Vlašićki sir i domaća kuhinja', en: 'Vlašić cheese and home cooking' },
      text: {
        bs: 'Probajte čuveni vlašićki (travnički) sir, domaći kajmak i pitu. Rado ćemo vam preporučiti najbolje restorane u blizini.',
        en: 'Try the famous Vlašić (Travnik) cheese, homemade kajmak and pies. We are happy to recommend the best restaurants nearby.'
      }
    }
  },

  /* --- utisci (u demu izmišljeni) --- */
  /* vrijeme uživo (open-meteo.com), koordinate Babanovca */
  weather: { lat: 44.29, lon: 17.65, title: { bs: 'Trenutno na Vlašiću', en: 'Right now on Vlašić' } },

  breakfast: {
    text: { bs: 'Na upit pripremamo domaći doručak koji vas čeka na stolu kad se probudite. Sve sa okolnih farmi, uz pogled na planinu.', en: 'On request we prepare a homemade breakfast, ready on the table when you wake up. Everything from local farms, with a mountain view.' },
    items: [
      { bs: 'Vlašićki sir i kajmak', en: 'Vlašić cheese and kajmak' },
      { bs: 'Domaća jaja i suhomesnato', en: 'Farm eggs and cured meats' },
      { bs: 'Topao hljeb, džem i med', en: 'Warm bread, jam and honey' },
      { bs: 'Kafa, čaj i svježi sok', en: 'Coffee, tea and fresh juice' }
    ],
    time: { bs: 'Doplata 10 KM po osobi', en: 'Extra 10 KM per person' }
  },

  directions: {
    destination: 'Babanovac, Vlašić',
    steps: [
      { icon: 'car', text: { bs: 'Iz Travnika: put prema Turbetu, pa skretanje za Vlašić. Oko 30 minuta do Babanovca.', en: 'From Travnik: head to Turbe, then turn off for Vlašić. About 30 minutes to Babanovac.' } },
      { icon: 'road', text: { bs: 'Iz Sarajeva oko 1,5 do 2 sata, iz Banje Luke oko 2 sata vožnje.', en: 'About 1.5 to 2 hours from Sarajevo and about 2 hours from Banja Luka.' } },
      { icon: 'parking', text: { bs: 'Parking za dva auta je u dvorištu vikendice.', en: 'Parking for two cars in the chalet yard.' } }
    ],
    tip: { bs: 'Zimi obavezno zimske gume, a lanci u autu dobro dođu. Javite nam se prije polaska ako niste sigurni za stanje puta.', en: 'In winter, winter tyres are a must and snow chains are handy. Call us before you set off if you are unsure about the roads.' }
  },

  reviews: [
    { name: 'Amra i Kenan', from: { bs: 'Sarajevo', en: 'Sarajevo' }, rating: 5, text: { bs: 'Vikendica je još ljepša nego na slikama. Kamin, sauna i tišina, baš ono što nam je trebalo.', en: 'Even more beautiful than in the photos. Fireplace, sauna and silence, exactly what we needed.' } },
    { name: 'Marko', from: { bs: 'Zagreb', en: 'Zagreb' }, rating: 5, text: { bs: 'Pet minuta do staze, a kao da ste sami na planini. Domaćini fantastični.', en: 'Five minutes to the slopes, yet it feels like you have the mountain to yourself. Fantastic hosts.' } },
    { name: 'Lejla', from: { bs: 'Beč', en: 'Vienna' }, rating: 5, text: { bs: 'Djeca su se sanjkala cijeli dan, mi smo uživali na terasi. Vraćamo se sigurno!', en: 'The kids sledded all day while we relaxed on the terrace. We will definitely be back!' } },
    { name: 'Daniel & Sophie', from: { bs: 'Njemačka', en: 'Germany' }, rating: 4, text: { bs: 'Prelijep ljetni boravak, livade i šetnje. Sve čisto i toplo opremljeno.', en: 'A lovely summer stay, meadows and walks. Everything clean and warmly furnished.' } }
  ],

  /* --- kućni red i pitanja --- */
  faq: [
    { q: { bs: 'Kada je check-in i check-out?', en: 'When are check-in and check-out?' }, a: { bs: 'Check-in od 14:00, check-out do 11:00. Ako vam treba drugačije, javite se, rado ćemo izaći u susret.', en: 'Check-in from 2 pm, check-out by 11 am. If you need different times, let us know and we will do our best.' } },
    { q: { bs: 'Kako funkcioniše kapara i otkazivanje?', en: 'How do the deposit and cancellation work?' }, a: { bs: 'Kapara od 30% potvrđuje rezervaciju. Otkazivanje do 14 dana prije dolaska: kapara se vraća u cijelosti.', en: 'A 30% deposit confirms your booking. Cancel up to 14 days before arrival for a full refund of the deposit.' } },
    { q: { bs: 'Da li su kućni ljubimci dozvoljeni?', en: 'Are pets allowed?' }, a: { bs: 'Da, dobro odgojeni ljubimci su dobrodošli, uz najavu.', en: 'Yes, well-behaved pets are welcome, just let us know in advance.' } },
    { q: { bs: 'Da li je dozvoljeno pušenje?', en: 'Is smoking allowed?' }, a: { bs: 'Pušenje je dozvoljeno samo na terasi.', en: 'Smoking is allowed on the terrace only.' } },
    { q: { bs: 'Ima li parkinga i da li je put očišćen zimi?', en: 'Is there parking, and is the road cleared in winter?' }, a: { bs: 'Parking je za 3 auta, odmah ispred vikendice. Put se redovno čisti, ali zimi preporučujemo zimske gume i lance u autu.', en: 'Parking for 3 cars right in front of the chalet. The road is cleared regularly, but in winter we recommend winter tyres and chains.' } }
  ]
};
