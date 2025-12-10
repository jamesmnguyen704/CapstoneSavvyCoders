// this is my marvel page for fun since box office wasn't working
// controllers to handle my timeline and movies that aren't out yet

// controllers/marvel.js

import axios from "axios";
import dotenv from "dotenv";

const API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3/movie";

// FULL MCU MOVIE LIST (Iron Man → Secret Wars)
const mcuMovies = [
  // Phase 1
  1726, // Iron Man
  1724, // Incredible Hulk
  10138, // Iron Man 2
  10195, // Thor
  1771, // Captain America: The First Avenger
  24428, // The Avengers

  // Phase 2
  68721, // Iron Man 3
  76338, // Thor: The Dark World
  100402, // Captain America: The Winter Soldier
  118340, // Guardians of the Galaxy
  99861, // Avengers: Age of Ultron
  102899, // Ant-Man

  // Phase 3
  271110, // Captain America: Civil War
  284052, // Doctor Strange
  283995, // Guardians of the Galaxy Vol. 2
  315635, // Spider-Man: Homecoming
  284053, // Thor: Ragnarok
  284054, // Black Panther
  299536, // Avengers: Infinity War
  363088, // Ant-Man and the Wasp
  299537, // Captain Marvel
  299534, // Avengers: Endgame
  429617, // Spider-Man: Far From Home

  // Phase 4
  497698, // Black Widow
  566525, // Shang-Chi
  524434, // Eternals
  634649, // Spider-Man: No Way Home
  453395, // Doctor Strange in the Multiverse of Madness
  616037, // Thor: Love and Thunder
  505642, // Black Panther: Wakanda Forever

  // Phase 5
  640146, // Ant-Man and the Wasp: Quantumania
  447365, // Guardians of the Galaxy Vol. 3
  609681, // The Marvels
  533535, // Deadpool & Wolverine

  // Phase 6 — upcoming
  986056, // Thunderbolts (2025)
  617126, // Fantastic Four: First Steps (2025)
  969681, // Spider-Man: Brand New Day (2026)
  1003596, // Avengers: Doomsday (2026)
  1003598 // Avengers: Secret Wars (2027)
];

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
    for (let i = 0; i < mcuMovies.length; i += batchSize) {
      const batch = mcuMovies.slice(i, i + batchSize);
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
      if (i + batchSize < mcuMovies.length) {
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
