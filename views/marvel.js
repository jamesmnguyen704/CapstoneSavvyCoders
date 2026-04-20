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

// Cinematic lead + tagline per phase — drives the per-phase hero blocks.
const phaseMeta = {
  "Phase 1": {
    leadId: 24428,
    kicker: "Phase 1 · The Original Saga",
    tagline:
      "It all starts here — Iron Man, Cap, Thor, and Hulk assemble for the first time to repel Loki's invasion of New York."
  },
  "Phase 2": {
    leadId: 99861,
    kicker: "Phase 2 · Dark World & Winter Soldier",
    tagline:
      "The universe expands — Guardians of the Galaxy arrive, Winter Soldier cracks SHIELD, and Ultron rises."
  },
  "Phase 3": {
    leadId: 299534,
    kicker: "Phase 3 · The Infinity Saga Finale",
    tagline:
      "Civil War splinters the Avengers, Infinity War snaps half of them away, and Endgame brings them home."
  },
  "Phase 4": {
    leadId: 634649,
    kicker: "Phase 4 · The Multiverse Awakens",
    tagline:
      "Wanda unravels, Strange fractures reality, and three Spider-Men share a screen for the first time."
  },
  "Phase 5": {
    leadId: 533535,
    kicker: "Phase 5 · Variants & Vows",
    tagline:
      "Deadpool crashes the MCU, Thunderbolts* assembles, and the Multiverse war heats up ahead of Doomsday."
  }
};

