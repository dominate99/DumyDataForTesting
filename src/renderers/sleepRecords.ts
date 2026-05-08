import type { SleepScenario, SleepScenarioRecord } from "../domain/sleepScenario";

const DEFAULT_STAGE = "unknown";
const DEFAULT_DEVICE = "apple-health-export";
const RECORD_DATE_PATTERN =
  /^(?<date>\d{4}-\d{2}-\d{2}) (?<time>\d{2}:\d{2}:\d{2}) (?<offset>[+-]\d{4})$/;

function parseOffsetMinutes(offset: string): number {
  const sign = offset.startsWith("-") ? -1 : 1;
  const hours = Number(offset.slice(1, 3));
  const minutes = Number(offset.slice(3, 5));
  return sign * (hours * 60 + minutes);
}

function formatOffsetLocalParts(date: Date, offset: string): string {
  const offsetMinutes = parseOffsetMinutes(offset);
  const offsetDate = new Date(date.getTime() + offsetMinutes * 60_000);
  const year = offsetDate.getUTCFullYear();
  const month = String(offsetDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(offsetDate.getUTCDate()).padStart(2, "0");
  const hours = String(offsetDate.getUTCHours()).padStart(2, "0");
  const minutes = String(offsetDate.getUTCMinutes()).padStart(2, "0");
  const seconds = String(offsetDate.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export interface SleepRecord {
  id: string;
  sourceType: "apple-health";
  startAt: string;
  endAt: string;
  durationMinutes: number;
  sleepStageSummary: string;
  sourceDevice: string;
  ingestedAt: string;
}

export function parseRecordDate(value: string, fieldName: "startDate" | "endDate"): string {
  const match = RECORD_DATE_PATTERN.exec(value);

  if (!match?.groups) {
    throw new Error(`Sleep record has an invalid ${fieldName}.`);
  }

  const { date, time, offset } = match.groups;
  const normalizedOffset = `${offset.slice(0, 3)}:${offset.slice(3)}`;
  const normalizedDate = new Date(`${date}T${time}${normalizedOffset}`);

  if (Number.isNaN(normalizedDate.getTime())) {
    throw new Error(`Sleep record has an invalid ${fieldName}.`);
  }

  if (`${date} ${time}` !== formatOffsetLocalParts(normalizedDate, offset)) {
    throw new Error(`Sleep record has an invalid ${fieldName}.`);
  }

  return normalizedDate.toISOString();
}

function validateRecordDates(record: SleepScenarioRecord): { startAt: string; endAt: string } {
  if (!record.startDate || !record.endDate) {
    throw new Error("Sleep record is missing a startDate or endDate.");
  }

  const startAt = parseRecordDate(record.startDate, "startDate");
  const endAt = parseRecordDate(record.endDate, "endDate");

  if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
    throw new Error("Sleep record endDate must be later than startDate.");
  }

  return {
    startAt,
    endAt
  };
}

export function buildExpectedSleepRecords(scenario: SleepScenario): SleepRecord[] {
  const ingestedAt = new Date().toISOString();

  return scenario.records.map((record) => {
    const { startAt, endAt } = validateRecordDates(record);
    const startDate = record.startDate;
    const endDate = record.endDate;
    const normalizedDevice = record.device?.trim();
    const normalizedStage = record.value?.trim();
    const sourceDevice = normalizedDevice ? normalizedDevice : DEFAULT_DEVICE;
    const sleepStageSummary = normalizedStage ? normalizedStage : DEFAULT_STAGE;
    const durationMinutes = (new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000;

    return {
      id: `${startDate}|${endDate}|${sourceDevice}|${sleepStageSummary}`,
      sourceType: "apple-health",
      startAt,
      endAt,
      durationMinutes,
      sleepStageSummary,
      sourceDevice,
      ingestedAt
    };
  });
}
