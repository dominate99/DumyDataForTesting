import { describe, expect, test } from "vitest";
import { getScenarioById, scenarioPresets } from "../../src/scenarios/presets";

describe("scenario presets", () => {
  test("includes the expected starter scenarios", () => {
    expect(scenarioPresets.map((scenario) => scenario.id)).toEqual([
      "single-valid-night",
      "two-valid-nights",
      "replacement-import-single-night",
      "missing-start-date",
      "invalid-start-date",
      "mixed-valid-and-invalid-records",
      "end-before-start",
      "fallback-device-and-stage",
      "strong-coverage-multi-night"
    ]);
  });

  test("returns a scenario by id", () => {
    expect(getScenarioById("single-valid-night").description).toContain("single");
  });

  test("keeps the mixed failure scenario and replacement success scenario semantically distinct", () => {
    expect(getScenarioById("mixed-valid-and-invalid-records")).toMatchObject({
      expectedOutcome: "failure",
      expectedError: "Sleep record has an invalid startDate."
    });
    expect(getScenarioById("replacement-import-single-night")).toMatchObject({
      expectedOutcome: "success"
    });
  });

  test("throws when a scenario id is unknown", () => {
    expect(() => getScenarioById("does-not-exist")).toThrow("Unknown scenario: does-not-exist");
  });

  test("does not allow preset mutations to leak into the canonical catalog", () => {
    const scenario = getScenarioById("single-valid-night");
    const mutableScenario = scenario as unknown as {
      description: string;
      records: Array<{ startDate?: string; endDate?: string }>;
    };

    expect(() => {
      mutableScenario.description = "mutated";
    }).toThrow(TypeError);
    expect(() => {
      mutableScenario.records.push({
        startDate: "2026-04-03 00:00:00 -0700",
        endDate: "2026-04-03 08:00:00 -0700"
      });
    }).toThrow(TypeError);
    expect(getScenarioById("single-valid-night").description).toBe("A single valid Apple Health sleep record.");
    expect(getScenarioById("single-valid-night").records).toHaveLength(1);
  });

  test("keeps success and failure expectation metadata aligned", () => {
    expect(
      scenarioPresets
        .filter((scenario) => scenario.expectedOutcome === "success")
        .every((scenario) => scenario.expectedError === undefined)
    ).toBe(true);
    expect(
      scenarioPresets
        .filter((scenario) => scenario.expectedOutcome === "failure")
        .every((scenario) => typeof scenario.expectedError === "string" && scenario.expectedError.length > 0)
    ).toBe(true);
  });
});
