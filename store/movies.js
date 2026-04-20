// File: store/movies.js
// Purpose: State store for the merged Movies view (hero slider + filters + grid).
export default {
  header: "Movies",
  view: "Movies",
  genres: [],           // full TMDB genre list (lazy-loaded)
  selectedGenres: [],   // active genre ids
  year: "",             // "" means any
  minRating: 0,
  sort: "popularity.desc",
  results: [],          // hero uses results[0..5]; grid uses the full list
  total_results: 0,
  loading: false
};
