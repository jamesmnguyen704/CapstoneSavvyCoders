// Proves first-seen timestamps are genuinely persisted — not recomputed
// from the article's own publishedAt, and not lost when the process
// "restarts" (simulated here by disconnecting and reconnecting mongoose,
// which drops any in-memory state but not what's actually in the database).
// Runs against an isolated test database — same guard as editorialQueue.test.js.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: process.env.DOTENV_PATH || "./.env" });

const PROD_MONGODB = process.env.MONGODB || "";
const TEST_MONGODB = PROD_MONGODB.replace(/\/([^/?]+)(\?|$)/, "/cinemetrics_test$2");

if (!PROD_MONGODB) {
  throw new Error("MONGODB env var not set — set DOTENV_PATH before running this test");
}
if (TEST_MONGODB === PROD_MONGODB || !/\/cinemetrics_test(\?|$)/.test(TEST_MONGODB)) {
  throw new Error(
    "Refusing to run: could not derive an isolated test database name from MONGODB. " +
      "This test must never connect to the production database."
  );
}

before(async () => {
  await mongoose.connect(TEST_MONGODB);
  await mongoose.connection.collection("newsfirstseens").deleteMany({}).catch(() => {});
});

after(async () => {
  await mongoose.connection.collection("newsfirstseens").deleteMany({}).catch(() => {});
  await mongoose.disconnect();
});

test("a new URL gets a first-seen timestamp close to now, not derived from a publishedAt", async () => {
  const { recordFirstSeen } = await import("./newsFirstSeen.js");
  const url = "https://example.com/first-seen-test-1";
  const before = Date.now();

  const map = await recordFirstSeen([url]);

  assert.ok(map.get(url) instanceof Date);
  assert.ok(map.get(url).getTime() >= before - 1000);
  assert.ok(map.get(url).getTime() <= Date.now() + 1000);
});

test("calling recordFirstSeen again for the same URL returns the original timestamp, not a new one", async () => {
  const { recordFirstSeen } = await import("./newsFirstSeen.js");
  const url = "https://example.com/first-seen-test-2";

  const first = await recordFirstSeen([url]);
  const firstTimestamp = first.get(url).getTime();

  await new Promise(resolve => setTimeout(resolve, 50));

  const second = await recordFirstSeen([url]);
  assert.equal(second.get(url).getTime(), firstTimestamp, "a later call must not overwrite the original first-seen moment");
});

test("first-seen survives a simulated process restart (disconnect + reconnect)", async () => {
  const { recordFirstSeen } = await import("./newsFirstSeen.js");
  const url = "https://example.com/first-seen-test-restart";

  const before = await recordFirstSeen([url]);
  const originalTimestamp = before.get(url).getTime();

  // Simulates the one thing that actually distinguishes "persisted" from
  // "cached in this process": losing the connection (and with it, anything
  // that was only ever in memory) and coming back fresh.
  await mongoose.disconnect();
  await mongoose.connect(TEST_MONGODB);

  const after = await recordFirstSeen([url]);
  assert.equal(
    after.get(url).getTime(),
    originalTimestamp,
    "first-seen must be read back from the database, not lost when the connection restarts"
  );
});

test("when the database is not connected, first-seen is null immediately rather than fabricated or hung", async () => {
  const { recordFirstSeen } = await import("./newsFirstSeen.js");
  await mongoose.disconnect();

  const started = Date.now();
  const map = await recordFirstSeen(["https://example.com/no-db-test"]);
  const elapsed = Date.now() - started;

  assert.equal(map.get("https://example.com/no-db-test"), null);
  assert.ok(elapsed < 500, `should fail fast, not wait for mongoose's connection buffer timeout (took ${elapsed}ms)`);

  await mongoose.connect(TEST_MONGODB);
});
