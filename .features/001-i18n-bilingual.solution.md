# 001-i18n-bilingual solution

## Status
Implemented

## Input spec
- `.features/001-i18n-bilingual.feature.md`

## Tech Design

### Component structure
- `src/locales/*.ts`: typed dictionaries for `de` and `en`.
- `src/lib/i18n-context.tsx`: locale store, persistence, and translation context hooks.
- `src/components/language-toggle.tsx`: DE/EN UI switch.
- `src/components/home-content.tsx` and `src/components/hopfen-board.tsx`: consume dictionary keys.

### Data flow
1. Default locale resolves to `de`.
2. Locale can be switched via language toggle.
3. Locale value is persisted in `localStorage`.
4. Context provides translated strings to UI components.

### API/contracts
- `Locale`: `"de" | "en"`.
- `Dictionary`: typed object contract in `src/locales/types.ts`.
- `dictionaries`: locale-to-dictionary map in `src/locales/index.ts`.

### Server/Client boundaries
- Static metadata defaults on server render in `layout.tsx`.
- Runtime locale switching happens client-side via context in `LocaleProvider`.
- No external APIs or backend endpoints are involved.

### Risks and tradeoffs
- Initial render is `de`; client may switch to stored `en` after hydration.
- Locale is stored locally, not URL-based (no dedicated locale routes).

## Affected files/folders
- `src/locales/types.ts`
- `src/locales/index.ts`
- `src/locales/de.ts`
- `src/locales/en.ts`
- `src/lib/i18n-context.tsx`
- `src/components/language-toggle.tsx`
- `src/components/home-content.tsx`
- `src/components/hopfen-board.tsx`
- `src/app/layout.tsx`

## Handoff
- Backend Developer: none required for current i18n approach.
- Frontend Developer: extend dictionaries and toggle if additional locales are added.
- QA Engineer: verify DE default, EN toggle, persistence, and key parity.
