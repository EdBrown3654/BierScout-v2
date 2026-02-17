# Design Practices

## Goal
Provide a repeatable workflow for visual direction and AI-generated assets.

## Inputs
- Product context from `.docs/project/specialization.md`
- Brand brief from `.docs/project/brand.md`

## Generation rules
- Generate only into `public/assets/img/`.
- Prefer existing folders in `public/assets/img/`.
- Create at most one new subfolder if needed: `public/assets/img/<folder>`.
- Keep prompt and manifest as sidecar files next to each image.

## Prompt quality
- Mention style, composition, mood, color direction, and use case.
- Keep prompts deterministic where possible.
- Iterate with versioned names (`logo-v1`, `logo-v2`).

## Handoff
- Designer delivers short rationale + selected file paths.
- Frontend Developer integrates selected files into UI.
