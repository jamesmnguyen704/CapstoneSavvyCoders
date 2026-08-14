// File: store/games.js
// Purpose: State store for the Games view (personal library + platform filter).
// Notes: The library itself is static data in views/_gamesData.js — only the
//        filter/search UI state lives here.
export default {
  header: "Games",
  view: "Games",
  platform: "all", // "all" | switch | psn | steam | xbox | discord
  search: "",
  news: [],        // gaming wire, shown in the right rail
  newsLoading: false
};
