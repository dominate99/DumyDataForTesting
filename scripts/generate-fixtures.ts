import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { buildFixtureManifest } from "../src/fixtures/fixtureManifest";
import { fileURLToPath } from "node:url";
import { getScenarioById, scenarioPresets } from "../src/scenarios/presets";
import { writeScenarioFixtures } from "../src/fixtures/writeScenarioFixtures";

export interface GenerateFixturesOptions {
  outputDir?: string;
  scenarioIds?: readonly string[];
}

export interface GenerateFixturesResult {
  outputDir: string;
  scenarioIds: readonly string[];
}

export async function generateFixtures(
  options: GenerateFixturesOptions = {}
): Promise<GenerateFixturesResult> {
  const outputDir = resolve(options.outputDir ?? "generated-fixtures");
  const scenarioIds = [...(options.scenarioIds ?? scenarioPresets.map((scenario) => scenario.id))];
  const selectedScenarioIds = new Set(scenarioIds);

  await mkdir(outputDir, { recursive: true });

  await Promise.all(
    scenarioPresets
      .filter((scenario) => !selectedScenarioIds.has(scenario.id))
      .flatMap((scenario) => {
        const manifest = buildFixtureManifest(scenario);
        const fixtureStem = manifest.files.xml.replace(/\.xml$/, "");

        return [
          resolve(outputDir, manifest.files.xml),
          resolve(outputDir, manifest.files.zip),
          resolve(outputDir, manifest.files.normalizedJson),
          resolve(outputDir, `${fixtureStem}.manifest.json`)
        ];
      })
      .map((path) => rm(path, { force: true }))
  );

  for (const scenarioId of scenarioIds) {
    await writeScenarioFixtures(getScenarioById(scenarioId), { outputDir });
  }

  return {
    outputDir,
    scenarioIds
  };
}

async function runCli(): Promise<void> {
  const [, , outputDirArg, ...scenarioIds] = process.argv;
  const knownScenarioIds = new Set(scenarioPresets.map((scenario) => scenario.id));

  if (outputDirArg && scenarioIds.length === 0 && knownScenarioIds.has(outputDirArg)) {
    await generateFixtures({ scenarioIds: [outputDirArg] });
    return;
  }

  await generateFixtures({
    outputDir: outputDirArg,
    scenarioIds: scenarioIds.length > 0 ? scenarioIds : undefined
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  runCli().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
