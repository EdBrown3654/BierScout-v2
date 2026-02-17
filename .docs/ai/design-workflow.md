# AI Design Workflow

## Standard sequence
1. Fill `.docs/project/brand.md` placeholders.
2. Draft prompt candidates.
3. Choose a matching folder in `public/assets/img/`.
4. Generate first batch with `--dry-run` or live API.
5. Generate final candidates.
6. Select and hand off asset paths.

## Commands
```bash
# Dry run
npm run design:logo -- --prompt "Minimal geometric logo for ..." --name logo-v1 --dry-run

# One-level folder override
npm run design:logo -- --prompt "Minimal geometric logo for ..." --name logo-v1 --folder svg

# Live generation
npm run design:logo -- --prompt "Minimal geometric logo for ..." --name logo-v1
npm run design:image -- --type hero --prompt "Editorial hero image ..." --name hero-v1
```

## Output policy
- Output path is `public/assets/img/<folder>`.
- No `.output` root.
- No `generated` root.
- Prompt/manifest sidecar files are stored in the same folder as the image.
