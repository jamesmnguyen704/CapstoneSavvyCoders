// my movies.js routes to tmdb, for trending, now playing, popular and videos for the front end
import express from "express";
import axios from "axios";

console.log("DEBUG movies.js — ENV TMDB KEY =", process.env.TMDB_API_KEY);

const router = express.Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// trending movies for homepage
router.get("/trending", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&language=en-US`
    );

    res.json({
      message: "Trending Movies (TMDB Live Data)",
      results: response.data.results
    });
  } catch (error) {
    console.error("TMDB Trending API Error:", error);
    res.status(500).json({ message: "Failed to load trending movies" });
  }
});

// now playing in US theaters
router.get("/now_playing", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&region=US`
    );

    res.json({
      message: "Now Playing (TMDB Live Data)",
      results: response.data.results
    });
  } catch (error) {
    console.error("TMDB Now Playing API Error:", error);
    res.status(500).json({ message: "Failed to load now playing movies" });
  }
});

// popular movies for Movies view
router.get("/popular", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&region=US`
    );

    res.json({
      message: "Popular Movies (TMDB Live Data)",
      results: response.data.results
    });
  } catch (error) {
    console.error("TMDB Popular API Error:", error);
    res.status(500).json({ message: "Failed to load popular movies" });
  }
});

// -------------------------
// GET TRAILERS FOR A MOVIE
// -------------------------
router.get("/:id/videos", async (req, res) => {
  const movieId = req.params.id;

  try {
    // BEST ENDPOINT — returns way more consistent trailer results
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=videos&language=en-US`
    );

    const videos = response.data.videos?.results || [];

    res.json({
      message: "Movie videos (trailers, teasers)",
      results: videos
    });
  } catch (error) {
    console.error("TMDB Videos API Error:", error.message);
    res.status(500).json({
      message: "Failed to load movie videos",
      results: []
    });
  }
});

export default router;
