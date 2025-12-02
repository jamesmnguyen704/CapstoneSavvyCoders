// creating my router object for API endpoints for my movies

import express from "express";
const router = express.Router();

// Get endpoint /movies/trending pulling my placeholder information for now
router.get("/trending", (req, res) => {
  res.json({
    message: "Top Trending Movies (Demo Data)",
    results: [
      { id: 1, title: "Deadpool & Wolverine" },
      { id: 2, title: "Dune: Part Two" },
      { id: 3, title: "Inside Out 2" }
    ]
  });
});

// Get endpoints for /movies/upcoming. when called. it will list my placeholders information
router.get("/upcoming", (req, res) => {
  res.json({
    message: "Upcoming Movie Releases (Demo Data)",
    results: [
      { id: 101, title: "Avatar 3" },
      { id: 102, title: "Spider-Man: Beyond the Spider-Verse" }
    ]
  });
});

export default router;
