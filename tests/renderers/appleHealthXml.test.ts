import { describe, expect, test } from "vitest";
import { renderAppleHealthXml } from "../../src/renderers/appleHealthXml";
import { getScenarioById } from "../../src/scenarios/presets";

describe("renderAppleHealthXml", () => {
  test("renders a canonical Apple Health export document", () => {
    const xml = renderAppleHealthXml(getScenarioById("single-valid-night"));

    expect(xml).toMatch(
      /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<HealthData locale="en_US">\n  <Record [\s\S]*type="HKCategoryTypeIdentifierSleepAnalysis"[\s\S]*startDate="2026-04-01 00:00:00 -0700"[\s\S]* \/>\n<\/HealthData>$/
    );
  });

  test("omits missing optional attributes without inventing values", () => {
    const xml = renderAppleHealthXml(getScenarioById("missing-start-date"));

    expect(xml).not.toContain('startDate="');
    expect(xml).toContain('endDate="2026-04-01 08:00:00 -0700"');
  });

  test("escapes XML attribute values", () => {
    const xml = renderAppleHealthXml({
      id: "xml-escaping",
      description: "Escapes XML-sensitive characters.",
      expectedOutcome: "success",
      records: [
        {
          startDate: "2026-04-01 00:00:00 -0700",
          endDate: "2026-04-01 08:00:00 -0700",
          sourceName: 'Watch & Phone <Sync> "v1"'
        }
      ]
    });

    expect(xml).toContain('sourceName="Watch &amp; Phone &lt;Sync&gt; &quot;v1&quot;"');
  });

  test("does not let extra attributes override canonical Apple Health fields", () => {
    const xml = renderAppleHealthXml({
      id: "canonical-fields-win",
      description: "Canonical fields should not be overridden by extra attributes.",
      expectedOutcome: "success",
      records: [
        {
          startDate: "2026-04-01 00:00:00 -0700",
          endDate: "2026-04-01 08:00:00 -0700",
          extraAttributes: {
            type: "WrongType",
            startDate: "1900-01-01 00:00:00 -0700"
          }
        }
      ]
    });

    expect(xml).toContain('type="HKCategoryTypeIdentifierSleepAnalysis"');
    expect(xml).toContain('startDate="2026-04-01 00:00:00 -0700"');
    expect(xml).not.toContain('type="WrongType"');
    expect(xml).not.toContain('startDate="1900-01-01 00:00:00 -0700"');
  });
});
