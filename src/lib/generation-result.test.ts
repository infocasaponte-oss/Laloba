import assert from "node:assert/strict";
import test from "node:test";
import { generationResultSha256, parseGenerationResult } from "./generation-result.ts";

test("accepts a structured generation result", () => {
  const input = JSON.stringify({schemaVersion:"1",summary:"Aplicación creada",files:[{path:"index.html",content:"<!doctype html><html><body>OK</body></html>"}]});
  assert.equal(parseGenerationResult(input).ok, true);
});
test("rejects unexpected generated paths", () => {
  const input = JSON.stringify({schemaVersion:"1",summary:"x",files:[{path:"../../secret",content:"x"}]});
  assert.equal(parseGenerationResult(input).ok, false);
});
test("validates HTML inside the structured result", () => {
  const input = JSON.stringify({schemaVersion:"1",summary:"x",files:[{path:"index.html",content:"<!doctype html><html><iframe></iframe></html>"}]});
  assert.equal(parseGenerationResult(input).ok, false);
});

test("rejects Markdown-wrapped JSON because the protocol requires raw JSON", () => {
  const payload=JSON.stringify({schemaVersion:"1",summary:"ok",files:[{path:"index.html",content:"<!doctype html><html><body>ok</body></html>"}]});
  const fenced="```json\n"+payload+"\n```";
  assert.equal(parseGenerationResult(fenced).ok,false);
});

test("rejects explanatory text around an otherwise valid result", () => {
  const payload = JSON.stringify({schemaVersion:"1",summary:"ok",files:[{path:"index.html",content:"<!doctype html><html><body>ok</body></html>"}]});
  assert.equal(parseGenerationResult("Here is the result: " + payload).ok, false);
});


test("generation result fingerprint is canonical across object key ordering",async()=>{
 const a={schemaVersion:"1" as const,summary:"x",files:[{path:"index.html" as const,content:"<!doctype html><html><body>x</body></html>"}]};
 const b={files:[{content:"<!doctype html><html><body>x</body></html>",path:"index.html" as const}],summary:"x",schemaVersion:"1" as const};
 assert.equal(await generationResultSha256(a),await generationResultSha256(b));
});

test("generation result fingerprint changes with generated content",async()=>{
 const a={schemaVersion:"1" as const,summary:"x",files:[{path:"index.html" as const,content:"<!doctype html><html><body>a</body></html>"}]};
 const b={schemaVersion:"1" as const,summary:"x",files:[{path:"index.html" as const,content:"<!doctype html><html><body>b</body></html>"}]};
 assert.notEqual(await generationResultSha256(a),await generationResultSha256(b));
});
