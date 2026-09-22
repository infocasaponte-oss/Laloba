import assert from "node:assert/strict";
import test from "node:test";
import { createGenerationManifest } from "./generation-manifest.ts";

test("creates deterministic file hashes", async () => {
  const result = { schemaVersion: "1" as const, summary: "x", files: [{ path: "index.html" as const, content: "abc" }] };
  const manifest = await createGenerationManifest(result, "2026-01-01T00:00:00.000Z");
  assert.equal(manifest.files[0].bytes, 3);
  assert.equal(manifest.files[0].sha256, "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});
