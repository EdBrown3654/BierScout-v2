# Quality and Testing

## Type safety
- Avoid `any` unless documented and justified.
- Prefer explicit interfaces for API payloads.

## Logging and errors
- No empty `catch {}` blocks.
- Log actionable context for failures.

## Validation
- Validate inputs at boundaries (forms, server actions, API routes).

## Test baseline
- Unit tests for logic-heavy changes.
- E2E tests for critical user paths.
- Regression tests for fixed bugs.
