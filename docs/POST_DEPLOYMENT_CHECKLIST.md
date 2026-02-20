# Post-Deployment Monitoring Checklist

**Feature**: Beer Data Sync & Enrichment
**Deployment Date**: [Date of production deployment]
**Monitoring Period**: First 7 days post-deployment

---

## Day 1: Initial Deployment Verification

### System Health
- [ ] **Application builds successfully**
  - Command: `npm run build`
  - Expected: Success within 10 seconds
  - Action on failure: Rollback to previous build

- [ ] **TypeScript checks pass**
  - Command: `npm run typecheck`
  - Expected: 0 errors
  - Action on failure: Review type issues

- [ ] **No critical lint errors**
  - Command: `npm run lint`
  - Expected: 0 errors in production code (warnings OK)
  - Action on failure: Review code quality

### Data Integrity
- [ ] **Enriched JSON file exists and is valid**
  - Path: `data/beers.enriched.json`
  - Check: File size > 100KB
  - Check: Valid JSON structure
  - Action on failure: Restore from backup

- [ ] **Sync report was generated**
  - Path: `data/sync-report.json`
  - Check: Contains `runId`, `inputCount`, `outputCount`
  - Check: `errors[]` array is empty or contains only warnings
  - Action on failure: Review error logs

### UI Functionality
- [ ] **Application renders without errors**
  - Navigate to: `/` (home page)
  - Check: Page loads
  - Check: No console errors
  - Action on failure: Check browser console

- [ ] **Beer search/filter still works**
  - Search for: "Pilsner"
  - Filter by: Any country, any category
  - Expected: Results filtered correctly
  - Action on failure: Check UI component code

- [ ] **i18n labels display correctly**
  - Check German labels
  - Check language toggle functionality
  - Expected: All labels render
  - Action on failure: Verify i18n context

---

## Day 2: First Scheduled Sync (02:00 UTC)

### Scheduled Sync Execution
- [ ] **GitHub Actions workflow triggered**
  - Check: GitHub Actions tab shows "Beer Data Sync" job
  - Time: Should run at 02:00 UTC
  - Status: Should show "completed"
  - Action on failure: Check workflow configuration

- [ ] **Sync completed successfully**
  - Check: Exit code = 0 (success)
  - Check: Job status = "passed"
  - Check: No errors in logs
  - Action on failure: Review error logs, manual intervention may be needed

- [ ] **New data committed to repository**
  - Check: Git log shows new commit "chore: update beer data and sync report"
  - Check: Commit contains changes to `data/beers.enriched.json`
  - Check: Commit contains changes to `data/sync-report.json`
  - Action on failure: Check git workflow permissions

### Sync Report Quality
- [ ] **Check match statistics**
  - Command: `cat data/sync-report.json | jq '.matched'`
  - Expected: `matched.openBreweryDb > 0` (API should be reaching now)
  - Note: If 0 matches, API might be rate limited
  - Action if low: Increase `--request-delay-ms`

- [ ] **Verify no data loss**
  - Command: `cat data/sync-report.json | jq '.inputCount, .outputCount'`
  - Expected: `inputCount == outputCount` (no records lost)
  - Action on failure: Investigate merge logic

- [ ] **Check for conflicts or warnings**
  - Command: `cat data/sync-report.json | jq '.conflicts, .warnings'`
  - Expected: `conflicts == 0` or low number
  - Review: Any warnings about name collisions
  - Action: Document any naming issues found

---

## Days 3-7: Ongoing Monitoring

### Daily Checks
- [ ] **Sync continues to run daily**
  - Check: Each day at 02:00 UTC
  - Pattern: Look for workflow runs in GitHub Actions
  - Alert: If 2+ consecutive failures

- [ ] **Data quality remains consistent**
  - Command: `cat data/sync-report.json | jq '.durationMs'`
  - Expected: Sync time stays consistent (±50%)
  - Alert: If sync time jumps to 10x normal

- [ ] **No new errors accumulating**
  - Command: `cat data/sync-report.json | jq '.errors | length'`
  - Expected: 0 errors or same count as before
  - Action: Investigate new errors

### API Integration Monitoring
- [ ] **Open Brewery DB API remains responsive**
  - Check: `matched.openBreweryDb` increasing over time
  - Expected: Increasing number as more breweries matched
  - Alert: If plateaus at same number for multiple days

- [ ] **Rate limiting not causing issues**
  - Check: Job duration stays within expected range
  - Expected: < 5 minutes per run
  - Alert: If suddenly > 10 minutes

- [ ] **Timeout/retry logic working**
  - Check: `warnings[]` array for timeout messages
  - Expected: Few or no timeout warnings
  - Alert: If multiple timeout warnings

### Manual Override Verification
- [ ] **Manual overrides still applied correctly**
  - Check: Record #1 in beers.enriched.json
  - Expected: Contains manual override data
  - Command: `jq '.[0].dataSources' data/beers.enriched.json`
  - Expected: Contains "manual-override" source

- [ ] **Can modify manual overrides**
  - Edit: `data/manual-overrides.json` (add test override)
  - Run: `npm run data:sync:dry`
  - Verify: Test override appears in output
  - Clean: Revert test override

### Fallback Testing
- [ ] **Fallback to CSV tested**
  - Rename: `mv data/beers.enriched.json data/beers.enriched.json.bak`
  - Reload: Application
  - Check: UI still displays beers from CSV
  - Verify: Fallback logic working
  - Restore: `mv data/beers.enriched.json.bak data/beers.enriched.json`

---

## Performance Baseline

### Establish Baseline (First Day)
Record these metrics for comparison:

