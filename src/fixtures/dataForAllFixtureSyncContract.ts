import { buildFixtureManifest, type ScenarioFixtureManifest } from "./fixtureManifest";
import { posix, win32 } from "node:path";
import { getScenarioById } from "../scenarios/presets";
import { buildDatasetFixtureManifest } from "./datasetFixtureManifest";
import { getDatasetFixtureById } from "./datasetFixtures";

export type DataForAllFixtureArtifactKind = keyof ScenarioFixtureManifest["files"];
export type DataForAllDatasetFixtureArtifactKind =
  keyof ReturnType<typeof buildDatasetFixtureManifest>["files"];

interface DataForAllScenarioFixtureSyncSelection {
  fixtureSource: "sleep-scenario";
  scenarioId: string;
  artifactKind: DataForAllFixtureArtifactKind;
  targetFileName: string;
}

interface DataForAllDatasetFixtureSyncSelection {
  fixtureSource: "dataset-fixture";
  datasetFixtureId: string;
  artifactKind: DataForAllDatasetFixtureArtifactKind;
  targetFileName: string;
}

export type DataForAllFixtureSyncSelection =
  | DataForAllScenarioFixtureSyncSelection
  | DataForAllDatasetFixtureSyncSelection;

export type DataForAllFixtureSyncEntry = DataForAllFixtureSyncSelection & {
  sourceFileName: string;
};

const CURATED_DATAFORALL_SYNC_SELECTION = [
  {
    fixtureSource: "sleep-scenario",
    scenarioId: "fallback-device-and-stage",
    artifactKind: "normalizedJson",
    targetFileName: "fallback-device-and-stage.sleep-records.json"
  },
  {
    fixtureSource: "sleep-scenario",
    scenarioId: "invalid-start-date",
    artifactKind: "xml",
    targetFileName: "invalid-start-date.xml"
  },
  {
    fixtureSource: "sleep-scenario",
    scenarioId: "mixed-valid-and-invalid-records",
    artifactKind: "xml",
    targetFileName: "mixed-valid-and-invalid-records.xml"
  },
  {
    fixtureSource: "sleep-scenario",
    scenarioId: "missing-start-date",
    artifactKind: "xml",
    targetFileName: "missing-start-date.xml"
  },
  {
    fixtureSource: "sleep-scenario",
    scenarioId: "end-before-start",
    artifactKind: "xml",
    targetFileName: "end-before-start.xml"
  },
  {
    fixtureSource: "sleep-scenario",
    scenarioId: "replacement-import-single-night",
    artifactKind: "xml",
    targetFileName: "replacement-import-single-night.xml"
  },
  {
    fixtureSource: "sleep-scenario",
    scenarioId: "single-valid-night",
    artifactKind: "normalizedJson",
    targetFileName: "single-valid-night.sleep-records.json"
  },
  {
    fixtureSource: "sleep-scenario",
    scenarioId: "single-valid-night",
    artifactKind: "zip",
    targetFileName: "single-valid-night.zip"
  },
  {
    fixtureSource: "sleep-scenario",
    scenarioId: "strong-coverage-multi-night",
    artifactKind: "normalizedJson",
    targetFileName: "strong-coverage-multi-night.sleep-records.json"
  },
  {
    fixtureSource: "sleep-scenario",
    scenarioId: "two-valid-nights",
    artifactKind: "normalizedJson",
    targetFileName: "two-valid-nights.sleep-records.json"
  },
  {
    fixtureSource: "sleep-scenario",
    scenarioId: "two-valid-nights",
    artifactKind: "xml",
    targetFileName: "two-valid-nights.xml"
  },
  {
    fixtureSource: "sleep-scenario",
    scenarioId: "two-valid-nights",
    artifactKind: "zip",
    targetFileName: "two-valid-nights.zip"
  },
  {
    fixtureSource: "dataset-fixture",
    datasetFixtureId: "apple-health-sleep-dataset",
    artifactKind: "expectedArtifactJson",
    targetFileName: "two-valid-nights.dataset-artifact.json"
  },
  {
    fixtureSource: "dataset-fixture",
    datasetFixtureId: "structured-json-dataset",
    artifactKind: "source",
    targetFileName: "structured-json-dataset.json"
  },
  {
    fixtureSource: "dataset-fixture",
    datasetFixtureId: "structured-json-dataset",
    artifactKind: "expectedArtifactJson",
    targetFileName: "structured-json-dataset.dataset-artifact.json"
  },
  {
    fixtureSource: "dataset-fixture",
    datasetFixtureId: "structured-txt-dataset",
    artifactKind: "source",
    targetFileName: "structured-txt-dataset.txt"
  },
  {
    fixtureSource: "dataset-fixture",
    datasetFixtureId: "structured-txt-dataset",
    artifactKind: "expectedArtifactJson",
    targetFileName: "structured-txt-dataset.dataset-artifact.json"
  }
] as const satisfies readonly DataForAllFixtureSyncSelection[];

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

