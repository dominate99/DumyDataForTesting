# DATAFORTESTINGHELPER

Scenario-driven sleep test data generation for `DATAFORALL`.

## Install

```bash
pnpm install
```

## Test

```bash
pnpm test
pnpm build
```

## Generate fixtures

Generate every preset into `generated-fixtures`:

```bash
pnpm generate:fixtures
```

Generate selected presets into a custom directory:

```bash
pnpm generate:fixtures generated-fixtures single-valid-night invalid-start-date
```

Generate one known scenario into the default `generated-fixtures` directory:

```bash
pnpm generate:fixtures single-valid-night
```

Each generated scenario writes:

- Apple Health XML
- Apple Health ZIP
- normalized sleep records JSON
- a manifest JSON file describing the generated filenames

Fixture filenames are derived from the scenario id and include a short hash so sanitized names stay collision-safe across platforms.

## Runtime usage

```ts
import {
  buildExpectedSleepRecords,
  getScenarioById,
  renderAppleHealthXml,
  writeScenarioFixtures
} from "datafortestinghelper";

const scenario = getScenarioById("single-valid-night");

const xml = renderAppleHealthXml(scenario);
const records = buildExpectedSleepRecords(scenario);

await writeScenarioFixtures(scenario, { outputDir: "generated-fixtures" });
```
