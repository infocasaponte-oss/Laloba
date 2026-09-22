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

test("rejects history entries whose id does not match the snapshot generation",async()=>{
 const snapshot=await createProjectSnapshot("generation_5678",[{path:"index.html",content:"safe"}]);
 assert.throws(()=>appendGeneration(emptyProjectHistory(),{id:"generation_other",summary:"mismatch",snapshot}),/does not match/);
});

test("rejects restore after persisted generation identity tampering",async()=>{
 const snapshot=await createProjectSnapshot("generation_9012",[{path:"index.html",content:"safe"}]);
 const history=appendGeneration(emptyProjectHistory(),{id:"generation_9012",summary:"initial",snapshot});
 history.generations[0].id="generation_tampered";
 await assert.rejects(()=>restoreGeneration(history,"generation_tampered"),/does not match/);
});
