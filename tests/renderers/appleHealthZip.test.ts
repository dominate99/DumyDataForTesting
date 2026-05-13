import { describe, expect, test } from "vitest";
import JSZip from "jszip";
import { buildAppleHealthZip } from "../../src/renderers/appleHealthZip";
import { getScenarioById } from "../../src/scenarios/presets";

describe("buildAppleHealthZip", () => {
  test("writes export.xml to the canonical Apple Health path", async () => {
    const zipBytes = await buildAppleHealthZip(getScenarioById("single-valid-night"));
    const zip = await JSZip.loadAsync(zipBytes);
    const xml = await zip.file("apple_health_export/export.xml")?.async("string");

    expect(xml).toContain('type="HKCategoryTypeIdentifierSleepAnalysis"');
  });

  test("produces stable bytes for the same scenario across repeated runs", async () => {
    const first = await buildAppleHealthZip(getScenarioById("single-valid-night"));
    const second = await buildAppleHealthZip(getScenarioById("single-valid-night"));

    expect([...first]).toEqual([...second]);
  });
});
