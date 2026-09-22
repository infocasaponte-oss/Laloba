import assert from "node:assert/strict";
import test from "node:test";
import { appendGeneration, emptyProjectHistory, restoreGeneration } from "./project-history.ts";
import { createProjectSnapshot } from "./project-files.ts";

test("appends and restores verified generations", async () => {
  const snapshot = await createProjectSnapshot("generation_1234", [{ path: "index.html", content: "<!doctype html><html></html>" }], "2026-01-01T00:00:00.000Z");
  const history = appendGeneration(emptyProjectHistory(), { id: "generation_1234", summary: "initial", snapshot });
  assert.equal(history.currentGenerationId, "generation_1234");
  assert.equal((await restoreGeneration(history, "generation_1234")).currentGenerationId, "generation_1234");
});

test("refuses restoring tampered content", async () => {
  const snapshot = await createProjectSnapshot("generation_1234", [{ path: "index.html", content: "safe" }]);
  const history = appendGeneration(emptyProjectHistory(), { id: "generation_1234", summary: "initial", snapshot });
  snapshot.files[0].content = "tampered";
  await assert.rejects(() => restoreGeneration(history, "generation_1234"), /integrity/);
});
