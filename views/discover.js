// File: views/discover.js
// Purpose: Browse movies by filter (genre, year, min rating, sort order).
// Notes: Filter UI is rendered once; the results grid (#discoverResults) is
//        updated in place by a handler in index.js when the user changes a
//        filter, so inputs keep focus and don't re-render.

import html from "html-literal";

function escapeAttr(s) {
  return String(s ?? "").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function encodeMovie(movie) {
  return escapeAttr(
    JSON.stringify({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path || null,
      release_date: movie.release_date || null,
      vote_average: typeof movie.vote_average === "number" ? movie.vote_average : null
    })
  );
}

function movieCard(movie) {
  const year = (movie.release_date || "").slice(0, 4);
  const rating =
    typeof movie.vote_average === "number" && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : null;

  return `
    <div class="movie-card" data-movie-id="${movie.id}">
      <div class="movie-poster-wrap">
        <img
          src="https://image.tmdb.org/t/p/w300${movie.poster_path}"
          alt="${escapeAttr(movie.title)}"
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
          data-movie='${encodeMovie(movie)}'
        >
          <i class="fa-regular fa-bookmark"></i>
        </button>
      </div>
      <h3>${escapeAttr(movie.title)}</h3>
      <div class="card-actions">
        <button class="trailer-btn" data-id="${movie.id}">▶ Trailer</button>
        <button class="info-btn" type="button" data-id="${movie.id}" aria-label="More info">
          <i class="fa-solid fa-circle-info"></i>
        </button>
      </div>
    </div>
  `;
}

function skeletonRow(count = 12) {
  return Array.from({ length: count })
    .map(
      () => `
      <div class="movie-card skeleton-card">
        <div class="skeleton skeleton-poster"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line skeleton-line--short"></div>
      </div>
    `
    )
    .join("");
}

export function renderDiscoverResults(state) {
  const { results = [], loading = false, total_results = 0 } = state;
  const el = document.querySelector("#discoverResults");
  if (!el) return;
  if (loading) {
    el.innerHTML = skeletonRow();
    return;
  }
  if (!results.length) {
    el.innerHTML = `<p class="discover-empty">No movies match those filters — loosen something up.</p>`;
    return;
  }
  el.innerHTML = results.map(movieCard).join("");
  const count = document.querySelector("#discoverCount");
  if (count) {
    count.textContent = total_results
      ? `${total_results.toLocaleString()} movies`
      : `${results.length} shown`;
  }
}

const SORT_OPTIONS = [
  { value: "popularity.desc",            label: "Most popular" },
  { value: "vote_average.desc",          label: "Highest rated" },
  { value: "primary_release_date.desc",  label: "Newest" },
  { value: "primary_release_date.asc",   label: "Oldest" },
  { value: "revenue.desc",               label: "Biggest box office" }
];

export default state => {
  const genres = Array.isArray(state.genres) ? state.genres : [];
  const selected = Array.isArray(state.selectedGenres) ? state.selectedGenres : [];
  const sort = state.sort || "popularity.desc";
  const year = state.year || "";
  const minRating = state.minRating != null ? state.minRating : 0;

  const genreChips = genres
    .map(
      g => `
        <button
          class="discover-chip ${selected.includes(g.id) ? "discover-chip--active" : ""}"
          type="button"
          data-genre-id="${g.id}"
        >${escapeAttr(g.name)}</button>
      `
    )
    .join("");

  const yearOptions = (() => {
    const now = new Date().getFullYear();
    const opts = ['<option value="">Any year</option>'];
    for (let y = now + 1; y >= 1970; y--) {
      opts.push(`<option value="${y}" ${String(y) === String(year) ? "selected" : ""}>${y}</option>`);
    }
    return opts.join("");
  })();

  return html`
    <section class="discover-page">
      <header class="discover-header">
        <div>
          <span class="news-kicker">Discover</span>
          <h1>Browse by filter</h1>
          <p class="discover-sub">
            Dial in genres, year, rating, and order — the grid updates live.
          </p>
        </div>
        <div class="discover-count" id="discoverCount" aria-live="polite"></div>
      </header>

      <div class="discover-filters" id="discoverFilters">
        <div class="discover-filter-row">
          <span class="discover-filter-label">Genres</span>
          <div class="discover-chips">${genreChips}</div>
        </div>

        <div class="discover-filter-row discover-filter-row--inputs">
          <label class="discover-control">
            <span>Year</span>
            <select id="discoverYear">${yearOptions}</select>
          </label>

          <label class="discover-control">
            <span>Min rating: <b id="discoverRatingValue">${minRating || "0"}</b></span>
            <input
              type="range"
              id="discoverRating"
              min="0"
              max="9"
              step="0.5"
              value="${minRating}"
            />
          </label>

          <label class="discover-control">
            <span>Sort by</span>
            <select id="discoverSort">
              ${SORT_OPTIONS.map(
                o => `<option value="${o.value}" ${o.value === sort ? "selected" : ""}>${o.label}</option>`
              ).join("")}
            </select>
          </label>

          <button class="discover-reset" type="button" id="discoverReset">Reset</button>
        </div>
      </div>

      <div class="discover-grid" id="discoverResults">
        ${skeletonRow()}
      </div>
    </section>
  `;
};
