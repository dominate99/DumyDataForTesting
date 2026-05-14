# Dispatch Plan: dataforall-helper-integration

- Date: 2026-05-14
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

- User Request: `$ww make a plan to integrate the dataforall project using the test data datafortestinghelper created`
- Working Brief Reference: `docs/superpowers/working-briefs/2026-05-14-dataforall-helper-integration-working-brief.md`
- Artifact Registry Reference: `not present; using inline artifact mappings from the working brief`

## Dispatch Summary

- Goal: make `DATAFORALL`'s relationship with `datafortestinghelper` feel inevitable: helper owns the shared realistic data stories, inline tests stay intentionally local, and the sync path feels like the one obvious way to maintain that contract.
- Relevant Context: `DATAFORALL` already consumes helper-backed sleep fixtures across parser/import/hook/app/value surfaces and now consumes helper-backed dataset fixtures across import pipeline and narrow workspace/app flows. The remaining challenge is integration discipline: knowing what is already helper-backed, what should remain inline, what still deserves migration, and how fixture updates should move from helper into `DATAFORALL`.
- Constraints: do not migrate every test just for consistency theater; preserve inline tests where they are simpler and more local; avoid production changes unless a real testability blocker appears; route helper-managed fixture updates through the curated sync path; keep each section reviewable and scoped.
- Risks: over-migrating low-value local tests into indirect fixture usage; leaving the helper-vs-inline boundary implicit so future contributors reintroduce duplicated hand-authored realistic data; documenting policy without actually addressing the last meaningful adoption gaps; or changing the maintenance path without fresh verification.
- Product Standard: the integration should feel inevitable and tasteful, not comprehensive. Shared product stories use helper. Local contracts stay local. If a migration makes the test harder to explain, it is the wrong move.
- Reviewer Rule: every section returns to the orchestrator before human judgment.

## Planned Sections

### Section: Canonical Contract

- Section ID: `canonical-contract`
- Section State: accepted
- Runtime State: complete
- Required For Goal: true
- Draft Author Role: `test architecture worker`
- Planned Reviewer Persona: `code quality reviewer`
- Planned Specialist Personas: `none`
- Planned Scope: produce the canonical helper-vs-inline rule set, a clean ledger of what is already helper-backed, and a short, opinionated list of what still deserves migration.
- Planning Rationale: before any more code changes, the project needs one crisp answer to "where does this realistic test data belong?" without caveats or style drift.
- Expected Outputs:
  - a coverage ledger or maintained doc fragment that maps helper fixture families to current `DATAFORALL` consumers
  - an explicit "helper owns this / inline owns that" rule set
  - a short list of still-worthwhile adoptions, if any remain after the audit
- Planned Workflow Bindings: `superpowers:subagent-driven-development`, `superpowers:requesting-code-review`
- Planned Review Lanes:
  - Lane ID: `canonical-contract-spec-review`
  - Lane Type: `spec-review`
  - Reviewer Persona: `test architecture reviewer`
  - Required: true
  - Lane ID: `canonical-contract-code-review`
  - Lane Type: `code-quality-review`
  - Reviewer Persona: `code quality reviewer`
  - Required: true
- Scope Declarations:
  - `exclusive_write_scope`:
    - `artifact_id: helper-readme`
    - `artifact_id: dataforall-helper-test-loader`
  - `shared_read_scope`:
    - `artifact_id: helper-fixture-catalog`
    - `artifact_id: helper-scenarios`
    - `artifact_id: helper-sync-script`
    - `artifact_id: dataforall-sleep-tests`
    - `artifact_id: dataforall-dataset-tests`
    - `artifact_id: dataforall-vendored-helper-fixtures`
  - `depends_on_sections`: none
  - `parallel_safe_with_sections`: none
- Packet Created: false

### Section: Last-Mile Adoption

- Section ID: `last-mile-adoption`
- Section State: accepted
- Runtime State: complete
- Required For Goal: true
- Draft Author Role: `integration test worker`
- Planned Reviewer Persona: `code quality reviewer`
- Planned Specialist Personas: `none`
- Planned Scope: execute only the remaining adoptions that make the overall testing story cleaner and more obviously helper-owned, limited to realistic shared sleep or dataset stories that are still duplicated inline.
- Planning Rationale: by this point most of the important surfaces are already helper-backed, so this section exists to remove the last awkward duplications, not to chase uniformity.
- Adoption Rules:
  - only migrate tests that currently hand-author realistic import/data content already expressible by helper
  - do not migrate local repository/summary/source-detection micro-tests
  - do not migrate restore-shell/manual DB setup tests unless they are truly asserting imported file semantics
  - if the inventory finds no worthwhile remaining adoptions, this section may close with "no action required" after review
- Execution Outcome: the current audit found no further high-value realistic sleep or dataset story that still warrants helper adoption, so this section closed with no code changes required.
- Planned Workflow Bindings: `superpowers:subagent-driven-development`, `superpowers:test-driven-development`, `superpowers:requesting-code-review`
- Planned Review Lanes:
  - Lane ID: `last-mile-adoption-spec-review`
  - Lane Type: `spec-review`
  - Reviewer Persona: `test architecture reviewer`
  - Required: true
  - Lane ID: `last-mile-adoption-code-review`
  - Lane Type: `code-quality-review`
  - Reviewer Persona: `code quality reviewer`
  - Required: true
