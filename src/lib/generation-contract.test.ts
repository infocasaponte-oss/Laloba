import assert from "node:assert/strict";
import test from "node:test";
import { appSpecSchema, planApplication } from "./generation-contract.ts";

test("accepts a bounded application specification", () => {
  const spec = appSpecSchema.parse({
    schemaVersion: "1",
    name: "CRM Norte",
    summary: "CRM para un equipo comercial",
    pages: [{ id: "pipeline", title: "Pipeline", purpose: "Gestionar oportunidades" }],
    capabilities: ["forms", "tables"],
  });
  assert.deepEqual(planApplication(spec).files.map((f) => f.path), ["index.html"]);
});

test("rejects arbitrary capabilities", () => {
  assert.equal(appSpecSchema.safeParse({
    schemaVersion: "1",
    name: "Unsafe",
    summary: "x",
    pages: [{ id: "home", title: "Home", purpose: "x" }],
    capabilities: ["shell"],
  }).success, false);
});
