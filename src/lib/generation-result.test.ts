import assert from "node:assert/strict";
import test from "node:test";
import { parseGenerationResult } from "./generation-result.ts";

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
  const payload = JSON.stringify({schemaVersion:"1",summary:"ok",files:[{path:"index.html",content:"<!doctype html><html><body>ok</body></html>"}]});
  assert.equal(parseGenerationResult("\`\`\`json\\n" + payload + "\\n\`\`\`").ok, false);
});

test("rejects explanatory text around an otherwise valid result", () => {
  const payload = JSON.stringify({schemaVersion:"1",summary:"ok",files:[{path:"index.html",content:"<!doctype html><html><body>ok</body></html>"}]});
  assert.equal(parseGenerationResult("Here is the result: " + payload).ok, false);
});
