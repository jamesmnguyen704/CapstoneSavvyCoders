// File: views/games.js
// Purpose: "The Library" — James's game collection, filterable by platform,
//          with local cover art and cross-links to screen adaptations.
// Notes:
//   - Library data is static (views/_gamesData.js); this view only reads it.
//   - Titles with a film/TV adaptation get a "Watch the adaptation" chip that
//     opens the existing movie search, tying the page into the rest of the app.
import html from "html-literal";
import { GAMES, PLATFORMS, RIGS } from "./_gamesData";
import { gameCoverUrl, assetUrl } from "../services/api";

function escapeAttr(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Games in the library that have a film or TV adaptation on TMDB. The value is
// the search term the adaptation is most findable under.
const ADAPTATIONS = {
  "The Last of Us Part I": "The Last of Us",
  "The Last of Us Part II Remastered": "The Last of Us",
  "Ghost of Tsushima": "Ghost of Tsushima",
  "Cyberpunk 2077 (Ultimate Edition)": "Cyberpunk Edgerunners",
  "The Witcher 3: Wild Hunt": "The Witcher",
  "Resident Evil Biohazard (Gold Edition)": "Resident Evil",
  "Resident Evil 2": "Resident Evil",
  "Resident Evil Village": "Resident Evil",
  "Resident Evil Requiem": "Resident Evil",
  "God of War (2018)": "God of War",
  "Marvel's Spider-Man 2": "Spider-Man",
  "Marvel's Spider-Man: Miles Morales": "Spider-Man: Into the Spider-Verse",
  "Marvel Rivals": "Avengers",
  "Fortnite": "Fortnite",
  "Red Dead Redemption": "Red Dead Redemption",
  "Batman: Arkham Asylum": "Batman",
  "Mortal Kombat 1": "Mortal Kombat",
  "It Takes Two": "It Takes Two"
};

function platformBadges(platforms) {
  return platforms
    .map(
      p =>
        `<span class="game-badge" data-platform="${escapeAttr(p)}">${escapeAttr(
          PLATFORMS[p] || p
        )}</span>`
    )
    .join("");
}

function gameCard(game) {
  const cover = gameCoverUrl(game.cover);
  const adaptation = ADAPTATIONS[game.title];
  const note = game.notes ? Object.values(game.notes)[0] : "";

  return `
    <article class="game-card${game.recalled ? " game-card--recalled" : ""}">
      <div class="game-cover-wrap">
        ${
          cover
            ? `<img class="game-cover" src="${escapeAttr(cover)}" alt="${escapeAttr(
                game.title
              )}" loading="lazy" />`
            : `<div class="game-cover game-cover--placeholder" aria-hidden="true">🎮</div>`
        }
        ${game.recalled ? `<span class="game-flag">From memory</span>` : ""}
      </div>
      <div class="game-body">
        <h3 class="game-title">${escapeAttr(game.title)}</h3>
        <div class="game-badges">${platformBadges(game.platforms)}</div>
        ${note ? `<p class="game-note">${escapeAttr(note)}</p>` : ""}
        ${
          adaptation
            ? `<button class="game-adapt" type="button" data-adaptation="${escapeAttr(
                adaptation
              )}">▶ Watch the adaptation</button>`
            : ""
        }
      </div>
    </article>
  `;
}

function filterChips(active) {
  const counts = { all: GAMES.length };
  for (const key of Object.keys(PLATFORMS)) {
    counts[key] = GAMES.filter(g => g.platforms.includes(key)).length;
  }

  const chips = [{ key: "all", label: "All" }].concat(
    Object.entries(PLATFORMS).map(([key, label]) => ({ key, label }))
  );

  return chips
    .map(
      c => `
      <button
        type="button"
        class="game-chip${c.key === active ? " game-chip--active" : ""}"
        data-game-platform="${c.key}"
      >${escapeAttr(c.label)} <span class="game-chip-count">${counts[c.key] || 0}</span></button>`
    )
    .join("");
}

// The rigs tree: one card per machine, with what's played on it.
function rigCard(rig) {
  const owned = GAMES.filter(g => g.platforms.some(p => rig.platforms.includes(p)));
  const featured = owned.filter(g => g.featured);
  const art = owned.filter(g => g.cover).slice(0, 8);

  return `
    <article class="rig" style="--rig-accent:${rig.accent}">
      <header class="rig-head">
        <img class="rig-logo" src="${escapeAttr(assetUrl(`console-logos/${rig.logo}`))}" alt="${escapeAttr(rig.name)}" loading="lazy" />
        <div>
          <h3 class="rig-name">${escapeAttr(rig.name)}</h3>
          <span class="rig-count">${featured.length} featured · ${owned.length} owned</span>
        </div>
      </header>
      <div class="rig-services">
        ${rig.services.map(s => `<span class="rig-service">${escapeAttr(s)}</span>`).join("")}
      </div>
      <div class="rig-covers">
        ${art
          .map(
            g => `<img class="rig-cover" src="${escapeAttr(gameCoverUrl(g.cover))}" alt="${escapeAttr(g.title)}" title="${escapeAttr(g.title)}" loading="lazy" />`
          )
          .join("")}
      </div>
      <button class="rig-filter" type="button" data-game-platform="${escapeAttr(rig.platforms[0])}">
        See all ${owned.length} →
      </button>
    </article>
  `;
}

function newsItem(a) {
  const when = a.publishedAt ? relativeTime(a.publishedAt) : "";
  return `
    <a class="gnews-item" href="${escapeAttr(a.url)}" target="_blank" rel="noopener noreferrer">
      ${
        a.image
          ? `<img class="gnews-thumb" src="${escapeAttr(a.image)}" alt="" loading="lazy" />`
          : `<span class="gnews-thumb gnews-thumb--placeholder" aria-hidden="true">🎮</span>`
      }
      <span class="gnews-body">
        <span class="gnews-title">${escapeAttr(a.title)}</span>
        <span class="gnews-meta">${escapeAttr(a.source)}${when ? ` · ${when}` : ""}</span>
      </span>
    </a>
  `;
}

function relativeTime(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

// Right-hand gaming news rail. Re-rendered on its own once the feed lands.
export function renderGamesNews(state) {
  const el = document.querySelector("#gamesNews");
  if (!el) return;
  el.innerHTML = gamesNewsPanel(state);
}

function gamesNewsPanel(state) {
  const items = state.news || [];
  return `
    <h2 class="gnews-head">
      Gaming News
      <span class="gnews-sub">Consoles, PC &amp; the games worth your time</span>
    </h2>
    <div class="gnews-list">
      ${
        state.newsLoading
          ? Array.from({ length: 8 })
              .map(() => `<div class="gnews-item gnews-item--skeleton"><span class="skeleton gnews-skel"></span></div>`)
              .join("")
          : items.length
            ? items.map(newsItem).join("")
            : `<p class="gnews-empty">Couldn't load the gaming wire right now.</p>`
      }
    </div>
  `;
}

export function filterGames({ platform = "all", search = "" } = {}) {
  const q = String(search).trim().toLowerCase();
  return GAMES.filter(g => {
    if (platform !== "all" && !g.platforms.includes(platform)) return false;
    if (q && !g.title.toLowerCase().includes(q)) return false;
    return true;
  });
}

// Re-renders just the grid + count, so typing in the search box doesn't
// rebuild the whole page (and lose focus) on every keystroke.
export function renderGamesResults(state) {
  const grid = document.querySelector("#gamesGrid");
  const count = document.querySelector("#gamesCount");
  if (!grid) return;

  const list = filterGames(state);
  grid.innerHTML = list.length
    ? list.map(gameCard).join("")
    : `<p class="game-empty">No games match that filter.</p>`;
  if (count) count.textContent = `${list.length} of ${GAMES.length}`;
}

export default state => {
  const platform = state.platform || "all";
  const list = filterGames(state);
  const withCovers = GAMES.filter(g => g.cover).length;

  return html`
    <section class="games-page">
      <header class="games-header">
        <span class="games-kicker">Off the clock</span>
        <h1>The Library</h1>
        <p class="games-subtitle">
          ${GAMES.length} games across Switch, PlayStation, Xbox and PC —
          ${withCovers} with cover art pulled from Steam. Several have a film or
          TV adaptation you can jump straight into.
        </p>
      </header>

      <div class="games-layout">
        <div class="games-main">
          <div class="rigs">${RIGS.map(rigCard).join("")}</div>

          <div class="games-controls" id="gamesFilters">
            <div class="game-chips">${filterChips(platform)}</div>
            <div class="games-controls-right">
              <input
                id="gamesSearch"
                class="games-search"
                type="search"
                placeholder="Search the library…"
                value="${escapeAttr(state.search || "")}"
                aria-label="Search games"
              />
              <span class="games-count" id="gamesCount">${list.length} of ${GAMES.length}</span>
            </div>
          </div>

          <div class="games-grid" id="gamesGrid">
            ${list.length
              ? list.map(gameCard).join("")
              : `<p class="game-empty">No games match that filter.</p>`}
          </div>
        </div>

        <aside class="games-news" id="gamesNews">${gamesNewsPanel(state)}</aside>
      </div>
    </section>
  `;
};
