# Data Sync erklaert fuer Dummies

Dieses Dokument erklaert den Datenfluss von BierScout in sehr einfacher Sprache.

Ziel:
- Du sollst verstehen, woher die Daten kommen.
- Du sollst wissen, wann Daten aktualisiert werden.
- Du sollst bei Problemen die richtigen Stellen finden.

Stand: 20. Februar 2026

## Kurzfassung in 30 Sekunden

1. Basisdaten kommen aus `biermarket_bierliste.csv`.
2. Ein Sync-Prozess holt Zusatzdaten von Open Brewery DB.
3. Alles wird zusammengefuehrt und gespeichert.
4. Auf Vercel laeuft das automatisch per Cron.
5. Die Website liest zuerst die neuesten Blob-Daten.

## Die wichtigsten Dateien

- `biermarket_bierliste.csv`
  Das ist die Grundliste (deine stabile Basis).

- `data/manual-overrides.json`
  Hier kannst du einzelne Felder manuell korrigieren.

- `scripts/data/sync-beers.mjs`
  Der lokale Sync (manuell im Terminal).

- `src/app/api/cron/data-sync/route.ts`
  Der automatische Sync auf Vercel (Cron ruft diesen Endpoint auf).

- `src/lib/beers.ts`
  Hier steht, wo die App ihre Daten zur Laufzeit liest.

## Der Datenfluss (einfach)

1. **CSV laden**
   - Datei: `biermarket_bierliste.csv`
   - Script: `scripts/data/load-csv.mjs`

2. **Manuelle Overrides laden**
   - Datei: `data/manual-overrides.json`
   - Falls etwas falsch ist, kannst du es hier ueberschreiben.

3. **API-Enrichment**
   - Quelle: Open Brewery DB
   - Script: `scripts/data/sources/open-brewery-db.mjs`
   - Es werden z. B. Website/Ort der Brauerei gesucht.

4. **Merge (Zusammenfuehren)**
   - Script: `scripts/data/merge-enrichment.mjs`
   - Prioritaet:
     - manual override
     - CSV
     - API

5. **Qualitaetsreport bauen**
   - Script: `scripts/data/report-quality.mjs`
   - Ergebnis enthaelt z. B. matched/unmatched/missing fields.

6. **Speichern**
   - Lokal (CLI): `data/beers.enriched.json` und `data/sync-report.json`
   - Vercel Cron: Blob `beers/latest.json` und `sync-report/latest.json`

## Welche Felder kommen woher?

### CSV-Felder (Basisdaten)

Diese Felder kommen direkt aus `biermarket_bierliste.csv`:

- `Nr.` -> `nr`
- `Biermarke/Name` -> `name`
- `Brauerei` -> `brewery`
- `Land` -> `country`
- `Alkoholgehalt` -> `abv`
- `Stammwürze` -> `stammwuerze`
- `Zutaten` -> `ingredients`
- `Größe` -> `size`
- `Preis` -> `price`
- `Kategorie` -> `category`

### Open Brewery DB Felder (was die API liefern kann)

Typische API-Felder sind:

- `id`
- `name`
- `brewery_type`
- `website_url`
- `city`
- `state`
- `state_province`
- `country`
- `postal_code`
- `street`
- `address_1`
- `address_2`
- `address_3`
- `phone`
- `latitude`
- `longitude`

### Was wir aktuell aus der API in unsere Daten uebernehmen

Aktuelles Mapping im Projekt:

- `id` -> `breweryId` (und zusaetzlich als `sourceId` in `dataSources`)
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

## Was die Website beim Laden macht

In `src/lib/beers.ts` ist die Reihenfolge:

1. Vercel Blob (`BEERS_BLOB_PATH`, Standard `beers/latest.json`)
2. Lokale Datei `data/beers.enriched.json`
3. Fallback CSV `biermarket_bierliste.csv`

Das heisst:
- Wenn Blob aktuell ist, nutzt die Seite die neuesten Daten automatisch.
- Wenn Blob ausfaellt, bleibt die Seite trotzdem lauffaehig.

## Manuell syncen (lokal)

```bash
npm run data:sync
```

Dry Run (schreibt keine Dateien):

```bash
npm run data:sync -- --dry-run
```

Wichtig:
- Dry Run ist nur zum Testen.
- Fuer echte neue Dateien ohne Vercel-Cron brauchst du den normalen Sync.

## Automatisch syncen (Vercel)

Automatisch ueber:
- `vercel.json` (Cron Schedule)
- Endpoint: `GET /api/cron/data-sync`

Der Endpoint:
- prueft `CRON_SECRET`
- fuehrt den Sync aus
- schreibt Ergebnis in Vercel Blob

Die genaue Klick-fuer-Klick-Anleitung steht in `VERCEL.md`.

## Welche ENV Variablen wichtig sind

Pflicht:
- `CRON_SECRET`
- `BLOB_READ_WRITE_TOKEN`

Optional:
- `BEERS_BLOB_PATH` (Standard: `beers/latest.json`)
- `SYNC_REPORT_BLOB_PATH` (Standard: `sync-report/latest.json`)
- `DATA_SYNC_REQUEST_DELAY_MS` (Standard: `150`)

## Typische Fragen

1. Warum sehe ich keine neuen Daten sofort?
- Cron laeuft nur zu geplanten Zeiten.
- Oder der letzte Cron ist fehlgeschlagen.

2. Kann ich sofort testen?
- Ja, per curl mit Authorization Header gegen `/api/cron/data-sync`.
- Siehe `VERCEL.md`.

3. Was passiert wenn die API down ist?
- Sync faellt auf Basisdaten zurueck.
- Seite bleibt benutzbar.

## Typische Fehler

1. `401 Unauthorized`
- `CRON_SECRET` fehlt/falsch.

2. `500` Blob-Fehler
- `BLOB_READ_WRITE_TOKEN` fehlt/falsch.
- Blob Store nicht verbunden.

3. Seite zeigt alte Daten
- Cron nicht gelaufen oder fehlgeschlagen.
- Blob wurde nicht geschrieben.

## Sehr wichtig: nicht zwei Scheduler parallel

Wenn gleichzeitig laeuft:
- Vercel Cron
- GitHub Actions Data Sync

dann laufen zwei automatische Jobs nebeneinander.

Empfehlung:
- Nur einen Scheduler aktiv lassen.
- Fuer Vercel-Hosting: Vercel Cron bevorzugen.
