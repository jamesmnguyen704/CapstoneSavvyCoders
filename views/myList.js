// File: views/myList.js
// Purpose: "My List" page — now a tabbed surface combining the local watchlist
//          and the About / bio content on a single route.
// Notes:   Tab state lives in the URL (?tab=about). Clicking a tab swaps inner
//          content without leaving the route. Bookmark toggles + watchlist
//          change events still re-render the whole page from index.js.

import html from "html-literal";
import { listWatchlist } from "../services/watchlist.js";
import aboutMe from "./aboutMe.js";

// Escapes for both attribute and text contexts — saved titles originate from
// TMDB's community-edited data and land in innerHTML. `&` must go first or it
// would double-escape the entities added after it.
function escapeAttr(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
        <button class="trailer-btn" data-id="${item.id}">▶</button>
        <button class="info-btn" type="button" data-id="${item.id}" aria-label="More info">
          <i class="fa-solid fa-circle-info"></i>
        </button>
      </div>
    </div>
  `;
}

function getActiveTab() {
  if (typeof window === "undefined") return "list";
  const tab = new URLSearchParams(window.location.search).get("tab");
  if (tab === "list" || tab === "users" || tab === "bots") return tab;
  // Default (no ?tab= param, i.e. clicking "My List" in the nav) lands on
  // About first — the watchlist and admin panel are still one click away.
  return "about";
}

function tabBar(active, showAdmin) {
  return `
    <nav class="mylist-tabs" role="tablist" aria-label="My List sections">
      <button
        role="tab"
        type="button"
        class="mylist-tab ${active === "list" ? "mylist-tab--active" : ""}"
        data-tab="list"
        aria-selected="${active === "list"}"
      >
        <i class="fa-solid fa-bookmark"></i> My List
      </button>
      <button
        role="tab"
        type="button"
        class="mylist-tab ${active === "about" ? "mylist-tab--active" : ""}"
        data-tab="about"
        aria-selected="${active === "about"}"
      >
        <i class="fa-solid fa-user"></i> About
      </button>
      ${
        showAdmin
          ? `<button
              role="tab"
              type="button"
              class="mylist-tab ${active === "users" ? "mylist-tab--active" : ""}"
              data-tab="users"
              aria-selected="${active === "users"}"
            >
              <i class="fa-solid fa-lock"></i> Users
            </button>
            <button
              role="tab"
              type="button"
              class="mylist-tab ${active === "bots" ? "mylist-tab--active" : ""}"
              data-tab="bots"
              aria-selected="${active === "bots"}"
            >
              <i class="fa-solid fa-robot"></i> Bots
            </button>`
          : ""
      }
    </nav>
  `;
}

function usersPanel(users, { title, emptyLabel }) {
  const rows = users.length
    ? users
        .map(
          u => `
          <li class="admin-user-row">
            ${
              u.avatar
                ? `<img src="${u.avatar}" alt="${u.username}" loading="lazy" />`
                : `<span class="admin-user-avatar-fallback">${u.username.charAt(0).toUpperCase()}</span>`
            }
            <span class="admin-user-name">${u.username}</span>
            <span class="admin-user-moviecount" title="Movies commented on">🎬 ${u.movieCount || 0}</span>
            ${u.isCharacter ? `<span class="comment-character-badge">🎭 Character</span>` : `<span class="admin-user-real">Real user</span>`}
            <span class="admin-user-date">${new Date(u.createdAt).toLocaleDateString()}</span>
          </li>
        `
        )
        .join("")
    : `<li class="admin-user-row">${emptyLabel}</li>`;

  return `
    <header class="mylist-header">
      <div>
        <span class="news-kicker">Admin — Visible Only To You</span>
        <h1>${title}</h1>
        <p class="mylist-sub">${users.length} account${users.length === 1 ? "" : "s"} total.</p>
      </div>
    </header>
    <ul class="admin-user-list">${rows}</ul>
  `;
}

function listPanel() {
  const items = listWatchlist();
  const count = items.length;

  return `
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
  `;
}

export default state => {
  const adminUsers = Array.isArray(state.adminUsers) ? state.adminUsers : [];
  const realUsers = adminUsers.filter(u => !u.isCharacter);
  const botUsers = adminUsers.filter(u => u.isCharacter);
  const showAdmin = adminUsers.length > 0;
  const requested = getActiveTab();
  const active = (requested === "users" || requested === "bots") && !showAdmin ? "list" : requested;

  const panel =
    active === "about"
      ? aboutMe()
      : active === "users"
      ? usersPanel(realUsers, { title: "Real Users", emptyLabel: "No real users yet." })
      : active === "bots"
      ? usersPanel(botUsers, { title: "Character Bots", emptyLabel: "No bot accounts yet." })
      : listPanel();

  return html`
    <section class="mylist-page">
      ${tabBar(active, showAdmin)}
      <div class="mylist-panel" data-panel="${active}">
        ${panel}
      </div>
    </section>
  `;
};
