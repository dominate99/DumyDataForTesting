import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, posix, win32 } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { generateFixtures } from "../../scripts/generate-fixtures";
import {
  DATAFORALL_CURATED_FIXTURE_SYNC_CONTRACT,
  DATAFORALL_MANAGED_FIXTURE_FILE_NAMES,
  getDataForAllFixtureSourceFileNameForTargetFileName,
  isManagedDataForAllFixtureFileName
} from "../../src/fixtures/dataForAllFixtureSyncContract";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("DATAFORALL fixture sync contract", () => {
  test("defines the curated stable filenames DATAFORALL manages", () => {
    expect(DATAFORALL_CURATED_FIXTURE_SYNC_CONTRACT).toEqual([
      {
        scenarioId: "fallback-device-and-stage",
        artifactKind: "normalizedJson",
        targetFileName: "fallback-device-and-stage.sleep-records.json"
      },
      {
        scenarioId: "invalid-start-date",
        artifactKind: "xml",
        targetFileName: "invalid-start-date.xml"
      },
      {
        scenarioId: "mixed-valid-and-invalid-records",
        artifactKind: "xml",
        targetFileName: "mixed-valid-and-invalid-records.xml"
      },
      {
        scenarioId: "missing-start-date",
        artifactKind: "xml",
        targetFileName: "missing-start-date.xml"
      },
      {
        scenarioId: "end-before-start",
        artifactKind: "xml",
        targetFileName: "end-before-start.xml"
      },
      {
        scenarioId: "replacement-import-single-night",
        artifactKind: "xml",
        targetFileName: "replacement-import-single-night.xml"
      },
      {
        scenarioId: "single-valid-night",
        artifactKind: "normalizedJson",
        targetFileName: "single-valid-night.sleep-records.json"
      },
      {
        scenarioId: "single-valid-night",
        artifactKind: "zip",
        targetFileName: "single-valid-night.zip"
      },
      {
        scenarioId: "strong-coverage-multi-night",
        artifactKind: "normalizedJson",
        targetFileName: "strong-coverage-multi-night.sleep-records.json"
      },
      {
        scenarioId: "two-valid-nights",
        artifactKind: "normalizedJson",
        targetFileName: "two-valid-nights.sleep-records.json"
      },
      {
        scenarioId: "two-valid-nights",
        artifactKind: "xml",
        targetFileName: "two-valid-nights.xml"
      },
      {
        scenarioId: "two-valid-nights",
        artifactKind: "zip",
        targetFileName: "two-valid-nights.zip"
      }
    ]);
  });

  test("exposes a managed filename list that is safe for cleanup scoping", () => {
    expect(DATAFORALL_MANAGED_FIXTURE_FILE_NAMES).toEqual([
      "fallback-device-and-stage.sleep-records.json",
      "invalid-start-date.xml",
      "mixed-valid-and-invalid-records.xml",
      "missing-start-date.xml",
      "end-before-start.xml",
      "replacement-import-single-night.xml",
      "single-valid-night.sleep-records.json",
      "single-valid-night.zip",
      "strong-coverage-multi-night.sleep-records.json",
      "two-valid-nights.sleep-records.json",
      "two-valid-nights.xml",
      "two-valid-nights.zip"
    ]);

    expect(isManagedDataForAllFixtureFileName("two-valid-nights.zip")).toBe(true);
    expect(isManagedDataForAllFixtureFileName("end-before-start.xml")).toBe(true);
    expect(isManagedDataForAllFixtureFileName("two-valid-nights.manifest.json")).toBe(false);
  });

  test("keeps every managed target filename scoped to a plain basename", () => {
    for (const fileName of DATAFORALL_MANAGED_FIXTURE_FILE_NAMES) {
      expect(posix.basename(fileName)).toBe(fileName);
      expect(win32.basename(fileName)).toBe(fileName);
    }
  });

  test("resolves every curated source file to a generated helper artifact", async () => {
    const outputDir = await mkdtemp(join(tmpdir(), "datafortestinghelper-sync-contract-"));
    tempDirs.push(outputDir);

    const scenarioIds = [...new Set(DATAFORALL_CURATED_FIXTURE_SYNC_CONTRACT.map((entry) => entry.scenarioId))];

    await generateFixtures({ outputDir, scenarioIds });

    await Promise.all(
      DATAFORALL_CURATED_FIXTURE_SYNC_CONTRACT.map(async (entry) => {
        const sourceFileName = getDataForAllFixtureSourceFileNameForTargetFileName(entry.targetFileName);

        expect(sourceFileName).toBeTypeOf("string");
        await expect(stat(join(outputDir, sourceFileName as string)).then((file) => file.isFile())).resolves.toBe(true);
      })
    );
  });
});
