// Gate 2 regression tests: proves the Ghost Rider fixture moves through
// intake -> validation -> durable READY record, and that the specific
// failure modes the brief called out (duplicate submission, an unverified
// claim stated as fact, overlength drafts, wrong account, no auth) are all
// actually rejected. Runs against an isolated test database (same Atlas
// cluster, a different database name) — never the real app data.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import EditorialCandidate from "../models/editorialCandidate.js";

dotenv.config({ path: process.env.DOTENV_PATH || "./.env" });

const PROD_MONGODB = process.env.MONGODB || "";
const TEST_MONGODB = PROD_MONGODB.replace(/\/([^/?]+)(\?|$)/, "/cinemetrics_test$2");

// Defense against the one failure mode that would actually be dangerous:
// if the regex above doesn't match (connection string shaped differently
// than expected), .replace() returns the string UNCHANGED, and this test
// would silently run its deleteMany() against the real production
// database. Refuse to proceed unless the derived URI both differs from the
// real one AND visibly targets a database named for tests.
if (!PROD_MONGODB) {
  throw new Error("MONGODB env var not set — set DOTENV_PATH before running this test");
}
if (TEST_MONGODB === PROD_MONGODB || !/\/cinemetrics_test(\?|$)/.test(TEST_MONGODB)) {
  throw new Error(
    "Refusing to run: could not derive an isolated test database name from MONGODB. " +
      "This test must never connect to the production database."
  );
}

let app;
let server;
let baseUrl;
let authToken;

before(async () => {
  await mongoose.connect(TEST_MONGODB);
  await mongoose.connection.collection("editorialcandidates").deleteMany({}).catch(() => {});
  // Mongoose builds indexes asynchronously in the background by default —
  // without waiting for this, the concurrent-duplicate test below could run
  // before the unique index actually exists and get a false pass.
  await EditorialCandidate.init();

  ({ default: app } = await import("../app.js"));
  server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  authToken = jwt.sign({ username: "aznjames704" }, process.env.JWT_SECRET);
});

after(async () => {
  await mongoose.connection.collection("editorialcandidates").deleteMany({}).catch(() => {});
  await mongoose.disconnect();
  await new Promise(resolve => server.close(resolve));
});

function ghostRiderFixture(overrides = {}) {
  return {
    storyId: "ghost-rider-storrie-2026-10-27",
    account: "aznjames704",
    platform: "threads",
    angle: "casting-report",
    sources: [
      {
        url: "https://ew.com/connor-storrie-ghost-rider-villain-ryan-gosling-12197326",
        publisher: "Entertainment Weekly",
        articlePublishedAt: "2026-10-27T00:00:00.000Z"
      },
      {
        url: "https://people.com/heated-rivalry-star-connor-storrie-in-talks-to-play-villain-opposite-ryan-gosling-in-marvel-s-ghost-rider-report-12197454",
        publisher: "People",
        articlePublishedAt: "2026-10-27T00:00:00.000Z"
      }
    ],
    claims: [
      {
        text: "Connor Storrie is reportedly in talks to play a villain opposite Ryan Gosling in Marvel's Ghost Rider",
        status: "VERIFIED_REPORT",
        evidenceUrl: "https://ew.com/connor-storrie-ghost-rider-villain-ryan-gosling-12197326"
      },
      { text: "Marvel has officially confirmed the casting", status: "NOT_VERIFIED", evidenceUrl: null },
      { text: "The villain is Blackheart", status: "UNKNOWN", evidenceUrl: null }
    ],
    draftText:
      "Connor Storrie is reportedly in talks to play a villain opposite Ryan Gosling in Marvel's Ghost Rider, according to THR and Entertainment Weekly.\n\nMarvel hasn't confirmed the deal or revealed the villain.\n\nWho would you rather see him play: Blackheart or a completely new villain?",
    claimsReviewed: true,
    ...overrides
  };
}

