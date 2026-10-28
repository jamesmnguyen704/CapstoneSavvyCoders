// Records the moment Cinemetrics' own discovery pass first saw a given
// article URL. Set once via $setOnInsert and never overwritten, so it
// survives feed refreshes (the in-memory response cache in utils/cache.js
// expires every 5 minutes) and full server restarts (that cache doesn't).
// Deliberately NOT derived from the article's own publishedAt — that's when
// the outlet says it went live, not when we found it, and defaulting one to
// the other would fabricate a detection history we don't actually have.
import mongoose from "mongoose";

const newsFirstSeenSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  firstSeenAt: { type: Date, default: Date.now }
});

export default mongoose.model("NewsFirstSeen", newsFirstSeenSchema);
