import assert from "node:assert/strict";
import test from "node:test";
import { isTrustedMutationOrigin } from "./request-origin.server.ts";

test("accepts matching request origin", () => {
  const request = new Request("https://laloba.example/api/chat", {
    method: "POST",
    headers: { origin: "https://laloba.example" },
  });
  assert.equal(isTrustedMutationOrigin(request), true);
});

test("rejects a foreign browser origin", () => {
  const request = new Request("https://laloba.example/api/chat", {
    method: "POST",
    headers: { origin: "https://evil.example" },
  });
  assert.equal(isTrustedMutationOrigin(request), false);
});

test("accepts the public origin behind a trusted reverse proxy", () => {
  const request = new Request("http://127.0.0.1:8080/api/chat", {
    method: "POST",
    headers: {
      origin: "https://laloba.example",
      host: "127.0.0.1:8080",
      "x-forwarded-host": "laloba.example",
      "x-forwarded-proto": "https",
    },
  });
  assert.equal(isTrustedMutationOrigin(request), true);
});

test("allows requests without Origin for non-browser clients", () => {
  const request = new Request("https://laloba.example/api/chat", { method: "POST" });
  assert.equal(isTrustedMutationOrigin(request), true);
});
