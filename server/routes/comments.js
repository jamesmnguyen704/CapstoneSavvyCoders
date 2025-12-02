// this file provides API endpoints for getting, creating, and deleting comments

import express from "express"; // imported to create route
import Comment from "../models/comments.js"; // imported from mongoose

const router = express.Router(); // creates express router for comments
// find all my comments relating to the movieId from url to return as JSON, if error than 500
router.get("/:movieId", async (req, res) => {
  try {
    const comments = await Comment.find({ movieId: req.params.movieId });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch comments" });
  }
});

// creates comments using REQUEST, saves comment to DATABASE, returns save comment as JSON, if error than 400

router.post("/", async (req, res) => {
  try {
    const newComment = new Comment(req.body);
    const saved = await newComment.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Invalid comment data" });
  }
});

// DELETE comment from database, return success message as JSON, if error than 400
router.delete("/:id", async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(400).json({ error: "Could not delete comment" });
  }
});

export default router;
