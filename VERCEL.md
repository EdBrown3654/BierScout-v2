# Vercel Setup (mit GitHub Actions Sync, fuer Einsteiger)

Dieses Dokument zeigt dir Schritt fuer Schritt, wie du Vercel + GitHub so verbindest,
dass Bierdaten automatisch 1x pro Woche aktualisiert werden.

Stand: 20. Februar 2026

## Produktziel-Kontext

- Ziel von BierScout ist ein moeglichst globaler, dynamischer Bierkatalog.
- Die Daten sollen langfristig nicht mehr manuell gepflegt werden muessen.
- Vercel ist in diesem Modell die Auslieferungsschicht, nicht der Scheduler.

## Wichtig vorab

Der Scheduler laeuft in diesem Setup **nicht** in Vercel, sondern in **GitHub Actions**.

Das heisst:
- GitHub Action aktualisiert `data/beers.enriched.json`
- GitHub Action commitet + pusht automatisch
- Vercel deployed den neuen Commit automatisch

## 1. Repo in Vercel verbinden

1. Gehe auf `https://vercel.com/dashboard`
2. `Add New...` -> `Project`
3. GitHub-Repo auswaehlen
4. `Import` klicken
5. Framework: `Next.js` (automatisch)
6. `Deploy`

Fertig: Vercel baut jetzt bei jedem Push.

## 2. In Vercel Cron deaktiviert lassen

In diesem Setup soll **kein** Vercel Cron laufen.

Im Repo ist `vercel.json` deshalb ohne aktive `crons`.

## 3. GitHub Action aktivieren

Datei im Repo:
- `.github/workflows/data-sync.yml`

Darin ist bereits eingestellt:
- Schedule: `0 2 * * 1`
- Bedeutung: jeden Montag um `02:00 UTC`
- Auto-Commit geaenderter Daten-Dateien

## 4. GitHub Rechte pruefen (wichtig)

Die Action braucht Schreibrechte, um committen zu koennen.

Ist im Workflow bereits gesetzt:
- `permissions: contents: write`

Zusatzcheck in GitHub:
1. Repo -> `Settings`
2. `Actions` -> `General`
3. Bereich `Workflow permissions`
4. `Read and write permissions` aktivieren (falls noetig)

## 5. Erste manuelle Ausfuehrung (Test)

1. Repo in GitHub oeffnen
2. Tab `Actions`
3. Workflow `Beer Data Sync` waehlen
4. `Run workflow`

Erwartung:
- Workflow laeuft gruen durch
- Bei Datenaenderung entsteht ein Commit wie
  `chore: update beer data and sync report`
- Vercel startet danach automatisch ein Deployment

## 6. Pruefen, ob neue Daten live sind

1. In GitHub den letzten Sync-Commit ansehen
2. In Vercel `Deployments` oeffnen
3. Deployment nach diesem Commit muss erfolgreich sein
4. Seite oeffnen und Datenstand pruefen

## 7. Welche Datei ist entscheidend?

Hauptdatei fuer die App:
- `data/beers.enriched.json`

Loader-Reihenfolge in `src/lib/beers.ts`:
1. `data/beers.enriched.json`
2. optional Blob
3. CSV-Fallback

Damit funktioniert der GitHub-Flow sauber, auch ohne Vercel Cron.

## 8. Typische Fehler

1. Action darf nicht pushen
- Ursache: fehlende Workflow-Rechte
- Loesung: GitHub `Workflow permissions` auf Schreibrechte setzen

2. Action laeuft, aber kein Commit
- Ursache: keine Datenaenderung
- Loesung: normal, dann gibt es nichts zu committen

3. Vercel zeigt alten Stand
- Ursache: neues Deployment noch nicht fertig
- Loesung: Vercel Deployment-Status checken

## 9. Zusammenfassung

Ja, es laeuft automatisch 1x pro Woche.

Der komplette automatische Weg ist:
1. GitHub Action (Scheduler)
2. Auto-Commit + Push
3. Vercel Auto-Deploy
