# DATAFORTESTINGHELPER Scenario Expansion Working Brief

## Artifact Metadata

- `schema_version: 1`
- `brief_version: 2`
- `brief_status: ready`
- `topic_slug: datafortestinghelper-scenario-expansion`
- `created_at: 2026-05-12T11:55:00-07:00`
- `updated_at: 2026-05-12T16:45:00-07:00`
- `derived_from_user_request: "成一个新的 $ww round，然后落到 helper 和 DATAFORALL 里"`

## Gate State

- `estimation_complete: true`
- `brief_status: ready`
- `brief_version: 2`

## Routing

- `task_routing: code/programming`
- `orchestrator_choice: staff engineer orchestrator`

## Core Intent

- `goal`: Add the next high-value helper-backed sleep scenarios and wire them into `DATAFORALL` so the remaining worthwhile parser/import tests stop hand-authoring scenario XML where shared helper semantics would be clearer.
- `artifact_type`: Working brief plus tracked dispatch plan for a narrow cross-repo scenario-expansion round.
- `relevant_context`: `datafortestinghelper` already powers the required parser/import/object/hook/app helper-backed lanes and now also owns curated fixture sync into `DATAFORALL`. The next worthwhile expansion is intentionally small: consume the existing `end-before-start` helper scenario in parser tests, and add two new helper scenarios that cover mixed valid+invalid import payloads and later successful import replacement.
- `constraints`: keep this round limited to the three agreed scenario moves; avoid redesigning the broader fixture catalog; preserve the principle that targeted invalid container tests and tiny object/UI tests remain inline; keep production code unchanged unless a genuine parser/import testability issue appears; treat helper and DATAFORALL writes as separate reviewed sections.
- `scenario_contract_notes`: `mixed-valid-and-invalid-records` is a failure-oriented helper scenario, not a partial-success scenario. It must contain one valid sleep record plus one invalid sleep record in the same export payload, and the intended DATAFORALL assertion is total import failure with no persistence. Helper should not define normalized `SleepRecord[]` expectations for just the valid subset in this round. `replacement-import-single-night` is a normal successful import dataset with distinct dates meant to act as the second import in a replacement-flow test, not a helper-owned repository-semantic assertion by itself.

## Risk And Structure

- `risk_lenses`: mixed-outcome fixture support may tempt implementers toward partial-success semantics that are out of scope for this round; new scenarios could accidentally encode import-side repository semantics that belong in DATAFORALL tests rather than in the fixture model; fixture sync may need a small curated-contract update if new vendored filenames are introduced; overreaching into App/UI tests would dilute the value of this round.
- `parallelism_assessment`: medium. Helper scenario work and DATAFORALL test adoption are related but can be split into a helper-owned scenario/fixture section and a DATAFORALL-owned adoption section if the helper outputs are explicit.
- `blocking_dependencies`: agreement that the round includes exactly three items:
  - adopt existing `end-before-start` in `parseAppleHealth.test.ts`
  - add `mixed-valid-and-invalid-records`
  - add `replacement-import-single-night`
- `section_or_workstream_map`:
  - helper scenario expansion: extend helper presets/tests/fixture sync contract as needed, including any curated fixture names required for DATAFORALL consumption
  - DATAFORALL test adoption: replace the remaining hand-authored parser/import cases with helper-backed fixtures sourced through the curated sync path, not manual file copying
  - verification and review: helper-focused tests, DATAFORALL-focused tests, then synthesis

## Scope Preparation

- `artifact_mappings`:
  - `artifact_id: helper-presets`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\src\scenarios\presets.ts`
  - `artifact_id: helper-sync-contract`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\src\fixtures\dataForAllFixtureSyncContract.ts`
  - `artifact_id: helper-script-tests`
    - `artifact_kind: test-files`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\tests`
  - `artifact_id: dataforall-import-test`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\features\import\importSleepData.test.ts`
  - `artifact_id: dataforall-parser-test`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\lib\parsers\apple-health\parseAppleHealth.test.ts`
  - `artifact_id: dataforall-vendored-fixtures`
    - `artifact_kind: fixture-directory`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\test\fixtures\datafortestinghelper`
- `fixture_sync_policy`: if either new scenario needs to appear in `DATAFORALL` as a vendored fixture, the helper side must update `src/fixtures/dataForAllFixtureSyncContract.ts`, then refresh `DATAFORALL` fixtures through `pnpm sync:dataforall-fixtures -- --dataforall-repo <path>`. Hand-copying new helper-managed files into `DATAFORALL` is out of scope for this round.
- `exclusive_write_scope`: one section should own helper-side scenario additions and any curated fixture-sync contract updates; another should own DATAFORALL parser/import test adoption and vendored fixture refreshes produced by the helper sync command.
- `shared_read_scope`: existing helper presets and fixture-generation scripts; current DATAFORALL helper loader/fixtures; the current parser/import tests that still carry hand-authored XML.
- `depends_on_sections`: DATAFORALL adoption depends on helper scenario outputs being defined first.
- `parallel_safe_with_sections`: not recommended until helper-side scenario outputs are stable enough to consume.

## Persona And Workflow Guidance

- `recommended_personas`: `staff engineer orchestrator` for cross-repo scoping; `test data worker` for helper scenario additions; `integration test worker` for DATAFORALL adoption; `test architecture reviewer` and `code quality reviewer` for required review loops.
- `persona_selection_notes`: this is still a code/programming problem, but the design judgment is mainly about where scenario semantics belong. Helper should own reusable sleep-data facts; DATAFORALL tests should own the application behavior they assert against those facts.
- `workflow_bindings_by_stage`: framing uses `superpowers:brainstorming`; dispatch uses `superpowers:subagent-driven-development`; scenario/test edits follow `superpowers:test-driven-development`; review uses `superpowers:requesting-code-review`; closure uses `superpowers:verification-before-completion`.
- `dispatch_recommendation`: proceed with the narrow three-item scope only. Do not fold in optional `no-sleep-records`, bad zip topology, or broader helper library expansion during this round.

## Runtime Preparation

- `required_for_goal_by_section`:
  - helper scenario expansion: required
  - DATAFORALL adoption: required
  - verification and review: required
- `review_target_strategy`: every section gets the same explicit two-stage review pattern as prior `$ww` rounds: `spec-review` first, then `code-quality-review`, followed by orchestrator synthesis and human judgment.
- `controller_semantics_notes`: this is a fresh `$ww` round with its own approval gate. No subagent launch should occur until the dispatch plan is approved.
