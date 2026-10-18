// File: views/hotTakes.js
// Purpose: "Hot Takes" page — the busiest comment threads across the site,
// ranked by how many different voices are talking, not just raw volume.
import html from "html-literal";

export default state => {
  const threads = Array.isArray(state.threads) ? state.threads : [];

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
    : `<p class="hot-take-empty">No debates yet — be the first to start one.</p>`;

  return html`
    <section class="hot-takes-page">
      <h1>Hot Takes</h1>
      <p class="hot-takes-subtitle">The busiest comment threads on Cinemetrics right now.</p>
      <div class="hot-takes-grid">
        ${cards}
      </div>
    </section>
  `;
};
