// File: server/models/userMedia.js
// Purpose: One signed-in user's personal relationship to one movie —
//          their own 1-10 rating and watched/watchlist status. This is
//          Cinemetrics' own community data, separate from TMDB's score,
//          not a mirror of it.
import mongoose from "mongoose";

const userMediaSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  movieId: { type: Number, required: true },
  rating: { type: Number, min: 1, max: 10, default: null },
  watched: { type: Boolean, default: false },
  watchlisted: { type: Boolean, default: false },
  // Denormalized from the account at write time (same pattern as
  // Comment.isCharacter) so the aggregate "Cinemetrics users rated this"
  // query can exclude character-bot accounts without a $lookup join. A
  // real-user feature's credibility depends on it never being contaminated
  // by synthetic activity, the same integrity problem Hot Takes has.
  isCharacter: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
});

// One record per user per movie — upserts replace it rather than growing a
// history, since this tracks current state, not an event log.
userMediaSchema.index({ userId: 1, movieId: 1 }, { unique: true });

// Backs the aggregate "Cinemetrics users rated this X" shown on a movie page.
userMediaSchema.index({ movieId: 1, rating: 1 });

export default mongoose.model("UserMedia", userMediaSchema);
