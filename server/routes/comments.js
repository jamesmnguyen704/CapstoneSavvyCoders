import express from "express";
import Comment from "../models/comments.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const comments = await Comment.find({ movieId: req.params.movieId });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch comments" });
  }
});

// POST a new comment
router.post("/", async (req, res) => {
  try {
    const newComment = new Comment(req.body);
    const saved = await newComment.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Invalid comment data" });
  }
});

// DELETE a comment by ID
router.delete("/:id", async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(400).json({ error: "Could not delete comment" });
  }
});

export default router;
