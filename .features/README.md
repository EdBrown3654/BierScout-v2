# Feature Specs

All feature artifacts use a shared, incremental ID.

## Naming convention (mandatory)

- Feature file: `NNN-<feature-slug>.feature.md`
- Solution file: `NNN-<feature-slug>.solution.md`
- `NNN` is 3-digit, incremental, and unique (e.g. `001`, `002`, `003`).
- Every feature must have exactly one matching solution file with the same `NNN` and slug.

## Create a new feature

```bash
cp .features/_feature.template.md .features/003-my-feature.feature.md
cp .features/_solution.template.md .features/003-my-feature.solution.md
```

## Minimal template reference

```markdown
# 003-my-feature

## Status
Planned

## Goal

## Acceptance criteria
- [ ] AC-1 ...

## Edge cases
- ...
```
