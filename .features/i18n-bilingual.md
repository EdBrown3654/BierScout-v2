# i18n-bilingual

## Status
Planned

## Goal
Make the BierScout landing page fully bilingual (German + English). German is the default language. Users can switch to English via a visible language toggle. All UI strings, metadata, and accessible labels are translated. Beer data from the CSV remains in its original language.

## Non-goals
- Translating beer data (beer names, brewery names, CSV-sourced category names, country names)
- URL-based locale routing (e.g. `/en/`, `/de/` path prefixes)
- Server-side locale detection from `Accept-Language` header
- RTL language support
- More than two languages
- SEO-optimized `hreflang` alternate links

## User stories
- As a German-speaking beer enthusiast, I want the page to load in German by default, so that I see familiar labels and text immediately.
- As an English-speaking visitor, I want to switch the page to English, so that I can understand the UI and navigate the Hopfen-Board comfortably.
- As a returning visitor, I want my language preference to be remembered, so that I do not have to switch every time I visit.

## Scope of translatable strings

### layout.tsx
| Key | DE | EN |
|-----|----|----|
| `meta.title` | BIERSCOUT -- BIER REGIERT DIE WELT | BIERSCOUT -- BEER RULES THE WORLD |
| `meta.description` | Hopfen, Humor und Harte Rabatte. Entdecke Biere aus aller Welt. | Hops, Humor, and Hard Bargains. Discover beers from around the world. |
| `html.lang` | `de` | `en` |

### page.tsx
| Key | DE | EN |
|-----|----|----|
| `marquee` | BIER * HOPFEN * MALZ * PROST * | BEER * HOPS * MALT * CHEERS * |
| `hero.subtitle` | EST. 2026 -- FUER BIERFREUNDE | EST. 2026 -- FOR BEER LOVERS |
| `hero.tagline` | BIER REGIERT DIE WELT | BEER RULES THE WORLD |
| `hero.cta_line1` | BIER ? WO ? WANN ? WILL ICH. | BEER ? WHERE ? WHEN ? I WANT IT. |
| `hero.cta_line2` | Hopfen, Humor und Harte Rabatte. | Hops, Humor, and Hard Bargains. |
| `hero.button` | ZUM HOPFEN-BOARD | TO THE HOPFEN-BOARD |
| `stats.beers` | BIERE | BEERS |
| `stats.countries` | LAENDER | COUNTRIES |
| `stats.categories` | SORTEN | STYLES |
| `stats.breweries` | BRAUEREIEN | BREWERIES |
| `footer.tagline` | Hopfen, Humor und Harte Rabatte. | Hops, Humor, and Hard Bargains. |
| `footer.copyright` | (c) 2026 BIERSCOUT. PROST. | (c) 2026 BIERSCOUT. CHEERS. |

### hopfen-board.tsx
| Key | DE | EN |
|-----|----|----|
| `board.subtitle` | {n} Biere aus {m} Laendern | {n} beers from {m} countries |
| `search.placeholder` | SUCHE: BIER, BRAUEREI, LAND... | SEARCH: BEER, BREWERY, COUNTRY... |
| `filter.allCountries` | ALLE LAENDER | ALL COUNTRIES |
| `filter.allCategories` | ALLE SORTEN | ALL STYLES |
| `results.count` | {n} ERGEBNIS / ERGEBNISSE | {n} RESULT / RESULTS |
| `empty.title` | KEIN BIER GEFUNDEN | NO BEER FOUND |
| `empty.subtitle` | Versuch es mit einem anderen Suchbegriff, Digga. | Try a different search term, buddy. |
| `card.unknown` | UNBEKANNT | UNKNOWN |
| `card.label.country` | LAND | COUNTRY |
| `card.label.abv` | ALK | ABV |
| `card.label.size` | GROESSE | SIZE |
| `card.label.price` | PREIS | PRICE |

## Technical approach
Custom lightweight solution: typed dictionaries in `src/locales/`, React context + localStorage persistence, no external dependency.

## Acceptance criteria
- [ ] AC-1: Page loads in German by default when no locale preference is stored.
- [ ] AC-2: A visible language toggle (DE | EN) is present and matches brutalist design.
- [ ] AC-3: Clicking the toggle switches ALL UI strings to the corresponding language.
- [ ] AC-4: Selected language is persisted in localStorage and restored on reload.
- [ ] AC-5: html lang attribute updates to match active locale.
- [ ] AC-6: Beer data remains unchanged regardless of locale.
- [ ] AC-7: Translation dictionaries are fully typed -- missing key = compile error.
- [ ] AC-8: No new external dependencies.
- [ ] AC-9: Pluralization works correctly in both languages.
- [ ] AC-10: Passes lint, typecheck, and build.

## Edge cases
- No localStorage: default to `de`.
- Invalid localStorage value: fall back to `de`.
- localStorage unavailable: fall back to `de`, no errors.
- 0 results: use plural form in both languages.

## Risks/Dependencies
- Hydration mismatch: server renders DE, client may switch to EN from localStorage.
- Metadata limitation: document.title updated client-side only.
