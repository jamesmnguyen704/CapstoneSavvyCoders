// File: views/games.js
// Purpose: "The Library" — James's game collection, filterable by platform,
//          with local cover art and cross-links to screen adaptations.
// Notes:
//   - Library data is static (views/_gamesData.js); this view only reads it.
//   - Titles with a film/TV adaptation get a "Watch the adaptation" chip that
//     opens the existing movie search, tying the page into the rest of the app.
import html from "html-literal";
import { GAMES, PLATFORMS, RIGS, UPCOMING } from "./_gamesData";
import { gameCoverUrl, assetUrl } from "../services/api";
import { escapeAttr } from "./_cards";

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
    <article
      class="game-card${game.recalled ? " game-card--recalled" : ""}"
      data-game-key="${escapeAttr(gameKey(game.title))}"
      role="button"
      tabindex="0"
      aria-label="${escapeAttr(game.title)} — reviews and news"
    >
      <div class="game-cover-wrap">
        ${
          cover
            ? `<img class="game-cover${
                game.coverWide ? " game-cover--wide" : ""
              }" src="${escapeAttr(cover)}" alt="${escapeAttr(
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

const STATUS_LABELS = {
  dated: "Dated",
  window: "Window",
  rumored: "Rumored"
};

// Pull headlines off the gaming wire that mention a given upcoming title, so
// each radar card carries its own live news instead of just a static blurb.
// Radar entries carry a hand-picked `match` list (generic titles like "Call
// of Duty" need it to avoid false hits). Library games don't — this derives
// a reasonable term from the title alone by dropping edition/version
// qualifiers that would never appear in a headline about the game.
function deriveMatchTerm(title) {
  return String(title || "")
    .replace(/\s*\([^)]*\)\s*$/, "") // trailing "(Ultimate Edition)", "(2018)"
    .replace(/\s*[:\-]\s*(remastered|definitive edition|goty)\b.*$/i, "")
    .trim()
    .toLowerCase();
}

export function matchTerms(game) {
  if (game.match?.length) return game.match;
  const term = deriveMatchTerm(game.title);
  return term ? [term] : [];
}

export function newsForUpcoming(game, articles, limit = 2) {
  const terms = matchTerms(game);
  if (!terms.length) return [];
  return (articles || [])
    .filter(a => {
      const title = String(a.title || "").toLowerCase();
      return terms.some(t => title.includes(t));
    })
    .slice(0, limit);
}

// Every library game and radar entry gets a stable, URL-safe key so a card
// can be looked back up by it (for the detail modal) without re-encoding the
// whole object into a data attribute like the bookmark button does.
export function gameKey(title) {
  return encodeURIComponent(title);
}

export function findGameByKey(key) {
  return (
    GAMES.find(g => gameKey(g.title) === key) ||
    UPCOMING.find(g => gameKey(g.title) === key) ||
    null
  );
}

function reviewsList(articles) {
  if (!articles.length) {
    return `<p class="game-modal-empty">No headlines on the wire yet for this one.</p>`;
  }
  return `
    <ul class="game-modal-news">
      ${articles
        .map(
          a => `
        <li>
          <a href="${escapeAttr(a.url)}" target="_blank" rel="noopener noreferrer">
            <span class="game-modal-news-title">${escapeAttr(a.title)}</span>
            <span class="game-modal-news-meta">${escapeAttr(a.source)}${
              a.publishedAt ? ` · ${relativeTime(a.publishedAt)}` : ""
            }</span>
          </a>
        </li>
      `
        )
        .join("")}
    </ul>
  `;
}

// Modal body for a clicked game card — radar (unreleased) and library
// (owned) entries share this, since both just need "what's being said about
// it" plus whatever release info is on hand. No network round trip: every
// game's news is matched client-side against the wire already in state.
export function gameModalContent(key, state) {
  const game = findGameByKey(key);
  if (!game) return `<p class="game-modal-empty">Couldn't find that one.</p>`;

  const isUpcoming = UPCOMING.includes(game);
  const articles = newsForUpcoming(game, state?.news, 8);
  const cover = game.cover ? gameCoverUrl(game.cover) : game.art ? gameCoverUrl(game.art) : null;
  const adaptation = ADAPTATIONS[game.title];

  return `
    <div class="game-modal">
      <div class="game-modal-head">
        ${
          cover
            ? `<img class="game-modal-cover" src="${escapeAttr(cover)}" alt="" />`
            : `<div class="game-modal-cover game-modal-cover--placeholder" aria-hidden="true">🎮</div>`
        }
        <div class="game-modal-head-body">
          <h2 class="game-modal-title">${escapeAttr(game.title)}</h2>
          <div class="game-badges">${platformBadges(game.platforms)}</div>
          ${
            isUpcoming
              ? `<p class="game-modal-release">
                   <strong>${escapeAttr(STATUS_LABELS[game.status] || game.status)}</strong>
                   · ${escapeAttr(game.window)}
                 </p>
                 <p class="game-modal-note">${escapeAttr(game.note)}</p>`
              : `<p class="game-modal-release"><strong>In the library</strong></p>`
          }
          ${
            adaptation
              ? `<button class="game-adapt" type="button" data-adaptation="${escapeAttr(adaptation)}">▶ Watch the adaptation</button>`
              : ""
          }
        </div>
      </div>
      <h3 class="game-modal-section-head">Reviews &amp; news</h3>
      ${reviewsList(articles)}
    </div>
  `;
}

