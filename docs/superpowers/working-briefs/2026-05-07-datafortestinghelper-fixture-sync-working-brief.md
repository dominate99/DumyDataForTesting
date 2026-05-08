# DATAFORTESTINGHELPER Fixture Sync Working Brief

## Artifact Metadata

- `schema_version: 1`
- `brief_version: 1`
- `brief_status: ready`
- `topic_slug: datafortestinghelper-fixture-sync`
- `created_at: 2026-05-07T23:05:00-07:00`
- `updated_at: 2026-05-07T23:05:00-07:00`
- `derived_from_user_request: "开下一轮 $ww 做“自动化 fixture 同步”"`

## Gate State

- `estimation_complete: true`
- `brief_status: ready`
- `brief_version: 1`

## Routing

- `task_routing: code/programming`
- `orchestrator_choice: staff engineer orchestrator`

## Core Intent

- `goal`: Define and execute a safe automation path that syncs the curated helper-generated sleep fixtures from `datafortestinghelper` into the vendored `DATAFORALL/src/test/fixtures/datafortestinghelper` directory, so future test expansion does not depend on manual copy and rename work.
- `artifact_type`: Working brief plus tracked dispatch plan for a cross-repo fixture-sync automation round.
- `relevant_context`: `datafortestinghelper` already generates a full `generated-fixtures` set with hashed filenames and manifests, while `DATAFORALL` currently vendors a hand-picked subset with stable consumer-facing names such as `single-valid-night.zip` and `two-valid-nights.xml`. The helper-backed parser/import/object/hook/app test lanes are now in place, so fixture drift and manual sync toil are the next maintenance risk.
- `constraints`: keep the automation explicit and reviewable; avoid destructive deletion outside the intended vendored fixture directory; prefer a curated sync contract over copying every generated artifact; preserve the stable filenames that `DATAFORALL` tests already consume unless there is a compelling reason to migrate them; keep network access unnecessary; expect implementation to touch both repos only in narrowly scoped files and docs.

## Risk And Structure

- `risk_lenses`: blindly syncing all generated fixtures into `DATAFORALL` would create noise and maintenance burden; coupling `DATAFORALL` tests to hashed helper output names would make fixtures less legible; deletion logic could accidentally remove manually owned files; cross-repo path assumptions may be brittle if the two repos move independently; documentation-only changes without executable automation would not solve the real maintenance problem.
- `parallelism_assessment`: medium. The work can likely split into a contract/selection section and an implementation/documentation section, but any file-writing automation should have a single owner to avoid conflicting edits.
- `blocking_dependencies`: agreement on whether the sync source of truth lives as a manifest/config in `datafortestinghelper`; agreement that the target is the existing vendored fixture directory in `DATAFORALL`; agreement that this round should automate only the current curated subset, not redesign fixture naming across both repos.
- `section_or_workstream_map`:
  - sync contract: define which helper scenarios and output types belong in `DATAFORALL`
  - sync automation: add a script or command that copies curated outputs into the vendored `DATAFORALL` fixture directory with stable names
  - docs and verification: document the workflow and prove the sync can run safely and deterministically

## Scope Preparation

- `artifact_mappings`:
  - `artifact_id: helper-package-json`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\package.json`
  - `artifact_id: helper-generate-script`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\scripts\generate-fixtures.ts`
  - `artifact_id: helper-readme`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\README.md`
  - `artifact_id: helper-generated-fixtures`
    - `artifact_kind: fixture-directory`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\generated-fixtures`
  - `artifact_id: dataforall-vendored-fixtures`
    - `artifact_kind: fixture-directory`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\test\fixtures\datafortestinghelper`
  - `artifact_id: dataforall-helper-loader`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-04-25\ww-subagent-orchestrator-c-users-domin\DATAFORALL\src\test\datafortestinghelper.ts`
- `exclusive_write_scope`: one implementation section should own any new sync script and helper-side configuration; documentation updates may run separately if they do not rewrite the same files.
- `shared_read_scope`: helper fixture manifests, helper preset scenario ids, the current vendored DATAFORALL fixture set, and the existing helper loader that encodes the consumer-facing path contract.
- `depends_on_sections`: docs and verification depend on the chosen sync contract; script implementation depends on the contract being explicit.
- `parallel_safe_with_sections`: contract review can run separately from implementation drafting, but not in parallel with the final script write if both need to modify the same configuration artifact.

## Persona And Workflow Guidance

- `recommended_personas`: `staff engineer orchestrator` for scoping and safety constraints; `tooling worker` for script/config implementation; `test architecture reviewer` for contract alignment; `code quality reviewer` for filesystem safety and maintainability.
- `persona_selection_notes`: this is a tooling-and-test-infrastructure problem. The core design judgment is less about algorithmic complexity and more about choosing a safe source of truth and preventing silent drift between repos.
- `workflow_bindings_by_stage`: framing uses `superpowers:brainstorming`; dispatch uses `superpowers:subagent-driven-development`; script work follows `superpowers:test-driven-development`; review uses `superpowers:requesting-code-review`; closure uses `superpowers:verification-before-completion`.
- `dispatch_recommendation`: proceed, but keep the round focused on curated fixture sync only. Do not expand the scenario library or redesign test coverage during the same round.

## Runtime Preparation

- `required_for_goal_by_section`:
  - sync contract: required
  - sync automation: required
  - docs and verification: required
- `review_target_strategy`: every section gets the same explicit two-stage review pattern as the previous rounds: `spec-review` first, then `code-quality-review`, followed by orchestrator synthesis and human judgment.
- `controller_semantics_notes`: this is a fresh `$ww` round with a new approval gate. No subagent launch should occur until the new dispatch plan is approved.