async function postCandidate(body, token = authToken) {
  return fetch(`${baseUrl}/editorial-queue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
}

test("Ghost Rider fixture: intake -> READY -> duplicate rejected -> persists on read-back", async () => {
  const created = await postCandidate(ghostRiderFixture());
  assert.equal(created.status, 201);
  const createdBody = await created.json();
  assert.equal(createdBody.status, "READY");
  assert.equal(createdBody.verification, "REPORT_VERIFIED");

  const duplicate = await postCandidate(ghostRiderFixture());
  assert.equal(duplicate.status, 409);

  const readBack = await fetch(`${baseUrl}/editorial-queue/ghost-rider-storrie-2026-10-27`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const list = await readBack.json();
  assert.equal(list.length, 1, "duplicate submission must not create a second record");
  assert.equal(list[0].status, "READY");
  assert.ok(list[0].draftText.includes("Blackheart"));
});

test("a draft asserting an unverified claim as confirmed fact is rejected", async () => {
  const res = await postCandidate(
    ghostRiderFixture({
      storyId: "ghost-rider-blackheart-confirmed-test",
      draftText:
        "Marvel has officially confirmed Connor Storrie will play Blackheart opposite Ryan Gosling in Ghost Rider."
    })
  );
  assert.equal(res.status, 422);
  const body = await res.json();
  assert.ok(body.reasons.some(r => r.includes("certainty language")));
});

test("a draft over the character limit is rejected", async () => {
  const res = await postCandidate(
    ghostRiderFixture({
      storyId: "ghost-rider-overlength-test",
      draftText: "A real Marvel casting report. ".repeat(20)
    })
  );
  assert.equal(res.status, 422);
  const body = await res.json();
  assert.ok(body.reasons.some(r => r.includes("exceeds 500 characters")));
});

test("a draft with a hashtag is rejected", async () => {
  const res = await postCandidate(
    ghostRiderFixture({
      storyId: "ghost-rider-hashtag-test",
      draftText: "Connor Storrie reportedly in talks for Ghost Rider. #MCU #GhostRider"
    })
  );
  assert.equal(res.status, 422);
  const body = await res.json();
  assert.ok(body.reasons.some(r => r.includes("hashtag")));
});

test("submitting without claimsReviewed is rejected even with valid text", async () => {
  const res = await postCandidate(
    ghostRiderFixture({ storyId: "ghost-rider-unreviewed-test", claimsReviewed: false })
  );
  assert.equal(res.status, 422);
  const body = await res.json();
  assert.ok(body.reasons.some(r => r.includes("claimsReviewed")));
});

test("an authenticated but unauthorized account is rejected before validation runs", async () => {
  const wrongToken = jwt.sign({ username: "cyberyam704" }, process.env.JWT_SECRET);
  const res = await postCandidate(
    ghostRiderFixture({ storyId: "ghost-rider-wrong-account-test" }),
    wrongToken
  );
  assert.equal(res.status, 403);
});

test("no auth token at all is rejected", async () => {
  const res = await postCandidate(ghostRiderFixture({ storyId: "ghost-rider-no-auth-test" }), null);
  assert.equal(res.status, 401);
});

test("reviewedBy is bound to the authenticated caller, not a client-supplied value", async () => {
  const res = await postCandidate(
    ghostRiderFixture({
      storyId: "ghost-rider-reviewer-spoof-test",
      // An attempt to claim a different reviewer identity — must be ignored.
      reviewedBy: "someone-else"
    })
  );
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.reviewedBy, "aznjames704");
  assert.ok(body.reviewedAt);
});

test("a properly hedged draft with unverified claims is NOT blocked by the certainty-language check", async () => {
  // The mechanical check is defensive, not a blanket ban on unverified
  // claims — a draft that correctly hedges ("reportedly", "hasn't
  // confirmed") must still pass even though the underlying claims are
  // UNKNOWN/NOT_VERIFIED. This is the Ghost Rider fixture's own shape;
  // this test isolates that specific property on its own story id.
  const res = await postCandidate(
    ghostRiderFixture({
      storyId: "ghost-rider-hedged-language-test",
      draftText:
        "Connor Storrie is reportedly circling a villain role in Marvel's Ghost Rider, per multiple outlets. Nothing is confirmed yet — stay tuned."
    })
  );
  assert.equal(res.status, 201);
});

test("regex is a defensive check, not the sole authority: a misleading draft with no certainty words still requires claimsReviewed", async () => {
  // This draft implies the casting is near-certain ("basically a done
  // deal") without tripping CERTAINTY_PATTERN at all. No regex catches
  // this — the system's actual defense against it is that claimsReviewed
  // must be an explicit, truthful attestation from the one authorized
  // editor, not that the wording is mechanically unimpeachable. Proving
  // the regex *doesn't* catch this, and that submission still succeeds
  // once claimsReviewed is asserted, demonstrates the regex is advisory:
  // the real backstop is human review, not pattern matching.
  const misleadingText =
    "Connor Storrie is basically a done deal to play the villain in Ghost Rider at this point.";

  const unreviewed = await postCandidate(
    ghostRiderFixture({ storyId: "ghost-rider-misleading-no-review-test", draftText: misleadingText, claimsReviewed: false })
  );
  assert.equal(unreviewed.status, 422, "without claimsReviewed, even innocuous-sounding text is rejected");

  const reviewed = await postCandidate(
    ghostRiderFixture({ storyId: "ghost-rider-misleading-reviewed-test", draftText: misleadingText, claimsReviewed: true })
  );
  assert.equal(
    reviewed.status,
    201,
    "regex alone doesn't catch this wording — claimsReviewed is the real check, which is the point"
  );
});

test("GET endpoints are scoped to the authenticated account, not just filtered by storyId alone", async () => {
  // No second authorized account can exist today (publishingPolicy.js only
  // ever admits one), so this inserts one directly via the model to prove
  // the query-level scope actually works mechanically — correct by
  // construction, not just correct because nothing else could reach it.
  const storyId = "ghost-rider-cross-account-scope-test";
  await EditorialCandidate.create({
    storyId,
    account: "a-different-hypothetical-account",
    platform: "threads",
    angle: "casting-report",
    draftText: "This belongs to a different account and must not leak.",
    sources: [],
    claims: [{ text: "x", status: "VERIFIED_REPORT" }],
    status: "READY",
    reviewedBy: "a-different-hypothetical-account",
    reviewedAt: new Date()
  });

  const byStoryId = await fetch(`${baseUrl}/editorial-queue/${storyId}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  assert.deepEqual(await byStoryId.json(), [], "a candidate belonging to a different account must not be returned");

  const list = await fetch(`${baseUrl}/editorial-queue`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const listBody = await list.json();
  assert.ok(
    !listBody.some(c => c.storyId === storyId),
    "the list endpoint must not include another account's candidate either"
  );
});

test("duplicate submissions are rejected even when they race each other concurrently (DB-level unique index, not just the pre-check)", async () => {
  const storyId = "ghost-rider-race-condition-test";
  const [a, b] = await Promise.all([
    postCandidate(ghostRiderFixture({ storyId })),
    postCandidate(ghostRiderFixture({ storyId }))
  ]);

  const statuses = [a.status, b.status].sort();
  assert.deepEqual(
    statuses,
    [201, 409],
    "exactly one concurrent request should succeed; the other must be rejected by the unique index, not slip through"
  );

  const stored = await EditorialCandidate.find({ storyId }).lean();
  assert.equal(stored.length, 1, "the database must contain exactly one record even when the pre-check race loses");
});
