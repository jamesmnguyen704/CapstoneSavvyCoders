import { test } from "node:test";
import assert from "node:assert/strict";
import { requireInternalKey } from "./requireInternalKey.js";

function mockRes() {
  const res = {};
  res.statusCode = null;
  res.body = null;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
}

test("rejects when RESEARCH_CACHE_KEY is not configured", () => {
  delete process.env.RESEARCH_CACHE_KEY;
  const req = { headers: { "x-internal-key": "anything" } };
  const res = mockRes();
  let nextCalled = false;

  requireInternalKey(req, res, () => (nextCalled = true));

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 503);
});

test("rejects a request with no key header", () => {
  process.env.RESEARCH_CACHE_KEY = "test-secret";
  const req = { headers: {} };
  const res = mockRes();
  let nextCalled = false;

  requireInternalKey(req, res, () => (nextCalled = true));

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});

test("rejects a request with the wrong key", () => {
  process.env.RESEARCH_CACHE_KEY = "test-secret";
  const req = { headers: { "x-internal-key": "wrong" } };
  const res = mockRes();
  let nextCalled = false;

  requireInternalKey(req, res, () => (nextCalled = true));

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});

test("allows a request with the correct key", () => {
  process.env.RESEARCH_CACHE_KEY = "test-secret";
  const req = { headers: { "x-internal-key": "test-secret" } };
  const res = mockRes();
  let nextCalled = false;

  requireInternalKey(req, res, () => (nextCalled = true));

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});

// Regression for the timing-safe-comparison fix: crypto.timingSafeEqual
// throws on mismatched buffer lengths, so the length check must happen
// before it's called, not just "eventually reject."
test("rejects a key of a different length without throwing", () => {
  process.env.RESEARCH_CACHE_KEY = "test-secret";
  const req = { headers: { "x-internal-key": "test-secret-but-longer" } };
  const res = mockRes();
  let nextCalled = false;

  assert.doesNotThrow(() => requireInternalKey(req, res, () => (nextCalled = true)));

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});
