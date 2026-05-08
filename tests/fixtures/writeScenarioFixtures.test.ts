import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import JSZip from "jszip";
import { getScenarioById } from "../../src/scenarios/presets";
import { writeScenarioFixtures } from "../../src/fixtures/writeScenarioFixtures";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("writeScenarioFixtures", () => {
  test("writes xml, zip, normalized json, and manifest output with stable names", async () => {
    const outputDir = await mkdtemp(join(tmpdir(), "datafortestinghelper-"));
    tempDirs.push(outputDir);

    const result = await writeScenarioFixtures(getScenarioById("single-valid-night"), { outputDir });
    const [manifestJson, normalizedJson, xmlText, zipBytes] = await Promise.all([
      readFile(result.manifestPath, "utf8"),
      readFile(result.normalizedJsonPath, "utf8"),
      readFile(result.xmlPath, "utf8"),
      readFile(result.zipPath)
    ]);

    expect(basename(result.xmlPath)).toMatch(/^single-valid-night-[0-9a-f]{8}\.xml$/);
    expect(basename(result.zipPath)).toMatch(/^single-valid-night-[0-9a-f]{8}\.zip$/);
    expect(basename(result.normalizedJsonPath)).toMatch(/^single-valid-night-[0-9a-f]{8}\.sleep-records\.json$/);
    expect(basename(result.manifestPath)).toMatch(/^single-valid-night-[0-9a-f]{8}\.manifest\.json$/);

    expect(JSON.parse(manifestJson)).toEqual({
      id: "single-valid-night",
      expectedOutcome: "success",
      files: {
        xml: basename(result.xmlPath),
        zip: basename(result.zipPath),
        normalizedJson: basename(result.normalizedJsonPath)
      }
    });
    expect(JSON.parse(normalizedJson)).toEqual([
      expect.objectContaining({
        id: "2026-04-01 00:00:00 -0700|2026-04-01 08:00:00 -0700|Apple Watch|HKCategoryValueSleepAnalysisAsleepCore",
        sourceType: "apple-health",
        startAt: "2026-04-01T07:00:00.000Z",
        endAt: "2026-04-01T15:00:00.000Z",
        durationMinutes: 480,
        sleepStageSummary: "HKCategoryValueSleepAnalysisAsleepCore",
        sourceDevice: "Apple Watch"
      })
    ]);
    expect(xmlText).toContain('type="HKCategoryTypeIdentifierSleepAnalysis"');

    const zip = await JSZip.loadAsync(zipBytes);
    const zippedXml = await zip.file("apple_health_export/export.xml")?.async("string");

    expect(zippedXml).toBe(xmlText);

    await expect(stat(result.manifestPath)).resolves.toMatchObject({ isFile: expect.any(Function) });
    await expect(stat(result.manifestPath).then((entry) => entry.isFile())).resolves.toBe(true);
  });

  test("writes an empty normalized json array for failure scenarios", async () => {
    const outputDir = await mkdtemp(join(tmpdir(), "datafortestinghelper-failure-"));
    tempDirs.push(outputDir);

    const result = await writeScenarioFixtures(getScenarioById("missing-start-date"), { outputDir });
    const normalizedJson = await readFile(result.normalizedJsonPath, "utf8");

    expect(JSON.parse(normalizedJson)).toEqual([]);
    expect(basename(result.normalizedJsonPath)).toMatch(/^missing-start-date-[0-9a-f]{8}\.sleep-records\.json$/);
  });

  test("sanitizes fixture filenames derived from scenario ids", async () => {
    const outputDir = await mkdtemp(join(tmpdir(), "datafortestinghelper-sanitized-"));
    tempDirs.push(outputDir);

    const result = await writeScenarioFixtures(
      {
        id: 'unsafe/..\\\\name:*?"<>|',
        description: "Sanitized fixture path",
        expectedOutcome: "success",
        records: [
          {
            startDate: "2026-04-01 00:00:00 -0700",
            endDate: "2026-04-01 08:00:00 -0700"
          }
        ]
      },
      { outputDir }
    );

    expect(basename(result.xmlPath)).toMatch(/^unsafe[-\w]*name[-\w]*-[0-9a-f]{8}\.xml$/);
    expect(basename(result.xmlPath)).not.toMatch(/[<>:"/\\|?*\u0000-\u001F]/);
    expect(basename(result.manifestPath)).toMatch(/^unsafe[-\w]*name[-\w]*-[0-9a-f]{8}\.manifest\.json$/);
    expect(basename(result.manifestPath)).not.toMatch(/[<>:"/\\|?*\u0000-\u001F]/);
  });

  test("avoids Windows reserved device names in fixture filenames", async () => {
    const outputDir = await mkdtemp(join(tmpdir(), "datafortestinghelper-reserved-"));
    tempDirs.push(outputDir);

    const result = await writeScenarioFixtures(
      {
        id: "con.report",
        description: "Reserved device name should be made safe.",
        expectedOutcome: "success",
        records: [
          {
            startDate: "2026-04-01 00:00:00 -0700",
            endDate: "2026-04-01 08:00:00 -0700"
          }
        ]
      },
      { outputDir }
    );

    expect(basename(result.xmlPath)).toMatch(/^scenario-con\.report-[0-9a-f]{8}\.xml$/);
    expect(basename(result.manifestPath)).toMatch(/^scenario-con\.report-[0-9a-f]{8}\.manifest\.json$/);
  });

  test("keeps sanitized stems collision-safe for different raw scenario ids", async () => {
    const outputDir = await mkdtemp(join(tmpdir(), "datafortestinghelper-collision-"));
    tempDirs.push(outputDir);

    const first = await writeScenarioFixtures(
      {
        id: "a/b",
        description: "First colliding id",
        expectedOutcome: "success",
        records: [{ startDate: "2026-04-01 00:00:00 -0700", endDate: "2026-04-01 08:00:00 -0700" }]
      },
      { outputDir }
    );

    const second = await writeScenarioFixtures(
      {
        id: "a:b",
        description: "Second colliding id",
        expectedOutcome: "success",
        records: [{ startDate: "2026-04-01 00:00:00 -0700", endDate: "2026-04-01 08:00:00 -0700" }]
      },
      { outputDir }
    );

    expect(basename(first.xmlPath)).not.toBe(basename(second.xmlPath));
  });
});
