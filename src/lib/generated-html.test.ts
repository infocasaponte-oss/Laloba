import assert from "node:assert/strict";
import test from "node:test";
import { validateGeneratedHtml } from "./generated-html.ts";

test("accepts a complete local HTML document", () => {
  assert.equal(validateGeneratedHtml("<!doctype html><html><body><button>OK</button></body></html>").ok, true);
});
test("rejects parent-window access", () => {
  assert.equal(validateGeneratedHtml("<!doctype html><html><body><script>window.parent.location='https://example.com'</script></body></html>").ok, false);
});
test("rejects nested browsing contexts", () => {
  assert.equal(validateGeneratedHtml("<!doctype html><html><body><iframe src='https://example.com'></iframe></body></html>").ok, false);
});
