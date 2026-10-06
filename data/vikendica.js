/*
 * Planinka - SVI podaci o vikendici na jednom mjestu (bosanski, engleski i njemački).
 *
 * Za novog klijenta mijenjaš samo ovaj fajl (i slike u assets/img/, ako ih ima).
 * Svaki tekst je { bs: '...', en: '...', de: '...' }. Ako 'de' fali, njemačka verzija pokaže engleski tekst. Cijene su u KM.
 * Detalji su u README.md, "Novi klijent, korak po korak".
 */
window.VIKENDICA = {
  /* --- osnovno --- */
  name: 'Planinka',
  kind: { bs: 'Vikendica', en: 'Chalet', de: 'Ferienhaus' },
  place: 'Vlašić',
  title: { bs: 'Vikendica Planinka · Vlašić', en: 'Planinka Chalet · Vlašić', de: 'Ferienhaus Planinka · Vlašić' },
  tagline: {
    bs: 'Mir, kamin i pogled na planinu, 5 minuta od staze.',
    en: 'Peace, a fireplace and mountain views, 5 minutes from the slopes.', de: 'Ruhe, Kamin und Bergblick, 5 Minuten von der Piste.'
  },
  /* jezici stranice (prvi je zadani): 'bs', 'en', 'de' */
  languages: ['bs', 'en', 'de'],
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
    { icon: 'guests', value: '8', label: { bs: 'osoba', en: 'guests', de: 'Gäste' } },
    { icon: 'bed', value: '3', label: { bs: 'spavaće sobe', en: 'bedrooms', de: 'Schlafzimmer' } },
    { icon: 'bath', value: '2', label: { bs: 'kupatila', en: 'bathrooms', de: 'Badezimmer' } },
    { icon: 'fire', label: { bs: 'kamin', en: 'fireplace', de: 'Kamin' } },
    { icon: 'sauna', label: { bs: 'sauna', en: 'sauna', de: 'Sauna' } },
    { icon: 'parking', label: { bs: 'parking', en: 'parking', de: 'Parkplatz' } },
    { icon: 'wifi', label: { bs: 'brzi WiFi', en: 'fast WiFi', de: 'schnelles WLAN' } },
    { icon: 'paw', label: { bs: 'ljubimci dozvoljeni', en: 'pets welcome', de: 'Haustiere willkommen' } }
  ],

  /* --- galerija: scene su ilustracije iz js/scenes.js, ili prava slika: { image: 'assets/img/x.webp' } --- */
  gallery: [
    { scene: 'exterior', label: { bs: 'Vikendica', en: 'The chalet', de: 'Das Ferienhaus' } },
    { scene: 'living', label: { bs: 'Dnevni boravak sa kaminom', en: 'Living room with fireplace', de: 'Wohnzimmer mit Kamin' } },
    { scene: 'bedroom', label: { bs: 'Spavaća soba', en: 'Bedroom', de: 'Schlafzimmer' } },
    { scene: 'kitchen', label: { bs: 'Kuhinja i trpezarija', en: 'Kitchen and dining', de: 'Küche und Essbereich' } },
    { scene: 'sauna', label: { bs: 'Sauna', en: 'Sauna', de: 'Sauna' } },
    { scene: 'bathroom', label: { bs: 'Kupatilo', en: 'Bathroom', de: 'Badezimmer' } },
    { scene: 'view', label: { bs: 'Pogled sa terase', en: 'View from the terrace', de: 'Blick von der Terrasse' } }
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
    ],
    de: [
      'Planinka ist ein Holzhaus am Waldrand, ruhig und gemütlich, gemacht für Tage, an denen man einfach langsamer werden möchte. Morgens Kaffee auf der Terrasse mit Blick auf die Gipfel, abends Kaminfeuer und gute Gespräche.',
      'Die Piste ist fünf Minuten entfernt und Babanovac liegt gleich hinter der Kurve. Trotzdem ist es bei uns still: kein Gedränge, kein Lärm, nur Tannen, Schnee oder Wiesen, je nachdem, wann Sie kommen.',
      'Drei Schlafzimmer, zwei Badezimmer und eine Sauna machen es ideal für eine Familie oder eine Gruppe von bis zu acht Personen.'
    ]
  },

  /* --- sadržaji --- */
  amenities: [
    { icon: 'kitchen', label: { bs: 'Opremljena kuhinja', en: 'Fully equipped kitchen', de: 'Voll ausgestattete Küche' } },
    { icon: 'linen', label: { bs: 'Posteljina i peškiri', en: 'Bed linen and towels', de: 'Bettwäsche und Handtücher' } },
    { icon: 'fire', label: { bs: 'Kamin (drva uključena)', en: 'Fireplace (firewood included)', de: 'Kamin (Brennholz inklusive)' } },
    { icon: 'sauna', label: { bs: 'Finska sauna', en: 'Finnish sauna', de: 'Finnische Sauna' } },
    { icon: 'grill', label: { bs: 'Roštilj na terasi', en: 'Terrace barbecue', de: 'Grill auf der Terrasse' } },
    { icon: 'tv', label: { bs: 'Smart TV', en: 'Smart TV', de: 'Smart-TV' } },
    { icon: 'wifi', label: { bs: 'Brzi WiFi', en: 'Fast WiFi', de: 'Schnelles WLAN' } },
    { icon: 'washer', label: { bs: 'Mašina za veš', en: 'Washing machine', de: 'Waschmaschine' } },
    { icon: 'heat', label: { bs: 'Centralno grijanje', en: 'Central heating', de: 'Zentralheizung' } },
    { icon: 'ski', label: { bs: 'Ostava za skije', en: 'Ski storage', de: 'Skiraum' } },
    { icon: 'parking', label: { bs: 'Parking za 3 auta', en: 'Parking for 3 cars', de: 'Parkplatz für 3 Autos' } },
    { icon: 'coffee', label: { bs: 'Aparat za kafu', en: 'Coffee machine', de: 'Kaffeemaschine' } }
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
      en: ['Bed linen and towels', 'Firewood', 'Sauna', 'Parking and WiFi', 'Final cleaning'],
      de: ['Bettwäsche und Handtücher', 'Brennholz', 'Sauna', 'Parkplatz und WLAN', 'Endreinigung']
    },
    note: {
      bs: 'Kapara 30% potvrđuje rezervaciju. Boravišna taksa nije uključena.',
      en: 'A 30% deposit confirms the booking. Tourist tax is not included.', de: 'Eine Anzahlung von 30 % bestätigt die Buchung. Die Kurtaxe ist nicht inbegriffen.'
    }
  },

  /* --- lokacija: udaljenosti (putokazi) --- */
  distances: [
    { icon: 'ski', place: { bs: 'Ski staza', en: 'Ski slope', de: 'Skipiste' }, time: { bs: '5 min', en: '5 min', de: '5 Min.' } },
    { icon: 'pin', place: { bs: 'Babanovac', en: 'Babanovac', de: 'Babanovac' }, time: { bs: '3 min', en: '3 min', de: '3 Min.' } },
    { icon: 'car', place: { bs: 'Travnik', en: 'Travnik', de: 'Travnik' }, time: { bs: '30 min', en: '30 min', de: '30 Min.' } },
    { icon: 'car', place: { bs: 'Sarajevo', en: 'Sarajevo', de: 'Sarajevo' }, time: { bs: '1,5 h', en: '1.5 h', de: '1,5 Std.' } },
    { icon: 'car', place: { bs: 'Banja Luka', en: 'Banja Luka', de: 'Banja Luka' }, time: { bs: '1,5 h', en: '1.5 h', de: '1,5 Std.' } }
  ],
  mapQuery: 'Babanovac, Vlašić',

  /* --- šta raditi --- */
  activities: {
    winter: [
      { icon: 'ski', title: { bs: 'Skijanje', en: 'Skiing', de: 'Skifahren' }, text: { bs: 'Staze za početnike i iskusne, ski škola i iznajmljivanje opreme na Babanovcu.', en: 'Slopes for beginners and experts, ski school and gear rental at Babanovac.', de: 'Pisten für Anfänger und Fortgeschrittene, Skischule und Ausrüstungsverleih in Babanovac.' } },
      { icon: 'sled', title: { bs: 'Sanjkanje', en: 'Sledding', de: 'Rodeln' }, text: { bs: 'Blagi brežuljci odmah iza vikendice, idealni za djecu.', en: 'Gentle hills right behind the chalet, perfect for kids.', de: 'Sanfte Hügel direkt hinter dem Haus, ideal für Kinder.' } },
      { icon: 'snowshoe', title: { bs: 'Krpljanje', en: 'Snowshoeing', de: 'Schneeschuhwandern' }, text: { bs: 'Tihe staze kroz zasniježenu šumu do vidikovca.', en: 'Quiet trails through the snowy forest to the viewpoint.', de: 'Ruhige Wege durch den verschneiten Wald bis zum Aussichtspunkt.' } }
    ],
    summer: [
      { icon: 'hike', title: { bs: 'Šetnje i planinarenje', en: 'Walks and hiking', de: 'Spaziergänge und Wandern' }, text: { bs: 'Markirane staze kroz livade i borove šume.', en: 'Marked trails through meadows and pine forests.', de: 'Markierte Wege über Wiesen und durch Kiefernwälder.' } },
      { icon: 'view', title: { bs: 'Vidikovci', en: 'Viewpoints', de: 'Aussichtspunkte' }, text: { bs: 'Zalazak sunca sa Paljenika, pogled do Travnika.', en: 'Sunset from Paljenik, with views all the way to Travnik.', de: 'Sonnenuntergang vom Paljenik, mit Blick bis nach Travnik.' } },
      { icon: 'bike', title: { bs: 'Bicikl', en: 'Cycling', de: 'Radfahren' }, text: { bs: 'Planinski putevi za lagane i zahtjevne ture.', en: 'Mountain roads for easy and challenging rides.', de: 'Bergstraßen für leichte und anspruchsvolle Touren.' } }
    ],
    food: {
      title: { bs: 'Vlašićki sir i domaća kuhinja', en: 'Vlašić cheese and home cooking', de: 'Vlašić-Käse und Hausmannskost' },
      text: {
        bs: 'Probajte čuveni vlašićki (travnički) sir, domaći kajmak i pitu. Rado ćemo vam preporučiti najbolje restorane u blizini.',
        en: 'Try the famous Vlašić (Travnik) cheese, homemade kajmak and pies. We are happy to recommend the best restaurants nearby.', de: 'Probieren Sie den berühmten Vlašić-Käse (Travniker Käse), hausgemachten Kajmak und Pita. Gerne empfehlen wir Ihnen die besten Restaurants in der Nähe.'
      }
    }
  },

  /* --- utisci (u demu izmišljeni) --- */
  /* vrijeme uživo (open-meteo.com), koordinate Babanovca */
  weather: { lat: 44.29, lon: 17.65, title: { bs: 'Trenutno na Vlašiću', en: 'Right now on Vlašić', de: 'Aktuell auf dem Vlašić' } },

  breakfast: {
    text: { bs: 'Na upit pripremamo domaći doručak koji vas čeka na stolu kad se probudite. Sve sa okolnih farmi, uz pogled na planinu.', en: 'On request we prepare a homemade breakfast, ready on the table when you wake up. Everything from local farms, with a mountain view.', de: 'Auf Wunsch bereiten wir ein hausgemachtes Frühstück zu, das beim Aufwachen schon auf dem Tisch steht. Alles von Bauernhöfen aus der Umgebung, mit Bergblick.' },
    items: [
      { bs: 'Vlašićki sir i kajmak', en: 'Vlašić cheese and kajmak', de: 'Vlašić-Käse und Kajmak' },
      { bs: 'Domaća jaja i suhomesnato', en: 'Farm eggs and cured meats', de: 'Eier vom Hof und Räucherfleisch' },
      { bs: 'Topao hljeb, džem i med', en: 'Warm bread, jam and honey', de: 'Warmes Brot, Marmelade und Honig' },
      { bs: 'Kafa, čaj i svježi sok', en: 'Coffee, tea and fresh juice', de: 'Kaffee, Tee und frischer Saft' }
    ],
    time: { bs: 'Doplata 10 KM po osobi', en: 'Extra 10 KM per person', de: 'Aufpreis 10 KM pro Person' }
  },

  directions: {
    destination: 'Babanovac, Vlašić',
    steps: [
      { icon: 'car', text: { bs: 'Iz Travnika: put prema Turbetu, pa skretanje za Vlašić. Oko 30 minuta do Babanovca.', en: 'From Travnik: head to Turbe, then turn off for Vlašić. About 30 minutes to Babanovac.', de: 'Von Travnik: Richtung Turbe, dann Abzweigung nach Vlašić. Etwa 30 Minuten bis Babanovac.' } },
      { icon: 'road', text: { bs: 'Iz Sarajeva oko 1,5 do 2 sata, iz Banje Luke oko 2 sata vožnje.', en: 'About 1.5 to 2 hours from Sarajevo and about 2 hours from Banja Luka.', de: 'Etwa 1,5 bis 2 Stunden von Sarajevo und etwa 2 Stunden von Banja Luka.' } },
      { icon: 'parking', text: { bs: 'Parking za dva auta je u dvorištu vikendice.', en: 'Parking for two cars in the chalet yard.', de: 'Parkplatz für zwei Autos im Hof des Hauses.' } }
    ],
    tip: { bs: 'Zimi obavezno zimske gume, a lanci u autu dobro dođu. Javite nam se prije polaska ako niste sigurni za stanje puta.', en: 'In winter, winter tyres are a must and snow chains are handy. Call us before you set off if you are unsure about the roads.', de: 'Im Winter sind Winterreifen Pflicht und Schneeketten nützlich. Rufen Sie uns vor der Abfahrt an, wenn Sie sich bei den Straßenverhältnissen unsicher sind.' }
  },

  reviews: [
    { name: 'Amra i Kenan', from: { bs: 'Sarajevo', en: 'Sarajevo', de: 'Sarajevo' }, rating: 5, text: { bs: 'Vikendica je još ljepša nego na slikama. Kamin, sauna i tišina, baš ono što nam je trebalo.', en: 'Even more beautiful than in the photos. Fireplace, sauna and silence, exactly what we needed.', de: 'Noch schöner als auf den Fotos. Kamin, Sauna und Stille, genau das, was wir gebraucht haben.' } },
    { name: 'Marko', from: { bs: 'Zagreb', en: 'Zagreb', de: 'Zagreb' }, rating: 5, text: { bs: 'Pet minuta do staze, a kao da ste sami na planini. Domaćini fantastični.', en: 'Five minutes to the slopes, yet it feels like you have the mountain to yourself. Fantastic hosts.', de: 'Fünf Minuten zur Piste und trotzdem fühlt man sich, als hätte man den Berg für sich allein. Fantastische Gastgeber.' } },
    { name: 'Lejla', from: { bs: 'Beč', en: 'Vienna', de: 'Wien' }, rating: 5, text: { bs: 'Djeca su se sanjkala cijeli dan, mi smo uživali na terasi. Vraćamo se sigurno!', en: 'The kids sledded all day while we relaxed on the terrace. We will definitely be back!', de: 'Die Kinder sind den ganzen Tag gerodelt, während wir uns auf der Terrasse entspannt haben. Wir kommen bestimmt wieder!' } },
    { name: 'Daniel & Sophie', from: { bs: 'Njemačka', en: 'Germany', de: 'Deutschland' }, rating: 4, text: { bs: 'Prelijep ljetni boravak, livade i šetnje. Sve čisto i toplo opremljeno.', en: 'A lovely summer stay, meadows and walks. Everything clean and warmly furnished.', de: 'Ein wunderschöner Sommeraufenthalt, Wiesen und Spaziergänge. Alles sauber und gemütlich eingerichtet.' } }
  ],

  /* --- kućni red i pitanja --- */
  faq: [
    { q: { bs: 'Kada je check-in i check-out?', en: 'When are check-in and check-out?', de: 'Wann sind Check-in und Check-out?' }, a: { bs: 'Check-in od 14:00, check-out do 11:00. Ako vam treba drugačije, javite se, rado ćemo izaći u susret.', en: 'Check-in from 2 pm, check-out by 11 am. If you need different times, let us know and we will do our best.', de: 'Check-in ab 14 Uhr, Check-out bis 11 Uhr. Wenn Sie andere Zeiten brauchen, sagen Sie uns Bescheid, wir tun unser Bestes.' } },
    { q: { bs: 'Kako funkcioniše kapara i otkazivanje?', en: 'How do the deposit and cancellation work?', de: 'Wie funktionieren Anzahlung und Stornierung?' }, a: { bs: 'Kapara od 30% potvrđuje rezervaciju. Otkazivanje do 14 dana prije dolaska: kapara se vraća u cijelosti.', en: 'A 30% deposit confirms your booking. Cancel up to 14 days before arrival for a full refund of the deposit.', de: 'Eine Anzahlung von 30 % bestätigt Ihre Buchung. Bei Stornierung bis 14 Tage vor Anreise erhalten Sie die Anzahlung vollständig zurück.' } },
    { q: { bs: 'Da li su kućni ljubimci dozvoljeni?', en: 'Are pets allowed?', de: 'Sind Haustiere erlaubt?' }, a: { bs: 'Da, dobro odgojeni ljubimci su dobrodošli, uz najavu.', en: 'Yes, well-behaved pets are welcome, just let us know in advance.', de: 'Ja, brave Haustiere sind willkommen, sagen Sie uns einfach vorher Bescheid.' } },
    { q: { bs: 'Da li je dozvoljeno pušenje?', en: 'Is smoking allowed?', de: 'Darf man rauchen?' }, a: { bs: 'Pušenje je dozvoljeno samo na terasi.', en: 'Smoking is allowed on the terrace only.', de: 'Rauchen ist nur auf der Terrasse erlaubt.' } },
    { q: { bs: 'Ima li parkinga i da li je put očišćen zimi?', en: 'Is there parking, and is the road cleared in winter?', de: 'Gibt es Parkplätze und wird die Straße im Winter geräumt?' }, a: { bs: 'Parking je za 3 auta, odmah ispred vikendice. Put se redovno čisti, ali zimi preporučujemo zimske gume i lance u autu.', en: 'Parking for 3 cars right in front of the chalet. The road is cleared regularly, but in winter we recommend winter tyres and chains.', de: 'Parkplatz für 3 Autos direkt vor dem Haus. Die Straße wird regelmäßig geräumt, im Winter empfehlen wir trotzdem Winterreifen und Ketten.' } }
  ]
};