function renderPhaseHero(phase, phaseMovies) {
  const meta = phaseMeta[phase];
  if (!meta) return "";
  const lead = phaseMovies.find(m => m && m.id === meta.leadId);
  if (!lead) return "";
  const backdrop = lead.backdrop_path
    ? `https://image.tmdb.org/t/p/original${lead.backdrop_path}`
    : "images/placeholder-poster.jpg";
  return `
    <section class="marvel-hero-cinematic marvel-phase-hero">
      <img
        class="marvel-hero-bg"
        src="${backdrop}"
        alt="${lead.title} Backdrop"
        onerror="this.onerror=null; this.src='images/placeholder-poster.jpg'"
      />
      <div class="marvel-hero-scrim"></div>
      <div class="marvel-hero-body">
        <span class="marvel-hero-kicker">${meta.kicker}</span>
        <h2 class="marvel-hero-title">${lead.title}</h2>
        <p class="marvel-hero-tagline">${meta.tagline}</p>
        <div class="marvel-hero-actions">
          <button class="trailer-btn hero-btn" data-id="${lead.id}">▶ Watch Trailer</button>
          <button class="info-btn hero-info-btn" type="button" data-id="${lead.id}">
            <i class="fa-solid fa-circle-info"></i> More Info
          </button>
        </div>
      </div>
    </section>
  `;
}

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

  // Cinematic lead: pin Avengers: Doomsday. We try a couple of candidate
  // TMDB IDs (the listing has wobbled as the film is still pre-release),
  // and if none are in the dataset we synthesize a minimal record so the
  // ensemble hero always lands.
  const DOOMSDAY_IDS = [1003596, 1061474, 1003598];
  const SYNTHETIC_DOOMSDAY = {
    id: 1003596,
    title: "Avengers: Doomsday",
    overview:
      "Doctor Doom rises as the Multiverse Saga's final threat — pulling every surviving hero, mutant, and First Family member into a war that will decide reality itself.",
    backdrop_path: null,
    poster_path: null,
    release_date: "2026-12-18",
    __doomsday: true
  };
  const foundDoomsday = movies.find(m => m && DOOMSDAY_IDS.includes(m.id));
  const leadIsDoomsday = true;
  const leadMovie = foundDoomsday
    ? { ...foundDoomsday, __doomsday: true }
    : SYNTHETIC_DOOMSDAY;
  const isDoomsday = leadIsDoomsday;

  const recentlyReleased = [...movies]
    .filter(m => m.release_date && new Date(m.release_date) <= new Date())
    .sort((a, b) => new Date(b.release_date) - new Date(a.release_date));

  // Side thumbs: most recent released MCU titles, excluding whatever is lead.
  const featuredThumbs = recentlyReleased
    .filter(m => !foundDoomsday || m.id !== foundDoomsday.id)
    .slice(0, 4);

  return html`
    <section class="marvel-hero-cinematic">
      ${leadMovie
        ? `
          <img
            class="marvel-hero-bg"
            src="${
              leadMovie.backdrop_path
                ? `https://image.tmdb.org/t/p/original${leadMovie.backdrop_path}`
                : "images/placeholder-poster.jpg"
            }"
            alt="${leadMovie.title} Backdrop"
            onerror="this.onerror=null; this.src='images/placeholder-poster.jpg'"
          />
          <div class="marvel-hero-scrim"></div>
          <div class="marvel-hero-body">
            <span class="marvel-hero-kicker">
              ${isDoomsday ? "Phase 6 · The Multiverse Saga Finale" : "Marvel Cinematic Universe"}
            </span>
            <h1 class="marvel-hero-title">${leadMovie.title}</h1>
            ${
              isDoomsday
                ? `<p class="marvel-hero-tagline">
                     The largest ensemble in MCU history — Avengers, X-Men, Fantastic Four and
                     Doctor Doom collide. Over <b>60 returning and new stars</b> assemble for
                     the Multiverse Saga's blackout event.
                   </p>
                   <div class="marvel-hero-stats">
                     <span class="marvel-hero-stat"><b>60+</b><span>Cast members</span></span>
                     <span class="marvel-hero-stat"><b>30+</b><span>Returning MCU heroes</span></span>
                     <span class="marvel-hero-stat"><b>Dec 2026</b><span>In theaters</span></span>
                   </div>`
                : `<p class="marvel-hero-overview">${leadMovie.overview || ""}</p>`
            }
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
                .map(m => {
                  const year = (m.release_date || "").slice(0, 4);
                  return `
                <button class="marvel-hero-thumb trailer-btn" data-id="${m.id}" data-info-id="${m.id}" aria-label="Play ${m.title} trailer">
                  <img src="https://image.tmdb.org/t/p/w500${m.backdrop_path || m.poster_path}" alt="${m.title}" loading="lazy" />
                  <div class="marvel-phase-thumb-badges">
                    ${year ? `<span class="card-badge card-badge--year">${year}</span>` : ""}
                  </div>
                  <span class="marvel-hero-thumb-caption">${m.title}</span>
                  <span class="marvel-hero-thumb-play"><i class="fa-solid fa-play"></i></span>
                </button>
              `;
                })
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
              ${phase === "Phase 6" ? "" : renderPhaseHero(phase, phaseMovies)}
              ${phase === "Phase 6"
                ? html`<h2 class="marvel-phase-title" style="margin-left: 1rem;">${phase}</h2>`
                : ""}
              <div class="marvel-phase-grid">
                ${phaseMovies.length
                  ? phaseMovies
                      .map(movie => {
                        if (!movie) {
                          return html`
                            <div class="marvel-phase-thumb missing">
                              <span class="marvel-phase-thumb-caption">Missing Movie Data</span>
                            </div>
                          `;
                        }
                        const year = (movie.release_date || "").slice(0, 4);
                        const movieJson = JSON.stringify({
                          id: movie.id,
                          title: movie.title,
                          poster_path: movie.poster_path || null,
                          release_date: movie.release_date || null,
                          vote_average: movie.vote_average || null
                        })
                          .replace(/"/g, "&quot;");
                        const artPath = movie.backdrop_path || movie.poster_path;
                        return html`
                          <div class="marvel-phase-thumb" data-movie-id="${movie.id}">
                            <button
                              class="marvel-phase-thumb-btn trailer-btn"
                              type="button"
                              data-id="${movie.id}"
                              data-info-id="${movie.id}"
                              aria-label="Play ${movie.title} trailer"
                            >
                              <img
                                src="https://image.tmdb.org/t/p/w500${artPath}"
                                alt="${movie.title}"
                                loading="lazy"
                              />
                              <div class="marvel-phase-thumb-badges">
                                ${year ? `<span class="card-badge card-badge--year">${year}</span>` : ""}
                              </div>
                              <span class="marvel-phase-thumb-caption">${movie.title}</span>
                              <span class="marvel-phase-thumb-play"><i class="fa-solid fa-play"></i></span>
                            </button>
                            <button
                              class="card-bookmark marvel-phase-thumb-bookmark"
                              type="button"
                              aria-label="Add to My List"
                              data-movie='${movieJson}'
                            >
                              <i class="fa-regular fa-bookmark"></i>
                            </button>
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
