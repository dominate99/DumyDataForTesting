import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { DatasetFixtureDefinition } from "../domain/datasetFixture";
import { buildExpectedDatasetImportArtifact } from "../renderers/datasetImportArtifact";
import { buildDatasetFixtureManifest } from "./datasetFixtureManifest";

export interface WriteDatasetFixtureFilesOptions {
  outputDir: string;
}

export interface WriteDatasetFixtureFilesResult {
  sourcePath: string;
  expectedArtifactJsonPath: string;
}

export async function writeDatasetFixtureFiles(
  fixture: DatasetFixtureDefinition,
  options: WriteDatasetFixtureFilesOptions
): Promise<WriteDatasetFixtureFilesResult> {
  await mkdir(options.outputDir, { recursive: true });

  const manifest = buildDatasetFixtureManifest(fixture);
  const sourcePath = join(options.outputDir, manifest.files.source);
  const expectedArtifactJsonPath = join(
    options.outputDir,
    manifest.files.expectedArtifactJson
  );

  await writeFile(sourcePath, fixture.fileContents, "utf8");
  await writeFile(
    expectedArtifactJsonPath,
    JSON.stringify(buildExpectedDatasetImportArtifact(fixture), null, 2),
    "utf8"
  );

  return {
    sourcePath,
    expectedArtifactJsonPath
  };
}
