import type { SleepScenario } from "../domain/sleepScenario";

const NIGHT_1_START = "2026-04-01 00:00:00 -0700";
const NIGHT_1_END = "2026-04-01 08:00:00 -0700";

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

const presetCatalog = deepFreeze([
  {
    id: "single-valid-night",
    description: "A single valid Apple Health sleep record.",
    expectedOutcome: "success",
    records: [
      {
        startDate: NIGHT_1_START,
        endDate: NIGHT_1_END,
        value: "HKCategoryValueSleepAnalysisAsleepCore",
        device: "Apple Watch",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-04-01 08:05:00 -0700"
      }
    ]
  },
  {
    id: "two-valid-nights",
    description: "Two valid nights for repository and import replacement tests.",
    expectedOutcome: "success",
    records: [
      {
        startDate: NIGHT_1_START,
        endDate: NIGHT_1_END,
        value: "HKCategoryValueSleepAnalysisAsleepCore",
        device: "Apple Watch",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-04-01 08:05:00 -0700"
      },
      {
        startDate: "2026-04-02 00:15:00 -0700",
        endDate: "2026-04-02 07:15:00 -0700",
        value: "HKCategoryValueSleepAnalysisAsleepCore",
        device: "Apple Watch",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-04-02 07:35:00 -0700"
      }
    ]
  },
  {
    id: "missing-start-date",
    description: "A record missing startDate for parser validation tests.",
    expectedOutcome: "failure",
    expectedError: "Sleep record is missing a startDate or endDate.",
    records: [
      {
        endDate: NIGHT_1_END,
        value: "HKCategoryValueSleepAnalysisAsleepCore",
        device: "Apple Watch",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-04-01 08:05:00 -0700"
      }
    ]
  },
  {
    id: "invalid-start-date",
    description: "A record with an invalid start date string.",
    expectedOutcome: "failure",
    expectedError: "Sleep record has an invalid startDate.",
    records: [
      {
        startDate: "not-a-date",
        endDate: NIGHT_1_END,
        value: "HKCategoryValueSleepAnalysisAsleepCore",
        device: "Apple Watch",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-04-01 08:05:00 -0700"
      }
    ]
  },
  {
    id: "end-before-start",
    description: "A record with an end date that is not later than the start date.",
    expectedOutcome: "failure",
    expectedError: "Sleep record endDate must be later than startDate.",
    records: [
      {
        startDate: NIGHT_1_END,
        endDate: NIGHT_1_END,
        value: "HKCategoryValueSleepAnalysisAsleepCore",
        device: "Apple Watch",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-04-01 08:05:00 -0700"
      }
    ]
  },
  {
    id: "fallback-device-and-stage",
    description: "A valid record that omits device and value so normalization can use fallbacks.",
    expectedOutcome: "success",
    records: [
      {
        startDate: NIGHT_1_START,
        endDate: NIGHT_1_END,
        sourceName: "Apple Health Export",
        sourceVersion: "1",
        creationDate: "2026-04-01 08:05:00 -0700"
      }
    ]
  },
  {
    id: "strong-coverage-multi-night",
    description: "Four weekly records with rich metadata for value estimate coverage tests.",
    expectedOutcome: "success",
    records: [
      {
        startDate: "2026-03-01 23:00:00 -0800",
        endDate: "2026-03-02 07:00:00 -0800",
        value: "HKCategoryValueSleepAnalysisAsleepREM",
        device: "Apple Watch Ultra",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-03-02 07:05:00 -0800"
      },
      {
        startDate: "2026-03-08 23:10:00 -0800",
        endDate: "2026-03-09 07:00:00 -0800",
        value: "HKCategoryValueSleepAnalysisAsleepDeep",
        device: "Apple Watch Ultra",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-03-09 07:05:00 -0800"
      },
      {
        startDate: "2026-03-15 22:55:00 -0700",
        endDate: "2026-03-16 06:55:00 -0700",
        value: "HKCategoryValueSleepAnalysisAsleepCore",
        device: "Apple Watch Ultra",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-03-16 07:01:00 -0700"
      },
      {
        startDate: "2026-03-22 23:05:00 -0700",
        endDate: "2026-03-23 07:10:00 -0700",
        value: "HKCategoryValueSleepAnalysisAsleepREM",
        device: "Apple Watch Ultra",
        sourceName: "Apple Watch",
        sourceVersion: "10",
        creationDate: "2026-03-23 07:12:00 -0700"
      }
    ]
  }
] satisfies SleepScenario[]);

export const scenarioPresets = presetCatalog;

export function getScenarioById(id: string): SleepScenario {
  const scenario = presetCatalog.find((candidate) => candidate.id === id);

  if (!scenario) {
    throw new Error(`Unknown scenario: ${id}`);
  }

  return scenario;
}
