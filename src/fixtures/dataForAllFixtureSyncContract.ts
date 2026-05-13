import { buildFixtureManifest, type ScenarioFixtureManifest } from "./fixtureManifest";
import { posix, win32 } from "node:path";
import { getScenarioById } from "../scenarios/presets";

export type DataForAllFixtureArtifactKind = keyof ScenarioFixtureManifest["files"];

export interface DataForAllFixtureSyncSelection {
  scenarioId: string;
  artifactKind: DataForAllFixtureArtifactKind;
  targetFileName: string;
}

export interface DataForAllFixtureSyncEntry extends DataForAllFixtureSyncSelection {
  sourceFileName: string;
}

const CURATED_DATAFORALL_SYNC_SELECTION = [
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
      const selectionKey = `${selection.scenarioId}:${selection.artifactKind}`;

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
      const manifest = buildFixtureManifest(getScenarioById(selection.scenarioId));

      return Object.freeze({
        ...selection,
        sourceFileName: manifest.files[selection.artifactKind]
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
