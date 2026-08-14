// File: views/tv.js
// Purpose: TV & Streaming — browse shows by streaming service on the left,
//          with the combined TV + streaming news wire on the right.
// Notes: Mirrors the Games page layout (65/35). Provider chips call
//        /tv/providers, which is TMDB discover/tv filtered by watch provider.
import html from "html-literal";

function escapeAttr(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

function showCard(show) {
  const poster = show.poster_path
    ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
    : null;
  const year = (show.first_air_date || "").slice(0, 4);
  const rating =
    typeof show.vote_average === "number" && show.vote_average > 0
      ? show.vote_average.toFixed(1)
      : null;

  return `
    <article class="show-card" data-show-id="${show.id}">
      <div class="show-poster-wrap">
        ${
          poster
            ? `<img class="show-poster" src="${poster}" alt="${escapeAttr(show.name)}" loading="lazy" />`
            : `<div class="show-poster show-poster--placeholder" aria-hidden="true">📺</div>`
        }
        <div class="show-badges">
          ${year ? `<span class="show-badge">${year}</span>` : ""}
          ${rating ? `<span class="show-badge show-badge--rating">★ ${rating}</span>` : ""}
        </div>
      </div>
      <h3 class="show-title">${escapeAttr(show.name)}</h3>
    </article>
  `;
}

function providerChips(state) {
  const chips = [{ id: "all", name: "All Shows" }].concat(state.providers || []);
  return chips
    .map(
      p => `
      <button
        type="button"
        class="tv-chip${String(p.id) === String(state.provider) ? " tv-chip--active" : ""}"
        data-tv-provider="${escapeAttr(p.id)}"
      >${escapeAttr(p.name)}</button>`
    )
    .join("");
}

function showRow(label, shows, note = "") {
  if (!shows || !shows.length) return "";
  return `
    <section class="tv-row">
      <h2 class="tv-row-head">
        ${escapeAttr(label)}
        ${note ? `<span class="tv-row-count">${escapeAttr(note)}</span>` : ""}
      </h2>
      <div class="show-grid">${shows.map(showCard).join("")}</div>
    </section>
  `;
}

function newsItem(a) {
  const when = a.publishedAt ? relativeTime(a.publishedAt) : "";
  return `
    <a class="gnews-item" href="${escapeAttr(a.url)}" target="_blank" rel="noopener noreferrer">
      ${
        a.image
          ? `<img class="gnews-thumb" src="${escapeAttr(a.image)}" alt="" loading="lazy" />`
          : `<span class="gnews-thumb gnews-thumb--placeholder" aria-hidden="true">📺</span>`
      }
      <span class="gnews-body">
        <span class="gnews-title">${escapeAttr(a.title)}</span>
        <span class="gnews-meta">${escapeAttr(a.source)}${when ? ` · ${when}` : ""}</span>
      </span>
    </a>
  `;
}

function tvNewsPanel(state) {
  const items = state.news || [];
  return `
    <h2 class="gnews-head">
      TV &amp; Streaming News
      <span class="gnews-sub">Prestige, streaming wars &amp; what just dropped</span>
    </h2>
    <div class="gnews-list">
      ${
        state.newsLoading
          ? Array.from({ length: 8 })
              .map(() => `<div class="gnews-item gnews-item--skeleton"><span class="skeleton gnews-skel"></span></div>`)
              .join("")
          : items.length
            ? items.map(newsItem).join("")
            : `<p class="gnews-empty">Couldn't load the TV wire right now.</p>`
      }
    </div>
  `;
}

export function renderTvNews(state) {
  const el = document.querySelector("#tvNews");
  if (el) el.innerHTML = tvNewsPanel(state);
}

// Re-renders just the show area when a service chip is picked.
export function renderTvShows(state) {
  const el = document.querySelector("#tvShows");
  if (!el) return;
  el.innerHTML = showsMarkup(state);
}

// Every tab answers the same question — what are people actually watching —
// so both the "All Shows" view and each service tab render one popularity-
// ordered grid rather than a stack of differently-sorted rows.
function showsMarkup(state) {
  if (state.loading) {
    return `<div class="show-grid">${Array.from({ length: 12 })
      .map(() => `<div class="show-card"><div class="skeleton show-skeleton"></div></div>`)
      .join("")}</div>`;
  }

  if (state.provider !== "all") {
    const svc = (state.providers || []).find(p => String(p.id) === String(state.provider));
    if (!state.results.length) {
      return `<p class="tv-empty">No shows found for that service.</p>`;
    }
    return showRow(
      `Most Watched on ${svc ? svc.name : "this service"}`,
      state.results,
      `${state.totalResults.toLocaleString()} shows`
    );
  }

  return showRow("Most Popular Right Now", state.popular, "Across every service");
}

export default state => html`
  <section class="tv-page">
    <header class="tv-header">
      <span class="tv-kicker">On the small screen</span>
      <h1>TV &amp; Streaming</h1>
      <p class="tv-subtitle">
        What's on Netflix, HBO Max, Prime, Disney+, Apple TV+, Hulu and Peacock —
        with the TV and streaming wire running alongside.
      </p>
      <div class="tv-chips" id="tvProviders">${providerChips(state)}</div>
    </header>

    <div class="tv-layout">
      <div class="games-main" id="tvShows">${showsMarkup(state)}</div>
      <aside class="games-news" id="tvNews">${tvNewsPanel(state)}</aside>
    </div>
  </section>
`;
