// Pure unit tests for the dedupe/grouping decision in news.js. No network,
// no database — groupAndDedupe takes a plain array and returns one, so these
// run against hand-built fixtures instead of live RSS feeds.
import { test } from "node:test";
import assert from "node:assert/strict";
import { groupAndDedupe } from "./news.js";

function article(overrides) {
  return {
    id: overrides.url,
    title: "Untitled",
    url: "https://example.com/untitled",
    image: null,
    excerpt: "",
    source: "Test Source",
    publishedAt: "2026-10-27T12:00:00.000Z",
    tags: [],
    ...overrides
  };
}

test("two publishers covering the same story are grouped, not discarded", () => {
  // titleKey() compares the first 8 non-stopword keywords in order — it
  // catches true syndication (same wire headline, light rewording) rather
  // than "same topic, different wording." These two are deliberately close
  // enough to match under the EXISTING algorithm (this milestone preserves
  // what it already groups — it doesn't make it smarter).
  const items = [
    article({
      url: "https://joblo.com/connor-storrie-ghost-rider/",
      source: "JoBlo",
      title: "Connor Storrie In Talks To Play Villain In Marvel's Ghost Rider",
      publishedAt: "2026-10-27T14:00:00.000Z"
    }),
    article({
      url: "https://deadline.com/2026/10/connor-storrie-circling-ghost-rider-ryan-gosling-1237206577/",
      source: "Deadline",
      title: "Connor Storrie In Talks To Play Villain In Marvel's Ghost Rider Movie",
      publishedAt: "2026-10-27T13:00:00.000Z"
    })
  ];

  const results = groupAndDedupe(items);

  assert.equal(results.length, 1, "the public feed must still show one story, not two near-duplicate cards");
  const [story] = results;
  assert.equal(story.source, "JoBlo", "the newest article wins as primary, same as before this change");
  assert.equal(story.relatedSources.length, 1);
  assert.equal(story.relatedSources[0].publisher, "Deadline");
  assert.equal(story.relatedSources[0].matchedBy, "title");
  assert.ok(story.relatedSources[0].titleKeyMatched);
});

test("an exact URL repeat (e.g. Guardian and an RSS feed both surfacing the same link) is grouped by url, not title", () => {
  const items = [
    article({ url: "https://deadline.com/story-a/", source: "Deadline", title: "Story A breaks", publishedAt: "2026-10-27T14:00:00.000Z" }),
    article({ url: "https://deadline.com/story-a/", source: "The Guardian", title: "Story A breaks", publishedAt: "2026-10-27T13:00:00.000Z" })
  ];

  const results = groupAndDedupe(items);

  assert.equal(results.length, 1);
  assert.equal(results[0].relatedSources.length, 1);
  assert.equal(results[0].relatedSources[0].matchedBy, "url");
});

test("unrelated stories are kept separate, not accidentally merged", () => {
  const items = [
    article({ url: "https://a.com/ghost-rider-casting", source: "A", title: "Ghost Rider casts its villain" }),
    article({ url: "https://b.com/fantastic-four-trailer", source: "B", title: "Fantastic Four trailer drops" }),
    article({ url: "https://c.com/avengers-doomsday-set-photos", source: "C", title: "Avengers Doomsday set photos leak" })
  ];

  const results = groupAndDedupe(items);

  assert.equal(results.length, 3, "three genuinely different stories must not collapse into fewer");
  results.forEach(r => assert.equal(r.relatedSources.length, 0));
});

test("per-source cap overflow is still dropped outright, not attached as a related source", () => {
  // Five unrelated stories from the same prolific outlet, cap is 4 — the 5th
  // must be dropped entirely (original behavior), not grouped with anything.
  const items = Array.from({ length: 5 }, (_, i) =>
    article({
      url: `https://prolific.com/story-${i}`,
      source: "Prolific Wire",
      title: `Completely unrelated headline number ${i} about a different movie`
    })
  );

  const results = groupAndDedupe(items);

  assert.equal(results.length, 4, "the per-source cap (4) must still apply");
  results.forEach(r => assert.equal(r.relatedSources.length, 0, "cap overflow isn't a duplicate of anything"));
});

test("grouped relatedSources carry enough information to see why they were matched", () => {
  const items = [
    article({ url: "https://a.com/x", source: "A", title: "Marvel confirms new villain for Ghost Rider film" }),
    article({ url: "https://b.com/x", source: "B", title: "Marvel confirms new villain for the Ghost Rider film" })
  ];

  const [story] = groupAndDedupe(items);

  assert.equal(story.relatedSources.length, 1);
  const related = story.relatedSources[0];
  assert.ok(related.url);
  assert.ok(related.publisher);
  assert.ok(related.publishedAt);
  assert.equal(related.matchedBy, "title");
});
