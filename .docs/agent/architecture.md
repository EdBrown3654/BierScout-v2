# Architecture

## Baseline stack
- Next.js App Router
- React + TypeScript
- Tailwind CSS

## Suggested folders
- `src/app` for routes/layouts/server actions
- `src/components` for UI components
- `src/lib` for domain logic, hooks, and shared helpers
- `src/locales` for translations (optional)
- `.features` for feature specs

## Principle
Separate concerns:
- Server side: data fetching and composition
- Client side: interaction state and rendering
