# Project Specialization

## Product context
- Project name: `BierScout`
- Domain: `Beer discovery & information platform`
- Goal: `Brutalist-style landing page showcasing international beers from a curated CSV database with search and filter capabilities`
- Target users: `Bierfreunde – beer enthusiasts who want to explore beers from around the world`
- Brand brief: `.docs/project/brand.md`

## Technical context
- Data/API source: `Local CSV (biermarket_bierliste.csv) parsed at build time; OpenBreweryDB for supplementary data`
- Authentication model: `NextAuth.js (future phase)`
- Deployment target: `Vercel`
- Environment strategy: `Single environment (production) initially`

## Functional priorities
- Core entities: `Beer (Biermarke, Sorte/Kategorie, Land, Alkoholgehalt, Brauerei, Preis)`
- Core flows: `Browse Hopfen-Board → Filter/Search beers → View beer details`
- Non-goals (initial): `User accounts, reviews, shopping cart, brewery map`

## Quality and operations
- Performance targets: `LCP < 2.5s, static generation for beer data`
- Security constraints: `No user data collected initially, CSP headers`
- QA scope: `Visual regression, data parsing correctness, responsive layout`
- Release policy: `Ship when landing page is complete and reviewed`

## Conventions
- Naming conventions: `kebab-case files, PascalCase components, camelCase variables`
- Branch strategy: `main + feature branches`
- Commit rules: `Conventional commits (feat:, fix:, chore:)`
