// File: views/marvel.js
// Purpose: Render the Marvel Cinematic Universe pages grouped by phase.
// Notes: Groups fetched MCU movies by hard-coded phase IDs and renders horizontal rows.
import html from "html-literal";

const phaseIDs = {
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
  "Phase 5": [640146, 447365, 609681, 533535],
  "Phase 6": [986056, 617126, 969681, 1003596, 1003598]
};

function groupMoviesByPhase(movies) {
  const byID = Object.fromEntries(movies.map(m => [m.id, m]));
  const result = {};
  for (const [phase, ids] of Object.entries(phaseIDs)) {
    result[phase] = ids.map(id => byID[id]).filter(Boolean);
  }
  return result;
}

export default state => {
  const movies = Array.isArray(state.marvel) ? state.marvel : [];
  const phases = groupMoviesByPhase(movies);
  return html`
    <section class="marvel-container">
      <h1 class="marvel-title">Marvel Cinematic Universe</h1>
      <p class="marvel-subtitle">
        Complete MCU Timeline from Iron Man → Secret Wars
      </p>
      ${Object.entries(phases)
        .map(
          ([phase, phaseMovies]) =>
            html`
              <h2 class="marvel-phase-title">${phase}</h2>
              <div
                class="marvel-phase-row"
                style="display:flex;flex-direction:row;flex-wrap:nowrap;overflow-x:auto;gap:1rem;max-height:520px;align-items:flex-start;"
              >
                ${phaseMovies.length
                  ? phaseMovies
                      .map(movie =>
                        movie
                          ? html`
                              <div class="marvel-card">
                                <img
                                  class="marvel-poster"
                                  src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
                                  alt="${movie.title}"
                                />
                                <div class="marvel-info">
                                  <div class="marvel-card-title">
                                    ${movie.title}
                                  </div>
                                  <button class="trailer-btn" data-id="${movie.id}">
                                    ▶ Trailer
                                  </button>
                                  <div class="marvel-release">
                                    ${movie.release_date
                                      ? new Date(
                                          movie.release_date
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric"
                                        })
                                      : "TBA"}
                                  </div>
                                  <!-- overview removed to keep card compact -->
                                </div>
                              </div>
                            `
                          : html`
                              <div class="marvel-card missing">
                                <div class="marvel-card-title">
                                  Missing Movie Data
                                </div>
                                  <!-- missing overview removed -->
                              </div>
                            `
                      )
                      .join("")
                  : `<p>No movies found for this phase.</p>`}
              </div>
            `
        )
        .join("")}
    </section>
  `;
};
