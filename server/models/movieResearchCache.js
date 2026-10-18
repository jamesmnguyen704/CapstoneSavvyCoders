import mongoose from "mongoose";

// Persistent cache of facts a bot-comment research pass has already verified
// for a given movie, so the next research agent checks here FIRST instead of
// re-hitting TMDB/WebSearch for the same box-office number, cast-to-roster
// mapping, or full-cast pull it (or a previous agent) already did minutes
// or days earlier. See docs/persona-ensemble-framework.md's "Known
// constraints" section for why this exists.
const movieResearchCacheSchema = new mongoose.Schema({
  movieId: { type: Number, required: true, unique: true }, // TMDB id
  title: { type: String, default: null }, // for human readability only

  // Real, already-verified facts (reception, box office, plot/continuity
  // beats) so a new pass doesn't re-run the same WebSearch/TMDB calls.
  verifiedFacts: [
    {
      fact: { type: String, required: true },
      source: { type: String, default: null }, // URL or "TMDB credits" etc.
      verifiedAt: { type: Date, default: Date.now }
    }
  ],

  // Which of the current character-account roster are confirmed in this
  // movie's real cast, so rule #9 (full-cast-pull, cast-completeness) only
  // has to be done once per movie, not once per agent.
  castRosterMap: [
    {
      username: { type: String, required: true }, // our roster account
      actorName: { type: String, required: true },
      tmdbPersonId: { type: Number, default: null },
      character: { type: String, default: null }
    }
  ],

  // True once an agent has done the full TMDB /credits pull for this movie
  // (not just checked a handful of likely names) — lets a future agent skip
  // straight to castRosterMap instead of re-pulling the whole cast list.
  fullCastChecked: { type: Boolean, default: false },

  lastUpdated: { type: Date, default: Date.now }
});

movieResearchCacheSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

export default mongoose.model("MovieResearchCache", movieResearchCacheSchema);
