# DATAFORALL Helper Integration Working Brief

## Artifact Metadata

- `schema_version: 1`
- `brief_version: 2`
- `brief_status: ready`
- `topic_slug: dataforall-helper-integration`
- `created_at: 2026-05-14T01:35:00-07:00`
- `updated_at: 2026-05-14T01:48:00-07:00`
- `derived_from_user_request: "$ww make a plan to integrate the dataforall project using the test data datafortestinghelper created"`

## Gate State

- `estimation_complete: true`
- `brief_status: ready`
- `brief_version: 2`

## Routing

- `task_routing: code/programming`
- `orchestrator_choice: staff engineer orchestrator`

## Core Intent

- `goal`: Turn `datafortestinghelper` into the clearly understood default source for `DATAFORALL`'s shared realistic test data, while making the exceptions feel deliberate, minimal, and easy to explain.
- `artifact_type`: Working brief plus tracked dispatch plan for a cross-repo helper-integration planning and rollout round.
- `relevant_context`: prior rounds already integrated helper-backed sleep fixtures into `parseAppleHealth`, `importSleepData`, `useSleepImport`, `App`, and `buildSleepValueEstimate`, then added dataset fixture families for Apple Health, JSON, and TXT plus adoption in `importDatasetFile`, `useDatasetWorkspace`, and `App`. `DATAFORALL` now has meaningful helper-backed coverage, but the project still needs a sharper integration policy, a clean inventory of what is already helper-backed vs inline-by-design, and a deliberate plan for any remaining shared-scenario adoption and maintenance workflow.
- `constraints`: do not force every test to use helper; preserve inline tests where they are clearer and more local; do not redesign `DATAFORALL` production models; keep helper-managed fixture syncing curated and deterministic; every section must carry review coverage; prefer decisions that reduce long-term fixture drift and duplicated test-data authoring.
- `product_direction`: this round is about taste and clarity, not volume. There should be one obvious answer to "where should this realistic test data live?" and that answer should usually be helper.
- `north_star`: contributors should feel that helper-backed tests are the canonical product stories, and inline tests are intentionally small local contracts. If a future teammate has to stop and debate where a realistic import scenario belongs, this round has not gone far enough.
- `integration_thesis`:
  - helper-backed data is now mature enough for `DATAFORALL`'s cross-surface import stories
  - the next move is not "migrate everything"
  - the next move is "codify where helper is the source of truth, finish only the last meaningful adoptions, and make the maintenance path feel obvious"

## Risk And Structure

- `risk_lenses`: the biggest risk is tasteless integration, where helper is sprayed everywhere and the tests get more abstract instead of clearer; the second risk is timid integration, where realistic shared scenarios remain duplicated because nobody has written down the ownership boundary with conviction; the third risk is maintenance drift, where the sync path exists but does not feel like the one obvious workflow.
- `parallelism_assessment`: medium. A coverage/policy section can define the canonical helper-vs-inline boundary first; then any remaining adoption and maintenance work can branch from that contract.
- `blocking_dependencies`: alignment that this round is about integration policy and remaining high-value adoption, not a new helper feature family.
- `explicit_non_goals`:
  - no broad rewrite of every `DATAFORALL` test to helper
  - no production refactor in `DATAFORALL` unless a true testability blocker is discovered
  - no new connector family unless the coverage audit proves a real missing shared scenario
  - no attempt to replace local unit-level contract tests such as repository/source-detection/summary micro-tests that remain clearer inline
- `section_or_workstream_map`:
  - canonical contract: define the product-quality rule for when helper owns the data story and when inline tests stay local
  - last-mile adoption: finish only the remaining adoptions that make the overall testing story cleaner, not merely more uniform
  - invisible maintenance: make the sync path the natural default so contributors do not invent side workflows
- `decision_rule`: if a proposed integration step does not make the test story clearer, more teachable, or less duplicated, it does not belong in this round.

## Scope Preparation

