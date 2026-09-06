export const APP_VERSION = "1.1.0 Aries";

export const RELEASES = [
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
