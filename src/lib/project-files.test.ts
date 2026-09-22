import assert from "node:assert/strict";
import test from "node:test";
import { createProjectSnapshot, verifyProjectSnapshot } from "./project-files.ts";

test("creates and verifies an immutable project snapshot", async () => {
  const snapshot = await createProjectSnapshot("generation_1234", [{ path: "src/app.tsx", content: "export default 1" }], "2026-01-01T00:00:00.000Z");
  assert.equal(snapshot.files[0].sha256.length, 64);
  assert.equal(await verifyProjectSnapshot(snapshot), true);
  snapshot.files[0].content = "tampered";
  assert.equal(await verifyProjectSnapshot(snapshot), false);
});