- Scope Declarations:
  - `exclusive_write_scope`:
    - `artifact_id: dataforall-sleep-tests`
    - `artifact_id: dataforall-dataset-tests`
    - `artifact_id: dataforall-vendored-helper-fixtures`
  - `shared_read_scope`:
    - `artifact_id: helper-fixture-catalog`
    - `artifact_id: helper-scenarios`
    - `artifact_id: helper-sync-script`
    - `artifact_id: dataforall-helper-test-loader`
  - `depends_on_sections`:
    - `canonical-contract`
  - `parallel_safe_with_sections`: none
- Packet Created: false

### Section: Invisible Maintenance

- Section ID: `invisible-maintenance`
- Section State: accepted
- Runtime State: complete
- Required For Goal: true
- Draft Author Role: `maintenance workflow worker`
- Planned Reviewer Persona: `code quality reviewer`
- Planned Specialist Personas: `none`
- Planned Scope: make the helper-backed fixture refresh path and ownership rules so clear in docs and lightweight workflow touchpoints that contributors naturally follow the sync path instead of inventing alternatives.
- Planning Rationale: the best maintenance flow is the one nobody argues with because it already feels like the product's default behavior.
- Maintenance Rules:
  - helper-managed vendored fixtures must refresh through `pnpm sync:dataforall-fixtures -- --dataforall-repo <path>`
  - no hand-copied helper fixtures into `DATAFORALL`
  - any docs or helper scripts should describe when to resync, not add a second source of truth
- Planned Workflow Bindings: `superpowers:subagent-driven-development`, `superpowers:requesting-code-review`
- Planned Review Lanes:
  - Lane ID: `invisible-maintenance-spec-review`
  - Lane Type: `spec-review`
  - Reviewer Persona: `test architecture reviewer`
  - Required: true
  - Lane ID: `invisible-maintenance-code-review`
  - Lane Type: `code-quality-review`
  - Reviewer Persona: `code quality reviewer`
  - Required: true
- Scope Declarations:
  - `exclusive_write_scope`:
    - `artifact_id: helper-sync-script`
    - `artifact_id: helper-readme`
    - `artifact_id: dataforall-helper-test-loader`
  - `shared_read_scope`:
    - `artifact_id: helper-fixture-catalog`
    - `artifact_id: dataforall-vendored-helper-fixtures`
    - `artifact_id: dataforall-sleep-tests`
    - `artifact_id: dataforall-dataset-tests`
  - `depends_on_sections`:
    - `canonical-contract`
  - `parallel_safe_with_sections`: none
- Packet Created: false

## Ordering And Parallelism

- Blocking work first: `canonical-contract`
- Then: `last-mile-adoption`
- Then: `invisible-maintenance`
- Parallel sections: none recommended until the canonical contract fixes the helper ownership boundary
- Review loop per section: draft -> reviewer findings -> orchestrator synthesis -> human judgment

## Approval Block

- Required Human Choice: `Approve` | `Revise` | `Stop`
- Current Choice: Approve
- Approved By: user
- Approval Time: 2026-05-14T01:50:00-07:00
- Notes: this round is intentionally about integration taste, not migration count. It should create one obvious answer for realistic shared test data, close only the last adoptions that strengthen that answer, and make maintenance feel automatic.
- Choice Mapping:
  - Approve -> `Plan State: approved`
  - Revise -> `Plan State: revising`
  - Stop -> `Plan State: stopped`

## Revision History

- Revision 1 Created From Brief Version: 1
- Revision Reason: initial integration plan for extending `DATAFORALL`'s systematic use of `datafortestinghelper` test data
- Supersedes Revision:
- Revision 2 Created From Brief Version: 2
- Revision Reason: sharpen the plan around a canonical helper ownership contract, last-mile adoption only, and a more opinionated maintenance story
- Supersedes Revision: 1

## Dispatch Log

- Agents Launched: review-only lanes through the existing Hubble and Newton reviewer agents
- Retry Events:
- Close Events:
  - `canonical-contract` completed after README and loader boundary updates plus reviewer approval
  - `last-mile-adoption` completed as `no action required` after the audit confirmed the remaining inline cases are intentional local exceptions
  - `invisible-maintenance` completed through the README maintenance rule and sync-path guidance
- Review Lane Transitions:
  - `canonical-contract-spec-review`: APPROVED
  - `canonical-contract-code-review`: APPROVED after one documentation clarification pass
  - `last-mile-adoption-spec-review`: APPROVED as part of the round-level review because the no-action conclusion matched the audit evidence
  - `last-mile-adoption-code-review`: APPROVED after the explicit no-further-adoption conclusion was written down
  - `invisible-maintenance-spec-review`: APPROVED as part of the round-level review
  - `invisible-maintenance-code-review`: APPROVED after the README listed the intentional inline exceptions and sync default
- Launch Time: 2026-05-14T01:50:00-07:00
- Revisions Since Approval:
- Stop State Preserves Files: true
- No Launch Before Approval: true
- Result Artifact Location Source: latest active attempt record
