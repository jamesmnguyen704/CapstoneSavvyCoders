// File: views/news.js
// Purpose: Movie News page — editorial layout inspired by IGN / MovieWeb /
//          JoBlo: a full-bleed hero with text overlaid on the backdrop, a
//          magazine-style grid of image-first cards with category pills, and
//          a vertical "Latest" rail running down the right side.
// Notes:
//   - All upstream text is HTML-escaped to guard against injection.
//   - Categories are inferred from the article title/tags with a simple
//     keyword match and color-coded via CSS data attributes.

import html from "html-literal";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Category inference — order matters (first match wins).
const CATEGORY_RULES = [
  { label: "Marvel",     key: "marvel",     test: /\b(marvel|mcu|avenger|x-men|spider-man|thor|iron man|loki|wakanda|deadpool)\b/i },
  { label: "DC",         key: "dc",         test: /\b(dc|batman|superman|wonder woman|aquaman|justice league|joker)\b/i },
  { label: "Star Wars",  key: "starwars",   test: /\bstar ?wars|mandalorian|jedi|skywalker\b/i },
  { label: "Box Office", key: "boxoffice",  test: /\bbox office\b/i },
  { label: "CinemaCon",  key: "cinemacon",  test: /\bcinema ?con\b/i },
  { label: "Comic-Con",  key: "comiccon",   test: /\bcomic[- ]?con\b/i },
  { label: "Disney",     key: "disney",     test: /\b(disney|pixar)\b/i },
  { label: "Blockbuster",key: "blockbuster",test: /\b(blockbuster|franchise|sequel|reboot)\b/i },
  { label: "Sci-Fi",     key: "scifi",      test: /\b(sci[- ]?fi|dune|avatar|alien|predator|blade runner)\b/i },
  { label: "Superhero",  key: "superhero",  test: /\bsuperhero\b/i }
];

function inferCategory(article) {
  const hay = `${article.title || ""} ${(article.tags || []).join(" ")} ${article.excerpt || ""}`;
  for (const rule of CATEGORY_RULES) {
    if (rule.test.test(hay)) return { label: rule.label, key: rule.key };
  }
  return { label: "Film", key: "film" };
}

