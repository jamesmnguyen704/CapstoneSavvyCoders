// The minimal bridge from a real /news/marvel result to the editorial
// queue's input shape — and ONLY that. Produces a CANDIDATE-shaped stub, not
// a submission: claims[] is empty, angle/draftText are blank, and
// claimsReviewed is false. A news article has no verification status, no
// editorial framing, and no human attestation — none of those can be
// invented from the article text, and validateCandidate() (see
// editorialValidation.js) will reject this stub exactly as it would reject
// any other incomplete submission. A human fills in the real content and
// submits through the existing, unchanged POST /editorial-queue route.
//
// This module does NOT call that route itself — there is no auto-submission
// path here, on purpose.
export function draftFromNewsResult(newsResult, { account, platform = "threads", angle = "" } = {}) {
  if (!newsResult?.url || !newsResult?.title) {
    throw new Error("draftFromNewsResult requires a news result with at least a url and title");
  }

  const sources = [
    {
      url: newsResult.url,
      publisher: newsResult.source || "Unknown",
      articlePublishedAt: newsResult.publishedAt || null,
      discoveredAt: newsResult.firstSeenAt || null
    },
    ...(Array.isArray(newsResult.relatedSources)
      ? newsResult.relatedSources.map(rs => {
          const { provenance, isSyndicationOf } = provenanceFromMatchReason(rs.matchedBy, newsResult.url);
          return {
            url: rs.url,
            publisher: rs.publisher || "Unknown",
            articlePublishedAt: rs.publishedAt || null,
            discoveredAt: rs.firstSeenAt || null,
            provenance,
            isSyndicationOf
          };
        })
      : [])
  ];

  return {
    storyId: slugifyStoryId(newsResult.title, newsResult.firstSeenAt || newsResult.publishedAt),
    account: account || null,
    platform,
    angle,
    sources,
    claims: [], // human must research and assign a real verification status per claim
    draftText: "",
    claimsReviewed: false
  };
}

// news.js's grouping attaches a relatedSources entry for two structurally
// different reasons, and they mean different things for provenance:
//   - "url"/"title": news.js's original groupAndDedupe pass — an exact URL
//     repeat or a near-identical wire-copy headline. That IS a confirmed
//     syndication case (see news.js's own doc comment: title-similarity
//     exists specifically "to catch the same story syndicated across
//     publishers").
//   - "entity+similarity": the newsEventGrouping.js second pass — two
//     outlets independently worded their own headline about the same
//     underlying development. That's independent reporting, not a copy,
//     and must not be labeled as syndication just because it was grouped.
// Anything else (a future matchedBy value this hasn't been taught about) is
// recorded as UNKNOWN rather than guessed either way.
function provenanceFromMatchReason(matchedBy, primaryUrl) {
  if (matchedBy === "url" || matchedBy === "title") {
    return { provenance: "SYNDICATION", isSyndicationOf: primaryUrl };
  }
  if (matchedBy === "entity+similarity") {
    return { provenance: "INDEPENDENT_REPORT", isSyndicationOf: null };
  }
  return { provenance: "UNKNOWN", isSyndicationOf: null };
}

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "is",
  "are", "this", "that", "from", "by", "at", "as", "new", "says"
]);

function slugifyStoryId(title, dateInput) {
  const words = String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w && !STOP_WORDS.has(w))
    .slice(0, 6);

  const date = dateInput ? new Date(dateInput) : new Date();
  const dateStr = Number.isNaN(date.getTime()) ? "unknown-date" : date.toISOString().slice(0, 10);

  return [...words, dateStr].join("-");
}
