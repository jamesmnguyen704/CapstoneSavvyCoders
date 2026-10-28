// EXPERIMENTAL — not imported by any route, not wired into production.
// A candidate deterministic improvement over news.js's title-prefix
// matching, evaluated against server/research/newsGroupingFixtures.js. See
// docs/project-status.md for the research question this answers and
// docs/decisions.md for why a deterministic approach was tried before an
// LLM or external service.
//
// Approach: two articles are considered the same underlying event if they
// share enough NAMED ENTITIES (proper-noun phrases extracted from the raw
// title — actor names, character names, franchise titles) AND enough
// overall word overlap (Jaccard over the full stopword-filtered token set,
// not just the first 8 words in order like the existing titleKey()), AND
// are not too far apart in time. All three signals are necessary because
// each alone produces a known false-positive case in the fixture set:
//   - Entities alone: "Ryan Gosling" interview + "Ryan Gosling" new project
//     share an entity but are unrelated (same-actor-different-event).
//   - Word overlap alone: a franchise name + genre words can inflate
//     Jaccard between genuinely different developments.
//   - No time bound: an old rumor and a much later, unrelated confirmation
//     about the same film could otherwise match on entities + wording.
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "is",
  "are", "this", "that", "his", "her", "its", "from", "by", "at", "as", "new",
  "says", "will", "could", "may", "set"
]);

function tokenSet(title) {
  return new Set(
    String(title || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(w => w && !STOP_WORDS.has(w))
  );
}

// Headlines are written in Title Case, which capitalizes nearly every word
// — so "consecutive capitalized words" alone doesn't isolate proper nouns at
// all; it just re-captures long stretches of the whole headline. A first
// version of this function did exactly that and badly under-performed (see
// docs/project-status.md's research findings). The fix: break a capitalized
// run at any word that's a grammatical function word (still capitalized by
// title-case convention, never part of a proper noun) OR a generic headline
// verb/noun (a recognized, genre-specific "filler" vocabulary — "Talks",
// "Circling", "Eyes", "Movie", "Role" — these recur across unrelated
// headlines and would otherwise merge unrelated runs together or split a
// real entity in an inconsistent way). This second list is the part most
// likely to need expansion against a larger real corpus — it's a real,
// reportable limitation, not a solved problem.
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

function extractEntities(title) {
  const words = String(title || "").replace(/[“”"']/g, "").split(/\s+/).filter(Boolean);
  const entities = new Set();
  let run = [];

  const flush = () => {
    if (run.length >= 2) entities.add(run.join(" ").toLowerCase());
    run = [];
  };

  for (const rawWord of words) {
    const word = rawWord.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, ""); // strip surrounding punctuation
    const lower = word.toLowerCase();
    const isCapitalized = /^[A-Z]/.test(word);
    const isBreakWord = GRAMMATICAL_BREAK_WORDS.has(lower) || HEADLINE_FILLER_WORDS.has(lower);

    if (isCapitalized && !isBreakWord && word.length > 0) {
      run.push(word);
    } else {
      flush();
    }
  }
  flush();

  return entities;
}

function jaccard(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const x of setA) if (setB.has(x)) intersection++;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function sharedEntityCount(setA, setB) {
  let count = 0;
  for (const x of setA) if (setB.has(x)) count++;
  return count;
}

// Explicit, named thresholds — not tuned beyond "passes the fixture set,"
// and that's the point: these are the exact knobs a future pass should
// re-evaluate against a larger fixture set before trusting on live traffic.
export const THRESHOLDS = {
  maxGroupingGapMs: 7 * 24 * 60 * 60 * 1000, // 7 days — a time veto, not a positive signal
  jaccardThreshold: 0.35,
  strongEntityCount: 2 // 2+ shared entity phrases is enough on its own
};

function isSameEvent(a, b) {
  const timeA = a.publishedAt ? Date.parse(a.publishedAt) : null;
  const timeB = b.publishedAt ? Date.parse(b.publishedAt) : null;
  if (timeA && timeB && Math.abs(timeA - timeB) > THRESHOLDS.maxGroupingGapMs) {
    return false; // time veto overrides any text/entity similarity
  }

  const entitiesA = extractEntities(a.title);
  const entitiesB = extractEntities(b.title);
  const shared = sharedEntityCount(entitiesA, entitiesB);

  if (shared >= THRESHOLDS.strongEntityCount) return true;
  if (shared >= 1 && jaccard(tokenSet(a.title), tokenSet(b.title)) >= THRESHOLDS.jaccardThreshold) {
    return true;
  }
  return false;
}

// Same output shape as news.js's groupAndDedupe(): an array of primary
// articles, each with relatedSources[]. Does NOT implement the existing
// per-source cap or URL-exact-match pass — this prototype only replaces the
// title-similarity decision, to isolate what changes.
export function candidateGroupAndDedupe(sortedNewestFirstItems) {
  const groups = [];
  for (const item of sortedNewestFirstItems) {
    const group = groups.find(g => g.__members.some(m => isSameEvent(m, item)));
    if (group) {
      group.relatedSources.push({
        url: item.url,
        publisher: item.source,
        publishedAt: item.publishedAt || null,
        matchedBy: "entity+similarity"
      });
      group.__members.push(item);
    } else {
      groups.push({ ...item, relatedSources: [], __members: [item] });
    }
  }
  return groups.map(({ __members, ...rest }) => rest);
}
