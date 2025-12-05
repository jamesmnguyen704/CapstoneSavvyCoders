import axios from "axios";

const API_BASE = "http://localhost:3000"; // backend

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
