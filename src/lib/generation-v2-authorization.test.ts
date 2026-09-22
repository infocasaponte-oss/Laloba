import assert from "node:assert/strict";
import test from "node:test";
import { authorizeGenerationV2,prepareGenerationV2Authorization } from "./generation-v2-authorization.ts";

const base=[
 {path:"index.html",content:"<!doctype html><html><body>placeholder</body></html>"},
];
const result={
 schemaVersion:"2" as const,
 summary:"Create app",
 files:[
  {path:"src/app.ts",content:"export const answer=42;"},
  {path:"index.html",content:"<!doctype html><html><body>ready</body></html>"},
 ],
};

test("authorizes a multi-file generation against the exact base tree",async()=>{
 const now=new Date("2026-01-01T00:00:00.000Z");
 const pending=await prepareGenerationV2Authorization("generation_v2_1234","project-a","build it",result,base,now);
 const authorized=await authorizeGenerationV2(pending,"project-a",base,now);
 assert.deepEqual(authorized.files.map((file)=>file.path),["index.html","src/app.ts"]);
 assert.equal(authorized.snapshot.treeSha256,authorized.manifest.treeSha256);
 assert.equal(authorized.snapshot.createdAt,authorized.manifest.generatedAt);
});

test("rejects a changed base tree",async()=>{
 const now=new Date("2026-01-01T00:00:00.000Z");
 const pending=await prepareGenerationV2Authorization("generation_v2_1235","project-a","build it",result,base,now);
 const changed=[{path:"index.html",content:"<!doctype html><html><body>changed</body></html>"}];
 await assert.rejects(()=>authorizeGenerationV2(pending,"project-a",changed,now),/Project tree changed/);
});

test("rejects tampered candidate payloads",async()=>{
 const now=new Date("2026-01-01T00:00:00.000Z");
 const pending=await prepareGenerationV2Authorization("generation_v2_1236","project-a","build it",structuredClone(result),base,now);
 pending.result.files[0].content="<!doctype html><html><body>tampered</body></html>";
 await assert.rejects(()=>authorizeGenerationV2(pending,"project-a",base,now),/payload changed/);
});

test("rejects approval metadata mutation and project rebinding",async()=>{
 const now=new Date("2026-01-01T00:00:00.000Z");
 const pending=await prepareGenerationV2Authorization("generation_v2_1237","project-a","build it",structuredClone(result),base,now);
 pending.preparedAt="2026-01-01T00:01:00.000Z";
 await assert.rejects(()=>authorizeGenerationV2(pending,"project-a",base,now),/envelope changed/);

 const rebound=await prepareGenerationV2Authorization("generation_v2_1238","project-a","build it",structuredClone(result),base,now);
 rebound.projectId="project-b";
 await assert.rejects(()=>authorizeGenerationV2(rebound,"project-b",base,now),/envelope changed/);
});

test("rejects expired and future-dated approvals",async()=>{
 const prepared=new Date("2026-01-01T00:00:00.000Z");
 const pending=await prepareGenerationV2Authorization("generation_v2_1239","project-a","build it",result,base,prepared);
 await assert.rejects(()=>authorizeGenerationV2(pending,"project-a",base,new Date("2026-01-01T00:11:00.000Z")),/expired/);
 await assert.rejects(()=>authorizeGenerationV2(pending,"project-a",base,new Date("2025-12-31T23:59:59.000Z")),/expired/);
});

test("rejects invalid base and candidate artifacts before approval",async()=>{
 const now=new Date("2026-01-01T00:00:00.000Z");
 await assert.rejects(
  ()=>prepareGenerationV2Authorization("generation_v2_1240","project-a","build it",result,[{path:"src/base.ts",content:"x"}],now),
  /Invalid base project/,
 );
 await assert.rejects(
  ()=>prepareGenerationV2Authorization("generation_v2_1241","project-a","build it",{schemaVersion:"2",summary:"bad",files:[{path:"src/app.ts",content:"x"}]},base,now),
  /Invalid generation artifact/,
 );
});
