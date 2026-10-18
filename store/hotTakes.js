// File: store/hotTakes.js
// Purpose: State for the "Hot Takes" page — the busiest comment threads site-wide.
export default {
  view: "HotTakes",
  threads: [],
  loading: true,
  // "human" (real visitors only) is the default and the only one that should
  // ever be called "Hot Takes" — "character" is the bot-thread leaderboard,
  // a clearly separate surface so one is never mistaken for the other.
  audience: "human"
};
