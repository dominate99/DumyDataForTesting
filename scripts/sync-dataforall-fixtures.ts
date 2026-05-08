import { copyFile, mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join, posix, resolve, win32 } from "node:path";
import { fileURLToPath } from "node:url";
import { generateFixtures } from "./generate-fixtures";
import {
  DATAFORALL_CURATED_FIXTURE_SYNC_CONTRACT,
  DATAFORALL_MANAGED_FIXTURE_FILE_NAMES,
  getDataForAllFixtureSourceFileNameForTargetFileName
} from "../src/fixtures/dataForAllFixtureSyncContract";

const DATAFORALL_TARGET_FIXTURE_PARENT_SEGMENTS = ["src", "test", "fixtures"] as const;
const DATAFORALL_TARGET_FIXTURE_DIR_NAME = "datafortestinghelper";

export const DATAFORALL_FIXTURE_SYNC_MANIFEST_FILE_NAME =
  ".datafortestinghelper-sync-manifest.json";

interface DataForAllFixtureSyncManifest {
  managedFileNames: readonly string[];
}

export interface SyncDataForAllFixturesOptions {
  dataForAllRepoPath: string;
  cleanStaleManagedFiles?: boolean;
}

export interface SyncDataForAllFixturesResult {
  dataForAllRepoPath: string;
  targetFixtureDir: string;
  copiedFileNames: readonly string[];
  cleanedFileNames: readonly string[];
}

export interface SyncDataForAllFixturesRuntime {
  copyFile: typeof copyFile;
  mkdir: typeof mkdir;
  mkdtemp: typeof mkdtemp;
  readFile: typeof readFile;
  rename: typeof rename;
  rm: typeof rm;
  stat: typeof stat;
  writeFile: typeof writeFile;
  generateFixtures: typeof generateFixtures;
}

const DEFAULT_SYNC_RUNTIME: SyncDataForAllFixturesRuntime = {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
  generateFixtures
};

interface RollbackEntry {
  targetPath: string;
  backupPath: string | null;
}

interface RollbackRestoreFailure {
  targetPath: string;
  error: unknown;
}

function assertPlainBasename(fileName: string, label: string): void {
  if (
    fileName.length === 0 ||
    fileName === "." ||
    fileName === ".." ||
    posix.basename(fileName) !== fileName ||
    win32.basename(fileName) !== fileName
  ) {
    throw new Error(`${label} must be a plain basename: ${fileName}`);
  }
}

