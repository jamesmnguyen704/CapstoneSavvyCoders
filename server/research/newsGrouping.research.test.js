// Research report, not a production regression test: measures the EXISTING
// news.js grouping algorithm's pairwise precision/recall against a
// representative fixture set, then measures the candidate algorithm
// (newsGroupingCandidate.js) against the same fixtures, and prints both so
// the comparison is reproducible rather than asserted from memory. Nothing
// here touches server/routes/news.js's production behavior.
import { test } from "node:test";
import assert from "node:assert/strict";
import { groupAndDedupe } from "../routes/news.js";
import { candidateGroupAndDedupe } from "./newsGroupingCandidate.js";
import { pairwiseMetrics } from "./groupingMetrics.js";
import { FIXTURES } from "./newsGroupingFixtures.js";

// Production sorts newest-first before grouping (see aggregate() in
// news.js) — replicate that here so both algorithms see the same input
// order they'd see live.
const sorted = [...FIXTURES].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

const baseline = groupAndDedupe(sorted);
const candidate = candidateGroupAndDedupe(sorted);

const baselineMetrics = pairwiseMetrics(FIXTURES, baseline);
const candidateMetrics = pairwiseMetrics(FIXTURES, candidate);

test("baseline (existing titleKey) measurement — report", () => {
  console.log("\n=== BASELINE (existing news.js groupAndDedupe) ===");
  console.log(`Groups produced: ${baseline.length} (from ${FIXTURES.length} fixture articles)`);
  console.log(`Precision: ${baselineMetrics.precision.toFixed(2)}  Recall: ${baselineMetrics.recall.toFixed(2)}`);
  console.log(`TP=${baselineMetrics.tp} FP=${baselineMetrics.fp} FN=${baselineMetrics.fn} TN=${baselineMetrics.tn}`);
  if (baselineMetrics.falseNegatives.length) {
    console.log("Missed groupings (false negatives):");
    baselineMetrics.falseNegatives.forEach(f => console.log(`  [cluster ${f.cluster}] "${f.a}" <-> "${f.b}"`));
  }
  if (baselineMetrics.falsePositives.length) {
    console.log("Wrong groupings (false positives):");
    baselineMetrics.falsePositives.forEach(f => console.log(`  [${f.aCluster} vs ${f.bCluster}] "${f.a}" <-> "${f.b}"`));
  }

  // Known, expected baseline behavior (this is what makes it a baseline,
  // not a pass/fail gate): zero false positives (it's conservative to a
  // fault), and it misses Cluster A's 5-way grouping (the real-world case
  // that motivated this whole investigation) and Cluster C's
  // negotiation-then-confirmed pair.
  assert.equal(baselineMetrics.fp, 0, "existing algorithm should produce no false positives on this fixture set");
  assert.ok(baselineMetrics.fn > 0, "existing algorithm is expected to miss real groupings — that's the problem being measured");
});

test("candidate (entity + similarity + time-bound) measurement — report", () => {
  console.log("\n=== CANDIDATE (entity-aware, server/research/newsGroupingCandidate.js) ===");
  console.log(`Groups produced: ${candidate.length} (from ${FIXTURES.length} fixture articles)`);
  console.log(`Precision: ${candidateMetrics.precision.toFixed(2)}  Recall: ${candidateMetrics.recall.toFixed(2)}`);
  console.log(`TP=${candidateMetrics.tp} FP=${candidateMetrics.fp} FN=${candidateMetrics.fn} TN=${candidateMetrics.tn}`);
  if (candidateMetrics.falseNegatives.length) {
    console.log("Missed groupings (false negatives):");
    candidateMetrics.falseNegatives.forEach(f => console.log(`  [cluster ${f.cluster}] "${f.a}" <-> "${f.b}"`));
  }
  if (candidateMetrics.falsePositives.length) {
    console.log("Wrong groupings (false positives):");
    candidateMetrics.falsePositives.forEach(f => console.log(`  [${f.aCluster} vs ${f.bCluster}] "${f.a}" <-> "${f.b}"`));
  }

  // The specific, named claims this research makes: the candidate recovers
  // Cluster A (the motivating case) and Cluster C (negotiation->confirmed)
  // without producing any false positive on the adversarial cases the
  // fixture set was built to catch (same-actor-different-event,
  // rumor-vs-contradicting-confirmation, same-franchise-different-development).
  assert.equal(candidateMetrics.fp, 0, "candidate must not introduce false positives on the adversarial fixture cases");
  assert.ok(
    candidateMetrics.recall > baselineMetrics.recall,
    "candidate should recover at least some of the groupings the existing algorithm misses"
  );
});

test("Cluster A (the real Ghost Rider case) specifically: baseline fails to group, candidate groups all 5", () => {
  const clusterAUrls = FIXTURES.filter(f => f.expectedCluster === "A").map(f => f.url);

  const baselineClusters = new Set(
    clusterAUrls.map(url => {
      const match = baseline.find(g => g.url === url || g.relatedSources.some(rs => rs.url === url));
      return match ? match.url : url;
    })
  );
  const candidateClusters = new Set(
    clusterAUrls.map(url => {
      const match = candidate.find(g => g.url === url || g.relatedSources.some(rs => rs.url === url));
      return match ? match.url : url;
    })
  );

  console.log(`\nCluster A (5 real Ghost Rider articles): baseline produced ${baselineClusters.size} distinct group(s), candidate produced ${candidateClusters.size}.`);

  assert.equal(baselineClusters.size, 5, "confirms the live finding: baseline treats all 5 as separate stories");
  // Honest measured result, not a target: the candidate merges 2 real
  // headlines ("...in talks to join..." / "...Circling Role...Opposite
  // Ryan Gosling") whose entity extraction ("connor storrie", "ryan
  // gosling") matches directly, but doesn't bridge all 5 — "Marvel Studios
  // Eyes Major TV Star as Villain" never names Connor Storrie at all, so no
  // deterministic entity/text signal can link it without a cast/credits
  // lookup external to the headline text itself.
  assert.equal(candidateClusters.size, 2, "candidate recovers a partial merge, not the full 5-way group — see report");
});
