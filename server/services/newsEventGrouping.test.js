// Production regression tests for the second grouping pass — same fixture
// set used during Step B research (server/research/newsGroupingFixtures.js),
// now asserting real, shipped behavior rather than just measuring a
// candidate. Pure logic, no network, no database.
import { test } from "node:test";
import assert from "node:assert/strict";
import { groupAndDedupe } from "../routes/news.js";
import { mergeByEvent } from "./newsEventGrouping.js";
import { pairwiseMetrics } from "../research/groupingMetrics.js";
import { FIXTURES } from "../research/newsGroupingFixtures.js";

const sorted = [...FIXTURES].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
const deduped = groupAndDedupe(sorted);
const results = mergeByEvent(deduped);
const metrics = pairwiseMetrics(FIXTURES, results);

test("the two-pass pipeline (groupAndDedupe + mergeByEvent) produces zero false positives on the adversarial fixture set", () => {
  assert.equal(metrics.fp, 0, JSON.stringify(metrics.falsePositives, null, 2));
});

test("the two-pass pipeline recovers more real groupings than groupAndDedupe alone", () => {
  const baselineMetrics = pairwiseMetrics(FIXTURES, deduped);
  assert.ok(metrics.recall > baselineMetrics.recall);
});

test("the real 5-article Ghost Rider cluster is partially merged (2 groups), matching the measured research result", () => {
  const clusterAUrls = FIXTURES.filter(f => f.expectedCluster === "A").map(f => f.url);
  const clusterIds = new Set(
    clusterAUrls.map(url => {
      const owner = results.find(r => r.url === url || r.relatedSources.some(rs => rs.url === url));
      return owner ? owner.url : url;
    })
  );
  assert.equal(clusterIds.size, 2, "known, reported limitation — not all 5 are bridged by text/entity signals alone");
});

test("negotiation -> confirmed (Cluster C) is correctly merged as one development", () => {
  const clusterCUrls = FIXTURES.filter(f => f.expectedCluster === "C").map(f => f.url);
  const owners = new Set(
    clusterCUrls.map(url => {
      const owner = results.find(r => r.url === url || r.relatedSources.some(rs => rs.url === url));
      return owner ? owner.url : url;
    })
  );
  assert.equal(owners.size, 1);
});

test("same-actor-different-event (Cluster F1/F2) stays separate, even sharing 'Ryan Gosling'", () => {
  const f1 = FIXTURES.find(f => f.expectedCluster === "F1");
  const f2 = FIXTURES.find(f => f.expectedCluster === "F2");
  const ownerOf = url => {
    const owner = results.find(r => r.url === url || r.relatedSources.some(rs => rs.url === url));
    return owner ? owner.url : url;
  };
  assert.notEqual(ownerOf(f1.url), ownerOf(f2.url));
});

test("rumor vs. contradicting confirmation (Cluster E1/E2) stays separate", () => {
  const e1 = FIXTURES.find(f => f.expectedCluster === "E1");
  const e2 = FIXTURES.find(f => f.expectedCluster === "E2");
  const ownerOf = url => {
    const owner = results.find(r => r.url === url || r.relatedSources.some(rs => rs.url === url));
    return owner ? owner.url : url;
  };
  assert.notEqual(ownerOf(e1.url), ownerOf(e2.url), "7-day time veto + no strong entity/word match should keep these apart");
});

test("provenance is preserved through the merge — every original source URL is still reachable in the output", () => {
  const allInputUrls = new Set(FIXTURES.map(f => f.url));
  const allOutputUrls = new Set(results.flatMap(r => [r.url, ...r.relatedSources.map(s => s.url)]));
  for (const url of allInputUrls) {
    assert.ok(allOutputUrls.has(url), `${url} was dropped by the merge, not just re-grouped`);
  }
});
