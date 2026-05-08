# Dispatch Plan: datafortestinghelper

- Date: 2026-05-06
- Plan Revision: 1
- Working Brief Version: 1
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

- User Request: `$ww 帮我落地一个好的design plan`
- Working Brief Reference: `docs/superpowers/working-briefs/2026-05-06-datafortestinghelper-working-brief.md`

## Dispatch Summary

- Goal: Define a v1 architecture for a helper project that can generate reusable `DATAFORALL` sleep test scenarios as both raw Apple Health imports and normalized `SleepRecord` outputs.
- Relevant Context: `DATAFORALL` currently tests Apple Health XML and ZIP import, local storage persistence, export redaction, and value-estimation heuristics over the same sleep domain.
- Constraints: keep the helper standalone; prefer deterministic outputs; support runtime generation and static fixture emission; design around the existing Apple Health parser and `SleepRecord` contract.
- Risks: scenario shape may be too high-level for invalid parser cases; fixture generation may drift from runtime generation; output naming may become inconsistent without a manifest; early architecture may accidentally assume multiple data sources before they are needed.
- Reviewer Rule: Every section returns to the orchestrator before human judgment.

## Planned Sections

### Section: Scenario Model And Expectations

- Section ID: `scenario-model`
- Section State: accepted
- Draft Author Role: `staff engineer orchestrator`
- Planned Reviewer Persona: `test data systems reviewer`
- Planned Specialist Personas: `none`
- Planned Scope: define the canonical scenario abstraction, success and failure expectations, and the minimal fields required to derive raw and normalized outputs.
- Planning Rationale: this section is the architectural center of the project; if it is wrong, every renderer and fixture consumer inherits the wrong shape.
- Planned Workflow Bindings: `superpowers:brainstorming`
- Packet Created: false

### Section: Renderers And Output Surfaces

- Section ID: `renderers-outputs`
- Section State: accepted
- Draft Author Role: `staff engineer orchestrator`
- Planned Reviewer Persona: `parser-fixture reviewer`
- Planned Specialist Personas: `none`
- Planned Scope: define how scenarios emit `SleepRecord[]`, Apple Health `export.xml`, Apple Health export ZIP bytes, and named fixture artifacts.
- Planning Rationale: `DATAFORALL` needs both direct object generation and file-shaped inputs, so the output contract must be explicit and deterministic.
- Planned Workflow Bindings: `superpowers:brainstorming`
- Packet Created: false

### Section: Project Structure And Integration

- Section ID: `project-structure`
- Section State: accepted
- Draft Author Role: `staff engineer orchestrator`
- Planned Reviewer Persona: `test DX reviewer`
- Planned Specialist Personas: `none`
- Planned Scope: define the file layout, public API boundaries, fixture generation script, and how `DATAFORALL` will consume the helper in tests.
- Planning Rationale: even a sound data model will fail in practice if the project layout makes the helper awkward to import, regenerate, or maintain.
- Planned Workflow Bindings: `superpowers:brainstorming`
- Packet Created: false

## Section Review Record

### Section: Scenario Model And Expectations

- Section ID: `scenario-model`
- Review Status: approved-by-human
- Reviewer Findings:
- Orchestrator Synthesis: Approved through the full design spec review because the accepted design keeps the scenario model raw enough for invalid parser cases while still deriving normalized records for success cases.
- Human Decision: Approve
- Revision Notes:
- Rollup Rule:
  - Approve -> section state becomes `accepted`
  - Revise -> section state becomes `revision-requested` and plan state becomes `revising`
  - Stop -> section state becomes `stopped` and plan state becomes `stopped`

### Section: Renderers And Output Surfaces

- Section ID: `renderers-outputs`
- Review Status: approved-by-human
- Reviewer Findings:
- Orchestrator Synthesis: Approved through the full design spec review because runtime outputs and fixture outputs were explicitly kept aligned behind the same scenario source of truth.
- Human Decision: Approve
- Revision Notes:
- Rollup Rule:
  - Approve -> section state becomes `accepted`
  - Revise -> section state becomes `revision-requested` and plan state becomes `revising`
  - Stop -> section state becomes `stopped` and plan state becomes `stopped`

### Section: Project Structure And Integration

- Section ID: `project-structure`
- Review Status: approved-by-human
- Reviewer Findings:
- Orchestrator Synthesis: Approved through the full design spec review because the proposed layout preserves a clean boundary between pure generators, fixture-writing code, and consumer-facing APIs.
- Human Decision: Approve
- Revision Notes:
- Rollup Rule:
  - Approve -> section state becomes `accepted`
  - Revise -> section state becomes `revision-requested` and plan state becomes `revising`
  - Stop -> section state becomes `stopped` and plan state becomes `stopped`

## Ordering And Parallelism

- Blocking work first: `scenario-model` -> `renderers-outputs` -> `project-structure`
- Parallel sections: none before scenario-model is accepted
- Review loop per section: draft -> reviewer findings -> orchestrator synthesis -> human judgment

## Approval Block

- Required Human Choice: `Approve` | `Revise` | `Stop`
- Current Choice: Approve
- Approved By: user
- Approval Time: 2026-05-06T23:03:58.8139356-07:00
- Notes: Design spec approved in thread; proceed to implementation planning with no requested revisions.
- Choice Mapping:
  - Approve -> `Plan State: approved`
  - Revise -> `Plan State: revising`
  - Stop -> `Plan State: stopped`

## Revision History

- Revision 1 Created From Brief Version: 1
- Revision Reason: initial architecture and design-plan framing for the new helper project
- Supersedes Revision:

## Dispatch Log

- Agents Launched:
- Launch Time:
- Revisions Since Approval: none
- Stop State Preserves Files: true
- No Launch Before Approval: true
