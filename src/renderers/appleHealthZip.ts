import JSZip from "jszip";
import type { SleepScenario } from "../domain/sleepScenario";
import { renderAppleHealthXml } from "./appleHealthXml";

const FIXTURE_ZIP_ENTRY_DATE = new Date("2026-05-07T12:34:56.000Z");

export async function buildAppleHealthZip(scenario: SleepScenario): Promise<Uint8Array> {
  const zip = new JSZip();
  zip.file("apple_health_export/export.xml", renderAppleHealthXml(scenario), {
    date: FIXTURE_ZIP_ENTRY_DATE
  });
  return zip.generateAsync({ type: "uint8array" });
}
