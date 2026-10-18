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

export default mongoose.model("Comment", commentSchema);
