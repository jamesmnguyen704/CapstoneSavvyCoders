// Single source of truth for which MCU film belongs to which phase — imported
// by both server/controllers/curated/marvel.js (fetches this exact ID list
// from TMDB) and views/marvel.js (groups the fetched films into phase
// banners). Before this file existed the same IDs were hand-copied in both
// places, and they drifted: Captain America: Brave New World went missing
// entirely, and Thunderbolts* ended up filed under the wrong phase in one
// copy but not the other. One list now; a film can only be wrong in one
// place because there is only one place.
export const phaseIDs = {
  "Phase 1": [1726, 1724, 10138, 10195, 1771, 24428],
  "Phase 2": [68721, 76338, 100402, 118340, 99861, 102899],
  "Phase 3": [
    271110,
    284052,
    283995,
    315635,
    284053,
    284054,
    299536,
    363088,
    299537,
    299534,
    429617
  ],
  "Phase 4": [497698, 566525, 524434, 634649, 453395, 616037, 505642],
  // Thunderbolts* is Phase 5's own finale, not Phase 6's opener.
  "Phase 5": [640146, 447365, 609681, 533535, 822119, 986056],
  "Phase 6": [617126, 969681, 1003596, 1003598]
};

// Flat id list in phase order, for the backend's single TMDB fan-out.
export const mcuMovieIds = Object.values(phaseIDs).flat();