// Upcoming titles have no box art in the library yet, so these cards lead with
// the release window instead of a cover.
function radarCard(game, articles) {
  const related = newsForUpcoming(game, articles);

  return `
    <article
      class="radar-card"
      data-status="${escapeAttr(game.status)}"
      data-game-key="${escapeAttr(gameKey(game.title))}"
      role="button"
      tabindex="0"
      aria-label="${escapeAttr(game.title)} — reviews and release info"
    >
      ${
        game.art
          ? `<img class="radar-art" src="${escapeAttr(gameCoverUrl(game.art))}" alt="" aria-hidden="true" loading="lazy" />`
          : ""
      }
      <div class="radar-top">
        <span class="radar-status">${escapeAttr(STATUS_LABELS[game.status] || game.status)}</span>
        <span class="radar-window">${escapeAttr(game.window)}</span>
      </div>
      <h3 class="radar-title">${escapeAttr(game.title)}</h3>
      <div class="game-badges">${platformBadges(game.platforms)}</div>
      <p class="radar-note">${escapeAttr(game.note)}</p>
      ${
        related.length
          ? `<div class="radar-news">
              ${related
                .map(
                  a => `
                <a class="radar-news-item" href="${escapeAttr(a.url)}" target="_blank" rel="noopener noreferrer">
                  <span class="radar-news-title">${escapeAttr(a.title)}</span>
                  <span class="radar-news-meta">${escapeAttr(a.source)}${
                    a.publishedAt ? ` · ${relativeTime(a.publishedAt)}` : ""
                  }</span>
                </a>`
                )
                .join("")}
            </div>`
          : // Without this the card bottoms out on a void whenever the wire has
            // nothing matching, which reads as broken rather than quiet.
            `<p class="radar-news-empty">No headlines on the wire yet.</p>`
      }
      ${
        game.adaptation
          ? `<button class="game-adapt" type="button" data-adaptation="${escapeAttr(
              game.adaptation
            )}">▶ Watch the adaptation</button>`
          : ""
      }
    </article>
  `;
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
    <a class="gnews-card" href="${escapeAttr(a.url)}" target="_blank" rel="noopener noreferrer">
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

// The lead story carries a full-bleed image, so it has to be an item that
// actually has one — the wire regularly returns text-only entries.
function leadStory(a) {
  return `
    <a class="gnews-lead" href="${escapeAttr(a.url)}" target="_blank" rel="noopener noreferrer">
      <img class="gnews-lead-img" src="${escapeAttr(a.image)}" alt="" loading="lazy" />
      <div class="gnews-lead-body">
        <span class="gnews-lead-kicker">Top story</span>
        <h3 class="gnews-lead-title">${escapeAttr(a.title)}</h3>
        ${a.excerpt ? `<p class="gnews-lead-excerpt">${escapeAttr(a.excerpt)}</p>` : ""}
        <span class="gnews-meta">${escapeAttr(a.source)}${
          a.publishedAt ? ` · ${relativeTime(a.publishedAt)}` : ""
        }</span>
      </div>
    </a>
  `;
}

// Gaming news, now the centrepiece of the page rather than a side rail.
// Re-rendered on its own once the feed lands — and so is the radar, whose
// cards embed headlines of their own.
export function renderGamesNews(state) {
  const el = document.querySelector("#gamesNews");
  if (el) el.innerHTML = gamesNewsPanel(state);

  const radar = document.querySelector("#radarGrid");
  if (radar) radar.innerHTML = UPCOMING.map(g => radarCard(g, state.news)).join("");
}

function gamesNewsPanel(state) {
  const items = state.news || [];

  if (state.newsLoading) {
    return `
      ${newsHead()}
      <div class="gnews-grid">
        ${Array.from({ length: 9 })
          .map(() => `<div class="gnews-card gnews-card--skeleton"><span class="skeleton gnews-skel"></span></div>`)
          .join("")}
      </div>
    `;
  }

  if (!items.length) {
    return `${newsHead()}<p class="gnews-empty">Couldn't load the gaming wire right now.</p>`;
  }

  const leadIndex = items.findIndex(a => a.image);
  const lead = leadIndex >= 0 ? items[leadIndex] : null;
  const rest = lead ? items.filter((_, i) => i !== leadIndex) : items;

  return `
    ${newsHead()}
    ${lead ? leadStory(lead) : ""}
    <div class="gnews-grid">${rest.map(newsItem).join("")}</div>
  `;
}

