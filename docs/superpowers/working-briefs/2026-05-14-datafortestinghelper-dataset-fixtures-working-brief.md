# DATAFORTESTINGHELPER Dataset Fixtures Working Brief

## Artifact Metadata

- `schema_version: 1`
- `brief_version: 3`
- `brief_status: ready`
- `topic_slug: datafortestinghelper-dataset-fixtures`
- `created_at: 2026-05-14T10:20:00-07:00`
- `updated_at: 2026-05-14T11:10:00-07:00`
- `derived_from_user_request: "现在 dataforall 改进了 关于dataset 相关的feature， 生成相关的data 这样就可以更好的test"`

## Gate State

- `estimation_complete: true`
- `brief_status: ready`
- `brief_version: 3`

## Routing

- `task_routing: code/programming`
- `orchestrator_choice: staff engineer orchestrator`

## Core Intent

- `goal`: Extend `datafortestinghelper` so it can generate dataset-oriented test fixtures and expected artifacts that let `DATAFORALL` test the dataset import/workspace flows with shared, reusable data instead of hand-authored inline files.
- `artifact_type`: Working brief plus tracked dispatch plan for a narrow cross-repo dataset-fixture expansion round.
- `relevant_context`: `DATAFORALL` now has a dataset-first workspace with `importDatasetFile`, structured-file adapters, dataset restore flows, and `App` dataset shell integration. `datafortestinghelper` already covers Apple Health sleep scenarios and curated fixture sync into `DATAFORALL`, but it does not yet provide reusable dataset-level fixtures for structured JSON/TXT imports or expected dataset metadata artifacts.
- `constraints`: keep this round limited to dataset-oriented test data generation and adoption; do not redesign `DATAFORALL` production dataset models; preserve the principle that small contract tests such as `buildDatasetSummary.test.ts`, `detectImportSource.test.ts`, and `datasetRepository.test.ts` remain inline; keep review coverage on every section; prefer deterministic helper outputs so synced fixtures do not churn across runs.
- `product_direction`: treat this round as building one clean canonical dataset-import story per connector family, not as building an exhaustive fixture matrix.
- `dataset_contract_notes`: this round should introduce helper-owned dataset scenarios in three families only:
  - `apple-health-sleep-dataset`: helper-backed file input plus expected dataset metadata and linked sleep records
  - `structured-json-dataset`: helper-backed `.json` input plus expected dataset artifact metadata
  - `structured-txt-dataset`: helper-backed `.txt` input plus expected dataset artifact metadata
  The helper contract should describe file content and expected import artifacts, not higher-level workspace selection or repository behavior.
- `first_batch_contract_details`:
  - `apple-health-sleep-dataset` should reuse existing helper-backed sleep fixtures as the source of truth where possible, then layer expected dataset artifact fields on top:
    - expected `connectorType`, `sourceType`, `detailKind`
    - expected `datasetName`
    - expected `fileInfo.detectedType`
    - expected `stats`
    - expected `previewSummary`
    - expected `schemaSummary`
    - expected linked `sleepRecords`
  - `structured-json-dataset` should provide a stable small JSON input and expected dataset artifact only. It should not introduce ZIP-wrapped JSON or CSV in this round.
  - `structured-txt-dataset` should provide a stable small TXT input and expected dataset artifact only. It should not introduce ZIP-wrapped TXT in this round.
- `golden_path_definition`:
  - one Apple Health dataset fixture family proves the health dataset import story end-to-end
  - one JSON dataset fixture family proves the structured-file dataset story end-to-end
  - one TXT dataset fixture family proves the lightweight text dataset story end-to-end
  - every family should have one canonical, human-readable fixture name and one canonical expected artifact shape
  - this round optimizes for clarity and reuse, not maximum connector coverage

## Risk And Structure

- `risk_lenses`: the biggest design risk is letting helper start encoding app/workspace semantics instead of reusable dataset facts; structured-file fixtures could become too broad if this round tries to cover every connector/zip variant; nondeterministic fixture metadata would recreate the sync churn that was just fixed for sleep fixtures; overreaching into low-level contract tests would dilute the value of shared dataset fixtures.
- `parallelism_assessment`: medium. Helper-side dataset fixture generation must land first, but once the helper contract and curated sync outputs are explicit, DATAFORALL adoption can proceed as a separate reviewed section.
- `blocking_dependencies`: agreement that this round is limited to:
  - helper support for dataset-oriented fixture scenarios and expected import artifacts
  - adoption into `importDatasetFile.test.ts`
  - a narrow import-facing adoption slice in `useDatasetWorkspace.test.tsx`
  - a narrow import-facing adoption slice in selected `App.test.tsx` dataset flows
- `explicit_non_goals`:
  - no CSV fixture family in this round
  - no ZIP-wrapped structured-file fixtures in this round
  - no changes to `buildDatasetSummary.ts` or its tests
  - no changes to `detectImportSource.ts` or its tests
  - no changes to dataset repository implementation or tests
  - no attempt to move every dataset assertion into helper-backed expectations
  - no second fixture variant per connector family just to cover formatting trivia
