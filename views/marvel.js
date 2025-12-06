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
                              <div
                                class="marvel-card"
                                style="min-width:170px;max-width:170px;flex:0 0 170px;display:flex;flex-direction:column;align-items:center;margin-right:1.2rem;box-sizing:border-box;"
                              >
                                <img
                                  class="marvel-poster"
                                  src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
                                  alt="${movie.title}"
                                  style="width:160px;height:220px;object-fit:cover;border-radius:0.5rem;margin-bottom:0.5rem;"
                                />
                                <div class="marvel-info">
                                  <div class="marvel-card-title">
                                    ${movie.title}
                                  </div>
                                  <button
                                    class="trailer-btn"
                                    data-id="${movie.id}"
                                    style="margin:0.3rem 0 0.3rem 0;width:80px;background:#e62429;color:#fff;border:none;border-radius:0.3rem;padding:0.2rem 0;font-size:0.95rem;font-weight:600;cursor:pointer;display:block;"
                                  >
                                    Trailer
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
                                  <div class="marvel-rating">
                                    ${movie.vote_average
                                      ? movie.vote_average.toFixed(1)
                                      : "TBD"}
                                  </div>
                                  <div class="marvel-overview">
                                    ${movie.overview ||
                                      "No description available."}
                                  </div>
                                </div>
                              </div>
                            `
                          : html`
                              <div class="marvel-card missing">
                                <div class="marvel-card-title">
                                  Missing Movie Data
                                </div>
                                <div class="marvel-overview">
                                  This MCU movie could not be loaded. Check
                                  backend/API.
                                </div>
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
