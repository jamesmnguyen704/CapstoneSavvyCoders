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

  // Take the 5 most recently released MCU movies for the Hero Banner.
  // First one is the cinematic lead; the rest become side thumbnails.
  const heroMovies = [...movies]
    .filter(m => m.release_date && new Date(m.release_date) <= new Date())
    .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
    .slice(0, 5);

  const leadMovie = heroMovies[0];
  const featuredThumbs = heroMovies.slice(1, 5);

  return html`
    <section class="marvel-hero-cinematic">
      ${leadMovie
        ? `
          <img
            class="marvel-hero-bg"
            src="https://image.tmdb.org/t/p/original${leadMovie.backdrop_path}"
            alt="${leadMovie.title} Backdrop"
            onerror="this.onerror=null; this.src='images/placeholder-poster.jpg'"
          />
          <div class="marvel-hero-scrim"></div>
          <div class="marvel-hero-body">
            <span class="marvel-hero-kicker">Marvel Cinematic Universe</span>
            <h1 class="marvel-hero-title">${leadMovie.title}</h1>
            <p class="marvel-hero-overview">${leadMovie.overview || ""}</p>
            <div class="marvel-hero-actions">
              <button class="trailer-btn hero-btn" data-id="${leadMovie.id}">▶ Watch Trailer</button>
              <button class="info-btn hero-info-btn" type="button" data-id="${leadMovie.id}">
                <i class="fa-solid fa-circle-info"></i> More Info
              </button>
            </div>
          </div>
          ${
            featuredThumbs.length
              ? `
            <aside class="marvel-hero-featured" aria-label="Featured MCU titles">
              ${featuredThumbs
                .map(
                  m => `
                <button class="marvel-hero-thumb trailer-btn" data-id="${m.id}" aria-label="Play ${m.title} trailer">
                  <img src="https://image.tmdb.org/t/p/w300${m.backdrop_path || m.poster_path}" alt="${m.title}" loading="lazy" />
                  <span class="marvel-hero-thumb-play"><i class="fa-solid fa-play"></i></span>
                  <span class="marvel-hero-thumb-caption">${m.title}</span>
                </button>
              `
                )
                .join("")}
            </aside>`
              : ""
          }
        `
        : `
          <div class="marvel-hero-body">
            <span class="marvel-hero-kicker">Marvel Cinematic Universe</span>
            <h1 class="marvel-hero-title">Complete MCU Timeline</h1>
            <p class="marvel-hero-overview">From Iron Man → Secret Wars.</p>
          </div>
        `}
    </section>

    <section class="marvel-container">
      <h1 class="marvel-title" style="margin-left: 1rem;">
        MCU Timeline (Chronological By Phase)
      </h1>
      ${Object.entries(phases)
        .map(
          ([phase, phaseMovies]) =>
            html`
              <h2 class="marvel-phase-title" style="margin-left: 1rem;">
                ${phase}
              </h2>
              <div
                class="movie-carousel"
                style="align-items: flex-start; margin-left: 1rem;"
              >
                ${phaseMovies.length
                  ? phaseMovies
                      .map(movie => {
                        if (!movie) {
                          return html`
                            <div class="marvel-card missing">
                              <div class="marvel-card-title">Missing Movie Data</div>
                            </div>
                          `;
                        }
                        const year = (movie.release_date || "").slice(0, 4);
                        const rating =
                          typeof movie.vote_average === "number" && movie.vote_average > 0
                            ? movie.vote_average.toFixed(1)
                            : null;
                        const movieJson = JSON.stringify({
                          id: movie.id,
                          title: movie.title,
                          poster_path: movie.poster_path || null,
                          release_date: movie.release_date || null,
                          vote_average: movie.vote_average || null
                        })
                          .replace(/"/g, "&quot;");
                        return html`
                          <div class="marvel-card" data-movie-id="${movie.id}">
                            <div class="movie-poster-wrap">
                              <img
                                class="marvel-poster"
                                src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
                                alt="${movie.title}"
                                loading="lazy"
                              />
                              <div class="card-badges">
                                ${year ? `<span class="card-badge card-badge--year">${year}</span>` : ""}
                                ${rating ? `<span class="card-badge card-badge--rating">★ ${rating}</span>` : ""}
                              </div>
                              <button
                                class="card-bookmark"
                                type="button"
                                aria-label="Add to My List"
                                data-movie='${movieJson}'
                              >
                                <i class="fa-regular fa-bookmark"></i>
                              </button>
                            </div>
                            <div class="marvel-info">
                              <div class="marvel-card-title">${movie.title}</div>
                              <div class="card-actions">
                                <button class="trailer-btn" data-id="${movie.id}">▶ Trailer</button>
                                <button class="info-btn" type="button" data-id="${movie.id}" aria-label="More info">
                                  <i class="fa-solid fa-circle-info"></i>
                                </button>
                              </div>
                              <div class="marvel-release">
                                ${movie.release_date
                                  ? new Date(movie.release_date).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric"
                                    })
                                  : "TBA"}
                              </div>
                            </div>
                          </div>
                        `;
                      })
                      .join("")
                  : `<p>No movies found for this phase.</p>`}
              </div>
            `
        )
        .join("")}
    </section>
  `;
};
