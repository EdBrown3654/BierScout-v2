# Rules

## Git safety
- Do not force push or reset hard without explicit confirmation.
- Keep commits small and scoped.

## Default quality gate
Run before commit:
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Relevant tests for changed behavior

## Security baseline
- Keep secrets in environment variables.
- Avoid logging sensitive data.