- `artifact_mappings`:
  - `artifact_id: helper-fixture-catalog`
    - `artifact_kind: source-files`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\src\fixtures`
  - `artifact_id: helper-scenarios`
    - `artifact_kind: source-files`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\src\scenarios`
  - `artifact_id: helper-sync-script`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\scripts\sync-dataforall-fixtures.ts`
  - `artifact_id: helper-readme`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\README.md`
  - `artifact_id: dataforall-helper-test-loader`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\test\datafortestinghelper.ts`
  - `artifact_id: dataforall-sleep-tests`
    - `artifact_kind: test-files`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src`
  - `artifact_id: dataforall-dataset-tests`
    - `artifact_kind: test-files`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src`
  - `artifact_id: dataforall-vendored-helper-fixtures`
    - `artifact_kind: fixture-directory`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\test\fixtures\datafortestinghelper`
- `current_known_helper_backed_surfaces`:
  - sleep parser/import/app/value flows
  - dataset import pipeline
  - narrow dataset workspace/app import flows
- `known_inline_by_design_surfaces`:
  - tiny repository and summary contracts
  - targeted malformed zip / source-detection edge cases
  - direct restore-shell tests where hand-authored local DB setup is clearer than imported-file semantics
- `product_judgment_rule`:
  - realistic reusable import/data stories belong in helper unless there is a strong readability reason not to
  - tiny local behavior tests stay inline unless helper materially improves clarity
  - if a fixture needs a paragraph of explanation, it is probably the wrong abstraction for that test
- `audit_conclusion_on_remaining_adoption`:
  - the current audit does not identify any remaining high-value realistic sleep or dataset story that still needs helper adoption
  - the notable remaining inline cases are intentional local exceptions rather than unfinished helper integration
  - future helper adoption should reopen only if `DATAFORALL` introduces a new realistic shared story that would clearly benefit more than one test surface
- `intentional_inline_examples`:
  - malformed-container and ambiguous-source tests such as ambiguous ZIP handling and source-detection failures
  - restore-shell and local-DB setup tests whose primary subject is restoration behavior, not imported file semantics
  - tiny repository, summary, and source-detection micro-tests where helper would add indirection without adding clarity
- `exclusive_write_scope`: one section should own the integration inventory and policy artifact(s); another should own any chosen DATAFORALL adoption edits; another should own sync/maintenance docs or script touchpoints.
- `shared_read_scope`: existing helper catalog, current `DATAFORALL` helper loader, current synced fixture directory, and all current helper-backed test consumers.

## Persona And Workflow Guidance

- `recommended_personas`: `staff engineer orchestrator` for integration taste and tradeoffs; `test architecture worker` for the canonical boundary; `integration test worker` for the last-mile adoption; `maintenance workflow worker` for sync/README/documentation alignment; `test architecture reviewer` and `code quality reviewer` for each section.
- `persona_selection_notes`: the main judgment call is not implementation difficulty but product taste: what should feel canonical, what should feel local, and what future contributors should never have to think twice about.
- `workflow_bindings_by_stage`: framing uses `superpowers:brainstorming`; planning uses `superpowers:writing-plans`; any execution uses `superpowers:subagent-driven-development` and `superpowers:test-driven-development`; review uses `superpowers:requesting-code-review`; closure uses `superpowers:verification-before-completion`.
- `dispatch_recommendation`: proceed in three sharp moves: define the canonical rule, close only the last adoptions that strengthen the story, and make the maintenance path invisible enough that no one wants a workaround.

## Runtime Preparation

- `required_for_goal_by_section`:
  - integration inventory and policy: required
  - targeted remaining adoption: required
  - sync and maintenance integration: required
- `review_target_strategy`: every section gets `spec-review` and `code-quality-review`, followed by orchestrator synthesis and human judgment.
- `controller_semantics_notes`: this is a new `$ww` round. No dispatch should happen until the new integration plan is explicitly approved.
