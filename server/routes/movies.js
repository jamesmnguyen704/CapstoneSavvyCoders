import express from "express";
import axios from "axios";

console.log("DEBUG movies.js — ENV TMDB KEY =", process.env.TMDB_API_KEY);

const router = express.Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// get trending movies
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

// now playing in the us
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

// popular in the us
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

export default router;
