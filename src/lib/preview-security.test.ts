import assert from "node:assert/strict";
import test from "node:test";
import { hardenPreviewHtml } from "./preview-security.ts";

test("injects a restrictive CSP into a full HTML document", () => {
  const output = hardenPreviewHtml("<!doctype html><html><head><title>x</title></head><body></body></html>");
  assert.match(output, /Content-Security-Policy/);
  assert.match(output, /connect-src 'none'/);
  assert.match(output, /form-action 'none'/);
  assert.match(output, /frame-src 'none'/);
});

test("wraps fragments in a hardened document", () => {
  const output = hardenPreviewHtml("<main>Hello</main>");
  assert.match(output, /^<!doctype html><html>/);
  assert.match(output, /<main>Hello<\/main>/);
});
