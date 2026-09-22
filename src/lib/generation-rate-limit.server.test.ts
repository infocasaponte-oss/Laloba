import assert from "node:assert/strict";
import test from "node:test";
import {
  consumeGenerationQuota,
  generationRateLimitPolicy,
  generationRateLimitSizeForTest,
  resetGenerationRateLimitForTest,
} from "./generation-rate-limit.server.ts";

test("allows the initial burst and then rate limits", () => {
  resetGenerationRateLimitForTest();
  const now = 1_000_000;
  for (let i = 0; i < generationRateLimitPolicy.capacity; i += 1) {
    assert.equal(consumeGenerationQuota("quota-burst", now).allowed, true);
  }
  const denied = consumeGenerationQuota("quota-burst", now);
  assert.equal(denied.allowed, false);
  if (!denied.allowed) assert.ok(denied.retryAfterSeconds > 0);
});

test("refills quota over time", () => {
  resetGenerationRateLimitForTest();
  const now = 2_000_000;
  for (let i = 0; i < generationRateLimitPolicy.capacity; i += 1) consumeGenerationQuota("quota-refill", now);
  assert.equal(consumeGenerationQuota("quota-refill", now).allowed, false);
  assert.equal(consumeGenerationQuota("quota-refill", now + generationRateLimitPolicy.windowMs).allowed, true);
});

test("keeps unique-user state within the hard memory bound", () => {
  resetGenerationRateLimitForTest();
  const now = 3_000_000;
  for (let i = 0; i < generationRateLimitPolicy.maxBuckets + 250; i += 1) {
    consumeGenerationQuota(`user-${i}`, now);
  }
  assert.ok(generationRateLimitSizeForTest() <= generationRateLimitPolicy.maxBuckets);
});

test("does not mint extra quota when the clock moves backwards", () => {
  resetGenerationRateLimitForTest();
  const now = 4_000_000;
  for (let i = 0; i < generationRateLimitPolicy.capacity; i += 1) consumeGenerationQuota("clock-user", now);
  assert.equal(consumeGenerationQuota("clock-user", now - 60_000).allowed, false);
});
