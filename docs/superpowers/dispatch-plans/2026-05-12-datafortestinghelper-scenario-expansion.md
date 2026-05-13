# Dispatch Plan: datafortestinghelper-scenario-expansion

- Date: 2026-05-12
- Schema Version: 1
- Plan Revision: 2
- Working Brief Version: 2
- Plan State: completed
- Last Approved Revision: none
- Rollback Baseline Revision: none
- Task Routing: code/programming
- Main Orchestrator: staff engineer orchestrator

## Preconditions

- Estimation Complete: true
- Working Brief Status: ready

> Do not launch any real subagent until the preconditions are satisfied and `Plan State: approved`.

## Source Context

- User Request: `成一个新的 $ww round，然后落到 helper 和 DATAFORALL 里`
- Working Brief Reference: `docs/superpowers/working-briefs/2026-05-12-datafortestinghelper-scenario-expansion-working-brief.md`
- Artifact Registry Reference: `not present; using inline artifact mappings from the working brief`

## Dispatch Summary

- Goal: add the next three high-value helper-backed sleep scenario moves across helper and `DATAFORALL`: adopt `end-before-start` in parser tests, add `mixed-valid-and-invalid-records`, and add `replacement-import-single-night`.
- Relevant Context: helper-backed coverage is already established for the main sleep testing lanes, curated fixture sync is in place, and the new round should use that sync path if new vendored helper fixtures are needed in DATAFORALL.
- Constraints: preserve inline targeted zip/container and tiny object/UI tests; keep production code unchanged unless a real testability issue appears; keep scope to the three agreed scenario moves; treat `mixed-valid-and-invalid-records` as a failure-oriented scenario with no partial-success normalized expectation; route any new vendored helper fixtures through the curated sync contract and sync command rather than manual copying; review helper-side and DATAFORALL-side work independently.
- Risks: helper scenario shape may still need careful extension for mixed-outcome fixtures even with failure semantics pinned down; fixture sync may need a curated manifest update if the new scenarios are vendored; DATAFORALL tests could become less readable if scenario adoption is too indirect.
- Reviewer Rule: Every section returns to the orchestrator before human judgment.

## Planned Sections

### Section: Helper Scenario Expansion

- Section ID: `helper-scenarios`
- Section State: completed
- Runtime State: completed
- Required For Goal: true
- Draft Author Role: `test data worker`
- Planned Reviewer Persona: `code quality reviewer`
- Planned Specialist Personas: `none`
- Planned Scope: add the new helper scenario definitions and any supporting fixture-generation or curated-sync updates needed to expose them safely to DATAFORALL.
- Planning Rationale: helper must first own the new scenario facts before DATAFORALL can adopt them cleanly.
- Scenario Contract Notes: `mixed-valid-and-invalid-records` must be modeled as a failure-oriented export containing one valid sleep record plus one invalid sleep record, with no helper-owned partial-success normalized expectation. `replacement-import-single-night` must be a successful one-night dataset with dates distinct from the existing single-night preset so DATAFORALL can use it as the later import in a replacement-flow assertion.
- Planned Workflow Bindings: `superpowers:subagent-driven-development`, `superpowers:test-driven-development`, `superpowers:requesting-code-review`
- Planned Review Lanes:
  - Lane ID: `helper-scenarios-spec-review`
  - Lane Type: `spec-review`
  - Reviewer Persona: `test architecture reviewer`
  - Required: true
  - Lane ID: `helper-scenarios-code-review`
  - Lane Type: `code-quality-review`
  - Reviewer Persona: `code quality reviewer`
  - Required: true
