// File: server/routes/userMedia.js
// Purpose: A signed-in user's own rating and watched/watchlist status per
//          movie — Cinemetrics' native equivalent of Letterboxd/Trakt's
//          core loop, kept separate from TMDB's own score.
import express from "express";
import UserMedia from "../models/userMedia.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireNumericId } from "../middleware/requireNumericId.js";

const router = express.Router();

// Minimum real ratings before showing a community average — one or two
// ratings aren't a meaningful crowd number, and showing one anyway invites
// exactly the false-social-proof problem Hot Takes has with bot volume.
const MIN_RATINGS_FOR_AVERAGE = 3;

// Aggregate community rating for a movie — registered before "/:movieId" so
// Express doesn't swallow this path as a literal movieId (same pattern as
// comments' /meta/top and /meta/counts). Character-bot accounts are
// excluded by construction (isCharacter: { $ne: true }) — this number must
// only ever reflect real visitors, never synthetic activity.
router.get("/meta/rating/:movieId", requireNumericId("movieId"), async (req, res) => {
  try {
    const movieId = Number(req.params.movieId);
    const [agg] = await UserMedia.aggregate([
      { $match: { movieId, rating: { $ne: null }, isCharacter: { $ne: true } } },
      { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);
    const count = agg ? agg.count : 0;
    res.json({
      average: count >= MIN_RATINGS_FOR_AVERAGE ? Math.round(agg.average * 10) / 10 : null,
      count
    });
  } catch (err) {
    console.error("USER MEDIA RATING AGGREGATE ERROR:", err.message);
    res.status(500).json({ message: "Could not load Cinemetrics rating" });
  }
});

// This signed-in user's own state for one movie — absent fields default to
// "no opinion yet" rather than erroring, since most movies a user hasn't
// touched yet are the common case, not an edge case.
router.get("/:movieId", requireAuth, requireNumericId("movieId"), async (req, res) => {
  try {
    const movieId = Number(req.params.movieId);
    const record = await UserMedia.findOne({ userId: req.user.id, movieId }).lean();
    res.json({
      rating: record?.rating ?? null,
      watched: record?.watched ?? false,
      watchlisted: record?.watchlisted ?? false
    });
  } catch (err) {
    console.error("USER MEDIA GET ERROR:", err.message);
    res.status(500).json({ message: "Could not load your rating" });
  }
});

// Partial update — only the fields the client actually sends get touched, so
// rating a movie doesn't accidentally clear its watched flag and vice versa.
router.post("/:movieId", requireAuth, requireNumericId("movieId"), async (req, res) => {
  try {
    const movieId = Number(req.params.movieId);
    const { rating, watched, watchlisted } = req.body;

    const update = { updatedAt: new Date(), isCharacter: Boolean(req.user.isCharacter) };
    if (rating !== undefined) {
      if (rating !== null && (typeof rating !== "number" || rating < 1 || rating > 10)) {
        return res.status(400).json({ message: "Rating must be 1-10" });
      }
      update.rating = rating;
    }
    if (watched !== undefined) update.watched = Boolean(watched);
    if (watchlisted !== undefined) update.watchlisted = Boolean(watchlisted);

    const record = await UserMedia.findOneAndUpdate(
      { userId: req.user.id, movieId },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({
      rating: record.rating ?? null,
      watched: record.watched ?? false,
      watchlisted: record.watchlisted ?? false
    });
  } catch (err) {
    console.error("USER MEDIA SAVE ERROR:", err.message);
    res.status(500).json({ message: "Could not save your rating" });
  }
});

export default router;
