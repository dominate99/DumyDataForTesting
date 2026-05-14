import type { DatasetFixtureDefinition } from "../domain/datasetFixture";
import { buildExpectedSleepRecords } from "../renderers/sleepRecords";
import {
  buildExpectedDatasetImportArtifact,
  buildStructuredDatasetArtifactShape
} from "../renderers/datasetImportArtifact";
import { renderAppleHealthXml } from "../renderers/appleHealthXml";
import { getScenarioById } from "../scenarios/presets";

function deepFreeze<T>(value: T): T {
  if (Array.isArray(value)) {
    for (const entry of value) {
      deepFreeze(entry);
    }
  } else if (value && typeof value === "object") {
    for (const entry of Object.values(value as Record<string, unknown>)) {
      deepFreeze(entry);
    }
  }

  return Object.freeze(value);
}

const appleHealthScenario = getScenarioById("two-valid-nights");
const appleHealthSleepRecords = buildExpectedSleepRecords(appleHealthScenario);

const datasetFixtureCatalog = deepFreeze([
  {
    id: "apple-health-sleep-dataset",
    fileName: "two-valid-nights.xml",
    detectedType: "text/xml",
    fileContents: renderAppleHealthXml(appleHealthScenario),
    expectedArtifact: {
      sourceType: "health",
      connectorType: "apple-health",
      detailKind: "sample",
      datasetName: "Apple Health Sleep",
      stats: {
        itemCount: appleHealthSleepRecords.length,
        fieldCount: 0,
        coverageHint: `${appleHealthSleepRecords.length} nights`
      },
      previewSummary: {
        text: `${appleHealthSleepRecords.length} sleep samples imported`,
        highlights: ["sleep", `${appleHealthSleepRecords.length} nights`]
      },
      schemaSummary: { shape: "health-samples" },
      sleepRecords: appleHealthSleepRecords
    }
  },
  {
    id: "structured-json-dataset",
    fileName: "structured-json-dataset.json",
    detectedType: "application/json",
    fileContents: '[{"name":"alice","score":10},{"name":"bob","score":8}]',
    expectedArtifact: buildStructuredDatasetArtifactShape(
      "json",
      "structured-json-dataset.json",
      2,
      2,
      "json-records"
    )
  },
  {
    id: "structured-txt-dataset",
    fileName: "structured-txt-dataset.txt",
    detectedType: "text/plain",
    fileContents: "line 1\nline 2",
    expectedArtifact: buildStructuredDatasetArtifactShape(
      "txt",
      "structured-txt-dataset.txt",
      2,
      1,
      "txt-lines"
    )
  }
] satisfies DatasetFixtureDefinition[]);

export const datasetFixtures = datasetFixtureCatalog;

export function getDatasetFixtureById(id: string): DatasetFixtureDefinition {
  const fixture = datasetFixtureCatalog.find((candidate) => candidate.id === id);

  if (!fixture) {
    throw new Error(`Unknown dataset fixture: ${id}`);
  }

  return fixture;
}

export function buildExpectedDatasetFixtureArtifactById(id: string) {
  return buildExpectedDatasetImportArtifact(getDatasetFixtureById(id));
}

