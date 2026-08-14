// my movies.js routes to tmdb, for trending, now playing, popular and videos for the front end
import express from "express";
import axios from "axios";
import { cacheJson } from "../utils/cache.js";

// import curated data
import { curated2026, curated2027 } from "../controllers/curated/upcoming.js";

console.log("DEBUG movies.js — ENV TMDB KEY =", process.env.TMDB_API_KEY);

const router = express.Router();
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;

// Cache every GET under /movies. The curated routes fan out to dozens of TMDB
// calls, so they get a long TTL; the live TMDB lists get a short one.
const MINUTE = 60 * 1000;
router.use(
  cacheJson(req => {
    if (req.path === "/marvel" || req.path === "/awards") return 60 * MINUTE;
    if (req.path === "/upcoming-curated") return 30 * MINUTE;
    if (req.path === "/search") return 5 * MINUTE;
    // Keyed by full URL, so each ZIP caches separately.
    if (req.path === "/in-theaters") return 30 * MINUTE;
    // Theaters don't move, and Overpass is a shared free service.
    if (req.path === "/theaters-near") return 24 * 60 * MINUTE;
    return 10 * MINUTE;
  })
);


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


// In theaters near a US ZIP.
//
// There is no free showtimes API — Fandango has no public endpoint, Gracenote
// returns "Developer Inactive" without a paid account, and SerpApi is paid. So
// rather than fake it, we resolve the ZIP to a place name and hand the client
// everything it needs to deep-link straight into each chain's own site/app with
// the movie and location pre-filled. On mobile those are universal links, so
// they open the installed app directly.
router.get("/in-theaters", async (req, res) => {
  const zip = String(req.query.zip || "").trim();
  if (!/^\d{5}$/.test(zip)) {
    return res.status(400).json({ message: "Enter a 5-digit US ZIP code", results: [] });
  }

  try {
    const [place, nowPlaying] = await Promise.all([
      // Zippopotam is keyless and fast (~100ms). A bad ZIP 404s, which we
      // translate into a friendly message rather than a hard failure.
      axios
        .get(`https://api.zippopotam.us/us/${zip}`, { timeout: 8000 })
        .then(r => r.data)
        .catch(() => null),
      axios.get(
        `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.TMDB_API_KEY}&language=en-US&region=US`
      )
    ]);

    if (!place) {
      return res.status(404).json({ message: `No US location found for ${zip}`, results: [] });
    }

    const spot = place.places?.[0] || {};
    const location = {
      zip,
      city: spot["place name"] || "",
      state: spot["state abbreviation"] || spot.state || "",
      lat: Number(spot.latitude) || null,
      lng: Number(spot.longitude) || null
    };

    const results = (nowPlaying.data.results || [])
      .filter(m => m.poster_path)
      .map(m => ({
        id: m.id,
        title: m.title,
        poster_path: m.poster_path,
        backdrop_path: m.backdrop_path,
        release_date: m.release_date,
        vote_average: m.vote_average,
        overview: m.overview,
        tickets: ticketLinks(m.title, location)
      }));

    res.json({ location, radius: MILES_RADIUS, results });
  } catch (err) {
    console.error("IN-THEATERS ERROR:", err.message);
    res.status(500).json({ message: "Could not load what's playing near you", results: [] });
  }
});

// Nearest cinemas, split out from /in-theaters because Overpass can take ~20s
// under load and shouldn't hold up the movie grid. Cached for a day — theaters
// don't move.
router.get("/theaters-near", async (req, res) => {
  const zip = String(req.query.zip || "").trim();
  if (!/^\d{5}$/.test(zip)) {
    return res.status(400).json({ message: "Enter a 5-digit US ZIP code", theaters: [] });
  }

  try {
    const place = await axios
      .get(`https://api.zippopotam.us/us/${zip}`, { timeout: 8000 })
      .then(r => r.data)
      .catch(() => null);

    if (!place) {
      return res.status(404).json({ message: `No US location found for ${zip}`, theaters: [] });
    }

    const spot = place.places?.[0] || {};
    const theaters = await nearbyTheaters({
      lat: Number(spot.latitude),
      lng: Number(spot.longitude)
    });

    res.json({ radius: MILES_RADIUS, theaters });
  } catch (err) {
    console.error("THEATERS-NEAR ERROR:", err.message);
    res.status(500).json({ message: "Could not load nearby theaters", theaters: [] });
  }
});

