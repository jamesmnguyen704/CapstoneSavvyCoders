import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  movieId: { type: Number, required: true }, // how TMDB has id
  username: { type: String, default: "Anonymous" },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Comment", commentSchema);
