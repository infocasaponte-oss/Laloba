import assert from "node:assert/strict";
import test from "node:test";
import { createProjectSnapshot, projectTreeSha256, verifyProjectSnapshot } from "./project-files.ts";

test("creates and verifies an immutable project snapshot", async () => {
  const snapshot = await createProjectSnapshot("generation_1234", [{ path: "src/app.tsx", content: "export default 1" }], "2026-01-01T00:00:00.000Z");
  assert.equal(snapshot.files[0].sha256.length, 64);
  assert.equal(await verifyProjectSnapshot(snapshot), true);
  snapshot.files[0].content = "tampered";
  assert.equal(await verifyProjectSnapshot(snapshot), false);
});

test("tree digest is deterministic across file ordering",async()=>{
 const a=await createProjectSnapshot("generation_5678",[{path:"src/b.ts",content:"b"},{path:"src/a.ts",content:"a"}],"2026-01-01T00:00:00.000Z");
 const b=await createProjectSnapshot("generation_5678",[{path:"src/a.ts",content:"a"},{path:"src/b.ts",content:"b"}],"2026-01-01T00:00:00.000Z");
 assert.equal(a.treeSha256,b.treeSha256);
 assert.deepEqual(a.files.map(f=>f.path),["src/a.ts","src/b.ts"]);
});

test("detects snapshot path and tree tampering",async()=>{
 const snapshot=await createProjectSnapshot("generation_9012",[{path:"src/a.ts",content:"a"},{path:"src/b.ts",content:"b"}]);
 snapshot.files[0].path="src/renamed.ts";
 assert.equal(await verifyProjectSnapshot(snapshot),false);
});

test("rejects duplicate snapshot paths even when file hashes are valid",async()=>{
 const snapshot=await createProjectSnapshot("generation_3456",[{path:"src/a.ts",content:"a"}]);
 snapshot.files.push({...snapshot.files[0]});
 assert.equal(await verifyProjectSnapshot(snapshot),false);
});

test("canonical tree digest binds paths as well as content",async()=>{
 const original=await projectTreeSha256([{path:"src/a.ts",content:"same"}]);
 const renamed=await projectTreeSha256([{path:"src/b.ts",content:"same"}]);
 assert.notEqual(original,renamed);
});

test("rejects snapshots that omit the authenticated tree digest",async()=>{
 const snapshot=await createProjectSnapshot("generation_7777",[{path:"index.html",content:"<!doctype html><html></html>"}]);
 const legacy={...snapshot} as Partial<typeof snapshot>;
 delete legacy.treeSha256;
 assert.equal(await verifyProjectSnapshot(legacy as typeof snapshot),false);
});
