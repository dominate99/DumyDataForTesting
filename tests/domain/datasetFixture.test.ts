import { describe, expect, test } from "vitest";
import {
  buildExpectedDatasetFixtureArtifactById,
  datasetFixtures,
  getDatasetFixtureById
} from "../../src/fixtures/datasetFixtures";

describe("dataset fixtures", () => {
  test("includes the expected canonical dataset fixture families", () => {
    expect(datasetFixtures.map((fixture) => fixture.id)).toEqual([
      "apple-health-sleep-dataset",
      "structured-json-dataset",
      "structured-txt-dataset"
    ]);
  });

  test("builds the canonical Apple Health dataset artifact with linked sleep records", () => {
    expect(buildExpectedDatasetFixtureArtifactById("apple-health-sleep-dataset")).toEqual({
      sourceType: "health",
      connectorType: "apple-health",
      detailKind: "sample",
      datasetName: "Apple Health Sleep",
      fileInfo: {
        originalName: "two-valid-nights.xml",
        detectedType: "text/xml",
        sizeBytes: new TextEncoder().encode(
          getDatasetFixtureById("apple-health-sleep-dataset").fileContents
        ).byteLength
      },
      stats: {
        itemCount: 2,
        fieldCount: 0,
        coverageHint: "2 nights"
      },
      previewSummary: {
        text: "2 sleep samples imported",
        highlights: ["sleep", "2 nights"]
      },
      schemaSummary: {
        shape: "health-samples"
      },
      sleepRecords: [
        expect.objectContaining({
          startAt: "2026-04-01T07:00:00.000Z",
          endAt: "2026-04-01T15:00:00.000Z"
        }),
        expect.objectContaining({
          startAt: "2026-04-02T07:15:00.000Z",
          endAt: "2026-04-02T14:15:00.000Z"
        })
      ]
    });
  });

  test("builds the structured JSON dataset artifact", () => {
    expect(buildExpectedDatasetFixtureArtifactById("structured-json-dataset")).toEqual({
      sourceType: "structured-file",
      connectorType: "json",
      detailKind: "row",
      datasetName: "structured-json-dataset.json",
      fileInfo: {
        originalName: "structured-json-dataset.json",
        detectedType: "application/json",
        sizeBytes: 54
      },
      stats: {
        itemCount: 2,
        fieldCount: 2,
        coverageHint: "2 rows"
      },
      previewSummary: {
        text: "structured-json-dataset.json imported successfully",
        highlights: ["2 rows", "2 fields"]
      },
      schemaSummary: {
        shape: "json-records"
      }
    });
  });

  test("throws when a dataset fixture id is unknown", () => {
    expect(() => getDatasetFixtureById("does-not-exist")).toThrow(
      "Unknown dataset fixture: does-not-exist"
    );
  });
});
