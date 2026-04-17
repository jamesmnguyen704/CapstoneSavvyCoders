// File: server/routes/news.js
// Purpose: Proxy The Guardian's Film section so the frontend doesn't need an API key.
// Notes:
//   - The Guardian's developer `test` key works out of the box for low-volume use.
//     Set GUARDIAN_API_KEY in .env for a real key (increases rate limits).
//   - Response is normalized to { results: [{ id, title, url, image, excerpt, source, publishedAt }] }
//     so the frontend doesn't depend on Guardian's payload shape.

import express from "express";
import axios from "axios";

const router = express.Router();

const GUARDIAN_BASE = "https://content.guardianapis.com/search";

router.get("/", async (req, res) => {
  const apiKey = process.env.GUARDIAN_API_KEY || "test";
  const pageSize = Math.min(Number(req.query.pageSize) || 20, 50);

  try {
    const response = await axios.get(GUARDIAN_BASE, {
      params: {
        section: "film",
        "show-fields": "thumbnail,trailText,byline",
        "order-by": "newest",
        "page-size": pageSize,
        "api-key": apiKey
      },
      timeout: 8000
    });

    const raw = response.data?.response?.results || [];
    const results = raw.map(item => ({
      id: item.id,
      title: item.webTitle,
      url: item.webUrl,
      image: item.fields?.thumbnail || null,
      excerpt: stripHtml(item.fields?.trailText || ""),
      byline: item.fields?.byline || null,
      source: "The Guardian",
      publishedAt: item.webPublicationDate
    }));

    res.json({ results });
  } catch (err) {
    console.error("NEWS FETCH ERROR:", err.response?.data || err.message);
    res.status(502).json({ message: "Failed to load movie news", results: [] });
  }
});

function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, "").trim();
}

export default router;
