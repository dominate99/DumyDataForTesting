import {
  copyFile as fsCopyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile as fsWriteFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { generateFixtures } from "../../scripts/generate-fixtures";
import {
  DATAFORALL_CURATED_FIXTURE_SYNC_CONTRACT,
  DATAFORALL_MANAGED_FIXTURE_FILE_NAMES,
  getDataForAllFixtureSourceFileNameForTargetFileName
} from "../../src/fixtures/dataForAllFixtureSyncContract";
import {
  DATAFORALL_FIXTURE_SYNC_MANIFEST_FILE_NAME,
  parseCliArgs,
  syncDataForAllFixtures
} from "../../scripts/sync-dataforall-fixtures";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
});

async function createDataForAllRepoRoot(): Promise<string> {
  const repoRoot = await mkdtemp(join(tmpdir(), "dataforall-repo-"));
  tempDirs.push(repoRoot);
  await mkdir(join(repoRoot, "src", "test", "fixtures", "datafortestinghelper"), {
    recursive: true
  });
  return repoRoot;
}

async function createCuratedSourceFixtures(): Promise<string> {
  const outputDir = await mkdtemp(join(tmpdir(), "datafortestinghelper-source-"));
  tempDirs.push(outputDir);

  await generateFixtures({
    outputDir,
    scenarioIds: [...new Set(DATAFORALL_CURATED_FIXTURE_SYNC_CONTRACT.map((entry) => entry.scenarioId))]
  });

  return outputDir;
}

function stripIngestedAtFromJsonFixture(contents: Buffer) {
  return (JSON.parse(contents.toString("utf8")) as Array<Record<string, unknown>>).map(
    ({ ingestedAt: _ingestedAt, ...record }) => record
  );
}

