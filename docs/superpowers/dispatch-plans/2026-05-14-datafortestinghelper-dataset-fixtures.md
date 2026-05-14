# Dispatch Plan: datafortestinghelper-dataset-fixtures

- Date: 2026-05-14
- Schema Version: 1
- Plan Revision: 3
- Working Brief Version: 3
- Plan State: approved
- Last Approved Revision: none
- Rollback Baseline Revision: none
- Task Routing: code/programming
- Main Orchestrator: staff engineer orchestrator

## Preconditions

- Estimation Complete: true
- Working Brief Status: ready

> Do not launch any real subagent until the preconditions are satisfied and `Plan State: approved`.

## Source Context

- User Request: `现在 dataforall 改进了 关于dataset 相关的feature， 生成相关的data 这样就可以更好的test`
- Working Brief Reference: `docs/superpowers/working-briefs/2026-05-14-datafortestinghelper-dataset-fixtures-working-brief.md`
- Artifact Registry Reference: `not present; using inline artifact mappings from the working brief`

## Dispatch Summary

- Goal: extend `datafortestinghelper` with a small, beautiful set of canonical dataset fixtures and expected import artifacts, then drive them through the most important `DATAFORALL` dataset import/workspace/app tests.
- Relevant Context: `DATAFORALL` now has dataset-first flows for Apple Health, JSON, and TXT inputs, but the current tests still rely on hand-authored inline files and inline dataset metadata expectations. Helper-backed fixtures can now remove duplication across `importDatasetFile`, workspace restore, and app-level dataset flows.
- Constraints: keep scope limited to one canonical fixture family each for Apple Health sleep, JSON, and TXT; do not add CSV or ZIP-wrapped structured-file fixture families in this round; leave `buildDatasetSummary.test.ts`, `detectImportSource.test.ts`, and `datasetRepository.test.ts` inline; keep production code unchanged unless a real testability issue appears; route any new vendored dataset fixtures through the existing curated sync flow; split DATAFORALL adoption into an import-pipeline section and a narrower workspace/app section so review targets stay crisp.
- Risks: helper may drift into app semantics instead of reusable dataset import artifacts; structured-file fixtures may become too broad if every connector edge case is attempted in one round; nondeterministic generated artifacts would cause fixture churn; DATAFORALL adoption could become unreadable if helper expectations are too indirect.
- Product Standard: prefer one canonical fixture that many tests share over many slightly different fixtures that each explain only one test.
- Reviewer Rule: Every section returns to the orchestrator before human judgment.

## Planned Sections

### Section: Helper Dataset Fixtures

- Section ID: `helper-dataset-fixtures`
- Section State: drafted
- Runtime State: queued
- Required For Goal: true
- Draft Author Role: `test data worker`
- Planned Reviewer Persona: `code quality reviewer`
- Planned Specialist Personas: `none`
- Planned Scope: add helper-side dataset scenario contracts, presets, deterministic file/artifact renderers, and any curated sync updates needed to expose the new dataset fixtures safely to `DATAFORALL`.
- Planning Rationale: helper must own the reusable dataset files and expected import artifacts before DATAFORALL can consume them cleanly.
- Scenario Contract Notes:
  - Apple Health dataset fixtures should derive from existing sleep fixtures plus expected dataset metadata and linked `sleepRecords`.
  - Structured JSON/TXT dataset fixtures should describe the input file and expected dataset artifact only; they should not encode workspace selection or repository assertions.
  - Helper outputs must stay deterministic across repeated generation runs.
  - This section does not add CSV fixtures or ZIP-wrapped structured-file fixtures.
  - This section should produce canonical names that read like product fixtures, not low-level parser cases.
- Planned Workflow Bindings: `superpowers:subagent-driven-development`, `superpowers:test-driven-development`, `superpowers:requesting-code-review`
- Planned Review Lanes:
  - Lane ID: `helper-dataset-fixtures-spec-review`
  - Lane Type: `spec-review`
  - Reviewer Persona: `test architecture reviewer`
  - Required: true
  - Lane ID: `helper-dataset-fixtures-code-review`
  - Lane Type: `code-quality-review`
  - Reviewer Persona: `code quality reviewer`
  - Required: true
