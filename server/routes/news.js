// File: server/routes/news.js
// Purpose: Aggregates movie AND TV news from a curated set of sources.
//          Kept intentionally small to avoid Valnet-network churn
//          (MovieWeb/Collider/ScreenRant all share editorial).
// Endpoints:
//   GET /        → movie-focused feed
//   GET /tv      → TV-focused feed (streaming shows, prestige, reality)
// Notes:
//   - Returned shape: { results: [{ id, title, url, image, excerpt,
//     source, publishedAt, tags }] }, sorted by date desc.
//   - All feeds run in parallel with individual timeouts so one slow
//     source can't drag the whole response down.
//   - Dedupe is URL-based AND title-similarity-based to catch the same
//     story syndicated across publishers.

import express from "express";
import axios from "axios";
import Parser from "rss-parser";

const router = express.Router();

const parser = new Parser({
  timeout: 7000,
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["enclosure", "enclosure"],
      ["content:encoded", "contentEncoded"]
    ]
  }
});

const GUARDIAN_BASE = "https://content.guardianapis.com/search";

// Movie-focused configuration
const MOVIE_FEEDS = [
  { source: "IGN",      url: "https://feeds.feedburner.com/ign/movies-all" },
  { source: "/Film",    url: "https://www.slashfilm.com/feed/" },
  { source: "Deadline", url: "https://deadline.com/v/film/feed/" }
];
const MOVIE_GUARDIAN = {
  section: "film",
  query: [
    "marvel", "MCU", "avengers",
    "DC", "batman", "superman", "spider-man",
    '"star wars"', '"box office"', "blockbuster", "franchise", "sequel",
    '"comic-con"', '"comic con"', "cinemacon", '"cinema con"',
    "superhero", "disney", "pixar", "james bond",
    "james cameron", "dune", "avatar"
  ].join(" OR ")
};

// TV-focused configuration — streaming prestige, adult superhero,
// genre series that matter (not daytime soaps / local news).
const TV_FEEDS = [
  { source: "IGN",      url: "https://feeds.feedburner.com/ign/tv-all" },
  { source: "Deadline", url: "https://deadline.com/v/tv/feed/" }
];
const TV_GUARDIAN = {
  section: "tv-and-radio",
  query: [
    '"the boys"', "invincible", "daredevil", '"house of the dragon"',
    '"last of us"', "severance", "succession", "stranger things",
    "mandalorian", "loki", '"what if"', "wednesday", "bridgerton",
    '"squid game"', "beef", '"true detective"', '"the bear"',
    "streaming", "netflix", '"hbo max"', '"apple tv"', "hulu",
    '"amazon prime"', "paramount", '"disney plus"', "peacock"
  ].join(" OR ")
};

function stripHtml(s) {
  return String(s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

// Normalize a title for similarity comparison: lowercase, strip punctuation,
// drop common filler words, and clip to the first 8 keywords. Different
// publishers syndicating the same story usually keep 5+ shared keywords.
const STOP_WORDS = new Set([
  "the","a","an","and","or","of","to","in","on","for","with","is","are",
  "this","that","his","her","its","from","by","at","as","new","says"
]);
function titleKey(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w && !STOP_WORDS.has(w))
    .slice(0, 8)
    .join(" ");
}

function extractImage(item) {
  // Try several common RSS image locations in priority order.
  if (item.enclosure?.url && /^image\//i.test(item.enclosure.type || "image/")) {
    return item.enclosure.url;
  }
  if (Array.isArray(item.mediaContent) && item.mediaContent[0]?.$.url) {
    return item.mediaContent[0].$.url;
  }
  if (Array.isArray(item.mediaThumbnail) && item.mediaThumbnail[0]?.$.url) {
    return item.mediaThumbnail[0].$.url;
  }
  // Fall back to the first <img> in the content/description.
  const hay = item.contentEncoded || item.content || item.description || "";
  const match = String(hay).match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

function truncate(s, n) {
  const str = stripHtml(s);
  return str.length > n ? str.slice(0, n - 1).trimEnd() + "…" : str;
}

async function fetchRssSource({ source, url }) {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).slice(0, 8).map(item => ({
      id: item.guid || item.link,
      title: item.title || "",
      url: item.link || "",
      image: extractImage(item),
      excerpt: truncate(item.contentSnippet || item.content || item.description || "", 220),
      source,
      publishedAt: item.isoDate || item.pubDate || null,
      tags: []
    }));
  } catch (err) {
    console.warn(`NEWS RSS ${source} failed:`, err.message);
    return [];
  }
}

async function fetchGuardian({ section, query }) {
  const apiKey = process.env.GUARDIAN_API_KEY || "test";
  try {
    const response = await axios.get(GUARDIAN_BASE, {
      params: {
        section,
        q: query,
        "show-fields": "thumbnail,trailText,byline",
        "show-tags": "keyword",
        "order-by": "newest",
        "page-size": 20,
        "api-key": apiKey
      },
      timeout: 7000
    });
    return (response.data?.response?.results || []).map(item => ({
      id: item.id,
      title: item.webTitle,
      url: item.webUrl,
      image: item.fields?.thumbnail || null,
      excerpt: stripHtml(item.fields?.trailText || ""),
      source: "The Guardian",
      publishedAt: item.webPublicationDate,
      tags: (item.tags || []).map(t => t.webTitle).filter(Boolean)
    }));
  } catch (err) {
    console.warn(`NEWS Guardian (${section}) failed:`, err.message);
    return [];
  }
}

async function aggregate({ rssFeeds, guardian }) {
  const [guardianResults, ...rssResults] = await Promise.all([
    fetchGuardian(guardian),
    ...rssFeeds.map(fetchRssSource)
  ]);

  const all = [...guardianResults, ...rssResults.flat()]
    .filter(a => a && a.title && a.url);

  // Sort newest-first so the oldest near-duplicate loses.
  all.sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });

  // Dedupe in two passes: exact URL, then normalized-title similarity.
  const seenUrls = new Set();
  const seenTitles = new Set();
  const results = [];
  for (const item of all) {
    if (seenUrls.has(item.url)) continue;
    const key = titleKey(item.title);
    if (key && seenTitles.has(key)) continue;
    seenUrls.add(item.url);
    if (key) seenTitles.add(key);
    results.push(item);
    if (results.length >= 40) break;
  }
  return results;
}

router.get("/", async (req, res) => {
  try {
    const results = await aggregate({
      rssFeeds: MOVIE_FEEDS,
      guardian: MOVIE_GUARDIAN
    });
    if (!results.length) {
      return res.status(502).json({ message: "No movie news sources responded", results: [] });
    }
    res.json({ results });
  } catch (err) {
    console.error("NEWS MOVIE ERROR:", err.message);
    res.status(500).json({ message: "Failed to load movie news", results: [] });
  }
});

router.get("/tv", async (req, res) => {
  try {
    const results = await aggregate({
      rssFeeds: TV_FEEDS,
      guardian: TV_GUARDIAN
    });
    if (!results.length) {
      return res.status(502).json({ message: "No TV news sources responded", results: [] });
    }
    res.json({ results });
  } catch (err) {
    console.error("NEWS TV ERROR:", err.message);
    res.status(500).json({ message: "Failed to load TV news", results: [] });
  }
});

export default router;
