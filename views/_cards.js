// File: views/_cards.js
// Purpose: Shared card helpers used by Movies / Home / other grids.
import html from "html-literal";

export function escapeAttr(s) {
  return String(s ?? "")
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

export function movieCard(movie, { showComment = false } = {}) {
  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Image";
  const year = (movie.release_date || "").slice(0, 4);
  const rating =
    typeof movie.vote_average === "number" && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : null;

  return html`
    <div class="movie-card" data-movie-id="${movie.id}">
      <div class="movie-poster-wrap">
        <img
          src="${poster}"
          alt="${escapeAttr(movie.title)}"
          class="movie-poster"
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

      <h3 class="movie-title">${escapeAttr(movie.title)}</h3>

      <div class="card-actions">
        <button class="trailer-btn" data-id="${movie.id}">▶ Trailer</button>
        <button class="info-btn" type="button" data-id="${movie.id}" aria-label="More info">
          <i class="fa-solid fa-circle-info"></i>
        </button>
        ${showComment
          ? `<button class="comment-btn" data-movieid="${movie.id}" aria-label="Comments">
               <i class="fa-regular fa-comment"></i>
             </button>`
          : ""}
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
