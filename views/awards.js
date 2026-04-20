// File: views/awards.js
// Purpose: Academy Awards — curated nominees across Best Picture + the four
//          major acting categories + Best Director, grouped by ceremony.
// Notes:   Category tab bar swaps the visible sections. Film categories render
//          movie posters (same card shape as before). Person categories render
//          headshots with role + film metadata underneath.

import html from "html-literal";

const CATEGORY_TABS = [
  { key: "bestPicture",       label: "Best Picture",         icon: "fa-trophy" },
  { key: "bestDirector",      label: "Best Director",        icon: "fa-clapperboard" },
  { key: "bestActor",         label: "Best Actor",           icon: "fa-user-tie" },
  { key: "bestActress",       label: "Best Actress",         icon: "fa-star" },
  { key: "supportingActor",   label: "Supporting Actor",     icon: "fa-user-group" },
  { key: "supportingActress", label: "Supporting Actress",   icon: "fa-user-group" }
];

function escapeAttr(s) {
  return String(s ?? "").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function filmNomineeCard(movie) {
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

function personNomineeCard(nom) {
  const film = nom.film || {};
  return `
    <div class="award-card award-card--person ${nom.winner ? "award-card--winner" : ""}" data-person-id="${nom.personId}">
      <div class="award-person-art">
        ${
          nom.profile_path
            ? `<img src="https://image.tmdb.org/t/p/w300${nom.profile_path}" alt="${escapeAttr(nom.name)}" loading="lazy" />`
            : `<div class="movie-poster-placeholder" aria-hidden="true">🎭</div>`
        }
        ${
          nom.winner
            ? `<span class="award-badge award-badge--winner"><i class="fa-solid fa-trophy"></i> Winner</span>`
            : `<span class="award-badge award-badge--nominee">Nominee</span>`
        }
      </div>
      <div class="award-person-body">
        <h3 class="award-card-title">${escapeAttr(nom.name)}</h3>
        ${nom.role ? `<p class="award-person-role">as ${escapeAttr(nom.role)}</p>` : ""}
        <p class="award-person-film">
          <i class="fa-solid fa-film"></i> ${escapeAttr(film.title || "")}
        </p>
        ${
          film.id
            ? `<div class="card-actions">
                 <button class="trailer-btn" data-id="${film.id}">▶ Trailer</button>
                 <button class="info-btn" type="button" data-id="${film.id}" aria-label="More info">
                   <i class="fa-solid fa-circle-info"></i>
                 </button>
               </div>`
            : ""
        }
      </div>
    </div>
  `;
}

function ceremonyAnchor(group) {
  return `ceremony-${group.year}`;
}

function winnersHall(sections, categoryKey) {
  const isPersonCat = categoryKey !== "bestPicture";
  const winners = sections
    .map(s => ({ ...s.nominees.find(n => n.winner), ceremony: s.ceremony, forYear: s.forYear }))
    .filter(w => w && (w.id || w.personId));
  if (!winners.length) return "";

  return `
    <section class="awards-winners-hall">
      <header class="awards-winners-hall-head">
        <span class="awards-kicker">Winners' Hall</span>
        <h2>${isPersonCat ? "The winners, year by year" : "Best Picture, year by year"}</h2>
      </header>
      <div class="awards-winners-row">
        ${winners
          .map(w => {
            const art = isPersonCat
              ? w.profile_path
                ? `<img src="https://image.tmdb.org/t/p/w300${w.profile_path}" alt="${escapeAttr(w.name)}" loading="lazy" />`
                : `<span class="movie-poster-placeholder" aria-hidden="true">🏆</span>`
              : w.poster_path
                ? `<img src="https://image.tmdb.org/t/p/w500${w.poster_path}" alt="${escapeAttr(w.title)}" loading="lazy" />`
                : `<span class="movie-poster-placeholder" aria-hidden="true">🏆</span>`;
            const title = isPersonCat ? w.name : w.title;
            return `
              <a class="awards-winner-tile" href="#${ceremonyAnchor({ year: w.forYear + 1 })}">
                <span class="awards-winner-tile-art">
                  ${art}
                  <span class="awards-winner-tile-badge">
                    <i class="fa-solid fa-trophy"></i> ${w.forYear}
                  </span>
                </span>
                <span class="awards-winner-tile-title">${escapeAttr(title || "")}</span>
                <span class="awards-winner-tile-cer">${escapeAttr(w.ceremony)}</span>
              </a>
            `;
          })
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
        .map(s => `<a class="awards-jump" href="#${ceremonyAnchor(s)}">${escapeAttr(s.forYear)}</a>`)
        .join("")}
    </nav>
  `;
}

function section(group, categoryKey) {
  const isPersonCat = categoryKey !== "bestPicture";
  const winner = group.nominees.find(n => n.winner);
  const winnerChip = winner
    ? `<div class="awards-winner-chip">
         <i class="fa-solid fa-trophy"></i>
         <span>${escapeAttr(isPersonCat ? winner.name : winner.title)} took home the Oscar</span>
       </div>`
    : "";

  return `
    <section class="awards-section" id="${ceremonyAnchor(group)}">
      <header class="awards-section-head">
        <div>
          <span class="awards-kicker">${escapeAttr(group.ceremony)}</span>
          <h2>
            ${categoryLabel(categoryKey)}
            · <span class="awards-year">${group.forYear} films</span>
          </h2>
        </div>
        ${winnerChip}
      </header>
      <div class="awards-grid ${isPersonCat ? "awards-grid--person" : ""}">
        ${group.nominees.map(n => (isPersonCat ? personNomineeCard(n) : filmNomineeCard(n))).join("")}
      </div>
    </section>
  `;
}

function categoryLabel(key) {
  const m = CATEGORY_TABS.find(t => t.key === key);
  return m ? m.label : "Best Picture";
}

function categoryTabs(activeKey, categories) {
  return `
    <nav class="awards-cat-tabs" role="tablist" aria-label="Oscar categories">
      ${CATEGORY_TABS.map(t => {
        const count = (categories[t.key] || []).length;
        const disabled = count === 0;
        return `
          <button
            type="button"
            role="tab"
            class="awards-cat-tab ${activeKey === t.key ? "awards-cat-tab--active" : ""}"
            data-category="${t.key}"
            aria-selected="${activeKey === t.key}"
            ${disabled ? "disabled" : ""}
          >
            <i class="fa-solid ${t.icon}"></i>
            <span>${t.label}</span>
          </button>
        `;
      }).join("")}
    </nav>
  `;
}

export default state => {
  const categories = state.categories || {};
  const activeKey = state.activeCategory || "bestPicture";
  const sections = Array.isArray(state.sections) ? state.sections : (categories[activeKey] || []);

  if (!sections.length) {
    return html`
      <section class="awards-page">
        <header class="awards-header">
          <span class="news-kicker">Cinemetrics Awards</span>
          <h1><i class="fa-solid fa-trophy"></i> ${categoryLabel(activeKey)}</h1>
          <p class="awards-subtitle">Loading recent Academy Award nominees…</p>
        </header>
        ${categoryTabs(activeKey, categories)}
      </section>
    `;
  }

  const totalNominees = sections.reduce((n, s) => n + s.nominees.length, 0);
  const ceremonies = sections.length;
  const winnerCount = sections.filter(s => s.nominees.some(n => n.winner)).length;

  return html`
    <section class="awards-page">
      <header class="awards-header">
        <span class="news-kicker">Cinemetrics Awards</span>
        <h1><i class="fa-solid fa-trophy"></i> The Oscars</h1>
        <p class="awards-subtitle">
          Recent Academy Award nominees across Best Picture and the major
          acting &amp; directing categories — winners first, then the field.
        </p>
        <ul class="awards-stats" aria-label="Awards stats">
          <li><b>${ceremonies}</b><span>Ceremonies tracked</span></li>
          <li><b>${totalNominees}</b><span>${activeKey === "bestPicture" ? "Total nominees" : "Nominations"}</span></li>
          <li><b>${winnerCount}</b><span>Winners</span></li>
        </ul>
      </header>

      ${categoryTabs(activeKey, categories)}
      ${ceremonyJumps(sections)}
      ${winnersHall(sections, activeKey)}
      ${sections.map(s => section(s, activeKey)).join("")}
    </section>
  `;
};
