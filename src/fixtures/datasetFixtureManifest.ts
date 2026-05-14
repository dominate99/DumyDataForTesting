import type { DatasetFixtureDefinition } from "../domain/datasetFixture";
import { posix, win32 } from "node:path";

function assertPlainBasename(fileName: string, label: string): void {
  if (
    fileName.length === 0 ||
    fileName === "." ||
    fileName === ".." ||
    posix.basename(fileName) !== fileName ||
    win32.basename(fileName) !== fileName
  ) {
    throw new Error(`${label} must be a plain basename: ${fileName}`);
  }
}

export interface DatasetFixtureManifest {
  id: string;
  files: {
    source: string;
    expectedArtifactJson: string;
  };
}

export function buildDatasetFixtureManifest(
  fixture: DatasetFixtureDefinition
): DatasetFixtureManifest {
  assertPlainBasename(fixture.fileName, "dataset fixture filename");
  const source = fixture.fileName;
  const sourceStem = source.replace(/\.[^.]+$/u, "");

  return {
    id: fixture.id,
    files: {
      source,
      expectedArtifactJson: `${sourceStem}.dataset-artifact.json`
    }
  };
}

