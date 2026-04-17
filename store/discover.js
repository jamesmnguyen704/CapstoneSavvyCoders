// File: store/discover.js
// Purpose: State store for the Discover view + its filter inputs.
export default {
  header: "Discover",
  view: "Discover",
  genres: [],              // full TMDB genre list
  selectedGenres: [],      // currently-selected genre ids
  year: "",                // "" means any
  minRating: 0,
  sort: "popularity.desc",
  results: [],
  total_results: 0,
  loading: false
};