// Nearby cinemas from OpenStreetMap via Overpass — free, keyless, and the only
// no-cost source of real theater locations I could find. Overpass is a shared
// community service, so this sits behind the 30-minute route cache and fails
// soft: if it errors or times out, the page still renders the movie grid.
const MILES_RADIUS = 25;
const METERS = Math.round(MILES_RADIUS * 1609.34);

function milesBetween(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const rad = d => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function nearbyTheaters({ lat, lng }) {
  if (lat == null || lng == null) return [];

  const query =
    `[out:json][timeout:25];` +
    `(node["amenity"="cinema"](around:${METERS},${lat},${lng});` +
    `way["amenity"="cinema"](around:${METERS},${lat},${lng}););` +
    `out center tags;`;

  // Public Overpass instances rate-limit hard and can take ~20s under load, so
  // allow a generous timeout and fall through to a mirror on failure.
  // (overpass.osm.ch is excluded on purpose — it only holds Swiss data and
  // answers US queries with an empty set, which looks like success.)
  const ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
  ];

  let r = null;
  for (const endpoint of ENDPOINTS) {
    try {
      const attempt = await axios.post(
        endpoint,
        new URLSearchParams({ data: query }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            // Overpass asks for an identifying UA and 406s without a valid one.
            "User-Agent": "Cinemetrics/1.0 (portfolio project)"
          },
          timeout: 30000
        }
      );
      // An empty array is truthy — check length, or a mirror with no data for
      // this region silently ends the loop.
      if (attempt.data?.elements?.length) {
        r = attempt;
        break;
      }
    } catch (err) {
      console.warn(`OVERPASS ${new URL(endpoint).host} failed:`, err.message);
    }
  }
  if (!r) return [];

  try {
    return (r.data.elements || [])
      .map(e => {
        const eLat = e.lat ?? e.center?.lat;
        const eLng = e.lon ?? e.center?.lon;
        const t = e.tags || {};
        if (!t.name || eLat == null) return null;
        const address = [t["addr:housenumber"], t["addr:street"], t["addr:city"]]
          .filter(Boolean)
          .join(" ");
        return {
          name: t.name,
          brand: t.brand || null,
          address,
          distance: Number(milesBetween(lat, lng, eLat, eLng).toFixed(1)),
          website: t.website || t["contact:website"] || null,
          maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${t.name} ${address}`.trim()
          )}`
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 15);
  } catch (err) {
    console.warn("OVERPASS parse failed:", err.message);
    return [];
  }
}

// Pre-filled ticket URLs per chain. Verified to resolve; AMC/Regal reject
// scripted user-agents but behave normally in a browser.
function ticketLinks(title, { zip, city, state }) {
  const q = encodeURIComponent(title);
  const near = encodeURIComponent(`${city}, ${state} ${zip}`.trim());
  return [
    { name: "Fandango", url: `https://www.fandango.com/search?q=${q}&location=${zip}` },
    { name: "AMC", url: `https://www.amctheatres.com/showtimes?location=${zip}` },
    { name: "Regal", url: `https://www.regmovies.com/theatres?zipCode=${zip}` },
    { name: "Cinemark", url: `https://www.cinemark.com/theatres?zip=${zip}` },
    { name: "Google", url: `https://www.google.com/search?q=${q}+showtimes+near+${near}` }
  ];
}

// trending, now playing, popular, videos
router.get("/trending", async (req, res) => {
  const key = process.env.TMDB_API_KEY;
  try {
    const [response, nowPlaying] = await Promise.all([
      axios.get(
        `https://api.themoviedb.org/3/trending/movie/week?api_key=${key}&language=en-US`
      ),
      axios
        .get(
          `https://api.themoviedb.org/3/movie/now_playing?api_key=${key}&language=en-US&region=US`
        )
        .catch(() => null)
    ]);

    const results = response.data.results || [];
    const inTheaters = new Set((nowPlaying?.data?.results || []).map(m => m.id));

    // Only the first five drive the hero, so only those pay for a providers
    // lookup. Everything is behind the 10-minute route cache.
    const hero = results.slice(0, 5);
    await Promise.all(
      hero.map(async movie => {
        if (inTheaters.has(movie.id)) {
          movie.availability = { type: "theaters", label: "Playing in theaters" };
          return;
        }
        try {
          const wp = await axios.get(
            `https://api.themoviedb.org/3/movie/${movie.id}/watch/providers?api_key=${key}`,
            { timeout: 8000 }
          );
          const flatrate = wp.data?.results?.US?.flatrate || [];
          if (flatrate.length) {
            // Prefer the shortest name — TMDB lists "Netflix" alongside
            // resold variants like "Netflix Standard with Ads".
            const best = [...flatrate].sort(
              (a, b) => a.provider_name.length - b.provider_name.length
            )[0];
            movie.availability = {
              type: "streaming",
              provider: best.provider_name,
              label: `Now streaming on ${best.provider_name}`,
              logo: best.logo_path
                ? `https://image.tmdb.org/t/p/w45${best.logo_path}`
                : null
            };
          }
        } catch {
          /* availability is a nice-to-have; the hero renders fine without it */
        }
      })
    );

    res.json({ results });
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
    // `append_to_response` folds keywords / reviews / release_dates into the
    // same request, so the extra panels cost no additional round trips.
    const [detail, credits, similar, providers] = await Promise.all([
      axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${key}&language=en-US` +
          `&append_to_response=keywords,reviews,release_dates`
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
    // TMDB returns cast pre-sorted by billing order, so the first 10 are the
    // top-billed 10 of (often) 90+ credited actors.
    const cast = (credits.data.cast || []).slice(0, 10).map(c => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile_path: c.profile_path
    }));
    const crewList = credits.data.crew || [];
    const director = crewList.find(c => c.job === "Director");
    const writers = crewList
      .filter(c => ["Screenplay", "Writer", "Story"].includes(c.job))
      .map(c => ({ id: c.id, name: c.name }))
      // The same person can be credited for both Screenplay and Story.
      .filter((w, i, arr) => arr.findIndex(x => x.id === w.id) === i)
      .slice(0, 4);

    // Headshot crew block for the modal: directors, then writers, then
    // producers. One card per person — someone credited as both Producer and
    // Screenplay shows once, with their jobs joined.
    const CREW_JOBS = [
      "Director",
      "Screenplay",
      "Writer",
      "Story",
      "Producer",
      "Executive Producer"
    ];
    const crewByPerson = new Map();
    for (const c of crewList) {
      if (!CREW_JOBS.includes(c.job)) continue;
      const existing = crewByPerson.get(c.id);
      if (existing) {
        if (!existing.jobs.includes(c.job)) existing.jobs.push(c.job);
      } else {
        crewByPerson.set(c.id, {
          id: c.id,
          name: c.name,
          profile_path: c.profile_path,
          jobs: [c.job]
        });
      }
    }
    const rank = p => Math.min(...p.jobs.map(j => CREW_JOBS.indexOf(j)));
    const ranked = [...crewByPerson.values()].sort((a, b) => rank(a) - rank(b));

    // Big studio films credit a dozen executive producers, which would bury
    // the director and writers. Keep every director/writer, cap producers.
    let producersKept = 0;
    const crew = ranked
      .filter(p => {
        const isProducerOnly = p.jobs.every(j => j === "Producer" || j === "Executive Producer");
        if (!isProducerOnly) return true;
        producersKept += 1;
        return producersKept <= 3;
      })
      .slice(0, 10)
      .map(p => ({ ...p, job: p.jobs.join(", ") }));

    // US MPAA certification (PG-13 etc.) lives in the release_dates payload.
    const usRelease = (d.release_dates?.results || []).find(r => r.iso_3166_1 === "US");
    const certification =
      (usRelease?.release_dates || []).map(r => r.certification).find(Boolean) || null;

    const keywords = (d.keywords?.keywords || []).slice(0, 8).map(k => k.name);

    // Written reviews, newest first, with the reviewer's own 0-10 score.
    const reviews = (d.reviews?.results || [])
      .map(r => ({
        id: r.id,
        author: r.author_details?.username || r.author,
        rating: typeof r.author_details?.rating === "number" ? r.author_details.rating : null,
        avatar: r.author_details?.avatar_path || null,
        created_at: r.created_at,
        url: r.url,
        content: r.content
      }))
      .sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0))
      .slice(0, 6);

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
      certification,
      keywords,
      director: director ? { id: director.id, name: director.name } : null,
      writers,
      crew,
      cast,
      reviews,
      review_count: d.reviews?.total_results || 0,
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