- Scope Declarations:
  - `exclusive_write_scope`:
    - `artifact_id: helper-dataset-domain`
    - `artifact_id: helper-dataset-presets`
    - `artifact_id: helper-dataset-renderers`
    - `artifact_id: helper-sync-contract`
    - `artifact_id: helper-tests`
  - `shared_read_scope`:
    - `artifact_id: dataforall-import-dataset-test`
    - `artifact_id: dataforall-workspace-test`
    - `artifact_id: dataforall-app-test`
  - `depends_on_sections`: none
  - `parallel_safe_with_sections`: none
  - `artifact_mappings`:
    - `artifact_id: helper-dataset-domain`
    - `artifact_kind: source-files`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\src\domain`
    - `section_anchors:`
    - `artifact_id: helper-dataset-presets`
    - `artifact_kind: source-files`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\src\scenarios`
    - `section_anchors:`
    - `artifact_id: helper-dataset-renderers`
    - `artifact_kind: source-files`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\src\renderers`
    - `section_anchors:`
    - `artifact_id: helper-sync-contract`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\src\fixtures\dataForAllFixtureSyncContract.ts`
    - `section_anchors:`
    - `artifact_id: helper-tests`
    - `artifact_kind: test-files`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\tests`
    - `section_anchors:`
- Packet Created: false

### Section: DATAFORALL Import Pipeline Adoption

- Section ID: `dataforall-import-pipeline-adoption`
- Section State: drafted
- Runtime State: queued
- Required For Goal: true
- Draft Author Role: `integration test worker`
- Planned Reviewer Persona: `code quality reviewer`
- Planned Specialist Personas: `none`
- Planned Scope: replace the current inline dataset file inputs and inline expected artifact shapes in `importDatasetFile.test.ts` with helper-backed fixtures and helper-backed expected artifacts for Apple Health, JSON, and TXT import paths.
- Planning Rationale: `importDatasetFile.test.ts` is the narrowest high-value consumer of the new helper dataset contract and should validate all three first-batch fixture families before broader workspace/app adoption.
- Fixture Refresh Notes: if this section needs new helper-managed files in `src/test/fixtures/datafortestinghelper`, it must consume them through the helper sync flow rather than manual copying.
- Adoption Notes:
  - This section must cover all three first-batch fixture families in `importDatasetFile.test.ts`.
  - The ambiguous ZIP failure and mocked storage-failure tests stay manual.
  - The end state should make `importDatasetFile.test.ts` read like a showcase of the dataset helper contract.
- Planned Workflow Bindings: `superpowers:subagent-driven-development`, `superpowers:test-driven-development`, `superpowers:requesting-code-review`
- Planned Review Lanes:
  - Lane ID: `dataforall-import-pipeline-adoption-spec-review`
  - Lane Type: `spec-review`
  - Reviewer Persona: `test architecture reviewer`
  - Required: true
  - Lane ID: `dataforall-import-pipeline-adoption-code-review`
  - Lane Type: `code-quality-review`
  - Reviewer Persona: `code quality reviewer`
  - Required: true
- Scope Declarations:
  - `exclusive_write_scope`:
    - `artifact_id: dataforall-import-dataset-test`
    - `artifact_id: dataforall-vendored-fixtures`
  - `shared_read_scope`:
    - `artifact_id: helper-dataset-domain`
    - `artifact_id: helper-dataset-presets`
    - `artifact_id: helper-dataset-renderers`
    - `artifact_id: helper-sync-contract`
  - `depends_on_sections`:
    - `helper-dataset-fixtures`
  - `parallel_safe_with_sections`: none
  - `artifact_mappings`:
    - `artifact_id: dataforall-import-dataset-test`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\lib\import\importDatasetFile.test.ts`
    - `section_anchors:`
    - `artifact_id: dataforall-workspace-test`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\features\workspace\useDatasetWorkspace.test.tsx`
    - `section_anchors:`
    - `artifact_id: dataforall-app-test`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\App.test.tsx`
    - `section_anchors:`
    - `artifact_id: dataforall-vendored-fixtures`
    - `artifact_kind: fixture-directory`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\test\fixtures\datafortestinghelper`
    - `section_anchors:`
- Packet Created: false

### Section: DATAFORALL Workspace And App Adoption

- Section ID: `dataforall-workspace-app-adoption`
- Section State: drafted
- Runtime State: queued
- Required For Goal: true
- Draft Author Role: `integration test worker`
- Planned Reviewer Persona: `code quality reviewer`
- Planned Specialist Personas: `none`
- Planned Scope: adopt helper-backed dataset fixtures only in the agreed import-facing slices of `useDatasetWorkspace.test.tsx` and selected `App.test.tsx` dataset flows, without rewriting restore-shell/manual DB-state tests.
- Planning Rationale: after `importDatasetFile` validates the helper contract, workspace/app tests should reuse the same dataset files where they currently inline imported file content, but direct-DB restore tests should stay manual for clarity.
- Fixture Refresh Notes: this section may reuse any vendored fixtures already introduced by prior sections, but it should not invent ad hoc fixture copies outside the helper-managed sync path.
- Adoption Notes:
  - `useDatasetWorkspace.test.tsx` should add or replace only explicit import-facing tests; the existing restore-first tests remain manual unless a test is directly asserting imported file semantics.
  - `App.test.tsx` should replace the inline Apple Health XML and inline JSON dataset import flows with helper-backed fixtures.
  - TXT app-level adoption is optional and should be skipped if it would require new production behavior or materially widen the test surface.
  - This section should improve readability of the dataset story in the UI tests, not just reduce duplication mechanically.
- Planned Workflow Bindings: `superpowers:subagent-driven-development`, `superpowers:test-driven-development`, `superpowers:requesting-code-review`
- Planned Review Lanes:
  - Lane ID: `dataforall-workspace-app-adoption-spec-review`
  - Lane Type: `spec-review`
  - Reviewer Persona: `test architecture reviewer`
  - Required: true
  - Lane ID: `dataforall-workspace-app-adoption-code-review`
  - Lane Type: `code-quality-review`
  - Reviewer Persona: `code quality reviewer`
  - Required: true
- Scope Declarations:
  - `exclusive_write_scope`:
    - `artifact_id: dataforall-workspace-test`
    - `artifact_id: dataforall-app-test`
    - `artifact_id: dataforall-vendored-fixtures`
  - `shared_read_scope`:
    - `artifact_id: helper-dataset-domain`
    - `artifact_id: helper-dataset-presets`
    - `artifact_id: helper-dataset-renderers`
    - `artifact_id: helper-sync-contract`
    - `artifact_id: dataforall-import-dataset-test`
  - `depends_on_sections`:
    - `helper-dataset-fixtures`
    - `dataforall-import-pipeline-adoption`
  - `parallel_safe_with_sections`: none
  - `artifact_mappings`:
    - `artifact_id: dataforall-workspace-test`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\features\workspace\useDatasetWorkspace.test.tsx`
    - `section_anchors:`
    - `artifact_id: dataforall-app-test`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\App.test.tsx`
    - `section_anchors:`
    - `artifact_id: dataforall-vendored-fixtures`
    - `artifact_kind: fixture-directory`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\test\fixtures\datafortestinghelper`
    - `section_anchors:`
