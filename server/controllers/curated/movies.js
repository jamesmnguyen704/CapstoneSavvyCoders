// my movies.js routes to tmdb, for trending, now playing, popular and videos for the front end
import express from "express";
import axios from "axios";

// import curated data
import { curated2026, curated2027 } from "../controllers/curated/upcoming.js";

console.log("DEBUG movies.js — ENV TMDB KEY =", process.env.TMDB_API_KEY);

const router = express.Router();
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;

// -----------------------------
// LIVE TMDB ROUTES (trending, now playing, popular, videos)
// -----------------------------

router.get("/trending", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.TMDB_API_KEY}&language=en-US`
    );
    res.json({ results: response.data.results });
  } catch (error) {
    res.status(500).json({ message: "Failed to load trending movies" });
  }
});

router.get("/now_playing", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.TMDB_API_KEY}&language=en-US&region=US`
    );
    res.json({ results: response.data.results });
  } catch (error) {
    res.status(500).json({ message: "Failed to load now playing" });
  }
});

router.get("/popular", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&language=en-US&region=US`
    );
    res.json({ results: response.data.results });
  } catch (error) {
    res.status(500).json({ message: "Failed to load popular" });
  }
});

// VIDEO ROUTE
router.get("/:id/videos", async (req, res) => {
  const movieId = req.params.id;
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}&append_to_response=videos&language=en-US`
    );
    const videos = response.data.videos?.results || [];
    res.json({ results: videos });
  } catch {
    res.status(500).json({ message: "Failed to load videos", results: [] });
  }
});

// -----------------------------
// ⭐ CURATED UPCOMING RELEASES
// -----------------------------

router.get("/upcoming-curated", async (req, res) => {
  console.log("Curated route HIT!");

  try {
    const headers = {
      Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`
    };

    const fetchMovie = async (m) => {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${m.id}`,
        { headers }
      );
      return { ...response.data, customDate: m.date };
    };

    console.log("Fetching curated 2026 movies…");
    const movies2026 = await Promise.all(curated2026.map(fetchMovie));

    console.log("Fetching curated 2027 movies…");
    const movies2027 = await Promise.all(curated2027.map(fetchMovie));

    res.json({
      "2026": movies2026,
      "2027": movies2027
    });

    console.log("SUCCESS! Sending curated JSON.");
  } catch (err) {
    console.error("CURATED ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
export default router;
