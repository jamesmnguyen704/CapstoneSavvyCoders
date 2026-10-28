import { test } from "node:test";
import assert from "node:assert/strict";
import { draftFromNewsResult } from "./newsToCandidateDraft.js";
import { validateCandidate } from "./editorialValidation.js";

const REAL_NEWS_RESULT = {
  id: "https://www.joblo.com/connor-storrie-ghost-rider/",
  title: "Heated Rivalry's Connor Storrie in talks to join Ryan Gosling in Marvel's Ghost Rider",
  url: "https://www.joblo.com/connor-storrie-ghost-rider/",
  image: null,
  excerpt: "Connor Storrie is reportedly circling a villain role in Marvel's Ghost Rider.",
  source: "JoBlo",
  publishedAt: "2026-10-27T11:00:00.000Z",
  tags: [],
  firstSeenAt: "2026-10-28T02:36:26.880Z",
  relatedSources: [
    { url: "https://deadline.com/connor-storrie-ghost-rider", publisher: "Deadline", publishedAt: "2026-10-27T13:00:00.000Z", firstSeenAt: "2026-10-28T02:36:26.880Z", matchedBy: "entity+similarity" }
  ]
};

test("draftFromNewsResult produces a stub that validateCandidate always rejects", () => {
  const stub = draftFromNewsResult(REAL_NEWS_RESULT, { account: "aznjames704" });

  assert.ok(stub.storyId.endsWith("2026-10-28") || stub.storyId.endsWith("2026-10-27"));
  assert.equal(stub.sources.length, 2, "primary + the one relatedSources entry");
  assert.equal(stub.sources[0].url, REAL_NEWS_RESULT.url);
  assert.equal(stub.sources[1].url, REAL_NEWS_RESULT.relatedSources[0].url);
  assert.deepEqual(stub.claims, []);
  assert.equal(stub.draftText, "");
  assert.equal(stub.claimsReviewed, false);

  const { valid, reasons } = validateCandidate(stub);
  assert.equal(valid, false, "a raw stub must never itself be eligible for READY");
  assert.ok(reasons.some(r => r.includes("claim")));
  assert.ok(reasons.some(r => r.includes("claimsReviewed")));
});

test("draftFromNewsResult throws on a malformed news result rather than producing a broken stub", () => {
  assert.throws(() => draftFromNewsResult({}));
  assert.throws(() => draftFromNewsResult({ url: "https://example.com" })); // no title
});

test("draftFromNewsResult never calls out to the network or any queue route — pure function", () => {
  // No fetch/axios import in newsToCandidateDraft.js at all; this just
  // documents the invariant the module comment promises.
  const stub = draftFromNewsResult(REAL_NEWS_RESULT);
  assert.equal(typeof stub, "object");
  assert.equal(stub.account, null, "account is only set if the caller explicitly supplies it");
});
