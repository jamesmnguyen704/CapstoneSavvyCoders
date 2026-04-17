// File: server/routes/person.js
// Purpose: Proxy TMDB person endpoints so we can show cast member detail
//          (bio + filmography) when a user clicks a cast card.

import express from "express";
import axios from "axios";

const router = express.Router();

// GET /person/:id/details — combined detail + movie_credits payload.
router.get("/:id/details", async (req, res) => {
  const key = process.env.TMDB_API_KEY;
  const id = req.params.id;
  try {
    const [detail, credits] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/person/${id}`, {
        params: { api_key: key, language: "en-US" },
        timeout: 6000
      }),
      axios.get(`https://api.themoviedb.org/3/person/${id}/movie_credits`, {
        params: { api_key: key, language: "en-US" },
        timeout: 6000
      })
    ]);

    const d = detail.data;
    // Sort cast credits: released first, by popularity desc, dedupe by movie id.
    const seen = new Set();
    const cast = (credits.data.cast || [])
      .filter(c => {
        if (!c.poster_path) return false;
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      })
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 30)
      .map(c => ({
        id: c.id,
        title: c.title,
        character: c.character,
        poster_path: c.poster_path,
        release_date: c.release_date,
        vote_average: c.vote_average
      }));

    res.json({
      id: d.id,
      name: d.name,
      biography: d.biography || "",
      birthday: d.birthday,
      deathday: d.deathday,
      place_of_birth: d.place_of_birth,
      profile_path: d.profile_path,
      known_for_department: d.known_for_department,
      homepage: d.homepage,
      imdb_id: d.imdb_id,
      cast
    });
  } catch (err) {
    console.error("PERSON ERROR:", err.response?.data || err.message);
    res.status(404).json({ message: "Could not load person details" });
  }
});

export default router;
