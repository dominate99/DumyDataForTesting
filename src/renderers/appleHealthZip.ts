import JSZip from "jszip";
import type { SleepScenario } from "../domain/sleepScenario";
import { renderAppleHealthXml } from "./appleHealthXml";

export async function buildAppleHealthZip(scenario: SleepScenario): Promise<Uint8Array> {
  const zip = new JSZip();
  zip.file("apple_health_export/export.xml", renderAppleHealthXml(scenario));
  return zip.generateAsync({ type: "uint8array" });
}
