// this file provides API endpoints for getting, creating, and deleting comments

import express from "express"; // imported to create route
import axios from "axios";
import Comment from "../models/comments.js"; // imported from mongoose
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router(); // creates express router for comments

// Busiest threads across the whole site — registered before "/:movieId" so
// Express doesn't swallow this path as a literal movieId.
router.get("/meta/top", async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit);
    // Default to real users only — without this, "busiest conversations"
    // was 100% synthetic (109 character accounts vs. 1 real user) while
    // presenting itself as organic community activity. Pass
    // ?audience=character for the bot threads instead, surfaced as its own
    // explicit "Character Chaos"-style feature, never blended with this one.
    const audience = req.query.audience === "character" ? "character" : "human";
    const top = await Comment.aggregate([
      { $match: { isCharacter: audience === "character" } },
      {
        $group: {
          _id: "$movieId",
          count: { $sum: 1 },
          voices: { $addToSet: "$username" }
        }
      },
      { $addFields: { voiceCount: { $size: "$voices" } } },
      // Ranked by distinct voices first, then raw count — a thread with five
      // different characters talking feels "busier" than one person posting
      // five times in a row, even if the totals match.
      { $sort: { voiceCount: -1, count: -1 } },
      ...(requestedLimit > 0 ? [{ $limit: requestedLimit }] : [])
    ]);

    const key = process.env.TMDB_API_KEY;
    const withTitles = await Promise.all(
      top.map(async t => {
        try {
          const { data } = await axios.get(`https://api.themoviedb.org/3/movie/${t._id}`, {
            params: { api_key: key }
          });
          return {
            movieId: t._id,
            title: data.title,
            posterPath: data.poster_path,
            commentCount: t.count,
            voiceCount: t.voiceCount
          };
        } catch {
          return { movieId: t._id, title: null, posterPath: null, commentCount: t.count, voiceCount: t.voiceCount };
        }
      })
    );

    res.json(withTitles.filter(m => m.title));
  } catch (err) {
    console.error("TOP THREADS ERROR:", err.message);
    res.status(500).json({ error: "Could not load top threads" });
  }
});

// Bulk comment counts for a card grid — { movieIds: [...] } in, { [movieId]: count } out.
// POST (not GET) because a full grid can easily send 20-50 ids, past what's
// comfortable in a query string. Registered before "/:movieId" for the same
// reason /meta/top is — Express would otherwise treat "meta" as a movieId.
router.post("/meta/counts", async (req, res) => {
  try {
    const { movieIds } = req.body;
    if (!Array.isArray(movieIds) || movieIds.length === 0) {
      return res.json({});
    }
    const numericIds = movieIds.map(Number).filter(id => !Number.isNaN(id));
    const counts = await Comment.aggregate([
      { $match: { movieId: { $in: numericIds } } },
      { $group: { _id: "$movieId", count: { $sum: 1 } } }
    ]);
    const result = {};
    counts.forEach(c => { result[c._id] = c.count; });
    res.json(result);
  } catch (err) {
    console.error("COMMENT COUNTS ERROR:", err.message);
    res.status(500).json({ error: "Could not load comment counts" });
  }
});

// find all my comments relating to the movieId from url to return as JSON, if error than 500
// Reading comments stays public — only posting/deleting requires login.
router.get("/:movieId", async (req, res) => {
  try {
    const comments = await Comment.find({ movieId: req.params.movieId }).lean();
    // Counts computed here so the frontend doesn't need to know the schema;
    // likedBy/dislikedBy (raw ids) stay on the payload too, so the client can
    // work out whether *this* visitor already voted without a second call.
    const withCounts = comments.map(c => ({
      ...c,
      likeCount: (c.likedBy || []).length,
      dislikeCount: (c.dislikedBy || []).length
    }));
    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch comments" });
  }
});

// creates comments using REQUEST, saves comment to DATABASE, returns save comment as JSON, if error than 400
// username/userId come from the verified token, never from the request body —
// otherwise anyone could post a comment under someone else's name.
router.post("/", requireAuth, async (req, res) => {
  try {
    const { movieId, text } = req.body;
    const newComment = new Comment({
      movieId,
      text,
      userId: req.user.id,
      username: req.user.username,
      avatar: req.user.avatar || null,
      isCharacter: req.user.isCharacter || false
    });
    const saved = await newComment.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Invalid comment data" });
  }
});

// Thumbs up/down — one vote per user per comment. Toggling the same vote
// again removes it; voting the opposite way switches it. Anyone can vote on
// anyone's comment (including their own), same as the rest of the web.
router.post("/:id/vote", requireAuth, async (req, res) => {
  try {
    const { type } = req.body;
    if (type !== "like" && type !== "dislike") {
      return res.status(400).json({ error: "type must be 'like' or 'dislike'" });
    }
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const uid = req.user.id;
    const alreadyLiked = comment.likedBy.some(id => id.toString() === uid);
    const alreadyDisliked = comment.dislikedBy.some(id => id.toString() === uid);

    comment.likedBy = comment.likedBy.filter(id => id.toString() !== uid);
    comment.dislikedBy = comment.dislikedBy.filter(id => id.toString() !== uid);

    if (type === "like" && !alreadyLiked) comment.likedBy.push(uid);
    if (type === "dislike" && !alreadyDisliked) comment.dislikedBy.push(uid);

    await comment.save();
    res.json({
      likeCount: comment.likedBy.length,
      dislikeCount: comment.dislikedBy.length,
      userVote: comment.likedBy.some(id => id.toString() === uid)
        ? "like"
        : comment.dislikedBy.some(id => id.toString() === uid)
          ? "dislike"
          : null
    });
  } catch (err) {
    console.error("VOTE ERROR:", err.message);
    res.status(400).json({ error: "Could not record vote" });
  }
});

// DELETE comment from database, return success message as JSON, if error than 400
// Only the comment's own author may delete it.
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "You can only delete your own comments" });
    }
    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(400).json({ error: "Could not delete comment" });
  }
});

export default router;
