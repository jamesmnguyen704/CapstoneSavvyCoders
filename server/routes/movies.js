// my movies.js routes to tmdb, for trending, now playing, popular and videos for the front end
import express from "express";
import axios from "axios";

// import curated data
import { curated2026, curated2027 } from "../controllers/curated/upcoming.js";

console.log("DEBUG movies.js — ENV TMDB KEY =", process.env.TMDB_API_KEY);

const router = express.Router();
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;


// ⭐ my marvel movies yayyyyy — MUST BE AT TOP ⭐
import getMCUMovies from "../controllers/curated/marvel.js";
import { oscarsBestPicture } from "../controllers/curated/awards.js";
router.get("/marvel", getMCUMovies);

// Awards — enriches our curated Oscars Best Picture list with full TMDB data
// per nominee, grouped by ceremony.
router.get("/awards", async (req, res) => {
  const key = process.env.TMDB_API_KEY;
  const fetchMovie = async nominee => {
    try {
      const r = await axios.get(
        `https://api.themoviedb.org/3/movie/${nominee.id}`,
        {
          params: { api_key: key, language: "en-US" },
          timeout: 6000
        }
      );
      return { ...r.data, winner: !!nominee.winner };
    } catch (err) {
      if (err.response?.status !== 404) {
        console.warn(`AWARDS: failed for ${nominee.id}:`, err.message);
      }
      return null;
    }
  };

  try {
    const sections = await Promise.all(
      oscarsBestPicture.map(async section => ({
        ceremony: section.ceremony,
        year: section.year,
        forYear: section.forYear,
        nominees: (await Promise.all(section.nominees.map(fetchMovie)))
          .filter(Boolean)
          .sort((a, b) => (b.winner === true) - (a.winner === true))
      }))
    );
    res.json({ sections });
  } catch (err) {
    console.error("AWARDS ERROR:", err.message);
    res.status(500).json({ message: "Failed to load awards", sections: [] });
  }
});

// SEARCH: proxy TMDB's movie search. Keeps our API key server-side.
router.get("/search", async (req, res) => {
  const query = String(req.query.q || "").trim();
  if (query.length < 2) {
    return res.json({ results: [] });
  }
  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/search/movie",
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          query,
          language: "en-US",
          include_adult: false
        },
        timeout: 6000
      }
    );
    const results = (response.data.results || [])
      .filter(m => m.poster_path)
      .slice(0, 12);
    res.json({ results });
  } catch (err) {
    console.error("SEARCH ERROR:", err.response?.data || err.message);
    res.status(502).json({ message: "Search failed", results: [] });
  }
});


// trending, now playing, popular, videos
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

