import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { buildExpectedSleepRecords, parseRecordDate } from "../../src/renderers/sleepRecords";
import { getScenarioById } from "../../src/scenarios/presets";

describe("buildExpectedSleepRecords", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-07T12:34:56.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("valid scenario normalizes into one expected SleepRecord", () => {
    const scenario = getScenarioById("single-valid-night");

    expect(buildExpectedSleepRecords(scenario)).toEqual([
      {
        id: "2026-04-01 00:00:00 -0700|2026-04-01 08:00:00 -0700|Apple Watch|HKCategoryValueSleepAnalysisAsleepCore",
        sourceType: "apple-health",
        startAt: "2026-04-01T07:00:00.000Z",
        endAt: "2026-04-01T15:00:00.000Z",
        durationMinutes: 480,
        sleepStageSummary: "HKCategoryValueSleepAnalysisAsleepCore",
        sourceDevice: "Apple Watch",
        ingestedAt: "2026-05-07T12:34:56.000Z"
      }
    ]);
  });

  test("uses fallback device and stage values when scenario data omits them", () => {
    const scenario = getScenarioById("fallback-device-and-stage");

    expect(buildExpectedSleepRecords(scenario)).toEqual([
      {
        id: "2026-04-01 00:00:00 -0700|2026-04-01 08:00:00 -0700|apple-health-export|unknown",
        sourceType: "apple-health",
        startAt: "2026-04-01T07:00:00.000Z",
        endAt: "2026-04-01T15:00:00.000Z",
        durationMinutes: 480,
        sleepStageSummary: "unknown",
        sourceDevice: "apple-health-export",
        ingestedAt: "2026-05-07T12:34:56.000Z"
      }
    ]);
  });

  test("uses fallback device and stage values when scenario data provides blank strings", () => {
    expect(
      buildExpectedSleepRecords({
        id: "blank-metadata",
        description: "Blank metadata should still fall back.",
        expectedOutcome: "success",
        records: [
          {
            startDate: "2026-04-01 00:00:00 -0700",
            endDate: "2026-04-01 08:00:00 -0700",
            value: "   ",
            device: ""
          }
        ]
      })
    ).toEqual([
      {
        id: "2026-04-01 00:00:00 -0700|2026-04-01 08:00:00 -0700|apple-health-export|unknown",
        sourceType: "apple-health",
        startAt: "2026-04-01T07:00:00.000Z",
        endAt: "2026-04-01T15:00:00.000Z",
        durationMinutes: 480,
        sleepStageSummary: "unknown",
        sourceDevice: "apple-health-export",
        ingestedAt: "2026-05-07T12:34:56.000Z"
      }
    ]);
  });

  test("normalizes multiple records for repeated valid nights", () => {
    const scenario = getScenarioById("two-valid-nights");

    expect(buildExpectedSleepRecords(scenario)).toEqual([
      {
        id: "2026-04-01 00:00:00 -0700|2026-04-01 08:00:00 -0700|Apple Watch|HKCategoryValueSleepAnalysisAsleepCore",
        sourceType: "apple-health",
        startAt: "2026-04-01T07:00:00.000Z",
        endAt: "2026-04-01T15:00:00.000Z",
        durationMinutes: 480,
        sleepStageSummary: "HKCategoryValueSleepAnalysisAsleepCore",
        sourceDevice: "Apple Watch",
        ingestedAt: "2026-05-07T12:34:56.000Z"
      },
      {
        id: "2026-04-02 00:15:00 -0700|2026-04-02 07:15:00 -0700|Apple Watch|HKCategoryValueSleepAnalysisAsleepCore",
        sourceType: "apple-health",
        startAt: "2026-04-02T07:15:00.000Z",
        endAt: "2026-04-02T14:15:00.000Z",
        durationMinutes: 420,
        sleepStageSummary: "HKCategoryValueSleepAnalysisAsleepCore",
        sourceDevice: "Apple Watch",
        ingestedAt: "2026-05-07T12:34:56.000Z"
      }
    ]);
  });

  test("throws the declared error for failure scenarios", () => {
    expect(() => buildExpectedSleepRecords(getScenarioById("missing-start-date"))).toThrow(
      "Sleep record is missing a startDate or endDate."
    );
    expect(() => buildExpectedSleepRecords(getScenarioById("invalid-start-date"))).toThrow(
      "Sleep record has an invalid startDate."
    );
    expect(() => buildExpectedSleepRecords(getScenarioById("end-before-start"))).toThrow(
      "Sleep record endDate must be later than startDate."
    );
  });

  test("rejects impossible calendar dates even when the string format matches", () => {
    expect(() => parseRecordDate("2026-02-30 00:00:00 -0700", "startDate")).toThrow(
      "Sleep record has an invalid startDate."
    );
  });
});
