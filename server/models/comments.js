import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  movieId: { type: Number, required: true }, // how TMDB has id
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  avatar: { type: String, default: null },
  isCharacter: { type: Boolean, default: false },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // One vote per user per comment — storing who voted (not just a count) so
  // a reload or a second click can toggle/switch instead of double-counting.
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

// Guards against the same user posting the exact same text on the same movie
// twice (e.g. a bot-posting script rerun after a rate-limit restart) without
// blocking a real user who legitimately comments on a movie more than once.
commentSchema.index({ userId: 1, movieId: 1, text: 1 }, { unique: true });

// Every card-grid render hits POST /comments/meta/counts with a batch of
// movieIds — a plain index keeps that $match cheap as comment volume grows.
commentSchema.index({ movieId: 1 });

export default mongoose.model("Comment", commentSchema);
