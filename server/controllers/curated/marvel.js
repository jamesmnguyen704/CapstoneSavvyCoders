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
    // Log summary of failed IDs
    if (global.failedMarvelIDs && global.failedMarvelIDs.length > 0) {
      console.warn("Failed TMDB movie IDs:", global.failedMarvelIDs);
    }
    console.log(
      `Final MCU movies count: ${results.filter(r => r !== null).length}`
    );
    res.json({
      success: true,
      count: results.filter(r => r !== null).length,
      movies: results.filter(r => r !== null)
    });
  } catch (err) {
    console.error("MCU Controller Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default getMCUMovies;
