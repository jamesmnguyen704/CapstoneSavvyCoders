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

function ceremonyAnchor(group) {
  return `ceremony-${group.year}`;
}

function winnersHall(sections) {
  const winners = sections
    .map(s => ({ ...s.nominees.find(n => n.winner), ceremony: s.ceremony, forYear: s.forYear }))
    .filter(w => w && w.id);
  if (!winners.length) return "";
  return `
    <section class="awards-winners-hall">
      <header class="awards-winners-hall-head">
        <span class="awards-kicker">Winners' Hall</span>
        <h2>Best Picture, year by year</h2>
      </header>
      <div class="awards-winners-row">
        ${winners
          .map(
            w => `
          <a class="awards-winner-tile" href="#${ceremonyAnchor({ year: w.forYear + 1 })}">
            <span class="awards-winner-tile-art">
              ${
                w.poster_path
                  ? `<img src="https://image.tmdb.org/t/p/w500${w.poster_path}" alt="${escapeAttr(w.title)}" loading="lazy" />`
                  : `<span class="movie-poster-placeholder" aria-hidden="true">🏆</span>`
              }
              <span class="awards-winner-tile-badge">
                <i class="fa-solid fa-trophy"></i> ${w.forYear}
              </span>
            </span>
            <span class="awards-winner-tile-title">${escapeAttr(w.title)}</span>
            <span class="awards-winner-tile-cer">${escapeAttr(w.ceremony)}</span>
          </a>
        `
          )
          .join("")}
      </div>
    </section>
  `;
}

function ceremonyJumps(sections) {
  if (!sections.length) return "";
  return `
    <nav class="awards-jumps" aria-label="Jump to ceremony">
      ${sections
        .map(
          s => `<a class="awards-jump" href="#${ceremonyAnchor(s)}">${escapeAttr(s.forYear)}</a>`
        )
        .join("")}
    </nav>
  `;
}

function section(group) {
  const winner = group.nominees.find(n => n.winner);
  return `
    <section class="awards-section" id="${ceremonyAnchor(group)}">
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

  const totalNominees = sections.reduce((n, s) => n + s.nominees.length, 0);
  const ceremonies = sections.length;

  return html`
    <section class="awards-page">
      <header class="awards-header">
        <span class="news-kicker">Cinemetrics Awards</span>
        <h1><i class="fa-solid fa-trophy"></i> Best Picture</h1>
        <p class="awards-subtitle">
          Recent Academy Award Best Picture nominees — winner first, then the rest of the field.
        </p>
        <ul class="awards-stats" aria-label="Awards stats">
          <li><b>${ceremonies}</b><span>Ceremonies tracked</span></li>
          <li><b>${totalNominees}</b><span>Total nominees</span></li>
          <li><b>${sections.filter(s => s.nominees.some(n => n.winner)).length}</b><span>Best Picture winners</span></li>
        </ul>
      </header>

      ${ceremonyJumps(sections)}
      ${winnersHall(sections)}
      ${sections.map(section).join("")}
    </section>
  `;
};
