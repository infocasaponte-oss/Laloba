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
