# Data Sync erklaert fuer Dummies

Dieses Dokument erklaert den Datenfluss von BierScout in einfacher Sprache.

Ziel:
- Du verstehst, woher die Daten kommen.
- Du verstehst, wie Updates automatisch laufen.
- Du weisst, welche Datei am Ende auf der Website landet.

Produktziel der Website:
- BierScout soll langfristig moeglichst alle Biere der Welt abdecken.
- Alle relevanten Bierinfos sollen dynamisch und regelmaessig aktualisiert werden.
- Die CSV ist aktuell Startbasis/Fallback und wird schrittweise ersetzt.

Stand: 20. Februar 2026

## Kurzfassung in 20 Sekunden

1. Basis kommt aus `biermarket_bierliste.csv`.
2. Das Sync-Script reichert diese Daten ueber Open Brewery DB und Open Food Facts an.
3. Open Food Facts kann zusaetzlich neue Bier-Datensaetze entdecken.
4. Ergebnis ist `data/beers.enriched.json`.
5. Eine GitHub Action startet das automatisch 1x pro Woche.
6. Wenn sich Daten aendern, commitet die Action automatisch ins Repo.
7. Vercel deployed danach automatisch den neuen Stand.

## Aktueller Stand vs. Ziel

- Aktuell: dynamische Daten kommen aus zwei kostenlosen Quellen (Open Brewery DB + Open Food Facts).
- Ziel: auch Kernfelder wie ABV, Zutaten, Groesse und Preis sollen weiter schrittweise aus mehreren Quellen kommen.
- Wichtig: Preise sind orts- und zeitabhaengig und brauchen deshalb Quelle + Zeitpunkt statt eines statischen Einzelwerts.
- UI-Hinweis: Source-Metadaten werden intern gespeichert, aber aktuell nicht als eigene Nutzer-Sektion angezeigt.

## Die wichtigsten Dateien

- `biermarket_bierliste.csv`
  Stabile Basisdaten.

- `scripts/data/sync-beers.mjs`
  Das Haupt-Script fuer den Sync.

- `scripts/data/sources/open-brewery-db.mjs`
  Holt Zusatzdaten von Open Brewery DB.

- `scripts/data/sources/open-food-facts.mjs`
  Holt Produktdaten ohne API-Key und kann neue Biere entdecken.

- `data/beers.enriched.json`
  Das ist die fertige Datei, die die App primaer benutzt.

- `data/sync-report.json`
  Bericht mit Match-/Unmatched-Zahlen und fehlenden Feldern.

- `.github/workflows/data-sync.yml`
  Der automatische Job (Scheduler + Commit + Push).

## So laeuft der Sync intern

1. CSV laden
   - Quelle: `biermarket_bierliste.csv`

2. Manuelle Overrides laden
   - Quelle: `data/manual-overrides.json`

3. Open Brewery DB anfragen (ohne API-Key)
   - Script sucht passende Brauerei-Daten.

4. Open Food Facts anfragen (ohne API-Key)
   - Script matched bestehende Biere und entdeckt zusaetzliche Produkte.

5. Daten mergen
   - Prioritaet:
     - manual override
     - CSV
     - API (Open Brewery DB, Open Food Facts fuer fehlende Felder)

6. Report bauen
   - Ausgabe: `data/sync-report.json`

7. Ergebnis schreiben
   - Ausgabe: `data/beers.enriched.json`

## Welche Felder kommen woher?

### Aus der CSV (Basis)

- `Nr.` -> `nr`
- `Biermarke/Name` -> `name`
- `Brauerei` -> `brewery`
- `Land` -> `country`
- `Alkoholgehalt` -> `abv`
- `Stammwuerze` -> `stammwuerze`
- `Zutaten` -> `ingredients`
- `Groesse` -> `size`
- `Preis` -> `price`
- `Kategorie` -> `category`

### Aus Open Brewery DB (zusaetzlich)

- `id` -> `breweryId`
- `website_url` -> `breweryWebsite`
- `city` -> `breweryCity`
- `state` / `state_province` -> `breweryState`
- `state_province` -> `breweryStateProvince`
- `country` -> `breweryCountryCode`
- `brewery_type` -> `breweryType`
- `phone` -> `breweryPhone`
- `postal_code` -> `breweryPostalCode`
- `street` / `address_1` -> `breweryStreet`
- `address_1` -> `breweryAddress1`
- `address_2` -> `breweryAddress2`
- `address_3` -> `breweryAddress3`
- `latitude` -> `breweryLatitude`
- `longitude` -> `breweryLongitude`

### Aus Open Food Facts (zusaetzlich)

- `abv` / `alcohol_by_volume` / `nutriments.alcohol` -> `abv` (nur wenn in CSV leer)
- `ingredients_text` -> `ingredients` (nur wenn in CSV leer)
- `quantity` -> `size` (nur wenn in CSV leer)
- `code` -> `openFoodFactsCode`
- Produkt-URL -> `openFoodFactsUrl`
- Produkte ausserhalb der CSV koennen als neue Datensaetze aufgenommen werden

## Was die Website beim Laden macht

In `src/lib/beers.ts` ist die Reihenfolge:

1. `data/beers.enriched.json` (Repo-Datei, von GitHub Action aktualisiert)
2. Optional Vercel Blob (`BEERS_BLOB_PATH`), falls vorhanden
3. CSV-Fallback (`biermarket_bierliste.csv`)

Das bedeutet:
- Mit GitHub-Flow ist die Repo-Datei dein Hauptspeicher.
- Die CSV bleibt Sicherheitsnetz.

## Automatisch 1x pro Woche (GitHub)

Workflow: `.github/workflows/data-sync.yml`

- Schedule: `0 2 * * 1`
- Bedeutung: jeden Montag um `02:00 UTC`

Ablauf bei jedem Run:

1. `npm ci`
2. `npm run data:sync`
3. Pruefen, ob sich `data/beers.enriched.json` oder `data/sync-report.json` geaendert haben
4. Bei Aenderung: Commit + Push automatisch

## Manuell starten (ohne auf Montag zu warten)

In GitHub:
1. Repo oeffnen
2. Tab `Actions`
3. Workflow `Beer Data Sync`
4. `Run workflow`

Oder lokal:

```bash
npm run data:sync
```

## Wichtige Regel: nur ein Scheduler

Nicht gleichzeitig laufen lassen:
- GitHub Actions Schedule
- Vercel Cron

Empfehlung fuer euren Setup:
- GitHub Actions aktiv
- Vercel Cron deaktiviert

## Typische Fragen

1. Werden neue Daten gespeichert?
- Ja. Durch den Auto-Commit im Repo.

2. Muss die CSV dabei direkt geaendert werden?
- Nein. Entscheidend ist `data/beers.enriched.json`.

3. Kann das wirklich automatisch woechentlich laufen?
- Ja. Genau dafuer ist der Schedule in der GitHub Action da.

4. Brauchen wir dafuer API-Keys?
- Nein, fuer den aktuellen Flow nicht. Beide Quellen sind in der Nutzung als kostenlose No-Key-Reads eingebunden.