describe("syncDataForAllFixtures", () => {
  test("copies the curated managed fixtures into DATAFORALL without touching unmanaged files", async () => {
    const dataForAllRepoPath = await createDataForAllRepoRoot();
    const sourceOutputDir = await createCuratedSourceFixtures();
    const targetFixtureDir = join(
      dataForAllRepoPath,
      "src",
      "test",
      "fixtures",
      "datafortestinghelper"
    );
    const unmanagedPath = join(targetFixtureDir, "leave-me-alone.txt");

    await fsWriteFile(unmanagedPath, "keep me", "utf8");

    const result = await syncDataForAllFixtures({ dataForAllRepoPath });
    const manifestJson = JSON.parse(
      await readFile(join(targetFixtureDir, DATAFORALL_FIXTURE_SYNC_MANIFEST_FILE_NAME), "utf8")
    );

    expect(result).toEqual({
      dataForAllRepoPath,
      targetFixtureDir,
      copiedFileNames: DATAFORALL_MANAGED_FIXTURE_FILE_NAMES,
      cleanedFileNames: []
    });

    expect(manifestJson).toEqual({
      managedFileNames: DATAFORALL_MANAGED_FIXTURE_FILE_NAMES
    });

    await expect(readFile(unmanagedPath, "utf8")).resolves.toBe("keep me");

    await Promise.all(
      DATAFORALL_MANAGED_FIXTURE_FILE_NAMES.map(async (targetFileName) => {
        const sourceFileName = getDataForAllFixtureSourceFileNameForTargetFileName(targetFileName);

        expect(sourceFileName).toBeTypeOf("string");
        const [targetContents, sourceContents] = await Promise.all([
          readFile(join(targetFixtureDir, targetFileName)),
          readFile(join(sourceOutputDir, sourceFileName as string))
        ]);

        if (targetFileName.endsWith(".sleep-records.json")) {
          expect(stripIngestedAtFromJsonFixture(targetContents)).toEqual(
            stripIngestedAtFromJsonFixture(sourceContents)
          );
        } else {
          expect(targetContents.equals(sourceContents)).toBe(true);
        }
      })
    );
  });

  test("keeps previously managed stale files when cleanup is not explicitly enabled", async () => {
    const dataForAllRepoPath = await createDataForAllRepoRoot();
    const targetFixtureDir = join(
      dataForAllRepoPath,
      "src",
      "test",
      "fixtures",
      "datafortestinghelper"
    );
    const staleManagedFileName = "legacy-managed.xml";
    const staleManagedPath = join(targetFixtureDir, staleManagedFileName);

    await fsWriteFile(staleManagedPath, "legacy", "utf8");
    await fsWriteFile(
      join(targetFixtureDir, DATAFORALL_FIXTURE_SYNC_MANIFEST_FILE_NAME),
      JSON.stringify({ managedFileNames: [staleManagedFileName] }, null, 2),
      "utf8"
    );

    const result = await syncDataForAllFixtures({ dataForAllRepoPath });

    expect(result.cleanedFileNames).toEqual([]);
    await expect(readFile(staleManagedPath, "utf8")).resolves.toBe("legacy");
  });

  test("removes previously managed stale files only when cleanup is explicitly enabled", async () => {
    const dataForAllRepoPath = await createDataForAllRepoRoot();
    const targetFixtureDir = join(
      dataForAllRepoPath,
      "src",
      "test",
      "fixtures",
      "datafortestinghelper"
    );
    const staleManagedFileName = "legacy-managed.xml";
    const staleManagedPath = join(targetFixtureDir, staleManagedFileName);

    await fsWriteFile(staleManagedPath, "legacy", "utf8");
    await fsWriteFile(
      join(targetFixtureDir, DATAFORALL_FIXTURE_SYNC_MANIFEST_FILE_NAME),
      JSON.stringify({ managedFileNames: [staleManagedFileName] }, null, 2),
      "utf8"
    );

    const result = await syncDataForAllFixtures({
      dataForAllRepoPath,
      cleanStaleManagedFiles: true
    });

    expect(result.cleanedFileNames).toEqual([staleManagedFileName]);
    await expect(stat(staleManagedPath)).rejects.toMatchObject({ code: "ENOENT" });
  });

  test("rejects repo paths that do not contain the DATAFORALL fixture parent directory", async () => {
    const dataForAllRepoPath = await mkdtemp(join(tmpdir(), "not-dataforall-repo-"));
    tempDirs.push(dataForAllRepoPath);

    await expect(syncDataForAllFixtures({ dataForAllRepoPath })).rejects.toThrow(
      /src[\\/]test[\\/]fixtures/
    );
  });

  test("removes the temporary curated source directory when fixture generation fails", async () => {
    const dataForAllRepoPath = await createDataForAllRepoRoot();
    let generatedOutputDir: string | undefined;

    await expect(
      syncDataForAllFixtures(
        { dataForAllRepoPath },
        {
          async generateFixtures(options = {}) {
            const { outputDir, scenarioIds } = options;

            if (!outputDir) {
              throw new Error("expected outputDir override");
            }

            generatedOutputDir = outputDir;
            expect(Array.isArray(scenarioIds)).toBe(true);
            await fsWriteFile(join(outputDir, "partial.txt"), "partial", "utf8");
            throw new Error("fixture generation failed");
          }
        }
      )
    ).rejects.toThrow("fixture generation failed");

    expect(generatedOutputDir).toBeTruthy();
    await expect(stat(generatedOutputDir as string)).rejects.toMatchObject({ code: "ENOENT" });
  });

  test("restores copied files, stale cleanup, and the manifest when a late write fails", async () => {
    const dataForAllRepoPath = await createDataForAllRepoRoot();
    const targetFixtureDir = join(
      dataForAllRepoPath,
      "src",
      "test",
      "fixtures",
      "datafortestinghelper"
    );
    const restoredManagedFileName = DATAFORALL_MANAGED_FIXTURE_FILE_NAMES[0];
    const newManagedFileName = DATAFORALL_MANAGED_FIXTURE_FILE_NAMES[1];
    const staleManagedFileName = "legacy-managed.xml";
    const restoredManagedPath = join(targetFixtureDir, restoredManagedFileName);
    const newManagedPath = join(targetFixtureDir, newManagedFileName);
    const staleManagedPath = join(targetFixtureDir, staleManagedFileName);
    const manifestPath = join(targetFixtureDir, DATAFORALL_FIXTURE_SYNC_MANIFEST_FILE_NAME);
    const originalManifestJson = JSON.stringify(
      { managedFileNames: [restoredManagedFileName, staleManagedFileName] },
      null,
      2
    );

    await fsWriteFile(restoredManagedPath, "original managed contents", "utf8");
    await fsWriteFile(staleManagedPath, "legacy managed contents", "utf8");
    await fsWriteFile(manifestPath, originalManifestJson, "utf8");

    await expect(
      syncDataForAllFixtures(
        {
          dataForAllRepoPath,
          cleanStaleManagedFiles: true
        },
        {
          async copyFile(sourcePath, destinationPath) {
            await fsCopyFile(sourcePath, destinationPath);
          },
          async writeFile(path, data, options) {
            if (
              typeof path === "string" &&
              path.includes(DATAFORALL_FIXTURE_SYNC_MANIFEST_FILE_NAME)
            ) {
              throw new Error("manifest write failed");
            }

            await fsWriteFile(path, data, options as never);
          }
        }
      )
    ).rejects.toThrow("manifest write failed");

    await expect(readFile(restoredManagedPath, "utf8")).resolves.toBe("original managed contents");
    await expect(stat(newManagedPath)).rejects.toMatchObject({ code: "ENOENT" });
    await expect(readFile(staleManagedPath, "utf8")).resolves.toBe("legacy managed contents");
    await expect(readFile(manifestPath, "utf8")).resolves.toBe(originalManifestJson);
  });

  test("preserves the original sync failure and reports rollback restore failures without aborting later restores", async () => {
    const dataForAllRepoPath = await createDataForAllRepoRoot();
    const targetFixtureDir = join(
      dataForAllRepoPath,
      "src",
      "test",
      "fixtures",
      "datafortestinghelper"
    );
    const firstRestoredManagedFileName = DATAFORALL_MANAGED_FIXTURE_FILE_NAMES[0];
    const failedRollbackManagedFileName = DATAFORALL_MANAGED_FIXTURE_FILE_NAMES[1];
    const staleManagedFileName = "legacy-managed.xml";
    const firstRestoredManagedPath = join(targetFixtureDir, firstRestoredManagedFileName);
    const failedRollbackManagedPath = join(targetFixtureDir, failedRollbackManagedFileName);
    const staleManagedPath = join(targetFixtureDir, staleManagedFileName);
    const manifestPath = join(targetFixtureDir, DATAFORALL_FIXTURE_SYNC_MANIFEST_FILE_NAME);
    const originalManifestJson = JSON.stringify(
      {
        managedFileNames: [
          firstRestoredManagedFileName,
          failedRollbackManagedFileName,
          staleManagedFileName
        ]
      },
      null,
      2
    );

    await fsWriteFile(firstRestoredManagedPath, "first original managed contents", "utf8");
    await fsWriteFile(failedRollbackManagedPath, "second original managed contents", "utf8");
    await fsWriteFile(staleManagedPath, "legacy managed contents", "utf8");
    await fsWriteFile(manifestPath, originalManifestJson, "utf8");

    const error = await syncDataForAllFixtures(
      {
        dataForAllRepoPath,
        cleanStaleManagedFiles: true
      },
      {
        async copyFile(sourcePath, destinationPath) {
          if (
            typeof sourcePath === "string" &&
            typeof destinationPath === "string" &&
            sourcePath.endsWith(".bak") &&
            destinationPath === failedRollbackManagedPath
          ) {
            throw new Error("rollback restore failed");
          }

          await fsCopyFile(sourcePath, destinationPath);
        },
        async writeFile(path, data, options) {
          if (typeof path === "string" && path.includes(DATAFORALL_FIXTURE_SYNC_MANIFEST_FILE_NAME)) {
            throw new Error("manifest write failed");
          }

          await fsWriteFile(path, data, options as never);
        }
      }
    ).catch((caughtError: unknown) => caughtError);

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain("manifest write failed");
    expect((error as Error).message).toContain("rollback restore failed");
    expect((error as Error).message).toContain(failedRollbackManagedPath);
    expect(error).toMatchObject({
      cause: expect.objectContaining({
        message: "manifest write failed"
      })
    });

    await expect(readFile(firstRestoredManagedPath, "utf8")).resolves.toBe(
      "first original managed contents"
    );
    await expect(stat(failedRollbackManagedPath)).rejects.toMatchObject({ code: "ENOENT" });
    await expect(readFile(staleManagedPath, "utf8")).resolves.toBe("legacy managed contents");
    await expect(readFile(manifestPath, "utf8")).resolves.toBe(originalManifestJson);
  });
});

describe("parseCliArgs", () => {
  test("rejects a missing value after --dataforall-repo", () => {
    expect(() => parseCliArgs(["--dataforall-repo"])).toThrow(
      "Missing required value for --dataforall-repo <path>."
    );
  });

  test("rejects another flag in place of the --dataforall-repo value", () => {
    expect(() => parseCliArgs(["--dataforall-repo", "--clean-stale-managed"])).toThrow(
      "Missing required value for --dataforall-repo <path>."
    );
  });
});
