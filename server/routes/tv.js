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
import { cacheJson, getCached, setCached } from "../utils/cache.js";
import { requireNumericId } from "../middleware/requireNumericId.js";
import { getNielsenTop10 } from "../services/nielsenTop10.js";

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

// TMDB's `popularity` score is all-time, so a plain popularity sort surfaces
// decades-old talk shows and soaps (The Tonight Show, Law & Order SVU) ahead
// of anything actually airing now — those formats rack up popularity just by
// having thousands of episodes and votes. Pass this as `air_date.gte` to
// `discover/tv` to restrict results to shows with an episode in roughly the
// last 2 months, so "popular" tracks what's current instead of all-time.
function recentAirDateFloor() {
  return new Date(Date.now() - 60 * 24 * 60 * MINUTE).toISOString().slice(0, 10);
}

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

// Nielsen reports real viewership by title, not TMDB id, so each match needs
// a lookup to get posters/ids for the card. Nielsen's titles sometimes carry
// a year suffix TMDB's search doesn't expect (e.g. "East of Eden (2026)") —
// strip a trailing "(YYYY)" before searching.
async function resolveNielsenShow(title) {
  const cleanTitle = title.replace(/\s*\(\d{4}\)\s*$/, "").trim();
  try {
    const r = await axios.get(`${TMDB}/search/tv`, {
      params: { api_key: key(), language: "en-US", query: cleanTitle, page: 1 }
    });
    const match = (r.data.results || []).find(s => s.poster_path);
    return match ? shapeShow(match) : null;
  } catch (err) {
    console.error("NIELSEN MATCH ERROR:", cleanTitle, err.message);
    return null;
  }
}

router.get("/", async (req, res) => {
  try {
    const [popular, topRated, onTheAir] = await Promise.all([
      axios.get(`${TMDB}/discover/tv`, {
        params: {
          api_key: key(),
          language: "en-US",
          sort_by: "popularity.desc",
          "air_date.gte": recentAirDateFloor()
        }
      }),
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
    // Nielsen measures real viewing minutes per service — lead with that
    // where it exists. It only covers ~10-40 titles a week across every
    // service combined, so it rarely fills a whole grid on its own; TMDB's
    // discover results (already filtered to recent air dates) backfill the
    // rest, clearly marked as the estimate they are.
    const [nielsenEntries, discoverResult] = await Promise.all([
      getNielsenTop10(provider),
      axios.get(`${TMDB}/discover/tv`, {
        params: {
          api_key: key(),
          language: "en-US",
          with_watch_providers: provider,
          watch_region: "US",
          sort_by: "popularity.desc",
          "air_date.gte": recentAirDateFloor(),
          page: Math.min(Number(req.query.page) || 1, 500)
        }
      })
    ]);

    const measuredShows = (
      await Promise.all(nielsenEntries.map(e => resolveNielsenShow(e.title)))
    )
      .map((show, i) => (show ? { ...show, measured: true, rank: nielsenEntries[i].rank, minutes: nielsenEntries[i].minutes } : null))
      .filter(Boolean)
      .sort((a, b) => a.rank - b.rank);

    const seenIds = new Set(measuredShows.map(s => s.id));
    const estimatedShows = (discoverResult.data.results || [])
      .filter(s => s.poster_path && !seenIds.has(s.id))
      .map(s => ({ ...shapeShow(s), measured: false }));

    res.json({
      total_results: discoverResult.data.total_results || 0,
      measuredCount: measuredShows.length,
      results: [...measuredShows, ...estimatedShows]
    });
  } catch (err) {
    console.error("TV PROVIDERS ERROR:", err.message);
    res.status(500).json({ message: "Failed to load shows for that service", results: [] });
  }
});

router.get("/:id/details", requireNumericId(), async (req, res) => {
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

// Batched "where to watch" lookup for TV cards, same idea and shape as
// /movies/meta/availability but pointed at TMDB's /tv/ namespace — show IDs
// and movie IDs aren't the same space, so this needs its own route and its
// own cache-key prefix rather than sharing the movie endpoint/cache.
// Flatrate (subscription) only, same as the movie version and per James's
// explicit requirement: never show per-title rent/buy pricing here, only
// "this is free to watch if you already have the subscription."
const TV_AVAILABILITY_TTL_MS = 24 * 60 * 60 * 1000;

router.post("/meta/availability", async (req, res) => {
  try {
    const { showIds } = req.body;
    const ids = Array.isArray(showIds)
      ? [...new Set(showIds.map(Number).filter(id => !Number.isNaN(id)))]
      : [];
    if (!ids.length) return res.json({});

    const result = {};
    const uncached = [];
    for (const id of ids) {
      const hit = getCached(`tv-availability:${id}`);
      if (hit !== undefined) {
        if (hit) result[id] = hit;
      } else {
        uncached.push(id);
      }
    }

    if (uncached.length) {
      await Promise.all(
        uncached.map(async id => {
          let availability = null;
          try {
            const wp = await axios.get(
              `${TMDB}/tv/${id}/watch/providers?api_key=${key()}`,
              { timeout: 8000 }
            );
            const flatrate = wp.data?.results?.US?.flatrate || [];
            if (flatrate.length) {
              const best = [...flatrate].sort(
                (a, b) => a.provider_name.length - b.provider_name.length
              )[0];
              availability = {
                type: "streaming",
                provider: best.provider_name,
                label: `Now streaming on ${best.provider_name}`,
                logo: best.logo_path
                  ? `https://image.tmdb.org/t/p/w45${best.logo_path}`
                  : null
              };
            }
          } catch {
            /* availability is a nice-to-have; the card renders fine without it */
          }
          setCached(`tv-availability:${id}`, availability, TV_AVAILABILITY_TTL_MS);
          if (availability) result[id] = availability;
        })
      );
    }

    res.json(result);
  } catch (err) {
    console.error("TV AVAILABILITY ERROR:", err.message);
    res.status(500).json({ error: "Could not load availability" });
  }
});

export default router;
