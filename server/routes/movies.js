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
import {
  oscarsBestPicture,
  oscarsBestDirector,
  oscarsBestActor,
  oscarsBestActress,
  oscarsSupportingActor,
  oscarsSupportingActress
} from "../controllers/curated/awards.js";
router.get("/marvel", getMCUMovies);

// Awards — enriches our curated Oscars lists with full TMDB data per nominee.
// Best Picture returns film metadata; person-based categories return both
// headshot/bio (from /person/{id}) and the nominated film details.
router.get("/awards", async (req, res) => {
  const key = process.env.TMDB_API_KEY;

  const movieCache = new Map();
  const personCache = new Map();

  const fetchMovie = async id => {
    if (movieCache.has(id)) return movieCache.get(id);
    const p = axios
      .get(`https://api.themoviedb.org/3/movie/${id}`, {
        params: { api_key: key, language: "en-US" },
        timeout: 6000
      })
      .then(r => r.data)
      .catch(err => {
        if (err.response?.status !== 404) {
          console.warn(`AWARDS movie ${id}:`, err.message);
        }
        return null;
      });
    movieCache.set(id, p);
    return p;
  };

  const fetchPerson = async id => {
    if (personCache.has(id)) return personCache.get(id);
    const p = axios
      .get(`https://api.themoviedb.org/3/person/${id}`, {
        params: { api_key: key, language: "en-US" },
        timeout: 6000
      })
      .then(r => r.data)
      .catch(err => {
        if (err.response?.status !== 404) {
          console.warn(`AWARDS person ${id}:`, err.message);
        }
        return null;
      });
    personCache.set(id, p);
    return p;
  };

  const enrichFilmSection = async section => {
    const nominees = await Promise.all(
      section.nominees.map(async n => {
        const m = await fetchMovie(n.id);
        return m ? { ...m, winner: !!n.winner } : null;
      })
    );
    return {
      ceremony: section.ceremony,
      year: section.year,
      forYear: section.forYear,
      nominees: nominees
        .filter(Boolean)
        .sort((a, b) => (b.winner === true) - (a.winner === true))
    };
  };

  const enrichPersonSection = async section => {
    const nominees = await Promise.all(
      section.nominees.map(async n => {
        const [person, film] = await Promise.all([
          fetchPerson(n.personId),
          fetchMovie(n.filmId)
        ]);
        return {
          personId: n.personId,
          name: person?.name || n.personName,
          profile_path: person?.profile_path || null,
          role: n.role || null,
          winner: !!n.winner,
          film: film
            ? {
                id: film.id,
                title: film.title,
                poster_path: film.poster_path,
                backdrop_path: film.backdrop_path,
                release_date: film.release_date,
                vote_average: film.vote_average
              }
            : { id: n.filmId, title: n.filmTitle }
        };
      })
    );
    return {
      ceremony: section.ceremony,
      year: section.year,
      forYear: section.forYear,
      nominees: nominees
        .filter(Boolean)
        .sort((a, b) => (b.winner === true) - (a.winner === true))
    };
  };

  try {
    const [
      bestPicture,
      bestDirector,
      bestActor,
      bestActress,
      supportingActor,
      supportingActress
    ] = await Promise.all([
      Promise.all(oscarsBestPicture.map(enrichFilmSection)),
      Promise.all(oscarsBestDirector.map(enrichPersonSection)),
      Promise.all(oscarsBestActor.map(enrichPersonSection)),
      Promise.all(oscarsBestActress.map(enrichPersonSection)),
      Promise.all(oscarsSupportingActor.map(enrichPersonSection)),
      Promise.all(oscarsSupportingActress.map(enrichPersonSection))
    ]);

    res.json({
      sections: bestPicture, // legacy alias — Best Picture
      categories: {
        bestPicture,
        bestDirector,
        bestActor,
        bestActress,
        supportingActor,
        supportingActress
      }
    });
  } catch (err) {
    console.error("AWARDS ERROR:", err.message);
    res.status(500).json({ message: "Failed to load awards", sections: [] });
  }
});

// GENRES: TMDB's canonical movie genre list. Used by the Discover page.
router.get("/genres", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/genre/movie/list",
      {
        params: { api_key: process.env.TMDB_API_KEY, language: "en-US" },
        timeout: 6000
      }
    );
    res.json({ genres: response.data.genres || [] });
  } catch (err) {
    console.error("GENRES ERROR:", err.message);
    res.status(500).json({ genres: [] });
  }
});

// DISCOVER: filterable movie browser. Accepts:
//   genres   = comma-separated TMDB genre ids (AND-joined)
//   year     = primary release year (optional)
//   minRating= vote_average lower bound (optional)
//   sort     = TMDB sort string (popularity.desc by default)
//   page     = 1-based page number
router.get("/discover", async (req, res) => {
  try {
    const page = Math.max(1, Math.min(500, Number(req.query.page) || 1));
    const sort = String(req.query.sort || "popularity.desc");
    const genres = String(req.query.genres || "").trim();
    const year = Number(req.query.year) || null;
    const minRating = Number(req.query.minRating) || null;

    const params = {
      api_key: process.env.TMDB_API_KEY,
      language: "en-US",
      include_adult: false,
      sort_by: sort,
      page,
      "vote_count.gte": 25
    };
    if (genres) params.with_genres = genres;
    if (year) params.primary_release_year = year;
    if (minRating) params["vote_average.gte"] = minRating;

    const response = await axios.get(
      "https://api.themoviedb.org/3/discover/movie",
      { params, timeout: 8000 }
    );
    res.json({
      page: response.data.page,
      total_pages: Math.min(response.data.total_pages || 0, 500),
      total_results: response.data.total_results,
      results: (response.data.results || []).filter(m => m.poster_path)
    });
  } catch (err) {
    console.error("DISCOVER ERROR:", err.response?.data || err.message);
    res.status(500).json({ results: [], page: 1, total_pages: 0 });
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
