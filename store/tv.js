// File: store/tv.js
// Purpose: State store for the TV view — shows on the left, TV + streaming
//          news in the right rail (same 65/35 shape as the Games page).
export default {
  header: "TV & Streaming",
  view: "Tv",
  provider: "all",   // "all" or a TMDB watch-provider id
  providers: [],
  popular: [],
  topRated: [],
  onTheAir: [],
  results: [],       // provider-filtered shows, when a service is picked
  totalResults: 0,
  loading: false,
  news: [],
  newsLoading: false
};
