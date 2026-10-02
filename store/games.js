// File: store/games.js
// Purpose: State store for the Games view (personal library + platform filter).
// Notes: The library itself is static data in views/_gamesData.js — only the
//        filter/search UI state lives here.
export default {
  header: "Games",
  view: "Games",
  platform: "all", // "all" | switch | psn | steam | xbox | discord
  search: "",
  showAllGames: false, // library renders a capped preview until this flips
  news: [],        // gaming wire, shown in the right rail
  newsFetchedAt: 0, // epoch ms of the last successful wire fetch; 0 = never
  newsLoading: false
};
