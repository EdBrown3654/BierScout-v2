# Vercel Setup (Schritt fuer Schritt, fuer Einsteiger)

Dieses Dokument zeigt dir exakt, was du in Vercel klicken musst, damit der Bier-Daten-Sync automatisch laeuft (ohne manuelles Triggern).

Stand: 20. Februar 2026  
Projekt-Setup im Code:
- Cron-Config in `vercel.json`
- Cron-Endpoint in `src/app/api/cron/data-sync/route.ts`
- Runtime-Loader liest zuerst Blob in `src/lib/beers.ts`

## 1. Vorbereitung (einmal lokal)

1. Stelle sicher, dass diese Dateien im Repo sind und gepusht wurden:
   - `vercel.json`
   - `src/app/api/cron/data-sync/route.ts`
   - `src/lib/beers.ts`
2. Push auf deinen Default-Branch (z. B. `master` oder `main`).

Ohne diesen Push kann Vercel nichts davon deployen.

## 2. Projekt in Vercel verbinden

1. Gehe auf `https://vercel.com/dashboard`.
2. Klicke `Add New...` -> `Project`.
3. Waehl dein Git-Repository aus.
4. Klicke `Import`.
5. Framework sollte automatisch `Next.js` sein.
6. Klicke `Deploy`.

Jetzt existiert das Projekt in Vercel.

## 3. Blob Store anlegen (wichtig)

1. Oeffne dein Projekt in Vercel.
2. Gehe auf Tab `Storage`.
3. Klicke `Connect Database`.
4. Unter `Create New` waehle `Blob`.
5. Vergib einen Namen, z. B. `bierscout-data`.
6. Klicke `Create`.
7. Waehle die Umgebungen, mindestens `Production`.

Ergebnis:
- Vercel legt automatisch `BLOB_READ_WRITE_TOKEN` als Environment Variable an.

## 4. Environment Variables setzen

Pfad in Vercel:
1. Projekt oeffnen
2. `Settings`
3. Links `Environment Variables`

Jetzt folgende Variablen anlegen:

1. `CRON_SECRET` (Pflicht)
   - Wert: langer zufaelliger String (mindestens 16 Zeichen, besser 32+)
   - Beispiel erzeugen lokal:
   ```bash
   openssl rand -hex 32
   ```
   - Environment: mindestens `Production`

2. `BLOB_READ_WRITE_TOKEN` (Pflicht)
   - Wird meist vom Blob-Setup automatisch gesetzt.
   - Wenn nicht vorhanden: aus Blob-Store-Settings kopieren und hier anlegen.
   - Environment: `Production`

3. `BEERS_BLOB_PATH` (optional)
   - Standard: `beers/latest.json`

4. `SYNC_REPORT_BLOB_PATH` (optional)
   - Standard: `sync-report/latest.json`

5. `DATA_SYNC_REQUEST_DELAY_MS` (optional)
   - Standard: `150`
   - Groesser = langsamer, aber API-schonender.

Wichtig:
- Nach dem Anlegen/Aendern von Env Vars: neu deployen.

## 5. Cron Job aktivieren (ist ueber `vercel.json` schon vorbereitet)

Im Repo steht bereits:
```json
{
  "crons": [
    {
      "path": "/api/cron/data-sync",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Bedeutung:
- Jeden Tag um `02:00 UTC` ruft Vercel automatisch den Endpoint auf.

Wichtig:
- Cron Jobs laufen nur auf `Production` Deployments.
- Preview Deployments werden ignoriert.

## 6. Neu deployen

1. In Vercel: Tab `Deployments`.
2. Letztes Deployment oeffnen.
3. Klicke `Redeploy` (oder neuen Commit pushen).

Danach sollte der Cron Job in den Settings sichtbar sein.

## 7. Pruefen, ob Cron wirklich aktiv ist

1. Projekt -> `Settings` -> `Cron Jobs`.
2. Dort muss ein Job mit Pfad `/api/cron/data-sync` erscheinen.
3. Oeffne den Job und pruefe:
   - letzter Run-Status
   - Logs
   - naechste geplante Ausfuehrung

## 8. Was bei einem Run passiert

Der Endpoint `GET /api/cron/data-sync` macht automatisch:
1. CSV laden (`biermarket_bierliste.csv`)
2. Open Brewery DB Enrichment
3. Merge + Validation + Report
4. Schreiben nach Vercel Blob:
   - `beers/latest.json`
   - `sync-report/latest.json`

Die Website liest zur Laufzeit zuerst Blob-Daten.
Fallback bleibt aktiv:
1. Blob
2. `data/beers.enriched.json`
3. CSV

## 9. Schnelltest nach Setup

Wenn du nicht bis zum naechsten Tageslauf warten willst:

1. Nimm deine Produktions-URL, z. B. `https://dein-projekt.vercel.app`
2. Fuehre lokal aus:
```bash
curl -i -H "Authorization: Bearer DEIN_CRON_SECRET" https://dein-projekt.vercel.app/api/cron/data-sync
```
3. Erwartet bei Erfolg:
   - HTTP `200`
   - JSON mit `"ok": true`
   - Blob-URLs in `blobs.beers` und `blobs.report`

## 10. Typische Fehler und Loesung

1. `401 Unauthorized`
   - `CRON_SECRET` fehlt oder stimmt nicht.

2. `500` mit Blob-Fehler
   - `BLOB_READ_WRITE_TOKEN` fehlt oder ist falsch.
   - Blob Store nicht angelegt.

3. Cron taucht nicht in Vercel auf
   - `vercel.json` nicht im Root.
   - Kein neuer Production-Deploy nach Aenderung.

4. Daten aendern sich nicht
   - In `Settings -> Cron Jobs` Logs checken.
   - Endpoint manuell per `curl` testen.

## 11. Wichtiger Hinweis zu Doppel-Sync

Wenn weiterhin GitHub Actions (`.github/workflows/data-sync.yml`) taeglich laeuft, hast du zwei Scheduler.

Empfehlung:
1. Einen Scheduler behalten.
2. Wenn Vercel Cron genutzt wird, GitHub-Schedule deaktivieren.

## Offizielle Vercel Doku

- Cron Jobs: `https://vercel.com/docs/cron-jobs`
- Cron Verwaltung + `CRON_SECRET`: `https://vercel.com/docs/cron-jobs/manage-cron-jobs`
- Cron Quickstart: `https://vercel.com/guides/how-to-setup-cron-jobs-on-vercel`
- Blob SDK: `https://vercel.com/docs/vercel-blob/using-blob-sdk`
- Environment Variables: `https://vercel.com/docs/environment-variables`
