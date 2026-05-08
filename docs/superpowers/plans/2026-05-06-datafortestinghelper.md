# DATAFORTESTINGHELPER Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone TypeScript helper project that defines reusable sleep-data test scenarios once and emits Apple Health XML, Apple Health ZIP bytes, normalized `SleepRecord[]`, and optional fixture files for `DATAFORALL` tests.

**Architecture:** The project is scenario-first. `src/domain/` owns the raw scenario contract, `src/renderers/` converts scenarios into runtime outputs, `src/fixtures/` handles disk materialization, and `src/scenarios/` provides reusable named presets. Pure generation logic stays independent from filesystem code so `DATAFORALL` can consume the helper both by direct import and by generated fixture files.

**Tech Stack:** TypeScript, Node.js, Vitest, JSZip, tsx

---

## File Structure

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `README.md`
- Create: `src/index.ts`
- Create: `src/domain/sleepScenario.ts`
- Create: `src/renderers/sleepRecords.ts`
- Create: `src/renderers/appleHealthXml.ts`
- Create: `src/renderers/appleHealthZip.ts`
- Create: `src/scenarios/presets.ts`
- Create: `src/fixtures/fixtureManifest.ts`
- Create: `src/fixtures/writeScenarioFixtures.ts`
- Create: `scripts/generate-fixtures.ts`
- Create: `tests/setup.ts`
- Create: `tests/domain/sleepScenario.test.ts`
- Create: `tests/renderers/sleepRecords.test.ts`
- Create: `tests/renderers/appleHealthXml.test.ts`
- Create: `tests/renderers/appleHealthZip.test.ts`
- Create: `tests/fixtures/writeScenarioFixtures.test.ts`
- Create: `tests/scripts/generate-fixtures.test.ts`

### Task 1: Scaffold The Package And Test Harness

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `tests/setup.ts`

- [ ] **Step 1: Write the failing package bootstrap test**

Create `tests/domain/smoke.test.ts`:

```ts
import { describe, expect, test } from "vitest";

describe("package bootstrap", () => {
  test("loads the public entrypoint", async () => {
    const mod = await import("../../src/index");
    expect(mod).toBeDefined();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/domain/smoke.test.ts`
Expected: FAIL with a module resolution error because `src/index.ts` and the package scaffold do not exist yet.

- [ ] **Step 3: Create the package scaffold and minimal entrypoint**

Create `package.json`:

```json
{
  "name": "datafortestinghelper",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc --noEmit",
    "test": "vitest run",
    "generate:fixtures": "tsx scripts/generate-fixtures.ts"
  },
  "dependencies": {
    "jszip": "^3.10.1"
  },
  "devDependencies": {
    "@types/node": "^24.9.1",
    "tsx": "^4.20.6",
    "typescript": "^5.9.3",
    "vitest": "^3.2.4"
  }
}
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "declaration": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["node", "vitest/globals"]
  },
  "include": ["src", "tests", "scripts"]
}
```

Create `.gitignore`:

```gitignore
node_modules
coverage
dist
generated-fixtures
```

Create `src/index.ts`:

```ts
export {};
```

Create `tests/setup.ts`:

```ts
export {};
```

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `pnpm vitest run tests/domain/smoke.test.ts`
Expected: PASS with `1 passed`.

- [ ] **Step 5: Run the typecheck and full test command**

Run: `pnpm test`
Expected: PASS with the smoke test only.

Run: `pnpm build`
Expected: PASS with no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json .gitignore src/index.ts tests/setup.ts tests/domain/smoke.test.ts
git commit -m "chore: scaffold test data helper package"
```

### Task 2: Add The Canonical Scenario Contract And Presets

**Files:**
- Modify: `src/index.ts`
- Create: `src/domain/sleepScenario.ts`
- Create: `src/scenarios/presets.ts`
- Create: `tests/domain/sleepScenario.test.ts`

- [ ] **Step 1: Write the failing scenario contract tests**

Create `tests/domain/sleepScenario.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { getScenarioById, scenarioPresets } from "../../src/scenarios/presets";

