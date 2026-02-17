# Agent Guide (AI Coding Boilerplate)

## Skills (Slash Commands)

| Skill | Description |
|-------|-------------|
| `/spec` | Feature Specification erstellen |
| `/architect` | Architekturplan erstellen |
| `/component` | React Component bauen |
| `/endpoint` | API Endpoint / Server Action bauen |
| `/test` | Tests ausfuehren und analysieren |
| `/qa` | Vollstaendiger QA Pass |
| `/review` | Code Review |
| `/fix` | Bug Fix |
| `/design` | Design Assets generieren |
| `/deploy-check` | Pre-Deployment Validierung |
| `/feature` | Gesamte Feature Pipeline (Team Workflow) |

## Agents

| Prompt signals | Agent | subagent_type |
|----------------|-------|---------------|
| spec, requirements, user story | **Requirements Engineer** | `Requirements Engineer` |
| architecture, design, how to build | **Solution Architect** | `Solution Architect` |
| ui, component, tailwind, layout | **Frontend Developer** | `Frontend Developer` |
| api, server action, backend | **Backend Developer** | `Backend Developer` |
| test, qa, bug, e2e, unit | **QA Engineer** | `QA Engineer` |
| deploy, ci, env, build | **DevOps Engineer** | `DevOps Engineer` |
| logo, branding, visual, asset | **Designer** | `Designer` |

## Critical rules
- Never run destructive git commands without user confirmation.
- Never push directly to `main` without explicit approval.

## First-project specialization (hard gate)

On the first planning task, the Requirements Engineer must:
1. Replace placeholders in `.docs/project/specialization.md`.
2. Run `npm run ai:check-specialization`.
3. Verify no placeholders remain, then `npm run ai:start`.
4. Only then continue with feature planning.

If placeholders (e.g. `<PROJECT_DOMAIN>`) are still present, planning is blocked.

## Doc map (read only what is relevant)

| Area | File |
|------|------|
| Index | `.docs/agent/index.md` |
| Rules | `.docs/agent/rules.md` |
| Architecture | `.docs/agent/architecture.md` |
| Practices | `.docs/agent/practices.md` |
| Quality | `.docs/agent/quality.md` |
| Design | `.docs/agent/design.md` |
| AI workflow | `.docs/ai/workflow.md` |
| Design workflow | `.docs/ai/design-workflow.md` |
| First project | `.docs/ai/first-project-planning.md` |
| Specialization | `.docs/project/specialization.md` |
| Brand brief | `.docs/project/brand.md` |
| Best practices | `.docs/ai/best-practices.md` |
