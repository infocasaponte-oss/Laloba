import assert from "node:assert/strict";
import test from "node:test";
import { createProjectSnapshot,projectTreeSha256,verifyProjectSnapshot } from "./project-files.ts";

const html="<!doctype html><html><body>ok</body></html>";

test("creates and verifies an immutable project snapshot",async()=>{
 const snapshot=await createProjectSnapshot("generation_1234",[{path:"index.html",content:html},{path:"src/app.tsx",content:"export default 1"}],"2026-01-01T00:00:00.000Z");
 assert.equal(snapshot.files[0].sha256.length,64);
 assert.equal(await verifyProjectSnapshot(snapshot),true);
 snapshot.files[0].content="tampered";
 assert.equal(await verifyProjectSnapshot(snapshot),false);
});

test("tree digest is deterministic across file ordering",async()=>{
 const files=[{path:"index.html",content:html},{path:"src/b.ts",content:"b"},{path:"src/a.ts",content:"a"}];
 const a=await createProjectSnapshot("generation_5678",files,"2026-01-01T00:00:00.000Z");
 const b=await createProjectSnapshot("generation_5678",[...files].reverse(),"2026-01-01T00:00:00.000Z");
 assert.equal(a.treeSha256,b.treeSha256);
 assert.deepEqual(a.files.map(f=>f.path),["index.html","src/a.ts","src/b.ts"]);
});

test("detects snapshot path and tree tampering",async()=>{
 const snapshot=await createProjectSnapshot("generation_9012",[{path:"index.html",content:html},{path:"src/a.ts",content:"a"},{path:"src/b.ts",content:"b"}]);
 snapshot.files[1].path="src/renamed.ts";
 assert.equal(await verifyProjectSnapshot(snapshot),false);
});

test("rejects duplicate snapshot paths even when file hashes are valid",async()=>{
 const snapshot=await createProjectSnapshot("generation_3456",[{path:"index.html",content:html},{path:"src/a.ts",content:"a"}]);
 snapshot.files.push({...snapshot.files[1]});
 assert.equal(await verifyProjectSnapshot(snapshot),false);
});

test("canonical tree digest binds paths as well as content",async()=>{
 const original=await projectTreeSha256([{path:"src/a.ts",content:"same"}]);
 const renamed=await projectTreeSha256([{path:"src/b.ts",content:"same"}]);
 assert.notEqual(original,renamed);
});

test("rejects snapshots that omit the authenticated tree digest",async()=>{
 const snapshot=await createProjectSnapshot("generation_7777",[{path:"index.html",content:html}]);
 const legacy={...snapshot} as Partial<typeof snapshot>;
 delete legacy.treeSha256;
 assert.equal(await verifyProjectSnapshot(legacy as typeof snapshot),false);
});

test("rejects invalid timestamps and non-executable snapshots",async()=>{
 await assert.rejects(()=>createProjectSnapshot("generation_8888",[{path:"index.html",content:html}],"not-a-date"),/timestamp/);
 await assert.rejects(()=>createProjectSnapshot("generation_9999",[{path:"src/app.ts",content:"x"}]),/Invalid project artifact/);
});
