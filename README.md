# BierScout v2

BierScout ist eine brutalistische Next.js Landing Page fuer Bier-Discovery.
Die App laedt eine kuratierte Bierliste aus `biermarket_bierliste.csv` und bietet
Suche + Filter ueber Herkunftsland und Kategorie.

Aktueller Datenstand aus der CSV:
- 499 Biere
- 119 Laender
- 17 Kategorien
- 285 Brauereien

## Features

- Brutalist UI (hoher Kontrast, harte Kanten, monospaced Typografie)
- Hopfen-Board mit Volltextsuche (Bier, Brauerei, Land, Kategorie)
- Filter nach Land und Stil/Kategorie
- DE/EN Sprachumschaltung mit lokaler Persistenz (`localStorage`)
- Dynamische Bier-Logos ueber Domain-Mapping + Favicon-Fallback

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4

## Schnellstart

Voraussetzung: Node.js 20+ und npm.

```bash
npm install
npm run dev
```

Danach: `http://localhost:3000`

## Verfuegbare Scripts

- `npm run dev`: lokaler Dev-Server
- `npm run build`: Production-Build
- `npm run start`: Build lokal starten
- `npm run lint`: ESLint
- `npm run typecheck`: TypeScript-Pruefung ohne Emit
- `npm run ai:check-specialization`: prueft Platzhalter in `.docs/project/specialization.md`
- `npm run ai:start`: installiert Abhaengigkeiten (falls noetig), prueft Specialization und startet Dev-Server
- `npm run design:logo`: generiert Logo-Assets via OpenAI Images API
- `npm run design:image`: generiert Bild-Assets via OpenAI Images API
- `npm run logos:sync`: laedt fehlende Brauerei-Logos in `public/logos/`
- `npm run logos:sync:force`: laedt alle Logos neu in `public/logos/`

## Datenquelle

- CSV-Datei: `biermarket_bierliste.csv`
- Runtime-Loader: `src/lib/beers.ts`
- Reihenfolge zur Laufzeit: Vercel Blob (`beers/latest.json`) -> `data/beers.enriched.json` -> CSV-Fallback
- Country-Section-Header (`=== LAND ===`) werden als Fallback fuer fehlende Country-Felder genutzt
- Kategorien und Laender werden zur Laufzeit aus den Datensaetzen dedupliziert

## Automatischer Sync auf Vercel

- Cron-Konfiguration: `vercel.json` (woechentlich, montags `02:00 UTC`)
- Endpoint: `GET /api/cron/data-sync`
- Scheduler-Auth: `Authorization: Bearer $CRON_SECRET`
- Persistenz: `@vercel/blob` schreibt
  - `beers/latest.json`
  - `sync-report/latest.json`

Noetige Environment-Variablen:
- `CRON_SECRET`
- `BLOB_READ_WRITE_TOKEN`
- optional `BEERS_BLOB_PATH` (Default `beers/latest.json`)
- optional `SYNC_REPORT_BLOB_PATH` (Default `sync-report/latest.json`)
- optional `DATA_SYNC_REQUEST_DELAY_MS` (Default `150`)

## Wichtige Hinweise

- Die Hero-Sektion erwartet ein Banner unter:
  `public/header/bierscout_banner.jpg`
  Wenn die Datei fehlt, erscheint im Browser ein 404-Bildplatzhalter.
- Fuer Design-Asset-Generierung ist `OPENAI_API_KEY` in `.env` erforderlich.
- `.env.example` enthaelt alle relevanten Variablen.

## Dokumentation

- Technische und QA-Dokumente liegen unter `docs/`
- Data-Sync User Guide: `docs/DATA_SYNC.md`
- Implementierungszusammenfassung: `docs/IMPLEMENTATION_SUMMARY.md`
- QA-Report: `docs/QA_REPORT.md`
- QA-Testevidence: `docs/QA_TEST_EVIDENCE.md`

Logo-Caching:
- Lokale Logos: `public/logos/*.png`
- Sync-Script: `scripts/logos/fetch-logos.mjs`
- Rendering-Reihenfolge: lokales PNG → Google Favicon → Monogramm

## Projektstruktur (wichtigste Pfade)

- `src/app/page.tsx`: Server-Komponente, laedt Bierdaten und Statistiken
- `src/components/home-content.tsx`: Hero, Stats-Bar, Footer
- `src/components/hopfen-board.tsx`: Suche, Filter und Karten-Grid
- `src/components/beer-logo.tsx`: Logo/Fallback-Rendering
- `src/lib/beer-domains.ts`: Domain-Mapping + Favicon-URL-Erzeugung
- `src/locales/de.ts` und `src/locales/en.ts`: Texte fuer i18n
- `.docs/project/specialization.md`: Produktkontext und Ziele