function relativeTime(iso) {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const diff = Date.now() - d;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function categoryPill(cat) {
  return `<span class="news-pill" data-cat="${escapeHtml(cat.key)}">${escapeHtml(cat.label)}</span>`;
}

function renderFeatured(article) {
  if (!article) {
    return `
      <div class="news-hero news-hero--empty">
        <div class="news-hero-body">
          <h2>Loading the wire…</h2>
          <p>Pulling fresh blockbuster headlines.</p>
        </div>
      </div>
    `;
  }

  const title = escapeHtml(article.title);
  const url = escapeHtml(article.url);
  const image = article.image ? escapeHtml(article.image) : "";
  const excerpt = escapeHtml(article.excerpt);
  const source = escapeHtml(article.source);
  const when = escapeHtml(relativeTime(article.publishedAt));
  const byline = escapeHtml(article.byline || "");
  const cat = inferCategory(article);

  return `
    <a class="news-hero" href="${url}" target="_blank" rel="noopener noreferrer">
      ${
        image
          ? `<div class="news-hero-bg" style="background-image: url('${image}')"></div>`
          : `<div class="news-hero-bg news-hero-bg--placeholder"></div>`
      }
      <div class="news-hero-overlay"></div>
      <div class="news-hero-body">
        <div class="news-hero-meta">
          ${categoryPill(cat)}
          <span class="news-kicker-inline">Top Story</span>
        </div>
        <h2 class="news-hero-title">${title}</h2>
        ${excerpt ? `<p class="news-hero-excerpt">${excerpt}</p>` : ""}
        <div class="news-hero-byline">
          <span class="news-source">${source}</span>
          <span class="news-dot" aria-hidden="true">·</span>
          <time>${when}</time>
          ${byline ? `<span class="news-dot" aria-hidden="true">·</span><span>By ${byline}</span>` : ""}
        </div>
      </div>
    </a>
  `;
}

function renderGridCard(article, { large = false } = {}) {
  const title = escapeHtml(article.title);
  const url = escapeHtml(article.url);
  const image = article.image ? escapeHtml(article.image) : "";
  const excerpt = escapeHtml(article.excerpt);
  const when = escapeHtml(relativeTime(article.publishedAt));
  const source = escapeHtml(article.source);
  const cat = inferCategory(article);

  return `
    <a class="news-card${large ? " news-card--large" : ""}" href="${url}" target="_blank" rel="noopener noreferrer">
      <div class="news-card-media">
        ${
          image
            ? `<img src="${image}" alt="" loading="lazy" />`
            : `<div class="news-card-media--placeholder" aria-hidden="true">🎬</div>`
        }
        ${categoryPill(cat)}
      </div>
      <div class="news-card-body">
        <h3 class="news-card-title">${title}</h3>
        ${large && excerpt ? `<p class="news-card-excerpt">${excerpt}</p>` : ""}
        <div class="news-card-meta">
          <span class="news-source">${source}</span>
          <span class="news-dot" aria-hidden="true">·</span>
          <time>${when}</time>
        </div>
      </div>
    </a>
  `;
}

function renderRailItem(article) {
  const title = escapeHtml(article.title);
  const url = escapeHtml(article.url);
  const image = article.image ? escapeHtml(article.image) : "";
  const when = escapeHtml(relativeTime(article.publishedAt));
  const source = escapeHtml(article.source);
  const cat = inferCategory(article);

  return `
    <a class="news-item" href="${url}" target="_blank" rel="noopener noreferrer">
      ${
        image
          ? `<img class="news-item-thumb" src="${image}" alt="" loading="lazy" />`
          : `<div class="news-item-thumb news-item-thumb--placeholder" aria-hidden="true">🎬</div>`
      }
      <div class="news-item-body">
        <div class="news-item-meta">
          ${categoryPill(cat)}
          <span class="news-dot" aria-hidden="true">·</span>
          <time>${when}</time>
        </div>
        <h3 class="news-item-title">${title}</h3>
        <span class="news-item-source">${source}</span>
      </div>
    </a>
  `;
}

const TAB_CONFIG = {
  movies: {
    title: "Movie News",
    subtitle: "Blockbusters, Marvel, CinemaCon and geek culture — updated daily.",
    gridHead: "Top Stories",
    gridSub: "Blockbusters, superheroes &amp; sequels",
    railLabel: "Latest movie news"
  },
  tv: {
    title: "TV News",
    subtitle: "Streaming prestige, adult animation, reality & genre series — updated daily.",
    gridHead: "Top Stories",
    gridSub: "Boys, Invincible, Daredevil &amp; streaming prestige",
    railLabel: "Latest TV news"
  }
};

function renderTabs(activeTab) {
  const tabs = [
    { key: "movies", label: "Movies" },
    { key: "tv",     label: "TV" }
  ];
  return `
    <div class="news-tabs" role="tablist">
      ${tabs
        .map(
          t => `
          <button
            type="button"
            class="news-tab${t.key === activeTab ? " is-active" : ""}"
            role="tab"
            aria-selected="${t.key === activeTab}"
            data-news-tab="${t.key}"
          >${t.label}</button>`
        )
        .join("")}
    </div>
  `;
}

export default state => {
  const activeTab = state.activeTab === "tv" ? "tv" : "movies";
  const cfg = TAB_CONFIG[activeTab];
  const articles = Array.isArray(state.articles) ? state.articles : [];

  const featured = articles[0];
  const grid = articles.slice(1, 7); // 6 cards (1 large + 5 regular)
  const rail = articles.slice(7);

  const gridHtml = grid.length
    ? grid
        .map((article, i) => renderGridCard(article, { large: i === 0 }))
        .join("")
    : "";

  const railHtml = rail.length
    ? rail.map(renderRailItem).join("")
    : `<p class="news-empty">Check back soon for more headlines.</p>`;

  return html`
    <section class="news-page" data-active-tab="${activeTab}">
      <header class="news-header">
        <div class="news-header-left">
          <span class="news-kicker">Cinemetrics Wire</span>
          <h1>${cfg.title}</h1>
          <p class="news-subtitle">${cfg.subtitle}</p>
          ${renderTabs(activeTab)}
        </div>
        <div class="news-header-right">
          <span class="news-live">
            <span class="news-live-dot"></span>
            LIVE
          </span>
          <span class="news-source-credit">via The Guardian + RSS</span>
        </div>
      </header>

      <div class="news-layout">
        <div class="news-main">
          ${renderFeatured(featured)}

          ${
            grid.length
              ? `
                <div class="news-grid-head">
                  <h2>${cfg.gridHead}</h2>
                  <span class="news-grid-sub">${cfg.gridSub}</span>
                </div>
                <div class="news-grid">${gridHtml}</div>
              `
              : ""
          }
        </div>

        <aside class="news-rail" aria-label="${cfg.railLabel}">
          <h2 class="news-rail-title">Latest</h2>
          <div class="news-rail-list">${railHtml}</div>
        </aside>
      </div>
    </section>
  `;
};
