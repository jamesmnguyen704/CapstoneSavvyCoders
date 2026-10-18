// this is my marvel page for fun since box office wasn't working
// controllers to handle my timeline and movies that aren't out yet

// controllers/marvel.js

import axios from "axios";
import dotenv from "dotenv";
import { mcuMovieIds } from "../../../shared/mcuPhases.js";

const API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3/movie";

// Fetch a single movie
const fetchMovie = async id => {
  try {
    const response = await axios.get(`${TMDB_BASE}/${id}`, {
      params: { api_key: API_KEY, language: "en-US" }
    });
    return response.data;
  } catch (err) {
    console.error(`Error fetching movie ${id}:`, err.message);
    // Log failed ID to a list for summary
    if (!global.failedMarvelIDs) global.failedMarvelIDs = [];
    global.failedMarvelIDs.push(id);
    return null;
  }
};

// Main controller
export const getMCUMovies = async (req, res) => {
  console.log("getMCUMovies controller called!");
  // Reset per-request — this was never cleared, so it just grew forever
  // across every call to this route for the life of the process.
  global.failedMarvelIDs = [];
  try {
    // If rate limit is an issue, fetch in batches of 5 with delay
    const batchSize = 5;
    let results = [];
    for (let i = 0; i < mcuMovieIds.length; i += batchSize) {
      const batch = mcuMovieIds.slice(i, i + batchSize);
      // eslint-disable-next-line no-await-in-loop
      const batchResults = await Promise.all(batch.map(id => fetchMovie(id)));
      console.log(
        `Batch ${i / batchSize + 1}: Pulled ${
          batchResults.filter(r => r !== null).length
        } movies`
      );
      results = results.concat(batchResults);
      console.log(
        `Total movies so far: ${results.filter(r => r !== null).length}`
      );
      // Delay between batches to avoid rate limit (adjust as needed)
      if (i + batchSize < mcuMovieIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    }
    if (global.failedMarvelIDs.length > 0) {
      console.warn("Failed TMDB movie IDs:", global.failedMarvelIDs);
    }
    const movies = results.filter(r => r !== null);
    console.log(`Final MCU movies count: ${movies.length}`);

    // A rate-limit spell drops several titles mid-fetch without the request
    // itself ever failing — it still returns 200 with success:true, just
    // missing films. That 60-minute-cached "complete" list then shows an MCU
    // timeline with holes in it for up to an hour, even after TMDB recovers.
    // 90% tolerates one or two genuinely dead ids without defeating caching
    // forever over a single permanently-missing title.
    const completeEnough = movies.length >= mcuMovieIds.length * 0.9;
    if (!completeEnough) {
      return res.status(503).json({
        success: false,
        message: "Marvel data temporarily incomplete, please retry",
        count: movies.length,
        movies
      });
    }

    res.json({ success: true, count: movies.length, movies });
  } catch (err) {
    console.error("MCU Controller Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default getMCUMovies;
