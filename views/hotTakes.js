// File: views/hotTakes.js
// Purpose: "Hot Takes" page — the busiest comment threads across the site,
// ranked by how many different voices are talking, not just raw volume.
import html from "html-literal";

function tabBar(audience) {
  return `
    <nav class="hot-takes-tabs" role="tablist" aria-label="Hot Takes audience">
      <button
        role="tab"
        type="button"
        class="hot-takes-tab ${audience === "human" ? "hot-takes-tab--active" : ""}"
        data-audience="human"
        aria-selected="${audience === "human"}"
      >
        <i class="fa-solid fa-users"></i> Community
      </button>
      <button
        role="tab"
        type="button"
        class="hot-takes-tab ${audience === "character" ? "hot-takes-tab--active" : ""}"
        data-audience="character"
        aria-selected="${audience === "character"}"
      >
        <i class="fa-solid fa-masks-theater"></i> Character Chaos
      </button>
    </nav>
  `;
}

export default state => {
  const threads = Array.isArray(state.threads) ? state.threads : [];
  const audience = state.audience === "character" ? "character" : "human";

  const emptyMessage =
    audience === "character"
      ? "No character threads yet."
      : "No real-community debates yet — be the first to start one.";

  const cards = threads.length
    ? threads
        .map(
          t => `
          <a class="hot-take-card" href="/comments/${t.movieId}" data-navigo>
            ${
              t.posterPath
                ? `<img src="https://image.tmdb.org/t/p/w200${t.posterPath}" alt="${t.title}" loading="lazy" />`
                : `<div class="hot-take-poster-placeholder"></div>`
            }
            <div class="hot-take-body">
              <h3>${t.title}</h3>
              <p>${t.commentCount} comment${t.commentCount === 1 ? "" : "s"} · ${t.voiceCount} voice${t.voiceCount === 1 ? "" : "s"}</p>
            </div>
          </a>
        `
        )
        .join("")
    : `<p class="hot-take-empty">${emptyMessage}</p>`;

  return html`
    <section class="hot-takes-page">
      <h1>${audience === "character" ? "Character Chaos" : "Hot Takes"}</h1>
      <p class="hot-takes-subtitle">
        ${
          audience === "character"
            ? "The busiest Marvel-bot comment threads on Cinemetrics — fictional characters, not real visitors."
            : "The busiest real-community comment threads on Cinemetrics right now."
        }
      </p>
      ${tabBar(audience)}
      <div class="hot-takes-grid">
        ${cards}
      </div>
    </section>
  `;
};
