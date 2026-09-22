import assert from "node:assert/strict";
import test from "node:test";
import { validateGeneratedPath } from "./generated-path.ts";

for (const path of ["../secret", "/etc/passwd", "C:/secret", "src//x.ts", "src/./x.ts", ".env", "src\\x.ts"]) {
  test(`rejects unsafe path: ${path}`, () => assert.equal(validateGeneratedPath(path).ok, false));
}
test("accepts confined project paths", () => {
  assert.deepEqual(validateGeneratedPath("src/components/card.tsx"), { ok: true, path: "src/components/card.tsx" });
});
