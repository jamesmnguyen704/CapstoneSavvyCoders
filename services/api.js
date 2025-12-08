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
  const response = await axios.get(`${API_BASE}/movies/popular`);
  return response.data.results;
}

// upcoming
export async function fetchUpcoming() {
  const response = await axios.get(`${API_BASE}/movies/now_playing`);
  return response.data.results;
}

// now playing
export async function fetchNowPlaying() {
  const response = await axios.get(`${API_BASE}/movies/now_playing`);
  return response.data.results;
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

// work in progress for comments
export async function fetchComments(movieId) {
  try {
    const response = await axios.get(`${API_BASE}/comments/${movieId}`);
    return response.data.comments;
  } catch (err) {
    console.error("FETCH COMMENTS ERROR:", err);
    return [];
  }
}

export async function postComment(commentData) {
  try {
    await axios.post(`${API_BASE}/comments`, commentData);
  } catch (err) {
    console.error("POST COMMENT ERROR:", err);
  }
}

export async function deleteComment(id) {
  try {
    await axios.delete(`${API_BASE}/comments/${id}`);
  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
  }
}

// curated upcoming movies
export async function fetchUpcomingCurated() {
  try {
    const response = await axios.get(`${API_BASE}/movies/upcoming-curated`);
    return response.data; // returns { "2026": [...], "2027": [...] }
  } catch (err) {
    console.error("CURATED UPCOMING ERROR:", err);
    return { "2026": [], "2027": [] };
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
