import assert from "node:assert/strict";
import test from "node:test";
import { authorizeGeneration, prepareGenerationAuthorization } from "./generation-authorization.ts";

const result={
  schemaVersion:"1" as const,
  summary:"Fix heading",
  files:[{path:"index.html" as const,content:"<!doctype html><html><body>new</body></html>"}],
};

test("authorizes a generation only against the state it was prepared from",async()=>{
  const pending=await prepareGenerationAuthorization("generation_123456","project-a","fix it",result,"<html>old</html>");
  const authorized=await authorizeGeneration(pending,"project-a","<html>old</html>");
  assert.equal(authorized.snapshot.generationId,"generation_123456");
  assert.equal(authorized.snapshot.files[0].content,result.files[0].content);
  assert.equal(authorized.snapshot.treeSha256,authorized.manifest.treeSha256);
});

test("rejects authorization after the project changes",async()=>{
  const pending=await prepareGenerationAuthorization("generation_123457","project-a","fix it",result,"<html>old</html>");
  await assert.rejects(()=>authorizeGeneration(pending,"project-a","<html>edited</html>"),/Project changed after generation/);
});

test("rejects authorization for another project",async()=>{
  const pending=await prepareGenerationAuthorization("generation_123458","project-a","fix it",result,"<html>old</html>");
  await assert.rejects(()=>authorizeGeneration(pending,"project-b","<html>old</html>"),/another project/);
});

test("rejects tampering with a prepared generation",async()=>{
 const pending=await prepareGenerationAuthorization("generation_123459","project-a","fix it",structuredClone(result),"<html>old</html>",new Date("2026-01-01T00:00:00.000Z"));
 pending.result.files[0].content="<!doctype html><html><body>tampered</body></html>";
 await assert.rejects(()=>authorizeGeneration(pending,"project-a","<html>old</html>",new Date("2026-01-01T00:00:00.000Z")),/payload changed/);
});

test("rejects expired and future-dated generation authorizations",async()=>{
 const prepared=new Date("2026-01-01T00:00:00.000Z");
 const pending=await prepareGenerationAuthorization("generation_123460","project-a","fix it",result,"<html>old</html>",prepared);
 await assert.rejects(()=>authorizeGeneration(pending,"project-a","<html>old</html>",new Date("2026-01-01T00:11:00.000Z")),/expired/);
 await assert.rejects(()=>authorizeGeneration(pending,"project-a","<html>old</html>",new Date("2025-12-31T23:59:59.000Z")),/expired/);
});
