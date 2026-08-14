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
import { cacheJson } from "../utils/cache.js";

const router = express.Router();

// RSS aggregation is slow and the wires only move every few minutes.
router.use(cacheJson(5 * 60 * 1000));

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

// How many stories the feed returns, and how many any one outlet may supply.
const MAX_RESULTS = 40;
const MAX_PER_SOURCE = 6;

// Movie-focused configuration.
// Every URL here was verified live before being added — parses, returns items,
// and carries usable images. Feeds that 404'd (Empire, Vulture), paywalled
// (EW, 402), timed out (AV Club), or had gone stale (IndieWire's newest item
// was over two years old) are listed in REJECTED_FEEDS below so nobody
// re-adds them. Valnet properties (Collider / ScreenRant / CBR) are still
// excluded on purpose: they parse fine but publish near-identical headlines
// across all three, so they'd eat slots the dedupe pass can't fully reclaim.
const MOVIE_FEEDS = [
  { source: "IGN",          url: "https://feeds.feedburner.com/ign/movies-all" },
  { source: "/Film",        url: "https://www.slashfilm.com/feed/" },
  { source: "Deadline",     url: "https://deadline.com/v/film/feed/" },
  { source: "Variety",      url: "https://variety.com/v/film/feed/" },
  { source: "FirstShowing", url: "https://www.firstshowing.net/feed/" },
  { source: "Polygon",      url: "https://www.polygon.com/rss/index.xml" },
  { source: "BBC",          url: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml" },
  { source: "JoBlo",        url: "https://www.joblo.com/feed/" },
  { source: "MovieWeb",     url: "https://movieweb.com/feed/movie-news/" },
  { source: "ComingSoon",   url: "https://www.comingsoon.net/movies/news/feed" },
  { source: "Rotten Tomatoes", url: "https://editorial.rottentomatoes.com/feed/" },
  // THR's feed carries no image data at all — no enclosure, no media:* tags,
  // and a ~180-char description with no inline <img>. Its cards fall back to
  // the placeholder tile. Kept anyway because the reporting is worth it.
  { source: "The Hollywood Reporter", url: "https://www.hollywoodreporter.com/c/movies/feed/" }
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
  { source: "IGN",        url: "https://feeds.feedburner.com/ign/tv-all" },
  { source: "Deadline",   url: "https://deadline.com/v/tv/feed/" },
  { source: "Variety",    url: "https://variety.com/v/tv/feed/" },
  { source: "TVLine",     url: "https://tvline.com/feed/" },
  { source: "Decider",    url: "https://decider.com/feed/" },
  { source: "MovieWeb",   url: "https://movieweb.com/feed/tv-news/" },
  { source: "ComingSoon", url: "https://www.comingsoon.net/tv/news/feed" },
  { source: "Rotten Tomatoes", url: "https://editorial.rottentomatoes.com/feed/" },
  { source: "The Hollywood Reporter", url: "https://www.hollywoodreporter.com/c/tv/feed/" }
];

// Streaming-focused configuration — what just landed on which service,
// release schedules, and platform business news.
const STREAMING_FEEDS = [
  { source: "ComingSoon",      url: "https://www.comingsoon.net/streaming/news/feed" },
  { source: "Decider",         url: "https://decider.com/feed/" },
  { source: "What's on Netflix", url: "https://www.whats-on-netflix.com/feed/" },
  { source: "TVLine",          url: "https://tvline.com/feed/" },
  { source: "Variety",         url: "https://variety.com/v/digital/feed/" }
];
const STREAMING_GUARDIAN = {
  section: "tv-and-radio",
  query: [
    "netflix", '"hbo max"', '"apple tv"', "hulu", '"amazon prime"',
    '"prime video"', '"disney plus"', '"disney+"', "peacock", "paramount",
    "streaming", '"box set"', "binge"
  ].join(" OR ")
};

// Gaming — platform-balanced (Nintendo Life / Push Square / Pure Xbox cover
// Switch / PlayStation / Xbox respectively) plus the general trades.
const GAMING_FEEDS = [
  { source: "IGN",           url: "https://feeds.feedburner.com/ign/games-all" },
  { source: "GameSpot",      url: "https://www.gamespot.com/feeds/news/" },
  { source: "Eurogamer",     url: "https://www.eurogamer.net/feed" },
  { source: "PC Gamer",      url: "https://www.pcgamer.com/rss/" },
  { source: "Kotaku",        url: "https://kotaku.com/rss" },
  { source: "Nintendo Life", url: "https://www.nintendolife.com/feeds/latest" },
  { source: "Push Square",   url: "https://www.pushsquare.com/feeds/latest" },
  { source: "Pure Xbox",     url: "https://www.purexbox.com/feeds/latest" },
  { source: "ComingSoon",    url: "https://www.comingsoon.net/games/news/feed" }
];
const GAMING_GUARDIAN = {
  section: "games",
  query: [
    "playstation", "xbox", "nintendo", "switch", "steam", '"game pass"',
    '"grand theft auto"', "zelda", "mario", "pokemon", '"call of duty"',
    "esports", '"video game"', "indie"
  ].join(" OR ")
};

// Checked and deliberately not used — keep this list so a dead feed doesn't
// get re-added later. (Same reason /Film's TV URL was dropped previously.)
export const REJECTED_FEEDS = {
  "https://www.empireonline.com/movies/news/feed/": "404",
  "https://www.vulture.com/rss/index.xml": "404",
  "https://ew.com/feed/": "402 paywall",
  "https://www.avclub.com/rss": "times out (>12s)",
  "https://www.indiewire.com/c/film/feed/": "stale — newest item 2+ years old",
  "https://www.screendaily.com/1.rss": "parses but returns 0 items",
  "https://collider.com/feed/": "Valnet — duplicates ScreenRant/CBR",
  "https://screenrant.com/feed/": "Valnet — duplicates Collider/CBR",
  "https://www.cbr.com/feed/": "Valnet — duplicates Collider/ScreenRant"
};
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
  // Also cap each outlet, because the list is sorted newest-first and a
  // high-volume wire (JoBlo and Deadline both publish several times an hour)
  // would otherwise crowd out every slower, better source.
  const seenUrls = new Set();
  const seenTitles = new Set();
  const perSource = new Map();
  const results = [];
  for (const item of all) {
    if (seenUrls.has(item.url)) continue;
    const key = titleKey(item.title);
    if (key && seenTitles.has(key)) continue;

    const used = perSource.get(item.source) || 0;
    if (used >= MAX_PER_SOURCE) continue;

    seenUrls.add(item.url);
    if (key) seenTitles.add(key);
    perSource.set(item.source, used + 1);
    results.push(item);
    if (results.length >= MAX_RESULTS) break;
  }
  return results;
}

