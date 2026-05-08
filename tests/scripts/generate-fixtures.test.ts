import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { generateFixtures } from "../../scripts/generate-fixtures";
import { getScenarioById } from "../../src/scenarios/presets";
import { buildFixtureManifest } from "../../src/fixtures/fixtureManifest";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("generateFixtures", () => {
  test("writes selected preset fixtures to the target directory", async () => {
    const outputDir = await mkdtemp(join(tmpdir(), "datafortestinghelper-script-"));
    tempDirs.push(outputDir);

    const scenarioIds = ["single-valid-night", "invalid-start-date"];
    const singleManifest = buildFixtureManifest(getScenarioById("single-valid-night"));
    const invalidManifest = buildFixtureManifest(getScenarioById("invalid-start-date"));

    const result = await generateFixtures({ outputDir, scenarioIds });
    const singleManifestPath = join(
      outputDir,
      `${singleManifest.files.xml.replace(/\.xml$/, "")}.manifest.json`
    );
    const invalidManifestPath = join(
      outputDir,
      `${invalidManifest.files.xml.replace(/\.xml$/, "")}.manifest.json`
    );
    const manifestJson = JSON.parse(await readFile(singleManifestPath, "utf8"));
    const invalidManifestJson = JSON.parse(await readFile(invalidManifestPath, "utf8"));

    expect(result).toEqual({
      outputDir,
      scenarioIds
    });

    expect(manifestJson).toEqual(singleManifest);
    expect(invalidManifestJson).toEqual(invalidManifest);
    await expect(stat(singleManifestPath).then((entry) => entry.isFile())).resolves.toBe(true);
    await expect(stat(invalidManifestPath).then((entry) => entry.isFile())).resolves.toBe(true);
    await expect(stat(join(outputDir, singleManifest.files.xml)).then((entry) => entry.isFile())).resolves.toBe(true);
    await expect(stat(join(outputDir, singleManifest.files.zip)).then((entry) => entry.isFile())).resolves.toBe(true);
    await expect(
      stat(join(outputDir, singleManifest.files.normalizedJson)).then((entry) => entry.isFile())
    ).resolves.toBe(true);
    await expect(stat(join(outputDir, invalidManifest.files.xml)).then((entry) => entry.isFile())).resolves.toBe(true);
    await expect(stat(join(outputDir, invalidManifest.files.zip)).then((entry) => entry.isFile())).resolves.toBe(true);
    await expect(
      stat(join(outputDir, invalidManifest.files.normalizedJson)).then((entry) => entry.isFile())
    ).resolves.toBe(true);
  });

  test("removes stale preset fixture outputs when rerunning a smaller selection", async () => {
    const outputDir = await mkdtemp(join(tmpdir(), "datafortestinghelper-script-rerun-"));
    tempDirs.push(outputDir);

    const singleManifest = buildFixtureManifest(getScenarioById("single-valid-night"));
    const invalidManifest = buildFixtureManifest(getScenarioById("invalid-start-date"));

    await generateFixtures({ outputDir, scenarioIds: ["single-valid-night", "invalid-start-date"] });
    await generateFixtures({ outputDir, scenarioIds: ["single-valid-night"] });

    await expect(stat(join(outputDir, singleManifest.files.xml)).then((entry) => entry.isFile())).resolves.toBe(true);
    await expect(stat(join(outputDir, invalidManifest.files.xml))).rejects.toMatchObject({ code: "ENOENT" });
  });
});
