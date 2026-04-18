// File: store/news.js
// Purpose: State store for the News view (movies + TV tabs).
export default {
  header: "News",
  view: "News",
  activeTab: "movies", // "movies" | "tv"
  articles: [],        // articles for the active tab
  cache: {             // per-tab article cache so switching is instant
    movies: null,
    tv: null
  }
};