// One entry per tab. Adding a tab is adding a row here plus a button in
// views/news.js — the handler below is shared.
// TV and streaming are the same beat in practice — the /tv page shows them as
// one wire, so dedupe across both source lists rather than running two feeds
// that repeat each other.
const TV_STREAMING_FEEDS = [
  ...TV_FEEDS,
  ...STREAMING_FEEDS.filter(f => !TV_FEEDS.some(t => t.url === f.url))
];

const TABS = {
  movies:      { path: "/",             label: "movie",     rssFeeds: MOVIE_FEEDS,         guardian: MOVIE_GUARDIAN },
  tv:          { path: "/tv",           label: "TV",        rssFeeds: TV_FEEDS,            guardian: TV_GUARDIAN },
  streaming:   { path: "/streaming",    label: "streaming", rssFeeds: STREAMING_FEEDS,     guardian: STREAMING_GUARDIAN },
  gaming:      { path: "/gaming",       label: "gaming",    rssFeeds: GAMING_FEEDS,        guardian: GAMING_GUARDIAN },
  tvStreaming: { path: "/tv-streaming", label: "TV",        rssFeeds: TV_STREAMING_FEEDS,  guardian: TV_GUARDIAN }
};

for (const [key, tab] of Object.entries(TABS)) {
  router.get(tab.path, async (req, res) => {
    try {
      const results = await aggregate({ rssFeeds: tab.rssFeeds, guardian: tab.guardian });
      if (!results.length) {
        return res
          .status(502)
          .json({ message: `No ${tab.label} news sources responded`, results: [] });
      }
      res.json({ results });
    } catch (err) {
      console.error(`NEWS ${key.toUpperCase()} ERROR:`, err.message);
      res.status(500).json({ message: `Failed to load ${tab.label} news`, results: [] });
    }
  });
}

export default router;
