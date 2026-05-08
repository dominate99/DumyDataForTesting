# Dispatch Plan: datafortestinghelper-fixture-sync

- Date: 2026-05-07
- Schema Version: 1
- Plan Revision: 1
- Working Brief Version: 1
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

- User Request: `开下一轮 $ww 做“自动化 fixture 同步”`
- Working Brief Reference: `docs/superpowers/working-briefs/2026-05-07-datafortestinghelper-fixture-sync-working-brief.md`
- Artifact Registry Reference: `not present; using inline artifact mappings from the working brief`

## Dispatch Summary

- Goal: automate a safe, curated sync from `datafortestinghelper/generated-fixtures` into `DATAFORALL/src/test/fixtures/datafortestinghelper`, so the consumer repo can refresh helper-backed fixtures without manual copy work.
- Relevant Context: helper generation already exists and is deterministic, but `DATAFORALL` currently vendors only a stable, human-named subset of the generated outputs. That gap is now a maintenance hotspot because helper-backed coverage has expanded across parser, import, object, hook, and app layers.
- Constraints: preserve stable fixture names in `DATAFORALL`; avoid copying the entire generated output set unless explicitly selected; keep deletion logic scoped to managed vendored files only; keep reviewability high; avoid changing production code or widening test scope during this tooling round.
- Risks: an unsafe sync script could overwrite or delete the wrong files; a weak contract could allow drift between generated filenames and vendored filenames; cross-repo path assumptions could make the script brittle on another machine; documentation may lag behind implementation if ownership is split poorly.
- Reviewer Rule: Every section returns to the orchestrator before human judgment.

## Planned Sections

### Section: Curated Sync Contract

- Section ID: `sync-contract`
- Section State: accepted
- Runtime State: complete
- Required For Goal: true
- Draft Author Role: `tooling worker`
- Planned Reviewer Persona: `code quality reviewer`
- Planned Specialist Personas: `none`
- Planned Scope: define the source-of-truth mapping between helper scenario outputs and the stable vendored filenames that `DATAFORALL` should consume.
- Planning Rationale: the sync script is only safe if there is an explicit contract saying which files are managed, where they come from, and what their stable target names should be.
- Planned Workflow Bindings: `superpowers:subagent-driven-development`, `superpowers:test-driven-development`, `superpowers:requesting-code-review`
- Planned Review Lanes:
  - Lane ID: `sync-contract-spec-review`
  - Lane Type: `spec-review`
  - Reviewer Persona: `test architecture reviewer`
  - Required: true
  - Lane ID: `sync-contract-code-review`
  - Lane Type: `code-quality-review`
  - Reviewer Persona: `code quality reviewer`
  - Required: true
- Scope Declarations:
  - `exclusive_write_scope`:
    - `artifact_id: helper-generate-script`
    - `artifact_id: helper-package-json`
  - `shared_read_scope`:
    - `artifact_id: helper-generated-fixtures`
    - `artifact_id: dataforall-vendored-fixtures`
    - `artifact_id: dataforall-helper-loader`
  - `depends_on_sections`: none
  - `parallel_safe_with_sections`: none
  - `artifact_mappings`:
    - `artifact_id: helper-generate-script`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\scripts\generate-fixtures.ts`
    - `section_anchors:`
- Packet Created: true

### Section: Sync Automation And Docs

- Section ID: `sync-automation`
- Section State: accepted
- Runtime State: complete
- Required For Goal: true
- Draft Author Role: `tooling worker`
- Planned Reviewer Persona: `code quality reviewer`
- Planned Specialist Personas: `none`
- Planned Scope: implement the sync command and document how to use it, including safety expectations and any required local path assumptions.
- Planning Rationale: the contract only matters if developers can run one clear command and understand what it will update.
- Planned Workflow Bindings: `superpowers:subagent-driven-development`, `superpowers:test-driven-development`, `superpowers:requesting-code-review`
- Planned Review Lanes:
  - Lane ID: `sync-automation-spec-review`
  - Lane Type: `spec-review`
  - Reviewer Persona: `test architecture reviewer`
  - Required: true
  - Lane ID: `sync-automation-code-review`
  - Lane Type: `code-quality-review`
  - Reviewer Persona: `code quality reviewer`
  - Required: true
- Scope Declarations:
  - `exclusive_write_scope`:
    - `artifact_id: helper-readme`
    - `artifact_id: helper-package-json`
  - `shared_read_scope`:
    - `artifact_id: helper-generate-script`
    - `artifact_id: helper-generated-fixtures`
    - `artifact_id: dataforall-vendored-fixtures`
  - `depends_on_sections`:
    - `sync-contract`
  - `parallel_safe_with_sections`: none
  - `artifact_mappings`:
    - `artifact_id: helper-readme`
    - `artifact_kind: source-file`
    - `artifact_path: C:\Users\domin\Documents\Codex\2026-05-06\datafortestinghelper-project-dataforall-test-data\README.md`
    - `section_anchors:`
- Packet Created: true

## Ordering And Parallelism

- Blocking work first: `sync-contract`
- Parallel sections: none recommended until the managed-file contract is explicit
- Review loop per section: draft -> reviewer findings -> orchestrator synthesis -> human judgment

## Approval Block

- Required Human Choice: `Approve` | `Revise` | `Stop`
- Current Choice: Approve
- Approved By: user
- Approval Time: 2026-05-07
- Notes: this round is limited to curated fixture-sync automation and its documentation. It does not include broader helper scenario expansion or new DATAFORALL coverage work.
- Choice Mapping:
  - Approve -> `Plan State: approved`
  - Revise -> `Plan State: revising`
  - Stop -> `Plan State: stopped`

## Revision History

- Revision 1 Created From Brief Version: 1
- Revision Reason: initial framing for curated helper-to-DATAFORALL fixture-sync automation
- Supersedes Revision:

## Dispatch Log

- Agents Launched:
  - `sync-contract` implementer: `019e0658-61c5-76f2-9e04-0240e70d11c8`
- Retry Events:
- Close Events:
- Review Lane Transitions:
  - `sync-contract-spec-review`: APPROVED
  - `sync-contract-code-review`: NEEDS_REVISION -> fixed -> APPROVED
  - `sync-automation-spec-review`: APPROVED
  - `sync-automation-code-review`: NEEDS_REVISION -> fixed -> NEEDS_REVISION -> fixed -> APPROVED
- Launch Time: 2026-05-07
- Revisions Since Approval:
- Stop State Preserves Files: true
- No Launch Before Approval: true
- Result Artifact Location Source: latest active attempt record
