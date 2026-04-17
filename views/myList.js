// File: views/myList.js
// Purpose: "My List" — user's local watchlist stored in localStorage.
// Notes: Renders whatever's in the watchlist service. A delegated click handler
//        in index.js handles the bookmark/remove toggle; re-rendering happens
//        in response to "watchlist:change" events.

import html from "html-literal";
import { listWatchlist } from "../services/watchlist.js";

function escapeAttr(s) {
  return String(s ?? "").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function card(item) {
  const rating =
    typeof item.vote_average === "number" && item.vote_average > 0
      ? item.vote_average.toFixed(1)
      : null;
  const year = item.year || "";

  return `
    <div class="movie-card" data-movie-id="${item.id}">
      <div class="movie-poster-wrap">
        ${
          item.poster_path
            ? `<img src="https://image.tmdb.org/t/p/w300${item.poster_path}" alt="${escapeAttr(item.title)}" loading="lazy" />`
            : `<div class="movie-poster-placeholder" aria-hidden="true">🎬</div>`
        }
        <div class="card-badges">
          ${year ? `<span class="card-badge card-badge--year">${year}</span>` : ""}
          ${rating ? `<span class="card-badge card-badge--rating">★ ${rating}</span>` : ""}
        </div>
        <button
          class="card-bookmark card-bookmark--active"
          type="button"
          aria-label="Remove from My List"
          data-movie='${escapeAttr(JSON.stringify({ id: item.id, title: item.title, poster_path: item.poster_path }))}'
          data-action="remove"
        >
          <i class="fa-solid fa-bookmark"></i>
        </button>
      </div>
      <h3>${escapeAttr(item.title)}</h3>
      <div class="card-actions">
        <button class="trailer-btn" data-id="${item.id}">▶ Trailer</button>
        <button class="info-btn" type="button" data-id="${item.id}" aria-label="More info">
          <i class="fa-solid fa-circle-info"></i>
        </button>
      </div>
    </div>
  `;
}

export default () => {
  const items = listWatchlist();
  const count = items.length;

  return html`
    <section class="mylist-page">
      <header class="mylist-header">
        <div>
          <span class="news-kicker">Your Collection</span>
          <h1>My List</h1>
          <p class="mylist-sub">
            ${
              count
                ? `${count} saved ${count === 1 ? "movie" : "movies"} — stored locally on this device.`
                : "Your watchlist is empty. Hit the bookmark on any movie to save it here."
            }
          </p>
        </div>
      </header>

      ${
        count
          ? `<section class="movies-grid mylist-grid">${items.map(card).join("")}</section>`
          : `
            <div class="mylist-empty">
              <div class="mylist-empty-icon" aria-hidden="true">
                <i class="fa-regular fa-bookmark"></i>
              </div>
              <h2>Nothing saved yet</h2>
              <p>Browse Home, Movies, or Marvel and tap the bookmark on any poster to build your list.</p>
              <a href="/" data-navigo class="auth-btn">Browse movies</a>
            </div>
          `
      }
    </section>
  `;
};