```
Sync Duration:        _____ ms
API Match Rate:       _____ % (matched / total)
Missing Fields:
  - breweryWebsite:   _____ records
  - breweryCity:      _____ records
Output File Size:     _____ KB
```

### Weekly Comparison
- [ ] **Sync duration stable**
  - Threshold: ±20% of baseline
  - Alert: If outside threshold

- [ ] **API match rate stable**
  - Threshold: ±5% of baseline
  - Alert: If significant drop

- [ ] **Output file size stable**
  - Threshold: ±10% of baseline
  - Alert: If sudden growth

---

## Emergency Procedures

### If Sync Fails (Exit Code != 0)

1. **Check Error Logs**
   ```bash
   # View latest sync report errors
   cat data/sync-report.json | jq '.errors'
   ```

2. **Review GitHub Actions Logs**
   - Go to: GitHub Actions → Beer Data Sync
   - Click: Latest failed run
   - Check: Error messages in job output

3. **Manual Intervention**
   ```bash
   # Try manual dry-run
   npm run data:sync:dry

   # Review output
   cat data/sync-report.json | jq '.'
   ```

4. **Common Issues & Solutions**

   **Issue**: API rate limiting
   ```bash
   # Increase delay between requests
   npm run data:sync -- --request-delay-ms 3000
   ```

   **Issue**: Corrupted enriched JSON
   ```bash
   # Regenerate from CSV
   rm data/beers.enriched.json
   npm run data:sync
   ```

   **Issue**: Invalid CSV format
   ```bash
   # Check CSV syntax
   head -5 biermarket_bierliste.csv
   # Look for line breaks, encoding issues
   ```

   **Issue**: Manual override JSON malformed
   ```bash
   # Validate JSON
   cat data/manual-overrides.json | jq '.'
   # Fix syntax errors if found
   ```

5. **Escalation**
   - If unresolved: Check for API outages (https://api.openbrewerydb.org)
   - If API down: Fallback to CSV will keep app working
   - Notify: Team if manual intervention needed

### If Match Rate Drops Significantly

1. **Check API Status**
   - Visit: https://api.openbrewerydb.org
   - Check: API availability and response times

2. **Review Warnings**
   ```bash
   cat data/sync-report.json | jq '.warnings'
   ```

3. **Possible Causes**
   - API rate limiting (increase delay)
   - Network connectivity (check firewall)
   - API changes (check Open Brewery DB changelog)

4. **Action**
   - Monitor for 24 hours
   - If persistent: Investigate API changes
   - Consider fallback enhancement: skip enrichment via `--skip-enrichment` flag

### If UI Shows No Data

1. **Check Data Files**
   ```bash
   ls -lah data/beers.enriched.json
   file data/beers.enriched.json
   ```

2. **Verify JSON**
   ```bash
   cat data/beers.enriched.json | jq 'length'
   ```

3. **Check Fallback**
   - Verify CSV file exists: `biermarket_bierliste.csv`
   - Verify CSV is readable: `head -5 biermarket_bierliste.csv`

4. **Force Rebuild**
   ```bash
   npm run build
   ```

---

## Weekly Report Template

**Week of**: ___________

### Summary
- [ ] All syncs completed successfully: YES / NO
- [ ] No data loss detected: YES / NO
- [ ] API match rate stable: YES / NO
- [ ] No user-reported issues: YES / NO

### Metrics
| Metric | Value | Status |
|--------|-------|--------|
| Sync Success Rate | ___% | PASS/WARN/FAIL |
| Avg Sync Duration | ___ms | PASS/WARN/FAIL |
| API Match Rate | __% | PASS/WARN/FAIL |
| Output File Size | ___KB | PASS/WARN/FAIL |
| Error Count | ___ | PASS/WARN/FAIL |

### Actions Taken
- [ ] Reviewed error logs
- [ ] Checked API status
- [ ] Updated manual overrides if needed
- [ ] Monitored performance metrics
- [ ] No escalations required

### Recommendations
- Next monitoring focus: _____________
- Action items for development team: _____________

---

## Success Criteria for Full Launch

All of the following must be true for 7 consecutive days:

- [x] All scheduled syncs complete successfully (exit code 0)
- [x] API match rate consistently > 0% (baseline data always enriched)
- [x] No data loss (inputCount == outputCount)
- [x] Output file size stable (±10%)
- [x] Sync report errors empty or only non-blocking warnings
- [x] UI remains functional (no rendering errors)
- [x] Search/filter functionality unchanged
- [x] No user-reported issues
- [x] Fallback mechanism verified working

**7-Day Success Target**: Friday, [7 days after deployment]

---

## Phase 2 Planning

Once 7-day monitoring complete and success criteria met:

- [ ] Prepare enhancement proposal for Open Food Facts integration
- [ ] Evaluate approved scraping adapters (future phase)
- [ ] Gather user feedback on enriched data quality
- [ ] Plan performance optimizations (batch requests, caching)
- [ ] Schedule code review for unused variables cleanup

---

## Contact & Escalation

**Primary Contact**: [QA Engineer]
**Backup Contact**: [DevOps Engineer]
**Emergency**: [CTO / Tech Lead]

**Critical Issues Require**:
1. Immediate notification to team
2. GitHub issue creation with label "urgent-data-sync"
3. Slack notification to #data-team channel
4. Documentation of issue and resolution

---

## Notes

Use this section to document observations, issues found, and resolutions:

```
[Date]: [Observation/Issue]
- Status: [In Progress / Resolved]
- Notes: [Details]
```

---

**Monitoring Started**: [Date]
**Monitoring End Target**: [Date + 7 days]
**Final Sign-off**: _________________ (QA Engineer)
