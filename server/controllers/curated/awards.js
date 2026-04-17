// File: server/controllers/curated/awards.js
// Purpose: Curated Academy Awards Best Picture nominees (recent ceremonies).
// Notes:
//   - TMDB does not expose Oscar data natively. We keep a small hand-curated
//     list of TMDB IDs plus a `winner` flag, then let the /movies/awards
//     route enrich each entry with full TMDB metadata at request time.
//   - Unknown IDs 404 from TMDB and get filtered out in the route.

export const oscarsBestPicture = [
  {
    ceremony: "97th Academy Awards",
    year: 2025,
    forYear: 2024,
    nominees: [
      { id: 1064213, winner: true,  title: "Anora" },
      { id: 402431,  winner: false, title: "Wicked" },
      { id: 693134,  winner: false, title: "Dune: Part Two" },
      { id: 974635,  winner: false, title: "Conclave" }
    ]
  },
  {
    ceremony: "96th Academy Awards",
    year: 2024,
    forYear: 2023,
    nominees: [
      { id: 872585,  winner: true,  title: "Oppenheimer" },
      { id: 346698,  winner: false, title: "Barbie" },
      { id: 792307,  winner: false, title: "Poor Things" },
      { id: 840430,  winner: false, title: "The Holdovers" },
      { id: 666277,  winner: false, title: "Past Lives" },
      { id: 915935,  winner: false, title: "Anatomy of a Fall" },
      { id: 1056360, winner: false, title: "American Fiction" },
      { id: 594767,  winner: false, title: "Maestro" },
      { id: 466420,  winner: false, title: "Killers of the Flower Moon" },
      { id: 467244,  winner: false, title: "The Zone of Interest" }
    ]
  },
  {
    ceremony: "95th Academy Awards",
    year: 2023,
    forYear: 2022,
    nominees: [
      { id: 545611, winner: true,  title: "Everything Everywhere All at Once" },
      { id: 361743, winner: false, title: "Top Gun: Maverick" },
      { id: 736790, winner: false, title: "The Banshees of Inisherin" },
      { id: 502356, winner: false, title: "The Fabelmans" },
      { id: 614934, winner: false, title: "Elvis" },
      { id: 49046,  winner: false, title: "All Quiet on the Western Front" },
      { id: 758323, winner: false, title: "Avatar: The Way of Water" },
      { id: 674324, winner: false, title: "Triangle of Sadness" },
      { id: 817758, winner: false, title: "Tár" },
      { id: 804095, winner: false, title: "Women Talking" }
    ]
  }
];