- Scope Declarations:
  - `exclusive_write_scope`:
    - `artifact_id: helper-presets`
    - `artifact_id: helper-sync-contract`
    - `artifact_id: helper-script-tests`
  - `shared_read_scope`:
    - `artifact_id: dataforall-import-test`
    - `artifact_id: dataforall-parser-test`
  - `depends_on_sections`: none
  - `parallel_safe_with_sections`: none
  - `artifact_mappings`:
    - `artifact_id: helper-presets`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\src\scenarios\presets.ts`
    - `section_anchors:`
    - `artifact_id: helper-sync-contract`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\src\fixtures\dataForAllFixtureSyncContract.ts`
    - `section_anchors:`
    - `artifact_id: helper-script-tests`
    - `artifact_kind: test-files`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\tests`
    - `section_anchors:`
- Packet Created: true

### Section: DATAFORALL Adoption

- Section ID: `dataforall-adoption`
- Section State: completed
- Runtime State: completed
- Required For Goal: true
- Draft Author Role: `integration test worker`
- Planned Reviewer Persona: `code quality reviewer`
- Planned Specialist Personas: `none`
- Planned Scope: replace the agreed parser/import hand-authored XML cases with helper-backed fixtures and refresh the vendored fixture set through the curated sync path if needed.
- Planning Rationale: once helper exposes the scenarios, DATAFORALL should consume them at the parser/import layer where the scenario semantics add the most value.
- Fixture Refresh Notes: if new helper-managed fixtures are needed under `src/test/fixtures/datafortestinghelper`, this section must consume them by running the helper sync flow rather than manually copying files into DATAFORALL.
- Planned Workflow Bindings: `superpowers:subagent-driven-development`, `superpowers:test-driven-development`, `superpowers:requesting-code-review`
- Planned Review Lanes:
  - Lane ID: `dataforall-adoption-spec-review`
  - Lane Type: `spec-review`
  - Reviewer Persona: `test architecture reviewer`
  - Required: true
  - Lane ID: `dataforall-adoption-code-review`
  - Lane Type: `code-quality-review`
  - Reviewer Persona: `code quality reviewer`
  - Required: true
- Scope Declarations:
  - `exclusive_write_scope`:
    - `artifact_id: dataforall-import-test`
    - `artifact_id: dataforall-parser-test`
    - `artifact_id: dataforall-vendored-fixtures`
  - `shared_read_scope`:
    - `artifact_id: helper-presets`
    - `artifact_id: helper-sync-contract`
  - `depends_on_sections`:
    - `helper-scenarios`
  - `parallel_safe_with_sections`: none
  - `artifact_mappings`:
    - `artifact_id: dataforall-import-test`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\features\import\importSleepData.test.ts`
    - `section_anchors:`
    - `artifact_id: dataforall-parser-test`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\lib\parsers\apple-health\parseAppleHealth.test.ts`
    - `section_anchors:`
    - `artifact_id: dataforall-vendored-fixtures`
    - `artifact_kind: fixture-directory`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\test\fixtures\datafortestinghelper`
    - `section_anchors:`
- Packet Created: true

## Ordering And Parallelism

- Blocking work first: `helper-scenarios`
- Parallel sections: none recommended until helper scenario outputs are stable
- Review loop per section: draft -> reviewer findings -> orchestrator synthesis -> human judgment

## Approval Block

- Required Human Choice: `Approve` | `Revise` | `Stop`
- Current Choice: Approve
- Approved By: user
- Approval Time: 2026-05-12T16:50:00-07:00
- Notes: this round is intentionally limited to the three agreed scenario moves and does not include broader helper-library or UI-test expansion.
- Choice Mapping:
  - Approve -> `Plan State: approved`
  - Revise -> `Plan State: revising`
  - Stop -> `Plan State: stopped`

## Revision History

- Revision 1 Created From Brief Version: 1
- Revision Reason: initial framing for the next narrow helper-backed scenario expansion round
- Supersedes Revision:
- Revision 2 Created From Brief Version: 2
- Revision Reason: lock down mixed-scenario semantics, complete artifact mappings, and require curated sync for any new DATAFORALL vendored fixtures
- Supersedes Revision: 1

## Dispatch Log

- Agents Launched: `helper-scenarios-spec-review`, `helper-scenarios-code-review`, `dataforall-adoption-spec-review`, `dataforall-adoption-code-review`
- Retry Events:
- Close Events:
- Review Lane Transitions: `helper-scenarios` spec-review approved; `helper-scenarios` code-quality-review approved; `dataforall-adoption` spec-review approved; `dataforall-adoption` code-quality-review approved
- Launch Time: 2026-05-12T16:50:00-07:00
- Revisions Since Approval:
- Stop State Preserves Files: true
- No Launch Before Approval: true
- Result Artifact Location Source: latest active attempt record
