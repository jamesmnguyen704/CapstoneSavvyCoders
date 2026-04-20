// File: services/api.js
// Purpose: Thin client wrappers around backend endpoints used by the frontend.
// Notes: Centralizes API base URL and error handling so views can call simple helpers.
import axios from "axios";

// Determine API base URL from build-time env `VITE_BACKEND_URL` (set on Netlify)
// Parcel inlines `process.env.*` during build, so use that to avoid parser issues.
// Fallback to localhost for local development.
const API_BASE = process.env.VITE_BACKEND_URL || "http://localhost:3000";

export async function fetchHomeData() {
  try {
    const [trending, nowPlaying, popular] = await Promise.all([
      axios.get(`${API_BASE}/movies/trending`),
      axios.get(`${API_BASE}/movies/now_playing`),
      axios.get(`${API_BASE}/movies/popular`)
    ]);

    return {
      trending: trending.data.results,
      nowPlaying: nowPlaying.data.results,
      popular: popular.data.results
    };
  } catch (err) {
    console.error("HOME DATA ERR:", err);
    return { trending: [], nowPlaying: [], popular: [] };
  }
}

// popular
export async function fetchPopular() {
  try {
    const response = await axios.get(`${API_BASE}/movies/popular`);
    return response.data.results;
  } catch (err) {
    console.error("POPULAR MOVIES ERROR:", err);
    return [];
  }
}

// upcoming
export async function fetchUpcoming() {
  try {
    const response = await axios.get(`${API_BASE}/movies/now_playing`);
    return response.data.results;
  } catch (err) {
    console.error("UPCOMING MOVIES ERROR:", err);
    return [];
  }
}

// now playing
export async function fetchNowPlaying() {
  try {
    const response = await axios.get(`${API_BASE}/movies/now_playing`);
    return response.data.results;
  } catch (err) {
    console.error("NOW PLAYING ERROR:", err);
    return [];
  }
}

// box office attempt. still not working
export async function fetchBoxOffice() {
  try {
    const res = await axios.get(`${API_BASE}/boxoffice`);
    return res.data.results;
  } catch (err) {
    console.error("BOX OFFICE ERROR:", err);
    return [];
  }
}

// trailer videos
export async function fetchMovieVideos(movieId) {
  try {
    const response = await axios.get(`${API_BASE}/movies/${movieId}/videos`);
    return response.data.results;
  } catch (err) {
    console.error("VIDEO API ERROR:", err);
    return [];
  }
}

// Top-rated movies on TMDB (complements Trending / Now Playing / Popular).
export async function fetchTopRated() {
  try {
    const response = await axios.get(`${API_BASE}/movies/top_rated`);
    return response.data.results || [];
  } catch (err) {
    console.error("TOP RATED ERROR:", err);
    return [];
  }
}

// Full movie detail — runtime, genres, cast, similar, where to watch.
export async function fetchMovieDetails(id) {
  try {
    const response = await axios.get(`${API_BASE}/movies/${id}/details`);
    return response.data;
  } catch (err) {
    console.error("MOVIE DETAIL ERROR:", err);
    return null;
  }
}

// Oscars — curated + enriched with TMDB data, grouped by ceremony, across
// Best Picture + the major acting / directing categories.
export async function fetchAwards() {
  try {
    const response = await axios.get(`${API_BASE}/movies/awards`);
    const data = response.data || {};
    const categories = data.categories || { bestPicture: data.sections || [] };
    return {
      sections: Array.isArray(data.sections) ? data.sections : categories.bestPicture || [],
      categories
    };
  } catch (err) {
    console.error("AWARDS ERROR:", err);
    return { sections: [], categories: {} };
  }
}

// Genres — TMDB's movie genre list (used by the Discover page).
export async function fetchGenres() {
  try {
    const response = await axios.get(`${API_BASE}/movies/genres`);
    return Array.isArray(response.data?.genres) ? response.data.genres : [];
  } catch (err) {
    console.error("GENRES ERROR:", err);
    return [];
  }
}

// Discover — filterable browse. Accepts { genres, year, minRating, sort, page }.
export async function discoverMovies(filters = {}) {
  const params = {};
  if (filters.genres && filters.genres.length) params.genres = filters.genres.join(",");
  if (filters.year) params.year = filters.year;
  if (filters.minRating) params.minRating = filters.minRating;
  if (filters.sort) params.sort = filters.sort;
  if (filters.page) params.page = filters.page;
  try {
    const response = await axios.get(`${API_BASE}/movies/discover`, { params });
    return response.data || { results: [], page: 1, total_pages: 0 };
  } catch (err) {
    console.error("DISCOVER ERROR:", err);
    return { results: [], page: 1, total_pages: 0 };
  }
}

// Person detail + filmography (cast credits sorted by popularity).
export async function fetchPersonDetails(id) {
  try {
    const response = await axios.get(`${API_BASE}/person/${id}/details`);
    return response.data;
  } catch (err) {
    console.error("PERSON ERROR:", err);
    return null;
  }
}

// Movie search — proxied through our backend (TMDB /search/movie).
export async function searchMovies(query) {
  const q = String(query || "").trim();
  if (q.length < 2) return [];
  try {
    const response = await axios.get(`${API_BASE}/movies/search`, {
      params: { q }
    });
    return Array.isArray(response.data?.results) ? response.data.results : [];
  } catch (err) {
    console.error("SEARCH ERROR:", err);
    return [];
  }
}

// Movie news — proxied through our backend (Guardian Film section).
export async function fetchMovieNews() {
  try {
    const response = await axios.get(`${API_BASE}/news`);
    return Array.isArray(response.data?.results) ? response.data.results : [];
  } catch (err) {
    console.error("MOVIE NEWS ERROR:", err);
    return [];
  }
}

// TV news — proxied through our backend (TV-focused RSS + Guardian TV).
export async function fetchTvNews() {
  try {
    const response = await axios.get(`${API_BASE}/news/tv`);
    return Array.isArray(response.data?.results) ? response.data.results : [];
  } catch (err) {
    console.error("TV NEWS ERROR:", err);
    return [];
  }
}

// Comments API helpers. Route returns an array of comment docs directly.
export async function fetchComments(movieId) {
  try {
    const response = await axios.get(`${API_BASE}/comments/${movieId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error("FETCH COMMENTS ERROR:", err);
    return [];
  }
}

export async function postComment(commentData) {
  try {
    const response = await axios.post(`${API_BASE}/comments`, commentData);
    return response.data;
  } catch (err) {
    console.error("POST COMMENT ERROR:", err);
    throw err;
  }
}

export async function deleteComment(id) {
  try {
    await axios.delete(`${API_BASE}/comments/${id}`);
    return true;
  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
    throw err;
  }
}

// curated upcoming movies
export async function fetchUpcomingCurated() {
  try {
    const response = await axios.get(`${API_BASE}/movies/upcoming-curated`);
    return response.data; // { "2026": [...], "2027": [...], popular: [...] }
  } catch (err) {
    console.error("CURATED UPCOMING ERROR:", err);
    return { "2026": [], "2027": [], popular: [] };
  }
}

export async function fetchMarvelMovies() {
  try {
    const response = await axios.get(`${API_BASE}/movies/marvel`);
    return response.data.movies;
  } catch (err) {
    console.error("MARVEL API ERROR:", err);
    return [];
  }
}
