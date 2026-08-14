// File: server/routes/tv.js
// Purpose: TV + streaming data for the /tv page.
// Endpoints:
//   GET /            → popular / top rated / on the air, in one payload
//   GET /providers   → shows filtered by streaming service (discover/tv)
//   GET /:id/details → single show detail (seasons, cast, where to watch)
// Notes: Provider IDs are TMDB's US watch-provider ids, confirmed live:
//        Netflix 8, Prime 9, Hulu 15, Disney+ 337, Apple TV+ 350,
//        Peacock 386, HBO Max 1899.

import express from "express";
import axios from "axios";
import { cacheJson } from "../utils/cache.js";

const router = express.Router();

const MINUTE = 60 * 1000;
router.use(cacheJson(10 * MINUTE));

const TMDB = "https://api.themoviedb.org/3";
const key = () => process.env.TMDB_API_KEY;

export const TV_PROVIDERS = [
  { id: 8, name: "Netflix" },
  { id: 1899, name: "HBO Max" },
  { id: 9, name: "Prime Video" },
  { id: 337, name: "Disney+" },
  { id: 350, name: "Apple TV+" },
  { id: 15, name: "Hulu" },
  { id: 386, name: "Peacock" }
];

// Trim TMDB's show payload to what the cards actually render.
function shapeShow(s) {
  return {
    id: s.id,
    name: s.name,
    poster_path: s.poster_path,
    backdrop_path: s.backdrop_path,
    first_air_date: s.first_air_date,
    vote_average: s.vote_average,
    overview: s.overview
  };
}

router.get("/", async (req, res) => {
  try {
    const [popular, topRated, onTheAir] = await Promise.all([
      axios.get(`${TMDB}/tv/popular?api_key=${key()}&language=en-US`),
      axios.get(`${TMDB}/tv/top_rated?api_key=${key()}&language=en-US`),
      axios.get(`${TMDB}/tv/on_the_air?api_key=${key()}&language=en-US`)
    ]);

    res.json({
      providers: TV_PROVIDERS,
      popular: (popular.data.results || []).filter(s => s.poster_path).map(shapeShow),
      topRated: (topRated.data.results || []).filter(s => s.poster_path).map(shapeShow),
      onTheAir: (onTheAir.data.results || []).filter(s => s.poster_path).map(shapeShow)
    });
  } catch (err) {
    console.error("TV ERROR:", err.message);
    res.status(500).json({ message: "Failed to load TV shows", popular: [] });
  }
});

// Shows on a given service. `provider` is a TMDB watch-provider id.
router.get("/providers", async (req, res) => {
  const provider = String(req.query.provider || "").trim();
  if (!/^\d+$/.test(provider)) {
    return res.status(400).json({ message: "provider must be a TMDB provider id", results: [] });
  }
  try {
    const r = await axios.get(`${TMDB}/discover/tv`, {
      params: {
        api_key: key(),
        language: "en-US",
        with_watch_providers: provider,
        watch_region: "US",
        sort_by: "popularity.desc",
        page: Math.min(Number(req.query.page) || 1, 500)
      }
    });
    res.json({
      total_results: r.data.total_results || 0,
      results: (r.data.results || []).filter(s => s.poster_path).map(shapeShow)
    });
  } catch (err) {
    console.error("TV PROVIDERS ERROR:", err.message);
    res.status(500).json({ message: "Failed to load shows for that service", results: [] });
  }
});

router.get("/:id/details", async (req, res) => {
  try {
    const r = await axios.get(`${TMDB}/tv/${req.params.id}`, {
      params: {
        api_key: key(),
        language: "en-US",
        append_to_response: "credits,watch/providers,content_ratings"
      }
    });
    const d = r.data;
    const us = d["watch/providers"]?.results?.US || {};
    res.json({
      id: d.id,
      name: d.name,
      tagline: d.tagline || "",
      overview: d.overview || "",
      poster_path: d.poster_path,
      backdrop_path: d.backdrop_path,
      first_air_date: d.first_air_date,
      last_air_date: d.last_air_date,
      status: d.status,
      vote_average: d.vote_average,
      vote_count: d.vote_count,
      genres: (d.genres || []).map(g => g.name),
      seasons: d.number_of_seasons,
      episodes: d.number_of_episodes,
      networks: (d.networks || []).map(n => ({
        name: n.name,
        logo: n.logo_path ? `https://image.tmdb.org/t/p/w92${n.logo_path}` : null
      })),
      creators: (d.created_by || []).map(c => ({ id: c.id, name: c.name })),
      cast: (d.credits?.cast || []).slice(0, 10).map(c => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profile_path: c.profile_path
      })),
      stream: (us.flatrate || []).map(p => ({
        name: p.provider_name,
        logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null
      }))
    });
  } catch (err) {
    console.error("TV DETAIL ERROR:", err.message);
    res.status(404).json({ message: "Could not load show details" });
  }
});

export default router;
