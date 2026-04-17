// File: views/news.js
// Purpose: Movie News page — a vertical column of articles running down the
//          right side of the page, pulled from Guardian Film via our backend.
// Notes: All user-visible text is HTML-escaped to avoid any injection from
//        the upstream source. Article links open in a new tab.

import html from "html-literal";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return "";
  }
}

export default state => {
  const articles = Array.isArray(state.articles) ? state.articles : [];

  const featured = articles[0];
  const rest = articles.slice(1);

  const asideContent = rest.length
    ? rest
        .map(a => {
          const title = escapeHtml(a.title);
          const url = escapeHtml(a.url);
          const image = a.image ? escapeHtml(a.image) : "";
          const excerpt = escapeHtml(a.excerpt);
          const source = escapeHtml(a.source);
          const date = escapeHtml(formatDate(a.publishedAt));

          return `
            <a class="news-item" href="${url}" target="_blank" rel="noopener noreferrer">
              ${
                image
                  ? `<img class="news-item-thumb" src="${image}" alt="" loading="lazy" />`
                  : `<div class="news-item-thumb news-item-thumb--placeholder" aria-hidden="true">🎬</div>`
              }
              <div class="news-item-body">
                <div class="news-item-meta">
                  <span class="news-source">${source}</span>
                  <span class="news-dot" aria-hidden="true">·</span>
                  <time>${date}</time>
                </div>
                <h3 class="news-item-title">${title}</h3>
                ${excerpt ? `<p class="news-item-excerpt">${excerpt}</p>` : ""}
              </div>
            </a>
          `;
        })
        .join("")
    : `<p class="news-empty">No articles right now — check back in a bit.</p>`;

  const featuredContent = featured
    ? (() => {
        const title = escapeHtml(featured.title);
        const url = escapeHtml(featured.url);
        const image = featured.image ? escapeHtml(featured.image) : "";
        const excerpt = escapeHtml(featured.excerpt);
        const source = escapeHtml(featured.source);
        const date = escapeHtml(formatDate(featured.publishedAt));
        const byline = escapeHtml(featured.byline || "");

        return `
          <a class="news-featured" href="${url}" target="_blank" rel="noopener noreferrer">
            ${
              image
                ? `<div class="news-featured-media" style="background-image: url('${image}')"></div>`
                : `<div class="news-featured-media news-featured-media--placeholder"></div>`
            }
            <div class="news-featured-body">
              <div class="news-featured-meta">
                <span class="news-tag">Featured</span>
                <span class="news-source">${source}</span>
                <span class="news-dot" aria-hidden="true">·</span>
                <time>${date}</time>
              </div>
              <h2 class="news-featured-title">${title}</h2>
              ${excerpt ? `<p class="news-featured-excerpt">${excerpt}</p>` : ""}
              ${byline ? `<p class="news-byline">By ${byline}</p>` : ""}
            </div>
          </a>
        `;
      })()
    : `
        <div class="news-featured news-featured--empty">
          <h2>Loading the latest…</h2>
          <p>Pulling fresh movie headlines.</p>
        </div>
      `;

  return html`
    <section class="news-page">
      <header class="news-header">
        <h1>Movie News</h1>
        <p class="news-subtitle">Fresh headlines, via The Guardian — Film.</p>
      </header>

      <div class="news-layout">
        <div class="news-main">${featuredContent}</div>

        <aside class="news-rail" aria-label="Latest movie news">
          <h2 class="news-rail-title">Latest</h2>
          <div class="news-rail-list">${asideContent}</div>
        </aside>
      </div>
    </section>
  `;
};
