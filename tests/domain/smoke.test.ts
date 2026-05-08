import { describe, expect, test } from "vitest";

describe("package bootstrap", () => {
  test("loads the public entrypoint", async () => {
    const mod = await import("../../src/index");
    expect(mod).toBeDefined();
  });
});
