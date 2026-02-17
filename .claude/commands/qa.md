# QA Pass

$ARGUMENTS

## Workflow

1. **Spec:** Read feature spec from `.features/`, list all Acceptance Criteria
2. **Automated:** Run lint, build, and test suite
3. **Manual inspection:** Verify each AC against code, check edge cases
4. **Cross-cutting:** Accessibility, responsive, i18n, security (input validation, no XSS)
5. **Browser test** (if Chrome DevTools MCP available): Desktop, Tablet, Mobile
6. **Report:** AC status table, bugs with severity + steps to reproduce
7. **Verdict:** PASS (deploy-ready) or FAIL (fixes needed)
