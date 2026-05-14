import type { SleepRecord } from "../renderers/sleepRecords";

export type DatasetFixtureSourceType = "health" | "structured-file";
export type DatasetFixtureConnectorType = "apple-health" | "json" | "txt";
export type DatasetFixtureDetailKind = "sample" | "row" | "record";

export interface DatasetFixtureFileInfo {
  originalName: string;
  detectedType: string;
  sizeBytes: number;
}

export interface DatasetFixtureStats {
  itemCount: number;
  fieldCount: number;
  coverageHint: string;
}

export interface DatasetFixturePreviewSummary {
  text: string;
  highlights: readonly string[];
}

export interface DatasetFixtureSchemaSummary {
  shape: string;
}

export interface DatasetFixtureExpectedArtifact {
  sourceType: DatasetFixtureSourceType;
  connectorType: DatasetFixtureConnectorType;
  detailKind: DatasetFixtureDetailKind;
  datasetName: string;
  fileInfo: DatasetFixtureFileInfo;
  stats: DatasetFixtureStats;
  previewSummary: DatasetFixturePreviewSummary;
  schemaSummary: DatasetFixtureSchemaSummary;
  sleepRecords?: readonly SleepRecord[];
}

export interface DatasetFixtureDefinition {
  id: string;
  fileName: string;
  detectedType: string;
  fileContents: string;
  expectedArtifact: Omit<DatasetFixtureExpectedArtifact, "fileInfo">;
}

