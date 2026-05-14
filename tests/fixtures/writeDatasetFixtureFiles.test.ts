import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { buildExpectedDatasetFixtureArtifactById, getDatasetFixtureById } from "../../src/fixtures/datasetFixtures";
import { writeDatasetFixtureFiles } from "../../src/fixtures/writeDatasetFixtureFiles";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("writeDatasetFixtureFiles", () => {
  test("writes the source file and expected artifact JSON with canonical names", async () => {
    const outputDir = await mkdtemp(join(tmpdir(), "datafortestinghelper-dataset-fixtures-"));
    tempDirs.push(outputDir);

    const fixture = getDatasetFixtureById("structured-json-dataset");
    const result = await writeDatasetFixtureFiles(fixture, { outputDir });

    expect(basename(result.sourcePath)).toBe("structured-json-dataset.json");
    expect(basename(result.expectedArtifactJsonPath)).toBe(
      "structured-json-dataset.dataset-artifact.json"
    );
    await expect(readFile(result.sourcePath, "utf8")).resolves.toBe(fixture.fileContents);
    await expect(readFile(result.expectedArtifactJsonPath, "utf8").then(JSON.parse)).resolves.toEqual(
      buildExpectedDatasetFixtureArtifactById("structured-json-dataset")
    );
    await expect(stat(result.sourcePath).then((entry) => entry.isFile())).resolves.toBe(true);
    await expect(stat(result.expectedArtifactJsonPath).then((entry) => entry.isFile())).resolves.toBe(true);
  });
});

