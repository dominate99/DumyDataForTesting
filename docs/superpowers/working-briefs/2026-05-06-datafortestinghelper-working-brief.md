# DATAFORTESTINGHELPER Working Brief

## Gate State

- `estimation_complete: true`
- `brief_status: ready`
- `brief_version: 1`

## Routing

- `task_routing: code/programming`
- `orchestrator_choice: staff engineer orchestrator`

## Core Intent

- `goal`: Design a standalone TypeScript helper project that can define reusable sleep-data test scenarios once and emit both raw Apple Health fixtures and normalized `SleepRecord` outputs for `DATAFORALL` tests.
- `artifact_type`: Technical design spec plus tracked dispatch plan for a new test-data helper project.
- `relevant_context`: `DATAFORALL` currently centers on Apple Health sleep import, parses XML or ZIP exports, normalizes to `SleepRecord`, and reuses those records across repository, export, and value-estimate logic. The existing tests mix inline XML strings with one static XML fixture.
- `constraints`: Keep the new project independent from `DATAFORALL`; optimize for deterministic test data; support both runtime generation and fixture file generation; start with the current `SleepRecord` schema and Apple Health parser expectations; avoid over-design for unsupported data sources.

## Risk And Structure

- `risk_lenses`: schema drift between helper and `DATAFORALL`; invalid-scenario support for parser failure tests; fixture sprawl if outputs are not manifest-driven; coupling raw-file renderers too tightly to normalized expectations.
- `parallelism_assessment`: low for this planning round because architecture, API shape, and fixture strategy all depend on the same scenario model decision.
- `blocking_dependencies`: agreement on the central scenario abstraction; agreement that v1 only targets Apple Health sleep plus `SleepRecord` outputs.
- `section_or_workstream_map`: scenario model and expectations; output renderers and fixture generation; project structure and `DATAFORALL` integration guidance.

## Persona And Workflow Guidance

- `recommended_personas`: `staff engineer orchestrator` for architecture ownership; `test data systems designer` for scenario model quality; `test DX reviewer` for consumer ergonomics.
- `persona_selection_notes`: the working brief points to a software architecture problem rather than a product UI problem. The highest-risk choices are code-structure and test-interface decisions, so the top-level orchestrator should stay in the `code/programming` lane.
- `workflow_bindings_by_stage`: framing uses `superpowers:brainstorming`; implementation planning uses `superpowers:writing-plans`; any later parallel work uses `superpowers:dispatching-parallel-agents`.
- `dispatch_recommendation`: do not dispatch implementation work yet. First review and approve the design spec plus dispatch plan, then write the implementation plan.
