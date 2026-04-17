// File: views/awards.js
// Purpose: Academy Awards — curated Best Picture nominees per ceremony with
//          a "Winner" badge and TMDB-enriched data (poster, rating, year).

import html from "html-literal";

function escapeAttr(s) {
  return String(s ?? "").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function nomineeCard(movie) {
  const year = (movie.release_date || "").slice(0, 4);
  const rating =
    typeof movie.vote_average === "number" && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : null;

  return `
    <div class="award-card ${movie.winner ? "award-card--winner" : ""}" data-movie-id="${movie.id}">
      <div class="movie-poster-wrap">
        ${
          movie.poster_path
            ? `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${escapeAttr(movie.title)}" loading="lazy" />`
            : `<div class="movie-poster-placeholder" aria-hidden="true">🎬</div>`
        }
        ${
          movie.winner
            ? `<span class="award-badge award-badge--winner"><i class="fa-solid fa-trophy"></i> Winner</span>`
            : `<span class="award-badge award-badge--nominee">Nominee</span>`
        }
        <div class="card-badges">
          ${year ? `<span class="card-badge card-badge--year">${year}</span>` : ""}
          ${rating ? `<span class="card-badge card-badge--rating">★ ${rating}</span>` : ""}
        </div>
        <button
          class="card-bookmark"
          type="button"
          aria-label="Add to My List"
          data-movie='${escapeAttr(JSON.stringify({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            vote_average: movie.vote_average
          }))}'
        >
          <i class="fa-regular fa-bookmark"></i>
        </button>
      </div>
      <h3 class="award-card-title">${escapeAttr(movie.title)}</h3>
      <div class="card-actions">
        <button class="trailer-btn" data-id="${movie.id}">▶ Trailer</button>
        <button class="info-btn" type="button" data-id="${movie.id}" aria-label="More info">
          <i class="fa-solid fa-circle-info"></i>
        </button>
      </div>
    </div>
  `;
}

function section(group) {
  const winner = group.nominees.find(n => n.winner);
  return `
    <section class="awards-section">
      <header class="awards-section-head">
        <div>
          <span class="awards-kicker">${escapeAttr(group.ceremony)}</span>
          <h2>Best Picture · <span class="awards-year">${group.forYear} films</span></h2>
        </div>
        ${
          winner
            ? `<div class="awards-winner-chip">
                 <i class="fa-solid fa-trophy"></i>
                 <span>${escapeAttr(winner.title)} took home the Oscar</span>
               </div>`
            : ""
        }
      </header>
      <div class="awards-grid">
        ${group.nominees.map(nomineeCard).join("")}
      </div>
    </section>
  `;
}

export default state => {
  const sections = Array.isArray(state.sections) ? state.sections : [];

  if (!sections.length) {
    return html`
      <section class="awards-page">
        <header class="awards-header">
          <span class="news-kicker">Cinemetrics Awards</span>
          <h1><i class="fa-solid fa-trophy"></i> Best Picture</h1>
          <p class="awards-subtitle">Loading recent Academy Award nominees…</p>
        </header>
      </section>
    `;
  }

  return html`
    <section class="awards-page">
      <header class="awards-header">
        <span class="news-kicker">Cinemetrics Awards</span>
        <h1><i class="fa-solid fa-trophy"></i> Best Picture</h1>
        <p class="awards-subtitle">
          Recent Academy Award Best Picture nominees — winner first, then the rest of the field.
        </p>
      </header>

      ${sections.map(section).join("")}
    </section>
  `;
};
