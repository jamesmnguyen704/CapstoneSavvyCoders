// Second, additive grouping pass for news.js — merges primaries that
// groupAndDedupe() already treats as separate stories but that describe the
// same underlying development in different words (e.g. 5 real outlets
// independently reporting one Ghost Rider casting story with 5 different
// headlines — verified live not to be caught by exact-URL/title-prefix
// matching alone). Promoted from server/research/newsGroupingCandidate.js
// after baseline measurement — see docs/project-status.md's Step B research
// entry and docs/decisions.md for why a deterministic approach was chosen
// and what its measured precision/recall actually is (1.00 / 0.58 on the
// evaluation fixture set, zero false positives on every adversarial case
// tried: same-actor-different-event, rumor-vs-contradicting-confirmation,
// same-franchise-different-development).
//
// Headlines are Title Case, which capitalizes nearly every word — so a
// first version of entity extraction here ("consecutive capitalized
// words") badly under-performed, because it wasn't isolating proper nouns
// at all. The fix: break a capitalized run at grammatical function words
// AND a curated list of generic headline verbs/nouns ("Talks", "Circling",
// "Movie") that recur across unrelated stories. That filler-word list is
// the single most likely thing to need expansion against real traffic —
// flagged here, not hidden.
const GRAMMATICAL_BREAK_WORDS = new Set([
  "a", "an", "the", "in", "to", "for", "of", "on", "with", "as", "is", "are",
  "and", "or", "from", "by", "at", "opposite", "over", "into", "about",
  "after", "before", "vs", "v", "will", "would", "could", "may", "might"
]);
const HEADLINE_FILLER_WORDS = new Set([
  "talks", "talk", "role", "star", "stars", "movie", "film", "sequel",
  "reportedly", "officially", "confirms", "confirmed", "circling", "joining",
  "join", "eyes", "eyeing", "early", "major", "tv", "new"
]);
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "is",
  "are", "this", "that", "his", "her", "its", "from", "by", "at", "as", "new",
  "says", "will", "could", "may", "set"
]);

export const THRESHOLDS = {
  // A veto, not a positive signal — exists to stop an old rumor from
  // merging with an unrelated later story just because the wording happens
  // to overlap. Originally set to 7 days; raised to 14 after the fixture
  // set's own negotiation->confirmation case (a realistic 9-day gap, see
  // Cluster C in newsGroupingFixtures.js) was correctly judged the SAME
  // development by entity/word overlap but incorrectly vetoed by time alone.
  // Verified the wider window doesn't reopen the cases it exists to guard:
  // the rumor-vs-contradicting-confirmation fixture (19 days apart) stays
  // separate on entity mismatch, not the time veto, and the
  // same-franchise-different-development fixture is 35+ days out either way.
  maxGroupingGapMs: 14 * 24 * 60 * 60 * 1000,
  jaccardThreshold: 0.35,
  strongEntityCount: 2
};

function extractEntities(title) {
  const words = String(title || "").replace(/[“”"']/g, "").split(/\s+/).filter(Boolean);
  const entities = new Set();
  let run = [];

  const flush = () => {
    if (run.length >= 2) entities.add(run.join(" ").toLowerCase());
    run = [];
  };

  for (const rawWord of words) {
    const word = rawWord.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, "");
    const lower = word.toLowerCase();
    const isCapitalized = /^[A-Z]/.test(word);
    const isBreakWord = GRAMMATICAL_BREAK_WORDS.has(lower) || HEADLINE_FILLER_WORDS.has(lower);
    if (isCapitalized && !isBreakWord && word.length > 0) run.push(word);
    else flush();
  }
  flush();
  return entities;
}

function tokenSet(title) {
  return new Set(
    String(title || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(w => w && !STOP_WORDS.has(w))
  );
}

function jaccard(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const x of setA) if (setB.has(x)) intersection++;
  return intersection / (setA.size + setB.size - intersection);
}

export function isSameEvent(a, b) {
  const timeA = a.publishedAt ? Date.parse(a.publishedAt) : null;
  const timeB = b.publishedAt ? Date.parse(b.publishedAt) : null;
  if (timeA && timeB && Math.abs(timeA - timeB) > THRESHOLDS.maxGroupingGapMs) return false;

  const entitiesA = extractEntities(a.title);
  const entitiesB = extractEntities(b.title);
  let shared = 0;
  for (const e of entitiesA) if (entitiesB.has(e)) shared++;

  if (shared >= THRESHOLDS.strongEntityCount) return true;
  if (shared >= 1 && jaccard(tokenSet(a.title), tokenSet(b.title)) >= THRESHOLDS.jaccardThreshold) return true;
  return false;
}

// Second pass over groupAndDedupe()'s output: merges two primaries (plus
// everything already attached to them) when isSameEvent() matches on their
// titles. Preserves every source's provenance and its own firstSeenAt — the
// merged-away primary becomes just another relatedSources[] entry on the
// survivor, never discarded. Whichever primary appears first (the existing
// newest-first convention from groupAndDedupe) stays primary.
export function mergeByEvent(primaries) {
  const merged = [];

  for (const item of primaries) {
    const target = merged.find(m => isSameEvent(m, item) || item.relatedSources.some(rs => isSameEvent(m, rs)));

    if (!target) {
      merged.push({ ...item, relatedSources: [...item.relatedSources] });
      continue;
    }

    target.relatedSources.push({
      url: item.url,
      publisher: item.source,
      publishedAt: item.publishedAt || null,
      matchedBy: "entity+similarity"
    });
    target.relatedSources.push(...item.relatedSources);
  }

  return merged;
}
