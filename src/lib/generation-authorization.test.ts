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
});

test("rejects authorization after the project changes",async()=>{
  const pending=await prepareGenerationAuthorization("generation_123457","project-a","fix it",result,"<html>old</html>");
  await assert.rejects(()=>authorizeGeneration(pending,"project-a","<html>edited</html>"),/Project changed after generation/);
});

test("rejects authorization for another project",async()=>{
  const pending=await prepareGenerationAuthorization("generation_123458","project-a","fix it",result,"<html>old</html>");
  await assert.rejects(()=>authorizeGeneration(pending,"project-b","<html>old</html>"),/another project/);
});
