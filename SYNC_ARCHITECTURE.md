# Social Circle – plan för lagring och synkning

## Nuvarande läge

Appen är offline-first och använder `LocalStorageAdapter` i `js/storage.js`. All information samlas i en versionsmärkt databas med tre samlingar: `people`, `activities` och `plans`.

Befintlig information från de äldre localStorage-nycklarna flyttas automatiskt in i den nya strukturen. De gamla nycklarna uppdateras också under övergången.

## Avsedd OneDrive-lösning

Gränssnittet `connectRemote()` är förberett för en framtida OneDrive-adapter med två operationer:

- `pull()` hämtar data från OneDrive.
- `push(database)` sparar data till OneDrive.

Lokala ändringar sparas alltid först. Molnsynkning ska ske i bakgrunden så appen fortsätter fungera utan nätverk.

## Planerade steg

1. Registrera Social Circle som en klientapp hos Microsoft.
2. Lägg till Microsoft-inloggning med Authorization Code + PKCE.
3. Skapa en OneDrive-adapter mot Microsoft Graph.
4. Begränsa åtkomsten till appens egen mapp.
5. Lägg till synkstatus, manuell synkknapp och tydliga felmeddelanden.
6. Införa konflikthantering innan flera enheter får skriva samtidigt.
7. Byta OneDrive-representation från en samlad JSON-fil till Markdown-filer, utan att ändra appens vyer.

## Föreslagen filstruktur

```text
Social Circle/
├── People/
├── Activities/
├── Plans/
└── social-circle.json
```

Under första synkversionen kan `social-circle.json` vara ett säkert index och migreringsunderlag. Därefter blir Markdown-filerna den läsbara datakällan, med stabila id:n och ändringstid i YAML-frontmatter.