- `section_or_workstream_map`:
  - helper dataset fixtures: add helper-side dataset scenario contract, preset fixtures, deterministic artifact generation, and curated sync entries for only the dataset files that DATAFORALL will actually consume in this round
  - DATAFORALL import-pipeline adoption: replace the current inline dataset files and expected artifact shapes in `importDatasetFile.test.ts` with helper-backed fixtures
  - DATAFORALL workspace-and-app adoption: reuse helper-backed dataset fixtures only in the agreed import-facing tests in `useDatasetWorkspace.test.tsx` and `App.test.tsx`
  - verification and review: helper-focused tests, DATAFORALL-focused tests, then synthesis
- `decision_rule`: if a proposed fixture or assertion does not strengthen the canonical dataset-import story across more than one surface, it should not enter this round.

## Scope Preparation

- `artifact_mappings`:
  - `artifact_id: helper-dataset-domain`
    - `artifact_kind: source-files`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\src\domain`
  - `artifact_id: helper-dataset-presets`
    - `artifact_kind: source-files`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\src\scenarios`
  - `artifact_id: helper-dataset-renderers`
    - `artifact_kind: source-files`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\src\renderers`
  - `artifact_id: helper-sync-contract`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\src\fixtures\dataForAllFixtureSyncContract.ts`
  - `artifact_id: helper-tests`
    - `artifact_kind: test-files`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\tests`
  - `artifact_id: dataforall-import-dataset-test`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\lib\import\importDatasetFile.test.ts`
  - `artifact_id: dataforall-workspace-test`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\features\workspace\useDatasetWorkspace.test.tsx`
  - `artifact_id: dataforall-app-test`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\App.test.tsx`
  - `artifact_id: dataforall-vendored-fixtures`
    - `artifact_kind: fixture-directory`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\test\fixtures\datafortestinghelper`
- `fixture_sync_policy`: if new dataset fixtures need to appear in `DATAFORALL`'s vendored helper fixture directory, the helper side must extend the existing curated sync contract and refresh the target directory through `pnpm sync:dataforall-fixtures -- --dataforall-repo <path>`. Hand-copying helper-managed dataset fixtures into `DATAFORALL` is out of scope.
- `adoption_priority_notes`:
  - `importDatasetFile.test.ts` is the first required landing zone and should consume all three first-batch dataset fixture families. This file is the source-of-truth proving ground for helper-owned expected dataset artifacts.
  - `useDatasetWorkspace.test.tsx` should add or replace only import-facing tests that become clearer by sharing the same canonical fixtures. The existing restore-first tests should stay manual unless a test is directly asserting imported file semantics.
  - `App.test.tsx` should adopt helper-backed dataset fixtures only for the current inline import flows:
    - `imports Apple Health sleep data into the workspace library and shows sleep details`
    - `imports JSON datasets into the library without rendering sleep-only surfaces`
  - TXT app-level adoption is optional in this round and should be skipped unless it clearly improves the canonical workspace story.
- `exclusive_write_scope`: one section should own helper-side dataset scenario additions, deterministic renderers, tests, and curated sync updates; another should own DATAFORALL test adoption and vendored fixture refreshes produced by the helper sync flow.
- `shared_read_scope`: existing sleep helper presets and curated sync implementation; current `DATAFORALL` dataset import/workspace/app tests; dataset schema and import artifact types in `DATAFORALL`.
- `depends_on_sections`: DATAFORALL adoption depends on helper dataset fixture outputs being defined first.
- `parallel_safe_with_sections`: not recommended until helper dataset artifacts and filenames are stable.

## Persona And Workflow Guidance

- `recommended_personas`: `staff engineer orchestrator` for cross-repo scoping; `test data worker` for helper dataset fixture additions; `integration test worker` for DATAFORALL adoption; `test architecture reviewer` and `code quality reviewer` for required review loops.
- `persona_selection_notes`: the key design question is where dataset expectations belong. Helper should own reusable file content and expected import artifacts; `DATAFORALL` tests should still own workspace behavior, selection logic, and restore semantics.
- `workflow_bindings_by_stage`: framing uses `superpowers:brainstorming`; dispatch uses `superpowers:subagent-driven-development`; fixture/test edits follow `superpowers:test-driven-development`; review uses `superpowers:requesting-code-review`; closure uses `superpowers:verification-before-completion`.
- `dispatch_recommendation`: proceed with a narrow three-target adoption round only. Do not fold in `buildDatasetSummary`, `detectImportSource`, `datasetRepository`, or broader connector/zip expansion during this round.

## Runtime Preparation

- `required_for_goal_by_section`:
  - helper dataset fixtures: required
  - DATAFORALL dataset adoption: required
  - verification and review: required
- `review_target_strategy`: every section gets the same explicit two-stage review pattern used in prior `$ww` rounds: `spec-review` first, then `code-quality-review`, followed by orchestrator synthesis and human judgment.
- `controller_semantics_notes`: this is a fresh `$ww` round with its own approval gate. No subagent launch should occur until the dispatch plan is approved.
