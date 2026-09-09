export const APP_VERSION = "2.1.0 Swan";

export const RELEASES = [
  {
    version: "2.1.0 Swan",
    date: "8 september 2026",
    title: "Detaljvyer, platsval och kalenderval",
    changes: ["Zoomning av appgränssnittet är avstängd", "Aktivitetsfilter kan visas och döljas", "Välj en sparad plats när en plan skapas", "Klickbara detaljvyer för evenemang och platser", "Framtida bokningar och historik från plats- och evenemangsvyer", "Utfällbara kalenderaspekter för rutiner och födelsedagar", "Räknare för dagar sedan senaste personinteraktion"],
  },
  {
    version: "2.0.0 Raven",
    date: "8 september 2026",
    title: "Kontaktpåminnelser och redigerbara serier",
    changes: ["Skapa en person direkt när en cirkel redigeras", "Skapa en förifylld plan från personer och cirklar", "Länkar till Facebook, Instagram, LinkedIn och andra profiler", "Kontaktintervall från varje dag till några gånger per år", "Påminnelser för personer och cirklar på Today", "Ändra ett tillfälle eller detta och alla framtida i en serie", "Ta bort ett enskilt eller alla framtida serietillfällen", "Visa framtida bokningar för aktiviteter, evenemang och platser"],
  },
  {
    version: "1.9.0 Lynx",
    date: "8 september 2026",
    title: "Kompakta aktiviteter och rutiner",
    changes: ["Ny kompakt aktivitetslista för att se fler aktiviteter samtidigt", "Planer kan markeras som rutiner", "Rutiner märks tydligt på bokningskorten", "Visa eller dölj rutiner i kalendern", "Kalenderrutor, bokningslista och veckobalans följer rutinfiltreringen"],
  },
  {
    version: "1.8.0 Owl",
    date: "7 september 2026",
    title: "Tydligare veckor och rikare personprofiler",
    changes: ["Veckans bokningar grupperas under måndag till söndag", "Bokningar sorteras efter tid inom varje veckodag", "Större Tillbaka-knapp i Settings", "Adress, telefon, e-post, födelsedag och jobb på personer", "Redigera en persons cirkelmedlemskap direkt", "Utfällbara personuppgifter under agendan"],
  },
  {
    version: "1.7.0 Fox",
    date: "7 september 2026",
    title: "Aktivitetsdetaljer, taggar och massimport",
    changes: ["Hela aktivitetskortet öppnar en samlad detaljvy", "Planera, visa historik eller redigera från detaljvyn", "Flera taggar på aktiviteter, evenemang och platser", "Ännu högre rullgardiner och filter", "Massimport av personer, aktiviteter, platser och evenemang från Markdown", "Nedladdningsbar Markdown-mall med dubblettskydd"],
  },
  {
    version: "1.6.0 Fish",
    date: "7 september 2026",
    title: "Stabila dialoger och smidigare evenemang",
    changes: ["Dialoger är fastlåsta och skrollar endast lodrätt", "Högre rullgardiner och filter i hela appen", "Sök aktiviteter när ett evenemang skapas", "Sök platser när ett evenemang skapas", "Skapa ny aktivitet eller plats direkt från evenemanget"],
  },
  {
    version: "1.5.0 Eclipse",
    date: "6 september 2026",
    title: "Mobil bokning och tydligare balans",
    changes: ["Bredare mobilformulär utan överflöd för datum och tid", "Sökbara aktivitets-, person- och cirkelväljare", "Snabbskapande direkt från en bokning", "Daglig upprepning och anpassade veckodagar", "Balans visar konkreta antal i stället för abstrakta nivåer", "Stabila detaljkort vid flikbyte", "Extra stora aktivitetsfilter"],
  },
  {
    version: "1.4.0 Dragon",
    date: "6 september 2026",
    title: "Mobil sökning, planstadier och appidentitet",
    changes: ["Sökfält flyttas upp när iPhone-tangentbordet öppnas", "Fullbreddsfilter i Activities", "Kort- och listvy för aktiviteter", "Inbokade planer på personer och cirklar", "Planering, Schemalagt och Gjort som stadier", "Splash-intro och Social Circle-appikon"],
  },
  {
    version: "1.3.0 Crab",
    date: "6 september 2026",
    title: "Återkommande planer och bättre sökning",
    changes: ["Stabila och alltid fungerande stängknappar i formulär", "Bättre skrollning i modalvyer på iPhone", "Återkommande planer varje eller varannan vecka samt varje månad", "Sökning bland personer, aktiviteter, evenemang och platser", "Större aktivitetsfilter", "Dagens planer visas före balansanalysen"],
  },
  {
    version: "1.2.0 Bull",
    date: "6 september 2026",
    title: "Dagsbalans, miljö och smartare sökning",
    changes: ["Egna kategorier för aktiviteter och platser", "Inomhus och utomhus som balansfaktor", "Dagens balans direkt på Today", "Ungefärlig kostnad per aktivitet", "Avstånd och restid för platser", "Filter för pris, miljö och sökområde"],
  },
  {
    version: "1.1.0 Aries",
    date: "6 september 2026",
    title: "Intressen och veckobalans",
    changes: ["Intressen för personer", "Aktivitetsnivå och social nivå för aktiviteter", "Veckostatistik för historiska och framtida veckor", "Balansförslag för aktivitet, återhämtning, social tid och egen tid"],
  },
  {
    version: "1.0.1",
    date: "6 september 2026",
    title: "Säkrare rensning av lokal data",
    changes: ["Alla Social Circle-nycklar tas bort uttryckligen", "Tydlig bekräftelse efter lyckad rensning", "Automatisk återgång till en tom Today-skärm"],
  },
  {
    version: "1.0.0",
    date: "6 september 2026",
    title: "Säkerhetskopior och kalenderagenda",
    changes: ["Export av all data till en JSON-fil", "Import av en tidigare säkerhetskopia", "Möjlighet att tömma lokal data", "Expanderbar bokningslista för vald dag eller vecka"],
  },
  {
    version: "0.9.0",
    date: "6 september 2026",
    title: "Fler kalendervyer, evenemang och platser",
    changes: ["Kalender för 3 dagar, en vecka, två veckor och månad", "Sammansatta evenemang med flera aktiviteter", "Sparade platser att besöka", "Förberedelse för framtida Google Calendar-koppling"],
  },
  {
    version: "0.8.0",
    date: "6 september 2026",
    title: "Settings och versionshistorik",
    changes: ["Ny Settings-skärm från profilknappen", "Tydligt versionsnummer", "Skärm med nyheter från tidigare versioner", "Versionsmärkta filer för säkrare uppdatering"],
  },
  {
    version: "0.7.0",
    date: "6 september 2026",
    title: "Agenda, historik och cirklar",
    changes: ["Personliga agendor med avbockad historik", "Gemensam historik för personer och aktiviteter", "Cirklar med flera personer", "Sammankopplade planer, aktiviteter och kalenderhändelser"],
  },
  {
    version: "0.6.0",
    date: "6 september 2026",
    title: "Förberedd lagring",
    changes: ["Gemensamt lagringslager", "Automatisk övergång av tidigare lokal data", "Test av skrivning till Markdown-fil"],
  },
  {
    version: "0.5.0",
    date: "5 september 2026",
    title: "People, Calendar och Activities",
    changes: ["Personer och kontaktuppföljning", "Interaktiv månadskalender", "Aktiviteter med kategori, kostnad, tid och plats", "Filter, favoriter och sortering"],
  },
  {
    version: "0.1.0",
    date: "5 september 2026",
    title: "Första versionen",
    changes: ["Today-skärm", "Bottennavigering", "Lokalt sparade dagsplaner", "Mobilanpassad webbapp"],
  },
];

export function initVersionInfo() {
  document.querySelector("#app-version").textContent = `v${APP_VERSION}`;
  const list = document.querySelector("#release-list");
  RELEASES.forEach((release, index) => {
    const article = document.createElement("article");
    article.className = "release-card";
    const badge = index === 0 ? '<span class="current-badge">Aktuell</span>' : "";
    article.innerHTML = `<div class="release-heading"><div><p class="eyebrow">Version ${release.version}</p><h2>${release.title}</h2></div>${badge}</div><time>${release.date}</time><ul>${release.changes.map(change => `<li>${change}</li>`).join("")}</ul>`;
    list.append(article);
  });
}
