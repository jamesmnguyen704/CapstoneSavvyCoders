// File: views/_cards.js
// Purpose: Shared card helpers used by Movies / Home / other grids.
import html from "html-literal";

// Escapes for both attribute and text contexts — TMDB titles and overviews are
// community-edited, so they reach us as untrusted HTML and land in innerHTML.
// `&` must go first or it would double-escape the entities added after it.
export function escapeAttr(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function encodeMovie(movie) {
  return escapeAttr(
    JSON.stringify({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path || null,
      release_date: movie.release_date || null,
      vote_average:
        typeof movie.vote_average === "number" ? movie.vote_average : null
    })
  );
}

// "Where to watch" badge — a small provider logo next to the rating, JustWatch
// style. `movie.availability` is undefined until the backend's batched
// lookup covers that movie, so this renders nothing in the meantime rather
// than a placeholder. Streaming shows the provider's logo; theaters (no
// per-provider logo) shows a small film-reel icon instead.
export function availabilityIcon(movie) {
  const a = movie.availability;
  if (!a || !a.type) return "";
  if (a.type === "theaters") {
    return `<i class="fa-solid fa-film card-avail-icon" title="${escapeAttr(a.label || "Playing in theaters")}" aria-hidden="true"></i>`;
  }
  if (a.logo) {
    return `<img class="card-avail-logo" src="${a.logo}" alt="${escapeAttr(a.provider || a.label || "")}" loading="lazy" />`;
  }
  return "";
}

// Universal card layout: rating/info/trailer/comment-count overlay the
// poster (same corners on every page — Theaters pioneered this look), and
// only the title + bookmark sit below it. commentCount is populated by the
// router for some pages and not others yet; the badge just hides at 0.
// `dateLabel` is for Upcoming/Releases — a formatted date string shown under
// the title instead of over the poster, so it doesn't collide with the
// trailer button now sitting bottom-left of the poster.
export function movieCard(movie, { dateLabel = null } = {}) {
  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Image";
  const rating =
    typeof movie.vote_average === "number" && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : null;
  const commentCount =
    typeof movie.commentCount === "number" ? movie.commentCount : 0;

  return html`
    <div class="movie-card" data-movie-id="${movie.id}">
      <div class="movie-poster-wrap">
        <img
          src="${poster}"
          alt="${escapeAttr(movie.title)}"
          class="movie-poster"
          loading="lazy"
        />
        <div class="card-top-left">
          ${rating ? `<span class="card-rating">★ ${rating}</span>` : ""}
          ${availabilityIcon(movie)}
        </div>
        <button class="info-btn" type="button" data-id="${movie.id}" aria-label="More info">
          <i class="fa-solid fa-circle-info"></i>
        </button>
        <button class="trailer-btn card-trailer" data-id="${movie.id}" aria-label="Watch trailer">
          <i class="fa-solid fa-play"></i>
        </button>
        ${commentCount > 0
          ? `<button
               class="comment-btn card-comments"
               data-movieid="${movie.id}"
               aria-label="${commentCount} comment${commentCount === 1 ? "" : "s"}"
             >
               <i class="fa-regular fa-comment"></i> ${commentCount}
             </button>`
          : ""}
      </div>

      <div class="movie-card-meta">
        <h3 class="movie-title">${escapeAttr(movie.title)}</h3>
        ${dateLabel ? `<span class="movie-card-date">${escapeAttr(dateLabel)}</span>` : ""}
        <button
          class="card-bookmark card-bookmark--inline"
          type="button"
          aria-label="Add to My List"
          data-movie='${encodeMovie(movie)}'
        >
          <i class="fa-regular fa-bookmark"></i>
        </button>
      </div>
    </div>
  `;
}

export function skeletonCards(count = 12) {
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
