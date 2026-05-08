import type { SleepScenario } from "../domain/sleepScenario";
import { createHash } from "node:crypto";

const WINDOWS_RESERVED_NAMES = new Set([
  "con",
  "prn",
  "aux",
  "nul",
  "com1",
  "com2",
  "com3",
  "com4",
  "com5",
  "com6",
  "com7",
  "com8",
  "com9",
  "lpt1",
  "lpt2",
  "lpt3",
  "lpt4",
  "lpt5",
  "lpt6",
  "lpt7",
  "lpt8",
  "lpt9"
]);

function buildSafeFixtureStem(id: string): string {
  const sanitized = id
    .replaceAll(/[<>:"/\\|?*\u0000-\u001F]+/g, "-")
    .replaceAll(/\.\.+/g, "-")
    .trim()
    .replace(/[. ]+$/g, "");
  const safeStem = sanitized || "scenario";
  const firstSegment = safeStem.split(".")[0].toLowerCase();

  const collisionSafeStem = `${safeStem}-${createHash("sha1").update(id).digest("hex").slice(0, 8)}`;

  if (WINDOWS_RESERVED_NAMES.has(firstSegment)) {
    return `scenario-${collisionSafeStem}`;
  }

  return collisionSafeStem;
}

export interface ScenarioFixtureManifest {
  id: string;
  expectedOutcome: SleepScenario["expectedOutcome"];
  files: {
    xml: string;
    zip: string;
    normalizedJson: string;
  };
}

export function buildFixtureManifest(scenario: SleepScenario): ScenarioFixtureManifest {
  const safeStem = buildSafeFixtureStem(scenario.id);

  return {
    id: scenario.id,
    expectedOutcome: scenario.expectedOutcome,
    files: {
      xml: `${safeStem}.xml`,
      zip: `${safeStem}.zip`,
      normalizedJson: `${safeStem}.sleep-records.json`
    }
  };
}