// Top rated — lifetime highest rated on TMDB. Complements trending/popular.
router.get("/top_rated", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.TMDB_API_KEY}&language=en-US&region=US`
    );
    res.json({ results: response.data.results });
  } catch {
    res.status(500).json({ message: "Failed to load top rated" });
  }
});

// Movie detail — title, runtime, genres, tagline, cast, similar, and
// "where to watch" (JustWatch data via TMDB) in a single payload.
router.get("/:id/details", async (req, res) => {
  const movieId = req.params.id;
  const key = process.env.TMDB_API_KEY;
  try {
    const [detail, credits, similar, providers] = await Promise.all([
      axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${key}&language=en-US`
      ),
      axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${key}&language=en-US`
      ),
      axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${key}&language=en-US`
      ),
      axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${key}`
      )
    ]);

    const d = detail.data;
    const cast = (credits.data.cast || []).slice(0, 8).map(c => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile_path: c.profile_path
    }));
    const director = (credits.data.crew || []).find(c => c.job === "Director");

    const us = providers.data?.results?.US || {};
    const watchProviders = {
      link: us.link || null,
      stream: (us.flatrate || []).map(p => ({
        name: p.provider_name,
        logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null
      })),
      rent: (us.rent || []).map(p => ({
        name: p.provider_name,
        logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null
      })),
      buy: (us.buy || []).map(p => ({
        name: p.provider_name,
        logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null
      }))
    };

    res.json({
      id: d.id,
      title: d.title,
      tagline: d.tagline || "",
      overview: d.overview || "",
      poster_path: d.poster_path,
      backdrop_path: d.backdrop_path,
      release_date: d.release_date,
      runtime: d.runtime,
      vote_average: d.vote_average,
      vote_count: d.vote_count,
      genres: (d.genres || []).map(g => g.name),
      homepage: d.homepage,
      imdb_id: d.imdb_id,
      director: director ? { id: director.id, name: director.name } : null,
      cast,
      similar: (similar.data.results || [])
        .filter(m => m.poster_path)
        .slice(0, 12),
      watchProviders
    });
  } catch (err) {
    console.error("DETAIL ERROR:", err.response?.data || err.message);
    res.status(404).json({ message: "Could not load movie details" });
  }
});

// for trailers
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

// my favorite upcoming movies — auto-hides entries whose release has passed
// and also surfaces a "Popular" row from TMDB /discover for movies releasing
// after today so the page stays fresh without manual curation.
router.get("/upcoming-curated", async (req, res) => {
  console.log("Curated route HIT!");

  try {
    const headers = {
      Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`
    };

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const fetchMovie = async (m) => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${m.id}`,
          { headers }
        );
        return { ...response.data, customDate: m.date };
      } catch (err) {
        if (err.response && err.response.status === 404) {
          console.warn(`Movie ID ${m.id} not found on TMDB, skipping.`);
          return null;
        }
        console.error("CURATED ERROR:", err.response?.data || err.message);
        return null;
      }
    };

    // Drop anything whose curated date or TMDB release_date has already passed,
    // then sort ascending so the next upcoming appears first.
    const filterAndSort = list =>
      list
        .filter(m => {
          const d = m.customDate || m.release_date || "";
          return d && d >= today;
        })
        .sort((a, b) => {
          const da = a.customDate || a.release_date || "";
          const db = b.customDate || b.release_date || "";
          return da.localeCompare(db);
        });

    const [movies2026, movies2027] = await Promise.all([
      Promise.all(curated2026.map(fetchMovie)).then(arr => filterAndSort(arr.filter(Boolean))),
      Promise.all(curated2027.map(fetchMovie)).then(arr => filterAndSort(arr.filter(Boolean)))
    ]);

    // Also pull TMDB's most-anticipated upcoming so the page stays fresh with
    // movies we didn't manually curate.
    let popular = [];
    try {
      const nextYearMax = new Date();
      nextYearMax.setFullYear(nextYearMax.getFullYear() + 2);
      const discoverResp = await axios.get(
        "https://api.themoviedb.org/3/discover/movie",
        {
          params: {
            api_key: process.env.TMDB_API_KEY,
            "primary_release_date.gte": today,
            "primary_release_date.lte": nextYearMax.toISOString().slice(0, 10),
            sort_by: "popularity.desc",
            include_adult: false,
            language: "en-US",
            region: "US",
            "vote_count.gte": 20
          },
          timeout: 8000
        }
      );
      popular = (discoverResp.data?.results || [])
        .filter(m => m.poster_path)
        .slice(0, 20);
    } catch (err) {
      console.warn("Upcoming-popular fallback failed:", err.message);
    }

    res.json({
      "2026": movies2026,
      "2027": movies2027,
      popular
    });

    console.log("SUCCESS! Sending curated JSON.");
  } catch (err) {
    console.error("CURATED ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

// fallback for getting single movie
router.get("/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${req.params.id}?api_key=${process.env.TMDB_API_KEY}&language=en-US`
    );
    res.json(response.data);
  } catch {
    res.status(404).json({ message: "Movie not found" });
  }
});

export default router;