function createDataForAllFixtureSyncContract(): readonly DataForAllFixtureSyncSelection[] {
  const seenSelectionKeys = new Set<string>();
  const seenTargetFileNames = new Set<string>();

  return Object.freeze(
    CURATED_DATAFORALL_SYNC_SELECTION.map((selection) => {
      const selectionKey =
        selection.fixtureSource === "sleep-scenario"
          ? `${selection.fixtureSource}:${selection.scenarioId}:${selection.artifactKind}`
          : `${selection.fixtureSource}:${selection.datasetFixtureId}:${selection.artifactKind}`;

      if (seenSelectionKeys.has(selectionKey)) {
        throw new Error(`Duplicate DATAFORALL fixture selection: ${selectionKey}`);
      }

      if (seenTargetFileNames.has(selection.targetFileName)) {
        throw new Error(`Duplicate DATAFORALL managed target filename: ${selection.targetFileName}`);
      }

      assertPlainBasename(selection.targetFileName, "DATAFORALL managed target filename");

      seenSelectionKeys.add(selectionKey);
      seenTargetFileNames.add(selection.targetFileName);

      return Object.freeze({ ...selection });
    })
  );
}

export const DATAFORALL_CURATED_FIXTURE_SYNC_CONTRACT = createDataForAllFixtureSyncContract();

function createDataForAllFixtureSyncEntries(): readonly DataForAllFixtureSyncEntry[] {
  return Object.freeze(
    DATAFORALL_CURATED_FIXTURE_SYNC_CONTRACT.map((selection) => {
      const sourceFileName =
        selection.fixtureSource === "sleep-scenario"
          ? buildFixtureManifest(getScenarioById(selection.scenarioId)).files[selection.artifactKind]
          : buildDatasetFixtureManifest(getDatasetFixtureById(selection.datasetFixtureId)).files[
              selection.artifactKind
            ];

      return Object.freeze({
        ...selection,
        sourceFileName
      });
    })
  );
}

export const DATAFORALL_MANAGED_FIXTURE_FILE_NAMES = Object.freeze(
  DATAFORALL_CURATED_FIXTURE_SYNC_CONTRACT.map((selection) => selection.targetFileName)
);

const DATAFORALL_FIXTURE_SYNC_ENTRIES = createDataForAllFixtureSyncEntries();
const DATAFORALL_MANAGED_FIXTURE_FILE_NAME_SET = new Set(DATAFORALL_MANAGED_FIXTURE_FILE_NAMES);
const DATAFORALL_FIXTURE_SYNC_CONTRACT_BY_TARGET_FILE_NAME = new Map(
  DATAFORALL_FIXTURE_SYNC_ENTRIES.map((entry) => [entry.targetFileName, entry] as const)
);

export function isManagedDataForAllFixtureFileName(fileName: string): boolean {
  return DATAFORALL_MANAGED_FIXTURE_FILE_NAME_SET.has(fileName);
}

export function getDataForAllFixtureSourceFileNameForTargetFileName(
  fileName: string
): string | undefined {
  return DATAFORALL_FIXTURE_SYNC_CONTRACT_BY_TARGET_FILE_NAME.get(fileName)?.sourceFileName;
}
