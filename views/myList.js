// File: views/myList.js
// Purpose: "My List" page — now a tabbed surface combining the local watchlist
//          and the About / bio content on a single route.
// Notes:   Tab state lives in the URL (?tab=about). Clicking a tab swaps inner
//          content without leaving the route. Bookmark toggles + watchlist
//          change events still re-render the whole page from index.js.

import html from "html-literal";
import { listWatchlist } from "../services/watchlist.js";
import aboutMe from "./aboutMe.js";
import { movieCard } from "./_cards";

// Watchlist items are a compact localStorage projection (id, title,
// poster_path, year, vote_average) — reshape to the {release_date} field
// movieCard() expects so this list renders the same card everyone else sees.
// The bookmark button itself needs no special "remove" variant: the click
// handler in index.js toggles on actual watchlist membership and
// syncBookmarkButtons() re-syncs the filled/outline state after every
// render, so the default movieCard() markup already ends up correct here.
function toCardMovie(item) {
  return { ...item, release_date: item.year ? `${item.year}-01-01` : "" };
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
              class="mylist-tab ${active === "bots" ? "mylist-tab--active" : ""}"
              data-tab="bots"
              aria-selected="${active === "bots"}"
            >
              <i class="fa-solid fa-robot"></i> Bots
            </button>
            <button
              role="tab"
              type="button"
              class="mylist-tab ${active === "users" ? "mylist-tab--active" : ""}"
              data-tab="users"
              aria-selected="${active === "users"}"
            >
              <i class="fa-solid fa-lock"></i> Users
            </button>`
          : ""
      }
      <button
        role="tab"
        type="button"
        class="mylist-tab ${active === "list" ? "mylist-tab--active" : ""}"
        data-tab="list"
        aria-selected="${active === "list"}"
      >
        <i class="fa-solid fa-bookmark"></i> My List
      </button>
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
        ? `<section class="movies-grid mylist-grid">${items.map(item => movieCard(toCardMovie(item))).join("")}</section>`
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
