// this file provides API endpoints for getting, creating, and deleting comments

import express from "express"; // imported to create route
import Comment from "../models/comments.js"; // imported from mongoose
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router(); // creates express router for comments
// find all my comments relating to the movieId from url to return as JSON, if error than 500
// Reading comments stays public — only posting/deleting requires login.
router.get("/:movieId", async (req, res) => {
  try {
    const comments = await Comment.find({ movieId: req.params.movieId });
    res.json(comments);
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
      username: req.user.username
    });
    const saved = await newComment.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Invalid comment data" });
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
