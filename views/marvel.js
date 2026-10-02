// File: views/marvel.js
// Purpose: Render the Marvel Cinematic Universe pages grouped by phase.
// Notes: Groups fetched MCU movies by hard-coded phase IDs and renders horizontal rows.
import html from "html-literal";
import placeholderPoster from "url:../Assets/images/placeholder-poster.jpg";

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

// One tile per film. Used inside each phase banner, and on its own for Phase 6
// (which has no banner of its own).
function phaseTiles(phaseMovies) {
  if (!phaseMovies.length) return `<p>No movies found for this phase.</p>`;

  return phaseMovies
    .map(movie => {
      if (!movie) {
        return `
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
      }).replace(/"/g, "&quot;");
      const artPath = movie.backdrop_path || movie.poster_path;
      return `
        <div class="marvel-phase-thumb" data-movie-id="${movie.id}">
          <button
            class="marvel-phase-thumb-btn trailer-btn"
            type="button"
            data-id="${movie.id}"
            data-info-id="${movie.id}"
            aria-label="Play ${escapeAttr(movie.title)} trailer"
          >
            <img src="${TMDB_IMG}/w500${artPath}" alt="${escapeAttr(movie.title)}" loading="lazy" />
            <div class="marvel-phase-thumb-badges">
              ${year ? `<span class="card-badge card-badge--year">${year}</span>` : ""}
            </div>
            <span class="marvel-phase-thumb-caption">${escapeAttr(movie.title)}</span>
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
    .join("");
}

// Each phase banner cycles through that phase's films — same crossfade as the
// Doomsday hero. The title and both buttons re-point to whichever film is
// showing, so the banner always acts on what you are looking at.
function renderPhaseHero(phase, phaseMovies) {
  const meta = phaseMeta[phase];
  if (!meta) return "";

  const withArt = phaseMovies.filter(m => m && m.backdrop_path);
  if (!withArt.length) return "";

  // Lead first, then the rest of the phase in release order.
  const lead = withArt.find(m => m.id === meta.leadId);
  const slides = lead ? [lead, ...withArt.filter(m => m.id !== lead.id)] : withArt;
  const first = slides[0];

  return `
    <section class="marvel-hero-cinematic marvel-phase-hero">
      <div class="doom-hero-slides" data-slideshow aria-hidden="true">
        ${slides
          .map(
            (m, i) => `
          <img
            class="doom-hero-slide${i === 0 ? " is-active" : ""}"
            src="${TMDB_IMG}/w1280${m.backdrop_path}"
            alt=""
            loading="lazy"
            data-title="${escapeAttr(m.title)}"
            data-movie-id="${m.id}"
          />`
          )
          .join("")}
      </div>
      <div class="marvel-hero-scrim"></div>
      <div class="marvel-hero-body">
        <span class="marvel-hero-kicker">${meta.kicker}</span>
        <h2 class="marvel-hero-title" data-slide-title>${escapeAttr(first.title)}</h2>
        <p class="marvel-hero-tagline">${meta.tagline}</p>
        <div class="marvel-hero-actions">
          <button class="trailer-btn hero-btn" data-slide-target data-id="${first.id}">▶ Watch Trailer</button>
          <button class="info-btn hero-info-btn" type="button" data-slide-target data-id="${first.id}">
            <i class="fa-solid fa-circle-info"></i> More Info
          </button>
        </div>
      </div>
      <aside class="marvel-phase-strip" aria-label="${escapeAttr(phase)} films">
        <div class="marvel-phase-rail">${phaseTiles(phaseMovies)}</div>
      </aside>
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

const TMDB_IMG = "https://image.tmdb.org/t/p";
// Doomsday headlines the hero, so it is excluded from the "also coming" strip.
const DOOMSDAY_ID = 1003596;

// Must escape angle brackets, not just quotes: these values are TMDB titles and
// overviews (community-editable) and land in innerHTML via html-literal, which
// does no escaping of its own.
function escapeAttr(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// "Victor von Doom  / Doctor Doom" → "Doctor Doom". TMDB doubles the spaces
// and lists the civilian name first; the hero name is what fans scan for.
function heroName(character) {
  const parts = String(character || "")
    .split("/")
    .map(s => s.trim())
    .filter(Boolean);
  return parts[parts.length - 1] || "";
}

function runtimeLabel(mins) {
  if (!mins) return null;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function releaseLabel(date) {
  if (!date) return null;
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

// The countdown renders its digits server-side-equivalent (at render time) so
// it is correct without JS; index.js then ticks it live.
function countdownBlock(releaseDate) {
  if (!releaseDate) return "";
  const target = new Date(`${releaseDate}T00:00:00`);
  const diff = target - new Date();
  const released = diff <= 0;
  const d = Math.max(0, Math.floor(diff / 86400000));
  const h = Math.max(0, Math.floor((diff % 86400000) / 3600000));
  const m = Math.max(0, Math.floor((diff % 3600000) / 60000));
  const s = Math.max(0, Math.floor((diff % 60000) / 1000));
  const pad = n => String(n).padStart(2, "0");

  if (released) {
    return `<div class="doom-countdown doom-countdown--out"><span class="doom-countdown-live">In theaters now</span></div>`;
  }

  return `
    <div class="doom-countdown" data-countdown="${releaseDate}" role="timer" aria-live="off">
      <span class="doom-countdown-label">Doomsday arrives in</span>
      <div class="doom-countdown-units">
        <span class="doom-unit"><b data-cd="days">${d}</b><span>days</span></span>
        <span class="doom-sep">:</span>
        <span class="doom-unit"><b data-cd="hours">${pad(h)}</b><span>hrs</span></span>
        <span class="doom-sep">:</span>
        <span class="doom-unit"><b data-cd="mins">${pad(m)}</b><span>min</span></span>
        <span class="doom-sep">:</span>
        <span class="doom-unit"><b data-cd="secs">${pad(s)}</b><span>sec</span></span>
      </div>
    </div>
  `;
}

// Rendered inside the hero banner rather than as its own section — the banner
// names the film, so the roster belongs with it.
function assembleWall(dd) {
  const cast = Array.isArray(dd.cast) ? dd.cast : [];
  if (!cast.length) return "";

  return `
    <aside class="doom-hero-cast" aria-label="Avengers: Doomsday cast">
      <div class="doom-cast-rail">
        ${cast
          .map(c => {
            const role = heroName(c.character);
            return `
            <button class="doom-cast-card" type="button" data-person-id="${c.id}" aria-label="${escapeAttr(c.name)}${role ? ` as ${escapeAttr(role)}` : ""}">
              <span class="doom-cast-art">
                <img src="${TMDB_IMG}/w185${c.profile_path}" alt="${escapeAttr(c.name)}" loading="lazy" />
              </span>
              ${role ? `<span class="doom-cast-role">${escapeAttr(role)}</span>` : ""}
              <span class="doom-cast-name">${escapeAttr(c.name)}</span>
            </button>
          `;
          })
          .join("")}
      </div>
    </aside>
  `;
}

function newsBlock(articles) {
  const list = Array.isArray(articles) ? articles.filter(a => a && a.title && a.url) : [];
  if (!list.length) return "";

  return `
    <section class="doom-news">
      <header class="doom-section-head">
        <span class="doom-kicker">The wire</span>
        <h2>Marvel headlines</h2>
      </header>
      <div class="doom-news-list">
        ${list
          .slice(0, 8)
          .map(a => {
            const when = a.publishedAt
              ? new Date(a.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric"
                })
              : "";
            return `
            <a class="doom-news-item" href="${escapeAttr(a.url)}" target="_blank" rel="noopener noreferrer">
              ${
                a.image
                  ? `<span class="doom-news-art"><img src="${escapeAttr(a.image)}" alt="" loading="lazy" /></span>`
                  : `<span class="doom-news-art doom-news-art--empty" aria-hidden="true"><i class="fa-solid fa-newspaper"></i></span>`
              }
              <span class="doom-news-body">
                <span class="doom-news-title">${escapeAttr(a.title)}</span>
                <span class="doom-news-meta">${escapeAttr(a.source || "")}${when ? ` · ${when}` : ""}</span>
              </span>
            </a>
          `;
          })
          .join("")}
      </div>
    </section>
  `;
}

export default state => {
  const movies = Array.isArray(state.marvel) ? state.marvel : [];
  const phases = groupMoviesByPhase(movies);

  // Doomsday comes from its own endpoint (full cast + real trailer key). Fall
  // back to the row inside the phase dataset if that call hasn't landed yet.
  const dd = state.doomsday || movies.find(m => m && m.id === 1003596) || null;

  const meta = dd
    ? [releaseLabel(dd.release_date), runtimeLabel(dd.runtime), dd.status].filter(Boolean)
    : [];

  return html`
    <section class="marvel-hero-cinematic doom-hero">
      ${dd
        ? `
          <img
            class="marvel-hero-bg doom-hero-bg"
            src="${
              dd.backdrop_path
                ? `${TMDB_IMG}/original${dd.backdrop_path}`
                : placeholderPoster
            }"
            alt="${escapeAttr(dd.title)} backdrop"
            onerror="this.onerror=null; this.src='${placeholderPoster}'"
          />
          ${
            Array.isArray(dd.backdrops) && dd.backdrops.length > 1
              ? `<div class="doom-hero-slides" data-slideshow aria-hidden="true">
                   ${dd.backdrops
                     .map(
                       (p, i) =>
                         `<img class="doom-hero-slide${i === 0 ? " is-active" : ""}" src="${TMDB_IMG}/w1280${p}" alt="" loading="${i < 2 ? "eager" : "lazy"}" />`
                     )
                     .join("")}
                 </div>`
              : ""
          }
          <div class="marvel-hero-scrim doom-hero-scrim"></div>
          <div class="marvel-hero-body doom-hero-body">
            <span class="marvel-hero-kicker doom-hero-kicker">Phase 6 · The Multiverse Saga Finale</span>
            <h1 class="marvel-hero-title doom-hero-title">${escapeAttr(dd.title)}</h1>
            ${
              meta.length
                ? `<p class="doom-hero-meta">${meta.map(m => `<span>${escapeAttr(m)}</span>`).join("")}</p>`
                : ""
            }
            ${countdownBlock(dd.release_date)}
            ${dd.overview ? `<p class="marvel-hero-tagline doom-hero-overview">${escapeAttr(dd.overview)}</p>` : ""}
            <div class="marvel-hero-actions">
              <button class="trailer-btn hero-btn" data-id="${dd.id}">▶ Watch Trailer</button>
              <button class="info-btn hero-info-btn" type="button" data-id="${dd.id}">
                <i class="fa-solid fa-circle-info"></i> More Info
              </button>
            </div>
          </div>
        `
        : `
          <div class="marvel-hero-body">
            <span class="marvel-hero-kicker">Marvel Cinematic Universe</span>
            <h1 class="marvel-hero-title">Complete MCU Timeline</h1>
            <p class="marvel-hero-overview">From Iron Man → Secret Wars.</p>
          </div>
        `}
      ${dd ? assembleWall(dd) : ""}
    </section>

    ${newsBlock(state.news)}

    <section class="marvel-container">
      <h1 class="marvel-title" style="margin-left: 1rem;">
        MCU Timeline (Newest Phase First)
      </h1>
      ${Object.entries(phases)
        // Newest first: the hero opens on Phase 6, so the timeline counts back
        // from there to Phase 1 rather than climbing toward what you just read.
        .reverse()
        .map(
          ([phase, phaseMovies]) =>
            html`
              ${
                // Phases 1-5 carry their own banner with the films pinned
                // inside it. Phase 6 has no banner, so it keeps a plain
                // heading and grid.
                phase === "Phase 6"
                  ? html`
                      <h2 class="marvel-phase-title" style="margin-left: 1rem;">${phase}</h2>
                      <div class="marvel-phase-grid">${phaseTiles(phaseMovies)}</div>
                    `
                  : renderPhaseHero(phase, phaseMovies)
              }
            `
        )
        .join("")}
    </section>
  `;
};
