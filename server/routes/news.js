// File: server/routes/news.js
// Purpose: Aggregates movie news from multiple sources (RSS + The Guardian)
//          so the feed stays fresh even if one source goes dark.
// Sources:
//   - JoBlo           (movie news, heavily blockbuster/geeky)
//   - MovieWeb        (news + features)
//   - IGN Movies      (blockbusters + franchise)
//   - Collider        (mainstream movie coverage)
//   - /Film           (editorial + franchise deep dives)
//   - The Guardian    (filtered to blockbuster/geeky keywords)
// Notes:
//   - Returned shape: { results: [{ id, title, url, image, excerpt,
//     source, publishedAt, tags }] }, sorted by date desc.
//   - All feeds run in parallel with individual timeouts so one slow
//     source can't drag the whole response down.

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

const FEEDS = [
  { source: "JoBlo",    url: "https://www.joblo.com/feed/" },
  { source: "MovieWeb", url: "https://movieweb.com/feed/" },
  { source: "IGN",      url: "https://feeds.feedburner.com/ign/movies-all" },
  { source: "Collider", url: "https://collider.com/feed/" },
  { source: "/Film",    url: "https://www.slashfilm.com/feed/" }
];

const GUARDIAN_BASE = "https://content.guardianapis.com/search";
const GUARDIAN_QUERY = [
  "marvel", "MCU", "avengers",
  "DC", "batman", "superman", "spider-man",
  '"star wars"', '"box office"', "blockbuster", "franchise", "sequel",
  '"comic-con"', '"comic con"', "cinemacon", '"cinema con"',
  "superhero", "disney", "pixar", "james bond",
  "james cameron", "dune", "avatar"
].join(" OR ");

function stripHtml(s) {
  return String(s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
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

async function fetchGuardian() {
  const apiKey = process.env.GUARDIAN_API_KEY || "test";
  try {
    const response = await axios.get(GUARDIAN_BASE, {
      params: {
        section: "film",
        q: GUARDIAN_QUERY,
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
    console.warn("NEWS Guardian failed:", err.message);
    return [];
  }
}

router.get("/", async (req, res) => {
  try {
    const [guardian, ...rssResults] = await Promise.all([
      fetchGuardian(),
      ...FEEDS.map(fetchRssSource)
    ]);

    const merged = [...guardian, ...rssResults.flat()]
      .filter(a => a && a.title && a.url)
      // Dedupe by URL (different sources sometimes syndicate the same item)
      .reduce((map, a) => {
        if (!map.has(a.url)) map.set(a.url, a);
        return map;
      }, new Map());

    const results = Array.from(merged.values())
      .sort((a, b) => {
        const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
        const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
        return tb - ta;
      })
      .slice(0, 40);

    if (!results.length) {
      return res.status(502).json({
        message: "No news sources responded",
        results: []
      });
    }

    res.json({ results });
  } catch (err) {
    console.error("NEWS AGGREGATE ERROR:", err.message);
    res.status(500).json({ message: "Failed to load news", results: [] });
  }
});

export default router;
