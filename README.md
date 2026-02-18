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

## Datenquelle

- CSV-Datei: `biermarket_bierliste.csv`
- Parser: `src/lib/beers.ts`
- Country-Section-Header (`=== LAND ===`) werden als Fallback fuer fehlende Country-Felder genutzt
- Kategorien und Laender werden zur Laufzeit aus den Datensaetzen dedupliziert

## Wichtige Hinweise

- Die Hero-Sektion erwartet ein Banner unter:
  `public/Header/bierscout_banner.jpg`
  Wenn die Datei fehlt, erscheint im Browser ein 404-Bildplatzhalter.
- Fuer Design-Asset-Generierung ist `OPENAI_API_KEY` in `.env` erforderlich.
- `.env.example` enthaelt alle relevanten Variablen.

## Projektstruktur (wichtigste Pfade)

- `src/app/page.tsx`: Server-Komponente, laedt Bierdaten und Statistiken
- `src/components/home-content.tsx`: Hero, Stats-Bar, Footer
- `src/components/hopfen-board.tsx`: Suche, Filter und Karten-Grid
- `src/components/beer-logo.tsx`: Logo/Fallback-Rendering
- `src/lib/beer-domains.ts`: Domain-Mapping + Favicon-URL-Erzeugung
- `src/locales/de.ts` und `src/locales/en.ts`: Texte fuer i18n
- `.docs/project/specialization.md`: Produktkontext und Ziele
