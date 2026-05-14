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

## DATAFORALL integration contract

Use `datafortestinghelper` as the default source of truth for realistic shared test-data stories in `DATAFORALL`.

Use helper-backed fixtures when a test is asserting a reusable product story such as:

- Apple Health sleep import and parser flows
- shared sleep-record scenarios reused across import, app, hook, and value-estimate tests
- canonical dataset import stories for Apple Health, JSON, and TXT

Keep tests inline when they are intentionally local, small, or malformed in ways that are clearer by hand, such as:

- repository micro-tests
- source-detection and malformed-container edge cases
- direct restore-shell setup tests that are asserting local DB state rather than imported file semantics

If a realistic input file or expected imported artifact would be useful in more than one `DATAFORALL` test surface, it should usually live here instead of being hand-authored inside one test file.

### Current DATAFORALL coverage

Helper-backed sleep fixtures currently power these `DATAFORALL` surfaces:

- Apple Health parser/import tests
- sleep import hook and app flows
- sleep value-estimate tests

Helper-backed dataset fixtures currently power these `DATAFORALL` surfaces:

- dataset import pipeline tests
- narrow workspace import-facing tests
- app-level Apple Health and JSON dataset import flows

### Intentional inline exceptions

The current integration audit did not find any further high-value realistic import story that still needs migration into helper. The notable inline cases that remain are intentional:

- malformed-container and ambiguous-source tests such as ambiguous ZIP handling and source-detection failures
- restore-shell and local-DB setup tests whose primary subject is restoration behavior rather than imported file semantics
- tiny repository, summary, and source-detection micro-tests where helper would add indirection without improving clarity

### Maintenance rule

When helper-managed fixtures change, refresh `DATAFORALL` through the curated sync command:

```bash
pnpm sync:dataforall-fixtures -- --dataforall-repo ../DATAFORALL
```

Do not hand-copy helper-managed fixtures into `DATAFORALL`. The vendored directory in `DATAFORALL/src/test/fixtures/datafortestinghelper` is a synced view of the curated helper contract, not a second source of truth.

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