async function pathExists(
  path: string,
  runtime: Pick<SyncDataForAllFixturesRuntime, "stat">
): Promise<boolean> {
  try {
    await runtime.stat(path);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

async function replaceFileAtomically(
  targetPath: string,
  writeTempFile: (tempPath: string) => Promise<void>,
  runtime: Pick<SyncDataForAllFixturesRuntime, "rename" | "rm" | "stat">
): Promise<void> {
  const tempPath = `${targetPath}.${randomUUID()}.tmp`;
  const backupPath = `${targetPath}.${randomUUID()}.bak`;
  let backupCreated = false;

  try {
    await writeTempFile(tempPath);

    if (await pathExists(targetPath, runtime)) {
      await runtime.rename(targetPath, backupPath);
      backupCreated = true;
    }

    await runtime.rename(tempPath, targetPath);
  } catch (error) {
    await runtime.rm(tempPath, { force: true });

    if (backupCreated && (await pathExists(backupPath, runtime))) {
      await runtime.rm(targetPath, { force: true });
      await runtime.rename(backupPath, targetPath);
    }

    throw error;
  }

  if (backupCreated) {
    await runtime.rm(backupPath, { force: true });
  }
}

async function ensureDataForAllTargetFixtureDir(
  dataForAllRepoPath: string,
  runtime: Pick<SyncDataForAllFixturesRuntime, "mkdir" | "stat">
): Promise<string> {
  const resolvedRepoPath = resolve(dataForAllRepoPath);
  const targetFixtureParentDir = join(
    resolvedRepoPath,
    ...DATAFORALL_TARGET_FIXTURE_PARENT_SEGMENTS
  );

  if (!(await pathExists(targetFixtureParentDir, runtime))) {
    throw new Error(
      `Provided DATAFORALL repo path must already contain ${DATAFORALL_TARGET_FIXTURE_PARENT_SEGMENTS.join("/")}: ${resolvedRepoPath}`
    );
  }

  const fixtureParentStats = await runtime.stat(targetFixtureParentDir);

  if (!fixtureParentStats.isDirectory()) {
    throw new Error(`DATAFORALL fixture parent is not a directory: ${targetFixtureParentDir}`);
  }

  await runtime.mkdir(join(targetFixtureParentDir, DATAFORALL_TARGET_FIXTURE_DIR_NAME), {
    recursive: true
  });

  return join(targetFixtureParentDir, DATAFORALL_TARGET_FIXTURE_DIR_NAME);
}

function parseFixtureSyncManifest(jsonText: string, manifestPath: string): DataForAllFixtureSyncManifest {
  const parsed = JSON.parse(jsonText) as unknown;

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("managedFileNames" in parsed) ||
    !Array.isArray(parsed.managedFileNames)
  ) {
    throw new Error(`Invalid DATAFORALL fixture sync manifest: ${manifestPath}`);
  }

  for (const fileName of parsed.managedFileNames) {
    if (typeof fileName !== "string") {
      throw new Error(`Invalid DATAFORALL fixture sync manifest entry: ${manifestPath}`);
    }

    assertPlainBasename(fileName, "DATAFORALL sync manifest entry");
  }

  return {
    managedFileNames: Object.freeze([...parsed.managedFileNames])
  };
}

async function readPreviousManagedFileNames(targetFixtureDir: string): Promise<readonly string[]> {
  const manifestPath = join(targetFixtureDir, DATAFORALL_FIXTURE_SYNC_MANIFEST_FILE_NAME);

  try {
    const jsonText = await readFile(manifestPath, "utf8");
    return parseFixtureSyncManifest(jsonText, manifestPath).managedFileNames;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeManagedFileManifest(
  targetFixtureDir: string,
  runtime: Pick<SyncDataForAllFixturesRuntime, "rm" | "rename" | "stat" | "writeFile">,
  captureRollback?: (targetPath: string) => Promise<void>
): Promise<void> {
  const manifestPath = join(targetFixtureDir, DATAFORALL_FIXTURE_SYNC_MANIFEST_FILE_NAME);
  const manifestJson = JSON.stringify(
    {
      managedFileNames: DATAFORALL_MANAGED_FIXTURE_FILE_NAMES
    },
    null,
    2
  );

  await captureRollback?.(manifestPath);
  await replaceFileAtomically(
    manifestPath,
    async (tempPath) => {
      await runtime.writeFile(tempPath, manifestJson, "utf8");
    },
    runtime
  );
}

function getCuratedScenarioIds(): readonly string[] {
  return [...new Set(DATAFORALL_CURATED_FIXTURE_SYNC_CONTRACT.map((entry) => entry.scenarioId))];
}

async function copyManagedFixtures(
  sourceOutputDir: string,
  targetFixtureDir: string,
  runtime: Pick<SyncDataForAllFixturesRuntime, "copyFile" | "rm" | "rename" | "stat">,
  captureRollback?: (targetPath: string) => Promise<void>
): Promise<void> {
  for (const targetFileName of DATAFORALL_MANAGED_FIXTURE_FILE_NAMES) {
    const sourceFileName = getDataForAllFixtureSourceFileNameForTargetFileName(targetFileName);

    if (!sourceFileName) {
      throw new Error(`Missing curated source fixture mapping for ${targetFileName}`);
    }

    const targetPath = join(targetFixtureDir, targetFileName);
    await captureRollback?.(targetPath);
    await replaceFileAtomically(
      targetPath,
      async (tempPath) => {
        await runtime.copyFile(join(sourceOutputDir, sourceFileName), tempPath);
      },
      runtime
    );
  }
}

async function removeStaleManagedFiles(
  targetFixtureDir: string,
  previousManagedFileNames: readonly string[],
  runtime: Pick<SyncDataForAllFixturesRuntime, "rm">,
  captureRollback?: (targetPath: string) => Promise<void>
): Promise<readonly string[]> {
  const currentManagedFileNameSet = new Set(DATAFORALL_MANAGED_FIXTURE_FILE_NAMES);
  const staleManagedFileNames = previousManagedFileNames.filter(
    (fileName) => !currentManagedFileNameSet.has(fileName)
  );

  for (const fileName of staleManagedFileNames) {
    const targetPath = join(targetFixtureDir, fileName);
    await captureRollback?.(targetPath);
    await runtime.rm(targetPath, { force: true });
  }

  return staleManagedFileNames;
}

async function captureRollbackEntry(
  targetPath: string,
  rollbackEntries: RollbackEntry[],
  rollbackDir: string,
  runtime: Pick<SyncDataForAllFixturesRuntime, "copyFile" | "stat">
): Promise<void> {
  if (rollbackEntries.some((entry) => entry.targetPath === targetPath)) {
    return;
  }

  if (!(await pathExists(targetPath, runtime))) {
    rollbackEntries.push({ targetPath, backupPath: null });
    return;
  }

  const backupPath = join(rollbackDir, `${rollbackEntries.length}-${randomUUID()}.bak`);
  await runtime.copyFile(targetPath, backupPath);
  rollbackEntries.push({ targetPath, backupPath });
}

async function restoreRollbackEntries(
  rollbackEntries: readonly RollbackEntry[],
  runtime: Pick<SyncDataForAllFixturesRuntime, "copyFile" | "rm">
): Promise<readonly RollbackRestoreFailure[]> {
  const rollbackFailures: RollbackRestoreFailure[] = [];

  for (const entry of [...rollbackEntries].reverse()) {
    try {
      await runtime.rm(entry.targetPath, { force: true });

      if (entry.backupPath) {
        await runtime.copyFile(entry.backupPath, entry.targetPath);
      }
    } catch (error) {
      rollbackFailures.push({
        targetPath: entry.targetPath,
        error
      });
    }
  }

  return rollbackFailures;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function buildRollbackFailureError(
  originalError: unknown,
  rollbackFailures: readonly RollbackRestoreFailure[]
): Error {
  const rollbackFailureLabel = rollbackFailures.length === 1 ? "entry" : "entries";
  const rollbackFailureDetails = rollbackFailures
    .map((failure) => `${failure.targetPath}: ${getErrorMessage(failure.error)}`)
    .join("; ");

  return new Error(
    `${getErrorMessage(originalError)} Rollback also failed for ${rollbackFailures.length} ${rollbackFailureLabel}: ${rollbackFailureDetails}`,
    {
      cause: originalError
    }
  );
}

async function applyManagedFixtureSync(
  sourceOutputDir: string,
  targetFixtureDir: string,
  previousManagedFileNames: readonly string[],
  options: SyncDataForAllFixturesOptions,
  runtime: Pick<
    SyncDataForAllFixturesRuntime,
    "copyFile" | "mkdtemp" | "rm" | "rename" | "stat" | "writeFile"
  >
): Promise<readonly string[]> {
  const rollbackDir = await runtime.mkdtemp(join(tmpdir(), "datafortestinghelper-rollback-"));
  const rollbackEntries: RollbackEntry[] = [];

  try {
    const captureRollback = async (targetPath: string) =>
      captureRollbackEntry(targetPath, rollbackEntries, rollbackDir, runtime);

    await copyManagedFixtures(sourceOutputDir, targetFixtureDir, runtime, captureRollback);

    const cleanedFileNames = options.cleanStaleManagedFiles
      ? await removeStaleManagedFiles(
          targetFixtureDir,
          previousManagedFileNames,
          runtime,
          captureRollback
        )
      : [];

    await writeManagedFileManifest(targetFixtureDir, runtime, captureRollback);
    return cleanedFileNames;
  } catch (error) {
    const rollbackFailures = await restoreRollbackEntries(rollbackEntries, runtime);

    if (rollbackFailures.length > 0) {
      throw buildRollbackFailureError(error, rollbackFailures);
    }

    throw error;
  } finally {
    await runtime.rm(rollbackDir, { recursive: true, force: true });
  }
}

export async function syncDataForAllFixtures(
  options: SyncDataForAllFixturesOptions,
  runtimeOverrides: Partial<SyncDataForAllFixturesRuntime> = {}
): Promise<SyncDataForAllFixturesResult> {
  const runtime = {
    ...DEFAULT_SYNC_RUNTIME,
    ...runtimeOverrides
  };
  const dataForAllRepoPath = resolve(options.dataForAllRepoPath);
  const targetFixtureDir = await ensureDataForAllTargetFixtureDir(dataForAllRepoPath, runtime);
  const previousManagedFileNames = await readPreviousManagedFileNames(targetFixtureDir);
  const sourceOutputDir = await generateFreshCuratedSourceFixtures(runtime);
  let cleanedFileNames: readonly string[] = [];

  try {
    cleanedFileNames = await applyManagedFixtureSync(
      sourceOutputDir,
      targetFixtureDir,
      previousManagedFileNames,
      options,
      runtime
    );
  } finally {
    await runtime.rm(sourceOutputDir, { recursive: true, force: true });
  }

  return {
    dataForAllRepoPath,
    targetFixtureDir,
    copiedFileNames: DATAFORALL_MANAGED_FIXTURE_FILE_NAMES,
    cleanedFileNames
  };
}

async function generateFreshCuratedSourceFixtures(
  runtime: Pick<SyncDataForAllFixturesRuntime, "generateFixtures" | "mkdtemp" | "rm">
): Promise<string> {
  const outputDir = await runtime.mkdtemp(join(tmpdir(), "datafortestinghelper-sync-"));

  try {
    await runtime.generateFixtures({
      outputDir,
      scenarioIds: getCuratedScenarioIds()
    });
    return outputDir;
  } catch (error) {
    await runtime.rm(outputDir, { recursive: true, force: true });
    throw error;
  }
}

function printUsage(): void {
  console.log(
    [
      "Usage: pnpm sync:dataforall-fixtures -- --dataforall-repo <path> [--clean-stale-managed]",
      "",
      "Options:",
      "  --dataforall-repo <path>   Path to the DATAFORALL repository root.",
      "  --clean-stale-managed      Remove files previously managed by this sync manifest",
      "                             that are no longer in the curated contract.",
      "  --help                     Show this usage text."
    ].join("\n")
  );
}

export function parseCliArgs(argv: readonly string[]): SyncDataForAllFixturesOptions | "help" {
  let dataForAllRepoPath: string | undefined;
  let cleanStaleManagedFiles = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--") {
      continue;
    }

    if (argument === "--help") {
      return "help";
    }

    if (argument === "--clean-stale-managed") {
      cleanStaleManagedFiles = true;
      continue;
    }

    if (argument === "--dataforall-repo") {
      const nextValue = argv[index + 1];

      if (!nextValue || nextValue.startsWith("--")) {
        throw new Error("Missing required value for --dataforall-repo <path>.");
      }

      dataForAllRepoPath = nextValue;
      index += 1;
      continue;
    }

    if (argument.startsWith("--dataforall-repo=")) {
      dataForAllRepoPath = argument.slice("--dataforall-repo=".length);
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  if (!dataForAllRepoPath) {
    throw new Error("Missing required --dataforall-repo <path> argument.");
  }

  return {
    dataForAllRepoPath,
    cleanStaleManagedFiles
  };
}

async function runCli(): Promise<void> {
  const parsedArgs = parseCliArgs(process.argv.slice(2));

  if (parsedArgs === "help") {
    printUsage();
    return;
  }

  const result = await syncDataForAllFixtures(parsedArgs);
  const cleanedSuffix =
    result.cleanedFileNames.length > 0
      ? ` Removed stale managed files: ${result.cleanedFileNames.join(", ")}.`
      : "";

  console.log(
    `Synced ${result.copiedFileNames.length} curated fixtures into ${result.targetFixtureDir}.${cleanedSuffix}`
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  runCli().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
