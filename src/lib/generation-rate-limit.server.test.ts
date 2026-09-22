import assert from "node:assert/strict";
import test from "node:test";
import { consumeGenerationQuota } from "./generation-rate-limit.server.ts";

test("allows the initial burst and then rate limits", () => {
  const user = "quota-burst-" + Math.random();
  const now = 1_000_000;
  for (let i = 0; i < 8; i += 1) {
    assert.equal(consumeGenerationQuota(user, now).allowed, true);
  }
  const denied = consumeGenerationQuota(user, now);
  assert.equal(denied.allowed, false);
  if (!denied.allowed) assert.ok(denied.retryAfterSeconds > 0);
});

test("refills quota over time", () => {
  const user = "quota-refill-" + Math.random();
  const now = 2_000_000;
  for (let i = 0; i < 8; i += 1) consumeGenerationQuota(user, now);
  assert.equal(consumeGenerationQuota(user, now).allowed, false);
  assert.equal(consumeGenerationQuota(user, now + 60 * 60 * 1000).allowed, true);
});
