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

## Sync curated DATAFORALL fixtures

Refresh the curated helper-backed fixtures inside an existing `DATAFORALL` checkout:

```bash
pnpm sync:dataforall-fixtures -- --dataforall-repo ../DATAFORALL
```

The sync command always regenerates the curated helper source fixtures into a temporary directory before copying, so it does not depend on a previously generated local `generated-fixtures` tree.

It copies only the managed curated set into `src/test/fixtures/datafortestinghelper` under the repo path you provide. Existing unmanaged files in that target directory are left alone.

The command also writes `.datafortestinghelper-sync-manifest.json` in the target fixture directory so it can track which files were managed by the helper sync.

If you intentionally want to remove files that were previously managed by this sync manifest but are no longer in the curated contract, opt into cleanup explicitly:

```bash
pnpm sync:dataforall-fixtures -- --dataforall-repo ../DATAFORALL --clean-stale-managed
```

For safety, the provided repo path must already contain `src/test/fixtures`; the command will create only the `datafortestinghelper` child directory if it is missing.

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
