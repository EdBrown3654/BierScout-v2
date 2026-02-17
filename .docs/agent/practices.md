# Engineering Practices

## Component boundaries
- Keep business logic out of presentation-only components.
- Prefer extracting reusable logic into `src/lib`.

## Styling
- Use Tailwind utilities by default.
- Use component CSS only when utilities are insufficient.

## Internationalization
- Do not hardcode user-facing strings if i18n is enabled for the project.
- Return error keys/structured errors where possible.

## Performance
- Memoize expensive derived values in client components.
- Dynamically import heavy UI libraries.
