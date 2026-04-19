// File: views/home.js
// Purpose: Home page — hero slider + Trending / Now Playing / Popular / Top Rated rows.
// Notes: Uses state populated by the router (fetchHomeData + fetchTopRated).

import html from "html-literal";

function escapeAttr(s) {
  return String(s ?? "").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function encodeMovie(movie) {
  return escapeAttr(
    JSON.stringify({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path || null,
      release_date: movie.release_date || null,
      vote_average: typeof movie.vote_average === "number" ? movie.vote_average : null
    })
  );
}

function movieCard(movie) {
  const year = (movie.release_date || "").slice(0, 4);
  const rating =
    typeof movie.vote_average === "number" && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : null;

  return `
    <div class="movie-card" data-movie-id="${movie.id}">
      <div class="movie-poster-wrap">
        <img
          src="https://image.tmdb.org/t/p/w300${movie.poster_path}"
          alt="${escapeAttr(movie.title)}"
          loading="lazy"
          onerror="this.onerror=null; this.src='images/placeholder-poster.jpg'"
        />
        <div class="card-badges">
          ${year ? `<span class="card-badge card-badge--year">${year}</span>` : ""}
          ${rating ? `<span class="card-badge card-badge--rating">★ ${rating}</span>` : ""}
        </div>
        <button
          class="card-bookmark"
          type="button"
          aria-label="Add to My List"
          data-movie='${encodeMovie(movie)}'
        >
          <i class="fa-regular fa-bookmark"></i>
        </button>
      </div>
      <h3>${escapeAttr(movie.title)}</h3>
      <div class="card-actions">
        <button class="trailer-btn" data-id="${movie.id}">▶ Trailer</button>
        <button class="info-btn" type="button" data-id="${movie.id}" aria-label="More info">
          <i class="fa-solid fa-circle-info"></i>
        </button>
      </div>
    </div>
  `;
}

function skeletonRow(count = 8) {
  return Array.from({ length: count })
    .map(
      () => `
      <div class="movie-card skeleton-card">
        <div class="skeleton skeleton-poster"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line skeleton-line--short"></div>
      </div>
    `
    )
    .join("");
}

function row(label, items) {
  const cards = items && items.length ? items.map(movieCard).join("") : skeletonRow();
  return `
    <section>
      <h2>${label}</h2>
      <div class="movie-carousel">${cards}</div>
    </section>
  `;
}

export default st => {
  const heroMovies = st.trending ? st.trending.slice(0, 5) : [];

  return html`
    <section class="hero-slider-container">
      ${heroMovies.length > 0
        ? heroMovies
            .map(
              movie => `
          <div class="hero-slide">
            <img
              class="hero-backdrop"
              src="https://image.tmdb.org/t/p/original${movie.backdrop_path}"
              alt="${escapeAttr(movie.title)} Backdrop"
              onerror="this.onerror=null; this.src='images/placeholder-poster.jpg'"
            />
            <div class="hero-display-title" aria-hidden="true">${escapeAttr(movie.title)}</div>
            <div class="hero-content">
              <h1>${escapeAttr(movie.title)}</h1>
              <p>${escapeAttr(movie.overview || "")}</p>
              <div class="hero-actions">
                <button class="trailer-btn hero-btn" data-id="${movie.id}">▶ Watch Trailer</button>
                <button class="info-btn hero-info-btn" type="button" data-id="${movie.id}">
                  <i class="fa-solid fa-circle-info"></i> More Info
                </button>
              </div>
            </div>
          </div>
        `
            )
            .join("")
        : `
          <div class="hero-content">
            <h1>Welcome to Cinemetrics</h1>
            <p>Dive into trending films, box office chaos, and upcoming releases.</p>
          </div>
        `}
    </section>

    <section id="trending">
      <h2>Trending Movies</h2>
      <div class="movie-carousel">
        ${st.trending && st.trending.length > 0
          ? st.trending.slice(1).map(movieCard).join("")
          : skeletonRow()}
      </div>
    </section>

    ${row("Now Playing in U.S. Theaters", st.nowPlaying)
      .replace("<section>", `<section id="now-playing">`)}

    ${row("Popular in the U.S.", st.popular)
      .replace("<section>", `<section id="popular">`)}

    ${row("Top Rated of All Time", st.topRated)
      .replace("<section>", `<section id="top-rated">`)}
  `;
};
