// File: views/releases.js
// Purpose: Upcoming Releases — curated 2026 / 2027 picks plus a live
//          "Most Anticipated" row pulled from TMDB /discover so the page
//          stays fresh even as curated dates roll by.
// Notes: Past-dated movies are filtered server-side before they reach here.

import html from "html-literal";

function formatDate(iso) {
  if (!iso) return "TBA";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return "TBA";
  }
}

function releaseCard(movie) {
  const releaseDate = movie.customDate || movie.release_date || "";
  const year = releaseDate ? String(releaseDate).slice(0, 4) : "";
  const rating =
    typeof movie.vote_average === "number" && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : null;

  return `
    <div class="release-card" data-movie-id="${movie.id}">
      <div class="release-poster">
        <img
          src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
          alt="${movie.title} Poster"
          loading="lazy"
        />
        ${
          releaseDate
            ? `<div class="release-overlay">
                 <span class="release-date">${formatDate(releaseDate)}</span>
               </div>`
            : ""
        }
        <div class="card-badges">
          ${year ? `<span class="card-badge card-badge--year">${year}</span>` : ""}
          ${rating ? `<span class="card-badge card-badge--rating">★ ${rating}</span>` : ""}
        </div>
        <button
          class="card-bookmark"
          type="button"
          aria-label="Add to My List"
          data-movie='${encodeCardMovie(movie)}'
        >
          <i class="fa-regular fa-bookmark"></i>
        </button>
      </div>

      <div class="release-info">
        <h3 class="release-title">${escapeAttr(movie.title || "")}</h3>
        <div class="card-actions">
          <button class="trailer-btn" data-id="${movie.id}">▶ Trailer</button>
          <button class="info-btn" type="button" data-id="${movie.id}" aria-label="More info">
            <i class="fa-solid fa-circle-info"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

function escapeAttr(s) {
  return String(s).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function encodeCardMovie(movie) {
  return escapeAttr(
    JSON.stringify({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path || null,
      release_date: movie.release_date || movie.customDate || null,
      vote_average: typeof movie.vote_average === "number" ? movie.vote_average : null
    })
  );
}

const cardRow = movies => (movies || []).map(releaseCard).join("");

export default st => {
  const movies2026 = (st.movies2026 || []).slice();
  const movies2027 = (st.movies2027 || []).slice();
  const popular = (st.popular || []).slice();

  const heroPool = [...movies2026, ...movies2027, ...popular].filter(m => m.backdrop_path || m.poster_path);
  const heroMovies = heroPool.slice(0, Math.min(5, heroPool.length));

  return html`
    <section class="hero-slider-container">
      ${heroMovies.length > 0
        ? heroMovies
            .map(
              movie => `
          <div class="hero-slide">
            <img
              class="hero-backdrop"
              src="https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}"
              alt="${escapeAttr(movie.title)} Backdrop"
              onerror="this.onerror=null; this.src='images/placeholder-poster.jpg'"
            />
            <div class="hero-content">
              <h1>${escapeAttr(movie.title)}</h1>
              <p>Releasing: ${formatDate(movie.customDate || movie.release_date)}</p>
              <div class="hero-actions">
                <button class="trailer-btn hero-btn" data-id="${movie.id}">▶ Watch Trailer</button>
                <button class="info-btn hero-info-btn" type="button" data-id="${movie.id}">
                  <i class="fa-solid fa-circle-info"></i> More Info
                </button>
              </div>
            </div>
          </div>
        `
            )
            .join("")
        : `
          <div class="hero-content">
            <h1>Upcoming Releases</h1>
            <p>Discover the biggest movies hitting theaters soon.</p>
          </div>
        `}
    </section>

    <div class="releases-container">
      <section class="releases-header">
        <h1>My most anticipated movies</h1>
        <p>Hand-picked releases for 2026 and 2027 — past dates drop off automatically.</p>
      </section>

      ${
        popular.length
          ? `
            <h2 class="year-title">
              <i class="fa-solid fa-fire"></i> Most Anticipated
              <span class="year-title-sub">Top upcoming on TMDB</span>
            </h2>
            <section class="movie-carousel">${cardRow(popular)}</section>
          `
          : ""
      }

      ${
        movies2026.length
          ? `
            <h2 class="year-title">⭐ 2026 Releases</h2>
            <section class="movie-carousel">${cardRow(movies2026)}</section>
          `
          : ""
      }

      ${
        movies2027.length
          ? `
            <h2 class="year-title">⭐ 2027 Releases</h2>
            <section class="movie-carousel">${cardRow(movies2027)}</section>
          `
          : ""
      }

      ${
        !popular.length && !movies2026.length && !movies2027.length
          ? `<p class="releases-empty">No upcoming titles right now — check back soon.</p>`
          : ""
      }
    </div>
  `;
};
