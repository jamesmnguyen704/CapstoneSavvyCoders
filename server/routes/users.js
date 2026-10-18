// Admin-only: lets the site owner see every signed-up account. Not a general
// user-directory feature — gated to one specific username, checked server-side
// so it isn't just a client-side hide.
import express from "express";
import User from "../models/user.js";
import Comment from "../models/comments.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();
const ADMIN_USERNAME = "aznjames704";

router.get("/", requireAuth, async (req, res) => {
  if (req.user.username !== ADMIN_USERNAME) {
    return res.status(403).json({ message: "Not authorized" });
  }
  try {
    const users = await User.find({})
      .select("username avatar isCharacter createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // How many distinct movies each account has actually commented on — the
    // only "movies they've been in" figure this app can honestly compute.
    const counts = await Comment.aggregate([
      { $group: { _id: "$username", movies: { $addToSet: "$movieId" } } }
    ]);
    const countByUsername = Object.fromEntries(counts.map(c => [c._id, c.movies.length]));

    res.json(users.map(u => ({ ...u, movieCount: countByUsername[u.username] || 0 })));
  } catch (err) {
    console.error("LIST USERS ERROR:", err.message);
    res.status(500).json({ message: "Could not load users" });
  }
});

export default router;