function newsHead() {
  return `
    <h2 class="gnews-head">
      Gaming News
      <span class="gnews-sub">Consoles, PC &amp; the games worth your time — refreshed every few minutes</span>
    </h2>
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

// The library is the archive, not the headline — show a slice of it by default
// so the page leads with news and upcoming releases. Filtering or searching
// opts out of the cap, since by then the visitor is deliberately digging.
const LIBRARY_PREVIEW = 12;

function visibleGames(state) {
  const list = filterGames(state);
  const browsing =
    (state.platform && state.platform !== "all") || String(state.search || "").trim();

  if (state.showAllGames || browsing) {
    return { shown: list, total: list.length, hidden: 0 };
  }
  return {
    shown: list.slice(0, LIBRARY_PREVIEW),
    total: list.length,
    hidden: Math.max(list.length - LIBRARY_PREVIEW, 0)
  };
}

function showAllButton(hidden) {
  if (!hidden) return "";
  return `
    <button class="games-showall" type="button" data-games-show-all>
      Show all ${GAMES.length} games <span class="games-showall-more">+${hidden} more</span>
    </button>
  `;
}

// Re-renders just the grid + count, so typing in the search box doesn't
// rebuild the whole page (and lose focus) on every keystroke.
export function renderGamesResults(state) {
  const grid = document.querySelector("#gamesGrid");
  const count = document.querySelector("#gamesCount");
  const more = document.querySelector("#gamesMore");
  if (!grid) return;

  const { shown, total, hidden } = visibleGames(state);
  grid.innerHTML = shown.length
    ? shown.map(gameCard).join("")
    : `<p class="game-empty">No games match that filter.</p>`;
  if (count) count.textContent = `${shown.length} of ${GAMES.length}`;
  if (more) more.innerHTML = showAllButton(hidden);

  return { total, hidden };
}

export default state => {
  const platform = state.platform || "all";
  const { shown, hidden } = visibleGames(state);

  return html`
    <section class="games-page">
      <header class="games-header">
        <span class="games-kicker">Off the clock</span>
        <h1>The Gaming Desk</h1>
        <p class="games-subtitle">
          What's coming, what's being written about it, and the ${GAMES.length}
          games sitting on my own shelf — several with a film or TV adaptation
          you can jump straight into.
        </p>
      </header>

      <section class="radar">
        <h2 class="radar-head">
          On My Radar
          <span class="radar-sub">What I'm waiting on — dates move, these are the latest I have</span>
        </h2>
        <div class="radar-grid" id="radarGrid">
          ${UPCOMING.map(g => radarCard(g, state.news)).join("")}
        </div>
      </section>

      <section class="games-news" id="gamesNews">${gamesNewsPanel(state)}</section>

      <section class="games-library">
        <h2 class="library-head">
          The Library
          <span class="library-sub">${RIGS.map(r => r.name).join(" · ")}</span>
        </h2>

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
            <span class="games-count" id="gamesCount">${shown.length} of ${GAMES.length}</span>
          </div>
        </div>

        <div class="games-grid games-grid--compact" id="gamesGrid">
          ${shown.length
            ? shown.map(gameCard).join("")
            : `<p class="game-empty">No games match that filter.</p>`}
        </div>

        <div class="games-more" id="gamesMore">${showAllButton(hidden)}</div>
      </section>
    </section>
  `;
};
