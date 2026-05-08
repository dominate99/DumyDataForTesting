import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import type { SleepScenario } from "../domain/sleepScenario";
import { buildAppleHealthZip } from "../renderers/appleHealthZip";
import { renderAppleHealthXml } from "../renderers/appleHealthXml";
import { buildExpectedSleepRecords } from "../renderers/sleepRecords";
import { buildFixtureManifest } from "./fixtureManifest";

export interface WriteScenarioFixturesOptions {
  outputDir: string;
}

export interface WriteScenarioFixturesResult {
  xmlPath: string;
  zipPath: string;
  normalizedJsonPath: string;
  manifestPath: string;
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

export async function writeScenarioFixtures(
  scenario: SleepScenario,
  options: WriteScenarioFixturesOptions
): Promise<WriteScenarioFixturesResult> {
  await mkdir(options.outputDir, { recursive: true });

  const manifest = buildFixtureManifest(scenario);
  const xmlPath = join(options.outputDir, manifest.files.xml);
  const zipPath = join(options.outputDir, manifest.files.zip);
  const normalizedJsonPath = join(options.outputDir, manifest.files.normalizedJson);
  const fixtureStem = manifest.files.xml.replace(/\.xml$/, "");
  const manifestPath = join(options.outputDir, `${fixtureStem}.manifest.json`);

  const normalizedRecords =
    scenario.expectedOutcome === "success" ? buildExpectedSleepRecords(scenario) : [];
  const xmlText = renderAppleHealthXml(scenario);
  const zipBuffer = Buffer.from(await buildAppleHealthZip(scenario));
  const normalizedJson = JSON.stringify(normalizedRecords, null, 2);
  const manifestJson = JSON.stringify(manifest, null, 2);
  const stagedFiles = [
    { finalPath: xmlPath, tempPath: `${xmlPath}.${randomUUID()}.tmp`, contents: xmlText, encoding: "utf8" as const },
    { finalPath: zipPath, tempPath: `${zipPath}.${randomUUID()}.tmp`, contents: zipBuffer },
    {
      finalPath: normalizedJsonPath,
      tempPath: `${normalizedJsonPath}.${randomUUID()}.tmp`,
      contents: normalizedJson,
      encoding: "utf8" as const
    },
    {
      finalPath: manifestPath,
      tempPath: `${manifestPath}.${randomUUID()}.tmp`,
      contents: manifestJson,
      encoding: "utf8" as const
    }
  ];
  const backupPaths = new Map<string, string>();
  const movedFinalPaths: string[] = [];

  try {
    for (const file of stagedFiles) {
      await writeFile(file.tempPath, file.contents, file.encoding);
    }

    for (const file of stagedFiles) {
      if (await pathExists(file.finalPath)) {
        const backupPath = `${file.finalPath}.${randomUUID()}.bak`;
        await rename(file.finalPath, backupPath);
        backupPaths.set(file.finalPath, backupPath);
      }

      await rename(file.tempPath, file.finalPath);
      movedFinalPaths.push(file.finalPath);
    }
  } catch (error) {
    await Promise.all(stagedFiles.map((file) => rm(file.tempPath, { force: true })));
    await Promise.all(
      movedFinalPaths.map(async (finalPath) => {
        await rm(finalPath, { force: true });
      })
    );
    await Promise.all(
      [...backupPaths.entries()].map(async ([finalPath, backupPath]) => {
        if (await pathExists(backupPath)) {
          await rename(backupPath, finalPath);
        }
      })
    );
    throw error;
  }

  await Promise.all(
    [...backupPaths.values()].map(async (path) => {
      try {
        await rm(path, { force: true });
      } catch {
        // The main fixture write already succeeded; treat backup cleanup as best-effort.
      }
    })
  );

  return {
    xmlPath,
    zipPath,
    normalizedJsonPath,
    manifestPath
  };
}
