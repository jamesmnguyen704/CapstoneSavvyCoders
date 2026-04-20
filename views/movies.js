// File: views/movies.js
// Purpose: Merged Movies + Discover view — hero slider, community header,
//          filter bar (genre/year/rating/sort), and a live-updating grid.
// Notes:   `renderMoviesResults` is exported for in-place grid updates when
//          filters change, so inputs keep focus and the hero doesn't re-render.
import html from "html-literal";
import { escapeAttr, movieCard, skeletonCards } from "./_cards";

const SORT_OPTIONS = [
  { value: "popularity.desc",           label: "Most popular" },
  { value: "vote_average.desc",         label: "Highest rated" },
  { value: "primary_release_date.desc", label: "Newest" },
  { value: "primary_release_date.asc",  label: "Oldest" },
  { value: "revenue.desc",              label: "Biggest box office" }
];

export function renderMoviesResults(state) {
  const { results = [], loading = false, total_results = 0 } = state;
  const el = document.querySelector("#moviesResults");
  if (!el) return;
  if (loading) {
    el.innerHTML = skeletonCards();
    return;
  }
  if (!results.length) {
    el.innerHTML = `<p class="discover-empty">No movies match those filters — loosen something up.</p>`;
    return;
  }
  el.innerHTML = results.map(m => movieCard(m, { showComment: true })).join("");
  const count = document.querySelector("#moviesCount");
  if (count) {
    count.textContent = total_results
      ? `${total_results.toLocaleString()} movies`
      : `${results.length} shown`;
  }
}

export default function Movies(st) {
  const results = Array.isArray(st.results) ? st.results : [];
  const heroMovies = results.slice(0, 5);

  const genres = Array.isArray(st.genres) ? st.genres : [];
  const selected = Array.isArray(st.selectedGenres) ? st.selectedGenres : [];
  const sort = st.sort || "popularity.desc";
  const year = st.year || "";
  const minRating = st.minRating != null ? st.minRating : 0;

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
      opts.push(
        `<option value="${y}" ${String(y) === String(year) ? "selected" : ""}>${y}</option>`
      );
    }
    return opts.join("");
  })();

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
              <p>${escapeAttr(movie.overview || "")}</p>
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
            <h1>Cinemetrics Community</h1>
            <p>Rate, Review, and Discuss</p>
          </div>
        `}
    </section>

    <div class="movies-container">
      <section class="movies-header">
        <div>
          <h1>Cinemetrics Community: Rate, Review, and Discuss</h1>
          <p>Join the conversation — browse, filter, and pick your next watch.</p>
        </div>
        <div class="discover-count" id="moviesCount" aria-live="polite"></div>
      </section>

      <div class="discover-filters" id="moviesFilters">
        <div class="discover-filter-row">
          <span class="discover-filter-label">Genres</span>
          <div class="discover-chips">${genreChips}</div>
        </div>

        <div class="discover-filter-row discover-filter-row--inputs">
          <label class="discover-control">
            <span>Year</span>
            <select id="moviesYear">${yearOptions}</select>
          </label>

          <label class="discover-control">
            <span>Min rating: <b id="moviesRatingValue">${minRating || "0"}</b></span>
            <input
              type="range"
              id="moviesRating"
              min="0"
              max="9"
              step="0.5"
              value="${minRating}"
            />
          </label>

          <label class="discover-control">
            <span>Sort by</span>
            <select id="moviesSort">
              ${SORT_OPTIONS.map(
                o => `<option value="${o.value}" ${o.value === sort ? "selected" : ""}>${o.label}</option>`
              ).join("")}
            </select>
          </label>

          <button class="discover-reset" type="button" id="moviesReset">Reset</button>
        </div>
      </div>

      <div class="discover-grid" id="moviesResults">
        ${results.length
          ? results.map(m => movieCard(m, { showComment: true })).join("")
          : skeletonCards()}
      </div>
    </div>
  `;
}
