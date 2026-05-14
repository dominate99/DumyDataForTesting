import type {
  DatasetFixtureConnectorType,
  DatasetFixtureDefinition,
  DatasetFixtureExpectedArtifact
} from "../domain/datasetFixture";

const textEncoder = new TextEncoder();

function buildStructuredPreviewSummary(
  connectorType: Exclude<DatasetFixtureConnectorType, "apple-health">,
  datasetName: string,
  itemCount: number,
  fieldCount: number
) {
  return {
    text: `${datasetName} imported successfully`,
    highlights: [`${itemCount} rows`, `${fieldCount} fields`]
  } as const;
}

export function buildExpectedDatasetImportArtifact(
  fixture: DatasetFixtureDefinition
): DatasetFixtureExpectedArtifact {
  return {
    ...fixture.expectedArtifact,
    fileInfo: {
      originalName: fixture.fileName,
      detectedType: fixture.detectedType,
      sizeBytes: textEncoder.encode(fixture.fileContents).byteLength
    }
  };
}

export function buildStructuredDatasetArtifactShape(
  connectorType: Exclude<DatasetFixtureConnectorType, "apple-health">,
  fileName: string,
  itemCount: number,
  fieldCount: number,
  shape: "json-records" | "txt-lines"
) {
  return {
    sourceType: "structured-file" as const,
    connectorType,
    detailKind: connectorType === "txt" ? ("record" as const) : ("row" as const),
    datasetName: fileName,
    stats: {
      itemCount,
      fieldCount,
      coverageHint: `${itemCount} rows`
    },
    previewSummary: buildStructuredPreviewSummary(
      connectorType,
      fileName,
      itemCount,
      fieldCount
    ),
    schemaSummary: { shape }
  };
}

