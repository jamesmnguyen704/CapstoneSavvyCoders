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
  // Grouped by the entity-aware second pass — that proves these are about
  // the same development, NOT whether one is a copy of the other or an
  // independent confirmation. provenance must stay UNKNOWN; matchedBy
  // records the technical grouping reason separately.
  assert.equal(stub.sources[1].provenance, "UNKNOWN");
  assert.equal(stub.sources[1].isSyndicationOf, null);
  assert.equal(stub.sources[1].matchedBy, "entity+similarity");
  assert.deepEqual(stub.claims, []);
  assert.equal(stub.draftText, "");
  assert.equal(stub.claimsReviewed, false);

  const { valid, reasons } = validateCandidate(stub);
  assert.equal(valid, false, "a raw stub must never itself be eligible for READY");
  assert.ok(reasons.some(r => r.includes("claim")));
  assert.ok(reasons.some(r => r.includes("claimsReviewed")));
});

test("differently-worded articles are NOT automatically labeled independent, regardless of matchedBy", () => {
  // Covers all three matchedBy values this bridge currently sees — none of
  // them should ever produce anything but UNKNOWN provenance. matchedBy
  // itself IS preserved, as separate grouping metadata.
  const stub = draftFromNewsResult({
    ...REAL_NEWS_RESULT,
    relatedSources: [
      { url: "https://outlet-a.example.com/x", publisher: "Outlet A", publishedAt: "2026-10-27T12:00:00.000Z", matchedBy: "url" },
      { url: "https://outlet-b.example.com/x", publisher: "Outlet B", publishedAt: "2026-10-27T12:30:00.000Z", matchedBy: "title" },
      { url: "https://outlet-c.example.com/x", publisher: "Outlet C", publishedAt: "2026-10-27T13:00:00.000Z", matchedBy: "entity+similarity" },
      { url: "https://outlet-d.example.com/x", publisher: "Outlet D", publishedAt: "2026-10-27T13:30:00.000Z" } // no matchedBy at all
    ]
  });

  const related = stub.sources.slice(1);
  assert.equal(related.length, 4);
  for (const source of related) {
    assert.equal(source.provenance, "UNKNOWN", `${source.publisher} must not have inferred provenance from matchedBy`);
    assert.equal(source.isSyndicationOf, null);
  }
  assert.deepEqual(related.map(s => s.matchedBy), ["url", "title", "entity+similarity", null]);
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
