# Pre-Deployment Check

$ARGUMENTS

## Workflow

1. **Build:**
   ```bash
   npm run lint && npm run build
   ```
   Run test command if configured
2. **Env:** Verify required environment variables are documented
3. **Git:** Check branch status, uncommitted changes, recent commits
4. **Report:** Green/red status for each check, blockers if any