- Packet Created: false

## Ordering And Parallelism

- Blocking work first: `helper-dataset-fixtures`
- Then: `dataforall-import-pipeline-adoption`
- Then: `dataforall-workspace-app-adoption`
- Parallel sections: none recommended until helper dataset outputs are stable
- Review loop per section: draft -> reviewer findings -> orchestrator synthesis -> human judgment

## Approval Block

- Required Human Choice: `Approve` | `Revise` | `Stop`
- Current Choice: Approve
- Approved By: user
- Approval Time: 2026-05-14T11:15:00-07:00
- Notes: this round is intentionally limited to a canonical dataset-fixture story across helper, `importDatasetFile`, a narrow import-facing slice of `useDatasetWorkspace`, and selected `App` dataset import flows. It explicitly excludes CSV fixture families, ZIP-wrapped structured-file fixtures, dataset repository refactors, and low-level summary/source-detection unit tests.
- Choice Mapping:
  - Approve -> `Plan State: approved`
  - Revise -> `Plan State: revising`
  - Stop -> `Plan State: stopped`

## Revision History

- Revision 1 Created From Brief Version: 1
- Revision Reason: initial framing for the helper-backed dataset fixture expansion round
- Supersedes Revision:
- Revision 2 Created From Brief Version: 2
- Revision Reason: tighten first-batch dataset fixture scope, adoption targets, and explicit non-goals
- Supersedes Revision: 1
- Revision 3 Created From Brief Version: 3
- Revision Reason: simplify the plan around one canonical dataset-import story per connector family and sharpen section intent
- Supersedes Revision: 2

## Dispatch Log

- Agents Launched:
- Retry Events:
- Close Events:
- Review Lane Transitions:
- Launch Time:
- Revisions Since Approval:
- Stop State Preserves Files: true
- No Launch Before Approval: true
- Result Artifact Location Source: latest active attempt record
