import type { SleepScenario, SleepScenarioRecord } from "../domain/sleepScenario";

function escapeXmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderAttributes(record: SleepScenarioRecord): string {
  const attributes: Record<string, string | undefined> = {
    ...record.extraAttributes,
    type: "HKCategoryTypeIdentifierSleepAnalysis",
    sourceName: record.sourceName,
    sourceVersion: record.sourceVersion,
    device: record.device,
    creationDate: record.creationDate,
    startDate: record.startDate,
    endDate: record.endDate,
    value: record.value
  };

  return Object.entries(attributes)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string")
    .map(([key, value]) => `${key}="${escapeXmlAttribute(value)}"`)
    .join(" ");
}

export function renderAppleHealthXml(scenario: SleepScenario): string {
  const recordLines = scenario.records
    .map((record) => `  <Record ${renderAttributes(record)} />`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<HealthData locale="en_US">\n${recordLines}\n</HealthData>`;
}
