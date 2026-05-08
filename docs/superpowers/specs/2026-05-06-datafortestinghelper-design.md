# DATAFORTESTINGHELPER Design Spec

## Goal

Create a standalone TypeScript helper project that defines reusable sleep-data test scenarios once and can emit:

- Apple Health `export.xml`
- Apple Health export ZIP payloads
- normalized `SleepRecord[]`
- optional named fixture files for test suites

The project exists to support `DATAFORALL` test coverage without duplicating test-data logic across parser, import, storage, export, and value-estimate tests.

## Scope

### In Scope

- v1 support for Apple Health sleep import data only
- v1 support for the current `SleepRecord` shape used by `DATAFORALL`
- deterministic scenario definitions for valid and invalid import cases
- both runtime generation and fixture artifact generation

### Out Of Scope

- new user-facing UI
- random or fuzzed data generation
- non-sleep health sources
- automatic coupling to the `DATAFORALL` repository at install time

## Recommended Architecture

The project should be built around a single canonical `SleepScenario` definition. A scenario is the source of truth for a test case. Renderers and fixture writers derive all outputs from that scenario rather than inventing their own intermediate shapes.

This keeps the system honest in two directions:

- parser and import tests can consume file-shaped artifacts that resemble user input
- repository, export, and value-estimate tests can consume normalized records without rewriting the same case by hand

The scenario model should be intentionally close to Apple Health sleep records, because the current `DATAFORALL` parser treats each `<Record type="HKCategoryTypeIdentifierSleepAnalysis" />` as one normalized `SleepRecord`. A higher-level abstraction like "night summary" would make invalid raw cases harder to express and would eventually need escape hatches.

## Canonical Scenario Model

The recommended minimal model is:

```ts
export interface SleepScenario {
  id: string;
  description: string;
  records: SleepScenarioRecord[];
  expectedOutcome: "success" | "failure";
  expectedError?: string;
}

export interface SleepScenarioRecord {
  startDate?: string;
  endDate?: string;
  value?: string;
  device?: string;
  sourceName?: string;
  sourceVersion?: string;
  creationDate?: string;
  extraAttributes?: Record<string, string>;
}
```

Why this shape:

- `startDate` and `endDate` remain raw-string fields so invalid parser cases can be represented exactly
- optional fields allow missing-attribute error cases without special side channels
- `value` and `device` map directly to `sleepStageSummary` and `sourceDevice`
- `extraAttributes` keeps the model extensible without version-one overengineering

Normalized expected records should be derived, not handwritten, for success scenarios. Failure scenarios should not produce expected `SleepRecord[]`; instead they should expose the expected parser or import error text.

## Output Surfaces

The public API should expose four main surfaces:

```ts
buildExpectedSleepRecords(scenario)
renderAppleHealthXml(scenario)
buildAppleHealthZip(scenario)
writeScenarioFixtures(scenario, options)
```

Recommended behavior:

- `buildExpectedSleepRecords(scenario)` returns normalized `SleepRecord[]` for success scenarios and throws on failure scenarios
- `renderAppleHealthXml(scenario)` always emits the exact XML that corresponds to the raw record definitions
- `buildAppleHealthZip(scenario)` wraps the XML into the canonical `apple_health_export/export.xml` ZIP path
- `writeScenarioFixtures(scenario, options)` writes stable fixture files, such as `.xml`, `.zip`, and `.json`, under a named output directory

This API keeps runtime generation and file generation aligned without forcing all tests to go through the filesystem.

## Project Structure

Recommended v1 layout:

```text
src/
  domain/
    sleepScenario.ts
  renderers/
    appleHealthXml.ts
    appleHealthZip.ts
    sleepRecords.ts
  scenarios/
    presets.ts
  fixtures/
    writeScenarioFixtures.ts
    fixtureManifest.ts
  index.ts
tests/
  sleepScenario.test.ts
  appleHealthXml.test.ts
  appleHealthZip.test.ts
  sleepRecords.test.ts
  writeScenarioFixtures.test.ts
scripts/
  generate-fixtures.ts
```

Boundary intent:

- `domain/` owns the scenario contracts and validation helpers
- `renderers/` transforms scenarios into runtime outputs
- `scenarios/` holds reusable named cases such as `singleValidNight`, `twoNightCoverage`, `missingStartDate`, and `invalidDate`
- `fixtures/` handles file naming and disk writes, separate from pure generation
- `scripts/generate-fixtures.ts` provides a repeatable way to materialize selected scenarios into fixture folders

## Integration With DATAFORALL

`DATAFORALL` should be able to consume this helper in two ways:

### Direct Runtime Imports

Use the helper in tests that want objects or bytes directly:

- parser tests can call `renderAppleHealthXml` or `buildAppleHealthZip`
- repository, export, and value-estimate tests can call `buildExpectedSleepRecords`

### Generated Fixture Files

Use the helper to materialize static fixture files for tests that read from disk or benefit from named artifacts. This is especially useful when keeping parity with the current `src/test/fixtures` convention in `DATAFORALL`.

The helper should not automatically copy files into `DATAFORALL`. Instead, the design should keep output paths configurable so the user can choose whether fixtures live inside this helper project, inside `DATAFORALL`, or in both places.

## Initial Scenario Set

The v1 helper should ship with a small, high-value scenario library:

- `single-valid-night`
- `two-valid-nights`
- `missing-start-date`
- `invalid-start-date`
- `end-before-start`
- `fallback-device-and-stage`
- `strong-coverage-multi-night`

This set covers the current known parser, import, export, and value-estimate branches without inflating scope.

## Testing Strategy

The helper project should test its own guarantees instead of assuming `DATAFORALL` tests will catch drift.

Required checks:

- XML renderer preserves raw attributes and missing-field cases exactly
- ZIP renderer uses the canonical Apple Health export path
- normalized record generation matches the current `SleepRecord` contract
- failure scenarios throw the declared error type or message
- fixture writer emits stable names and content for the same scenario input

## Design Decision Summary

- Use a scenario-first architecture
- Keep the scenario model raw enough for invalid import cases
- Derive normalized records from successful scenarios instead of hand-maintaining them
- Support runtime and fixture generation as equal first-class outputs
- Keep v1 tightly scoped to Apple Health sleep plus the current `SleepRecord` contract
