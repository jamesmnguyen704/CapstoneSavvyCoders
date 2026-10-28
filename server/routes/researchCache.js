// Read/write cache of facts a bot-comment research pass has already verified
// per movie — so a new research agent checks here before re-hitting
// TMDB/WebSearch for the same thing. Internal tooling, not user-facing:
// gated in app.js by requireInternalKey (a shared secret, since there's no
// human login behind a research pass), and never touches Comment/User data
// directly. See docs/persona-ensemble-framework.md's "Known constraints"
// section.

import express from "express";
import MovieResearchCache from "../models/movieResearchCache.js";

const router = express.Router();

// List every movie that has a cache entry, with counts — a quick overview
// of what's already been researched. Registered before "/:movieId" for the
// same Express-routing reason as comments.js's "/meta/top".
router.get("/meta/list", async (req, res) => {
  try {
    const all = await MovieResearchCache.find()
      .select("movieId title fullCastChecked verifiedFacts castRosterMap lastUpdated")
      .lean();
    res.json(
      all.map(m => ({
        movieId: m.movieId,
        title: m.title,
        fullCastChecked: m.fullCastChecked,
        factCount: m.verifiedFacts?.length || 0,
        castMapCount: m.castRosterMap?.length || 0,
        lastUpdated: m.lastUpdated
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Could not list research cache" });
  }
});

// Get whatever's cached for one movie — null-safe shape so a research agent
// can always check "do I already have this" without a 404 branch.
router.get("/:movieId", async (req, res) => {
  try {
    const entry = await MovieResearchCache.findOne({ movieId: Number(req.params.movieId) }).lean();
    res.json(
      entry || {
        movieId: Number(req.params.movieId),
        title: null,
        verifiedFacts: [],
        castRosterMap: [],
        fullCastChecked: false
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Could not fetch research cache" });
  }
});

// Upsert — merges new facts/cast-map entries into whatever's already cached
// rather than overwriting, so two agents researching the same movie don't
// clobber each other's findings.
router.post("/:movieId", async (req, res) => {
  try {
    const movieId = Number(req.params.movieId);
    const { title, verifiedFacts, castRosterMap, fullCastChecked } = req.body;

    let entry = await MovieResearchCache.findOne({ movieId });
    if (!entry) entry = new MovieResearchCache({ movieId });

    if (title) entry.title = title;
    if (fullCastChecked) entry.fullCastChecked = true;

    if (Array.isArray(verifiedFacts)) {
      const existingFacts = new Set(entry.verifiedFacts.map(f => f.fact));
      verifiedFacts.forEach(f => {
        if (f?.fact && !existingFacts.has(f.fact)) {
          entry.verifiedFacts.push({ fact: f.fact, source: f.source || null });
          existingFacts.add(f.fact);
        }
      });
    }

    if (Array.isArray(castRosterMap)) {
      const existingUsernames = new Set(entry.castRosterMap.map(c => c.username));
      castRosterMap.forEach(c => {
        if (c?.username && c?.actorName && !existingUsernames.has(c.username)) {
          entry.castRosterMap.push({
            username: c.username,
            actorName: c.actorName,
            tmdbPersonId: c.tmdbPersonId || null,
            character: c.character || null
          });
          existingUsernames.add(c.username);
        }
      });
    }

    await entry.save();
    res.status(200).json(entry);
  } catch (err) {
    console.error("RESEARCH CACHE WRITE ERROR:", err.message);
    res.status(500).json({ error: "Could not update research cache" });
  }
});

export default router;
