# First Project Planning

Goal: replace generic placeholders with project-specific context once, at project kickoff.

Owner: first planning agent (normally Requirements Engineer).

## Steps
1. Run `npm run ai:specify` or open `.docs/project/specialization.md`.
2. Replace every `<PLACEHOLDER>` with concrete values.
3. Add or remove sections to match the domain.
4. Run `npm run ai:check-specialization`.
5. Verify no `<...>` placeholders remain.
6. If branding work is in scope, also fill `.docs/project/brand.md`.
7. Create first feature spec in `.features/`.
8. Confirm the agent docs still match the specialized project.

## Done criteria
- No `<...>` placeholders remain in `.docs/project/specialization.md`.
- First feature spec exists and is approved.