describe("scenario presets", () => {
  test("includes the expected starter scenarios", () => {
    expect(scenarioPresets.map((scenario) => scenario.id)).toEqual([
      "single-valid-night",
      "two-valid-nights",
      "missing-start-date",
      "invalid-start-date",
      "end-before-start",
      "fallback-device-and-stage",
      "strong-coverage-multi-night"
    ]);
  });

  test("returns a scenario by id", () => {
    expect(getScenarioById("single-valid-night").description).toContain("single");
  });

  test("throws when a scenario id is unknown", () => {
    expect(() => getScenarioById("does-not-exist")).toThrow("Unknown scenario: does-not-exist");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/domain/sleepScenario.test.ts`
Expected: FAIL because `src/scenarios/presets.ts` does not exist yet.

- [ ] **Step 3: Implement the scenario domain and preset registry**

Create `src/domain/sleepScenario.ts`:

```ts
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

export interface SleepScenario {
  id: string;
  description: string;
  records: SleepScenarioRecord[];
  expectedOutcome: "success" | "failure";
  expectedError?: string;
}
```

Create `src/scenarios/presets.ts`:

```ts
import type { SleepScenario } from "../domain/sleepScenario";

const NIGHT_1_START = "2026-04-01 00:00:00 -0700";
const NIGHT_1_END = "2026-04-01 08:00:00 -0700";

export const scenarioPresets: SleepScenario[] = [
  {
    id: "single-valid-night",
    description: "A single valid Apple Health sleep record.",
    expectedOutcome: "success",
    records: [
      {
        startDate: NIGHT_1_START,
        endDate: NIGHT_1_END,
        value: "HKCategoryValueSleepAnalysisAsleepCore",
        device: "Apple Watch",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-04-01 08:05:00 -0700"
      }
    ]
  },
  {
    id: "two-valid-nights",
    description: "Two valid nights for repository and import replacement tests.",
    expectedOutcome: "success",
    records: [
      {
        startDate: NIGHT_1_START,
        endDate: NIGHT_1_END,
        value: "HKCategoryValueSleepAnalysisAsleepCore",
        device: "Apple Watch",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-04-01 08:05:00 -0700"
      },
      {
        startDate: "2026-04-02 00:15:00 -0700",
        endDate: "2026-04-02 07:15:00 -0700",
        value: "HKCategoryValueSleepAnalysisAsleepCore",
        device: "Apple Watch",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-04-02 07:35:00 -0700"
      }
    ]
  },
  {
    id: "missing-start-date",
    description: "A record missing startDate for parser validation tests.",
    expectedOutcome: "failure",
    expectedError: "Sleep record is missing a startDate or endDate.",
    records: [
      {
        endDate: NIGHT_1_END,
        value: "HKCategoryValueSleepAnalysisAsleepCore",
        device: "Apple Watch",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-04-01 08:05:00 -0700"
      }
    ]
  },
  {
    id: "invalid-start-date",
    description: "A record with an invalid start date string.",
    expectedOutcome: "failure",
    expectedError: "Sleep record has an invalid startDate.",
    records: [
      {
        startDate: "not-a-date",
        endDate: NIGHT_1_END,
        value: "HKCategoryValueSleepAnalysisAsleepCore",
        device: "Apple Watch",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-04-01 08:05:00 -0700"
      }
    ]
  },
  {
    id: "end-before-start",
    description: "A record with an end date that is not later than the start date.",
    expectedOutcome: "failure",
    expectedError: "Sleep record endDate must be later than startDate.",
    records: [
      {
        startDate: NIGHT_1_END,
        endDate: NIGHT_1_END,
        value: "HKCategoryValueSleepAnalysisAsleepCore",
        device: "Apple Watch",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-04-01 08:05:00 -0700"
      }
    ]
  },
  {
    id: "fallback-device-and-stage",
    description: "A valid record that omits device and value so normalization can use fallbacks.",
    expectedOutcome: "success",
    records: [
      {
        startDate: NIGHT_1_START,
        endDate: NIGHT_1_END,
        sourceName: "Apple Health Export",
        sourceVersion: "1",
        creationDate: "2026-04-01 08:05:00 -0700"
      }
    ]
  },
  {
    id: "strong-coverage-multi-night",
    description: "Four weekly records with rich metadata for value estimate coverage tests.",
    expectedOutcome: "success",
    records: [
      {
        startDate: "2026-03-01 23:00:00 -0800",
        endDate: "2026-03-02 07:00:00 -0800",
        value: "HKCategoryValueSleepAnalysisAsleepREM",
        device: "Apple Watch Ultra",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-03-02 07:05:00 -0800"
      },
      {
        startDate: "2026-03-08 23:10:00 -0800",
        endDate: "2026-03-09 07:00:00 -0800",
        value: "HKCategoryValueSleepAnalysisAsleepDeep",
        device: "Apple Watch Ultra",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-03-09 07:05:00 -0800"
      },
      {
        startDate: "2026-03-15 22:55:00 -0700",
        endDate: "2026-03-16 06:55:00 -0700",
        value: "HKCategoryValueSleepAnalysisAsleepCore",
        device: "Apple Watch Ultra",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-03-16 07:01:00 -0700"
      },
      {
        startDate: "2026-03-22 23:05:00 -0700",
        endDate: "2026-03-23 07:10:00 -0700",
        value: "HKCategoryValueSleepAnalysisAsleepREM",
        device: "Apple Watch Ultra",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-03-23 07:12:00 -0700"
      }
    ]
  }
];

export function getScenarioById(id: string): SleepScenario {
  const scenario = scenarioPresets.find((candidate) => candidate.id === id);

  if (!scenario) {
    throw new Error(`Unknown scenario: ${id}`);
  }

  return scenario;
}
```

Update `src/index.ts`:

```ts
export type { SleepScenario, SleepScenarioRecord } from "./domain/sleepScenario";
export { getScenarioById, scenarioPresets } from "./scenarios/presets";
```

- [ ] **Step 4: Run the targeted tests to verify they pass**

Run: `pnpm vitest run tests/domain/sleepScenario.test.ts tests/domain/smoke.test.ts`
Expected: PASS with `4 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/index.ts src/domain/sleepScenario.ts src/scenarios/presets.ts tests/domain/sleepScenario.test.ts
git commit -m "feat: add canonical sleep scenario presets"
```

### Task 3: Implement Normalized SleepRecord Generation

**Files:**
- Modify: `src/index.ts`
- Create: `src/renderers/sleepRecords.ts`
- Create: `tests/renderers/sleepRecords.test.ts`

- [ ] **Step 1: Write the failing renderer tests**

Create `tests/renderers/sleepRecords.test.ts`:

```ts
import { describe, expect, test, vi } from "vitest";
import { buildExpectedSleepRecords } from "../../src/renderers/sleepRecords";
import { getScenarioById } from "../../src/scenarios/presets";

describe("buildExpectedSleepRecords", () => {
  test("normalizes a valid scenario into SleepRecord objects", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-06T12:00:00.000Z"));

    const records = buildExpectedSleepRecords(getScenarioById("single-valid-night"));

    expect(records).toEqual([
      {
        id: "2026-04-01 00:00:00 -0700|2026-04-01 08:00:00 -0700|Apple Watch|HKCategoryValueSleepAnalysisAsleepCore",
        sourceType: "apple-health",
        startAt: "2026-04-01T07:00:00.000Z",
        endAt: "2026-04-01T15:00:00.000Z",
        durationMinutes: 480,
        sleepStageSummary: "HKCategoryValueSleepAnalysisAsleepCore",
        sourceDevice: "Apple Watch",
        ingestedAt: "2026-05-06T12:00:00.000Z"
      }
    ]);

    vi.useRealTimers();
  });

  test("uses fallback device and stage values when omitted", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-06T12:00:00.000Z"));

    const [record] = buildExpectedSleepRecords(getScenarioById("fallback-device-and-stage"));

    expect(record.sourceDevice).toBe("apple-health-export");
    expect(record.sleepStageSummary).toBe("unknown");

    vi.useRealTimers();
  });

  test("throws the declared error for failure scenarios", () => {
    expect(() => buildExpectedSleepRecords(getScenarioById("invalid-start-date"))).toThrow(
      "Sleep record has an invalid startDate."
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/renderers/sleepRecords.test.ts`
Expected: FAIL because `src/renderers/sleepRecords.ts` does not exist yet.

- [ ] **Step 3: Implement the normalized renderer**

Create `src/renderers/sleepRecords.ts`:

```ts
import type { SleepScenario } from "../domain/sleepScenario";

export interface SleepRecord {
  id: string;
  sourceType: "apple-health";
  startAt: string;
  endAt: string;
  durationMinutes: number;
  sleepStageSummary: string;
  sourceDevice: string;
  ingestedAt: string;
}

function parseRecordDate(value: string, fieldName: "startDate" | "endDate") {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Sleep record has an invalid ${fieldName}.`);
  }

  return date;
}

export function buildExpectedSleepRecords(scenario: SleepScenario): SleepRecord[] {
  return scenario.records.map((record) => {
    const startDate = record.startDate;
    const endDate = record.endDate;
    const device = record.device ?? "apple-health-export";
    const stage = record.value ?? "unknown";

    if (!startDate || !endDate) {
      throw new Error("Sleep record is missing a startDate or endDate.");
    }

    const startAt = parseRecordDate(startDate, "startDate");
    const endAt = parseRecordDate(endDate, "endDate");

    if (endAt.getTime() <= startAt.getTime()) {
      throw new Error("Sleep record endDate must be later than startDate.");
    }

    return {
      id: `${startDate}|${endDate}|${device}|${stage}`,
      sourceType: "apple-health",
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      durationMinutes: Math.round((endAt.getTime() - startAt.getTime()) / 60000),
      sleepStageSummary: stage,
      sourceDevice: device,
      ingestedAt: new Date().toISOString()
    };
  });
}
```

Update `src/index.ts`:

```ts
export type { SleepScenario, SleepScenarioRecord } from "./domain/sleepScenario";
export { getScenarioById, scenarioPresets } from "./scenarios/presets";
export { buildExpectedSleepRecords } from "./renderers/sleepRecords";
export type { SleepRecord } from "./renderers/sleepRecords";
```

- [ ] **Step 4: Run the targeted renderer tests**

Run: `pnpm vitest run tests/renderers/sleepRecords.test.ts tests/domain/sleepScenario.test.ts`
Expected: PASS with `6 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/index.ts src/renderers/sleepRecords.ts tests/renderers/sleepRecords.test.ts
git commit -m "feat: add normalized sleep record renderer"
```

### Task 4: Implement Apple Health XML And ZIP Renderers

**Files:**
- Modify: `src/index.ts`
- Create: `src/renderers/appleHealthXml.ts`
- Create: `src/renderers/appleHealthZip.ts`
- Create: `tests/renderers/appleHealthXml.test.ts`
- Create: `tests/renderers/appleHealthZip.test.ts`

- [ ] **Step 1: Write the failing XML and ZIP renderer tests**

Create `tests/renderers/appleHealthXml.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { renderAppleHealthXml } from "../../src/renderers/appleHealthXml";
import { getScenarioById } from "../../src/scenarios/presets";

describe("renderAppleHealthXml", () => {
  test("renders a canonical Apple Health export document", () => {
    const xml = renderAppleHealthXml(getScenarioById("single-valid-night"));

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<HealthData locale="en_US">');
    expect(xml).toContain('type="HKCategoryTypeIdentifierSleepAnalysis"');
    expect(xml).toContain('startDate="2026-04-01 00:00:00 -0700"');
  });

  test("omits missing optional attributes without inventing values", () => {
    const xml = renderAppleHealthXml(getScenarioById("missing-start-date"));

    expect(xml).not.toContain('startDate="');
    expect(xml).toContain('endDate="2026-04-01 08:00:00 -0700"');
  });
});
```

Create `tests/renderers/appleHealthZip.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import JSZip from "jszip";
import { buildAppleHealthZip } from "../../src/renderers/appleHealthZip";
import { getScenarioById } from "../../src/scenarios/presets";

describe("buildAppleHealthZip", () => {
  test("writes export.xml to the canonical Apple Health path", async () => {
    const zipBytes = await buildAppleHealthZip(getScenarioById("single-valid-night"));
    const zip = await JSZip.loadAsync(zipBytes);
    const xml = await zip.file("apple_health_export/export.xml")?.async("string");

    expect(xml).toContain('type="HKCategoryTypeIdentifierSleepAnalysis"');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run tests/renderers/appleHealthXml.test.ts tests/renderers/appleHealthZip.test.ts`
Expected: FAIL because the XML and ZIP renderers do not exist yet.

- [ ] **Step 3: Implement the XML renderer**

Create `src/renderers/appleHealthXml.ts`:

```ts
import type { SleepScenario, SleepScenarioRecord } from "../domain/sleepScenario";

function renderAttributes(record: SleepScenarioRecord): string {
  const attributes: Record<string, string | undefined> = {
    type: "HKCategoryTypeIdentifierSleepAnalysis",
    sourceName: record.sourceName,
    sourceVersion: record.sourceVersion,
    device: record.device,
    creationDate: record.creationDate,
    startDate: record.startDate,
    endDate: record.endDate,
    value: record.value,
    ...record.extraAttributes
  };

  return Object.entries(attributes)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string")
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
}

export function renderAppleHealthXml(scenario: SleepScenario): string {
  const recordLines = scenario.records.map((record) => `  <Record ${renderAttributes(record)} />`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<HealthData locale="en_US">\n${recordLines}\n</HealthData>`;
}
```

- [ ] **Step 4: Implement the ZIP renderer and public exports**

Create `src/renderers/appleHealthZip.ts`:

```ts
import JSZip from "jszip";
import type { SleepScenario } from "../domain/sleepScenario";
import { renderAppleHealthXml } from "./appleHealthXml";

export async function buildAppleHealthZip(scenario: SleepScenario): Promise<Uint8Array> {
  const zip = new JSZip();
  zip.file("apple_health_export/export.xml", renderAppleHealthXml(scenario));
  return zip.generateAsync({ type: "uint8array" });
}
```

Update `src/index.ts`:

```ts
export type { SleepScenario, SleepScenarioRecord } from "./domain/sleepScenario";
export { getScenarioById, scenarioPresets } from "./scenarios/presets";
export { buildExpectedSleepRecords } from "./renderers/sleepRecords";
export type { SleepRecord } from "./renderers/sleepRecords";
export { renderAppleHealthXml } from "./renderers/appleHealthXml";
export { buildAppleHealthZip } from "./renderers/appleHealthZip";
```

- [ ] **Step 5: Run the renderer test set**

Run: `pnpm vitest run tests/renderers/appleHealthXml.test.ts tests/renderers/appleHealthZip.test.ts tests/renderers/sleepRecords.test.ts`
Expected: PASS with `6 passed`.

- [ ] **Step 6: Commit**

```bash
git add src/index.ts src/renderers/appleHealthXml.ts src/renderers/appleHealthZip.ts tests/renderers/appleHealthXml.test.ts tests/renderers/appleHealthZip.test.ts
git commit -m "feat: add apple health xml and zip renderers"
```

### Task 5: Add Fixture Manifesting And File Generation

**Files:**
- Modify: `src/index.ts`
- Create: `src/fixtures/fixtureManifest.ts`
- Create: `src/fixtures/writeScenarioFixtures.ts`
- Create: `tests/fixtures/writeScenarioFixtures.test.ts`

- [ ] **Step 1: Write the failing fixture writer tests**

Create `tests/fixtures/writeScenarioFixtures.test.ts`:

```ts
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { getScenarioById } from "../../src/scenarios/presets";
import { writeScenarioFixtures } from "../../src/fixtures/writeScenarioFixtures";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("writeScenarioFixtures", () => {
  test("writes xml, zip, and normalized json outputs plus a manifest entry", async () => {
    const outputDir = await mkdtemp(join(tmpdir(), "datafortestinghelper-"));
    tempDirs.push(outputDir);

    const result = await writeScenarioFixtures(getScenarioById("single-valid-night"), { outputDir });
    const manifestJson = await readFile(result.manifestPath, "utf8");
    const normalizedJson = await readFile(result.normalizedJsonPath, "utf8");

    expect(result.xmlPath.endsWith("single-valid-night.xml")).toBe(true);
    expect(result.zipPath.endsWith("single-valid-night.zip")).toBe(true);
    expect(JSON.parse(manifestJson)).toEqual({
      id: "single-valid-night",
      expectedOutcome: "success",
      files: {
        xml: "single-valid-night.xml",
        zip: "single-valid-night.zip",
        normalizedJson: "single-valid-night.sleep-records.json"
      }
    });
    expect(JSON.parse(normalizedJson)).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run the fixture writer test to verify it fails**

Run: `pnpm vitest run tests/fixtures/writeScenarioFixtures.test.ts`
Expected: FAIL because the fixture manifest and writer do not exist yet.

- [ ] **Step 3: Implement the manifest helper**

Create `src/fixtures/fixtureManifest.ts`:

```ts
import type { SleepScenario } from "../domain/sleepScenario";

export interface ScenarioFixtureManifest {
  id: string;
  expectedOutcome: "success" | "failure";
  files: {
    xml: string;
    zip: string;
    normalizedJson: string;
  };
}

export function buildFixtureManifest(scenario: SleepScenario): ScenarioFixtureManifest {
  return {
    id: scenario.id,
    expectedOutcome: scenario.expectedOutcome,
    files: {
      xml: `${scenario.id}.xml`,
      zip: `${scenario.id}.zip`,
      normalizedJson: `${scenario.id}.sleep-records.json`
    }
  };
}
```

- [ ] **Step 4: Implement the fixture writer**

Create `src/fixtures/writeScenarioFixtures.ts`:

```ts
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { SleepScenario } from "../domain/sleepScenario";
import { buildFixtureManifest } from "./fixtureManifest";
import { renderAppleHealthXml } from "../renderers/appleHealthXml";
import { buildAppleHealthZip } from "../renderers/appleHealthZip";
import { buildExpectedSleepRecords } from "../renderers/sleepRecords";

export async function writeScenarioFixtures(scenario: SleepScenario, options: { outputDir: string }) {
  await mkdir(options.outputDir, { recursive: true });

  const manifest = buildFixtureManifest(scenario);
  const xmlPath = join(options.outputDir, manifest.files.xml);
  const zipPath = join(options.outputDir, manifest.files.zip);
  const normalizedJsonPath = join(options.outputDir, manifest.files.normalizedJson);
  const manifestPath = join(options.outputDir, `${scenario.id}.manifest.json`);

  await writeFile(xmlPath, renderAppleHealthXml(scenario), "utf8");
  await writeFile(zipPath, Buffer.from(await buildAppleHealthZip(scenario)));

  const normalizedRecords = scenario.expectedOutcome === "success" ? buildExpectedSleepRecords(scenario) : [];
  await writeFile(normalizedJsonPath, JSON.stringify(normalizedRecords, null, 2), "utf8");
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  return { xmlPath, zipPath, normalizedJsonPath, manifestPath };
}
```

Update `src/index.ts`:

```ts
export type { SleepScenario, SleepScenarioRecord } from "./domain/sleepScenario";
export { getScenarioById, scenarioPresets } from "./scenarios/presets";
export { buildExpectedSleepRecords } from "./renderers/sleepRecords";
export type { SleepRecord } from "./renderers/sleepRecords";
export { renderAppleHealthXml } from "./renderers/appleHealthXml";
export { buildAppleHealthZip } from "./renderers/appleHealthZip";
export { buildFixtureManifest } from "./fixtures/fixtureManifest";
export { writeScenarioFixtures } from "./fixtures/writeScenarioFixtures";
```

- [ ] **Step 5: Run the fixture test set**

Run: `pnpm vitest run tests/fixtures/writeScenarioFixtures.test.ts tests/renderers/appleHealthZip.test.ts`
Expected: PASS with `2 passed`.

- [ ] **Step 6: Commit**

```bash
git add src/index.ts src/fixtures/fixtureManifest.ts src/fixtures/writeScenarioFixtures.ts tests/fixtures/writeScenarioFixtures.test.ts
git commit -m "feat: add fixture manifest and writer"
```

### Task 6: Add The Fixture Generation Script And Consumer Documentation

**Files:**
- Create: `scripts/generate-fixtures.ts`
- Create: `tests/scripts/generate-fixtures.test.ts`
- Create: `README.md`

- [ ] **Step 1: Write the failing script and README expectations**

Create `tests/scripts/generate-fixtures.test.ts`:

```ts
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { generateFixtures } from "../../scripts/generate-fixtures";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("generateFixtures", () => {
  test("writes all preset fixtures to the target directory", async () => {
    const outputDir = await mkdtemp(join(tmpdir(), "datafortestinghelper-script-"));
    tempDirs.push(outputDir);

    await generateFixtures({ outputDir, scenarioIds: ["single-valid-night", "invalid-start-date"] });

    const files = await readdir(outputDir);
    const singleManifest = JSON.parse(await readFile(join(outputDir, "single-valid-night.manifest.json"), "utf8"));

    expect(files).toContain("single-valid-night.xml");
    expect(files).toContain("invalid-start-date.zip");
    expect(singleManifest.id).toBe("single-valid-night");
  });
});
```

- [ ] **Step 2: Run the script test to verify it fails**

Run: `pnpm vitest run tests/scripts/generate-fixtures.test.ts`
Expected: FAIL because the script module does not exist yet.

- [ ] **Step 3: Implement the script entrypoint**

Create `scripts/generate-fixtures.ts`:

```ts
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { getScenarioById, scenarioPresets } from "../src/scenarios/presets";
import { writeScenarioFixtures } from "../src/fixtures/writeScenarioFixtures";

export async function generateFixtures(options?: { outputDir?: string; scenarioIds?: string[] }) {
  const outputDir = resolve(options?.outputDir ?? "generated-fixtures");
  const scenarioIds = options?.scenarioIds ?? scenarioPresets.map((scenario) => scenario.id);

  await mkdir(outputDir, { recursive: true });

  for (const scenarioId of scenarioIds) {
    await writeScenarioFixtures(getScenarioById(scenarioId), { outputDir });
  }

  return { outputDir, scenarioIds };
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  const outputDir = process.argv[2];
  const scenarioIds = process.argv.slice(3);

  generateFixtures({
    outputDir,
    scenarioIds: scenarioIds.length > 0 ? scenarioIds : undefined
  }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
```

- [ ] **Step 4: Document usage in the README**

Create `README.md`:

````md
# DATAFORTESTINGHELPER

Scenario-driven sleep test data generation for `DATAFORALL`.

## What it generates

- Apple Health `export.xml`
- Apple Health export `.zip`
- normalized `SleepRecord[]`
- fixture files and manifest metadata

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

```bash
pnpm generate:fixtures
pnpm generate:fixtures generated-fixtures single-valid-night invalid-start-date
```

## Runtime usage

```ts
import { buildExpectedSleepRecords, renderAppleHealthXml, getScenarioById } from "datafortestinghelper";

const scenario = getScenarioById("single-valid-night");
const xml = renderAppleHealthXml(scenario);
const records = buildExpectedSleepRecords(scenario);
```
````

- [ ] **Step 5: Run the final verification commands**

Run: `pnpm vitest run tests/scripts/generate-fixtures.test.ts tests/fixtures/writeScenarioFixtures.test.ts`
Expected: PASS with `2 passed`.

Run: `pnpm test`
Expected: PASS with all domain, renderer, fixture, and script tests green.

Run: `pnpm build`
Expected: PASS with no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-fixtures.ts tests/scripts/generate-fixtures.test.ts README.md
git commit -m "docs: add fixture generation workflow"
```

## Self-Review

- Spec coverage: the plan covers scenario contracts, runtime renderers, ZIP generation, fixture writing, preset scenarios, and user-facing generation workflow.
- Placeholder scan: no unfinished placeholder markers or vague “handle later” steps remain.
- Type consistency: all tasks use the same names for `SleepScenario`, `SleepScenarioRecord`, `SleepRecord`, `buildExpectedSleepRecords`, `renderAppleHealthXml`, `buildAppleHealthZip`, `buildFixtureManifest`, and `writeScenarioFixtures`.
