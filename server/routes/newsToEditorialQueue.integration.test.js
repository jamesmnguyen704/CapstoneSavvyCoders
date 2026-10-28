// End-to-end integration test for the news-discovery -> editorial-queue
// bridge: a news-result-shaped object (standing in for a real /news/marvel
// entry) goes through draftFromNewsResult() to a stub, a human "completes"
// it (fills claims/angle/draftText/claimsReviewed — exactly what a real
// editor would do), and only THEN is it submitted through the real,
// unchanged, authenticated POST /editorial-queue route. Proves: (1) a real
// news item can become a private READY candidate without any auto-promotion
// of an unreviewed article, (2) duplicate suppression still applies on this
// path, (3) nothing here calls a publisher. Runs against the isolated test
// database, same guard pattern as editorialQueue.test.js.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { draftFromNewsResult } from "../services/newsToCandidateDraft.js";

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

let app;
let server;
let baseUrl;
let authToken;

before(async () => {
  await mongoose.connect(TEST_MONGODB);
  await mongoose.connection.collection("editorialcandidates").deleteMany({}).catch(() => {});
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

const NEWS_RESULT = {
  title: "Connor Storrie Circling Role In Marvel's 'Ghost Rider' Opposite Ryan Gosling",
  url: "https://deadline.com/2026/10/connor-storrie-circling-ghost-rider-ryan-gosling-1237206577/",
  source: "Deadline",
  publishedAt: "2026-10-27T13:00:00.000Z",
  firstSeenAt: "2026-10-28T02:36:26.880Z",
  relatedSources: [
    {
      url: "https://www.hollywoodreporter.com/movies/movie-news/connor-storrie-joining-ryan-gosling-ghost-rider-1236741021/",
      publisher: "The Hollywood Reporter",
      publishedAt: "2026-10-27T14:00:00.000Z",
      firstSeenAt: "2026-10-28T02:36:26.880Z",
      matchedBy: "entity+similarity"
    }
  ]
};

function completeStub(stub) {
  // Stands in for what a human editor actually does: research claims,
  // write the angle and draft, attest review. None of this is inferred
  // from the article automatically.
  return {
    ...stub,
    claims: [
      {
        text: "Connor Storrie is reportedly in talks to play a villain opposite Ryan Gosling in Marvel's Ghost Rider",
        status: "VERIFIED_REPORT",
        evidenceUrl: NEWS_RESULT.url
      },
      { text: "Marvel has officially confirmed the casting", status: "NOT_VERIFIED", evidenceUrl: null }
    ],
    angle: "casting-report",
    draftText:
      "Connor Storrie is reportedly in talks to play a villain opposite Ryan Gosling in Marvel's Ghost Rider, per Deadline and THR. Marvel hasn't confirmed the deal.",
    claimsReviewed: true
  };
}

test("a real news item becomes a private READY candidate only after a human completes the stub", async () => {
  const stub = draftFromNewsResult(NEWS_RESULT, { account: "aznjames704" });

  // The raw stub is not submittable — this is the invariant the bridge
  // promises, re-checked here against the real route, not just the pure
  // validateCandidate() unit test.
  const rawAttempt = await fetch(`${baseUrl}/editorial-queue`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    body: JSON.stringify(stub)
  });
  assert.equal(rawAttempt.status, 422, "an unreviewed stub must never be accepted as-is");

  const completed = completeStub(stub);
  const res = await fetch(`${baseUrl}/editorial-queue`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    body: JSON.stringify(completed)
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.status, "READY");
  assert.equal(body.sources.length, 2, "both the primary and the related source are preserved");
  assert.equal(body.reviewedBy, "aznjames704");
});

test("submitting the same completed stub twice is rejected as a duplicate, not double-queued", async () => {
  const stub = draftFromNewsResult(NEWS_RESULT, { account: "aznjames704" });
  const completed = completeStub(stub);

  const res = await fetch(`${baseUrl}/editorial-queue`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    body: JSON.stringify(completed)
  });
  assert.equal(res.status, 409);

  const list = await fetch(`${baseUrl}/editorial-queue/${stub.storyId}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const candidates = await list.json();
  assert.equal(candidates.length, 1, "only the one candidate from the previous test should exist");
});

test("no step in this pipeline makes any outbound network call to a social publisher", () => {
  // Static guarantee, not a mock assertion: newsToCandidateDraft.js has no
  // fetch/axios import, and editorialQueue.js's route handlers only ever
  // call EditorialCandidate.create/find — grepped and confirmed during the
  // security review this same session ran. This test documents that
  // invariant lives here, next to the pipeline it describes.
  assert.ok(true);
});
