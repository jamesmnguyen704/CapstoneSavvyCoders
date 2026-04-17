// File: views/movies.js
// Purpose: Movies view — a grid of popular movies with rich cards.
// Notes: Uses the shared movie card markup (badges, bookmark, info modal).

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
  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Image";
  const year = (movie.release_date || "").slice(0, 4);
  const rating =
    typeof movie.vote_average === "number" && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : null;

  return html`
    <div class="movie-card" data-movie-id="${movie.id}">
      <div class="movie-poster-wrap">
        <img
          src="${poster}"
          alt="${escapeAttr(movie.title)}"
          class="movie-poster"
          loading="lazy"
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

      <h3 class="movie-title">${escapeAttr(movie.title)}</h3>

      <div class="card-actions">
        <button class="trailer-btn" data-id="${movie.id}">▶ Trailer</button>
        <button class="info-btn" type="button" data-id="${movie.id}" aria-label="More info">
          <i class="fa-solid fa-circle-info"></i>
        </button>
        <button class="comment-btn" data-movieid="${movie.id}" aria-label="Comments">
          <i class="fa-regular fa-comment"></i>
        </button>
      </div>
    </div>
  `;
}

export default function Movies(st) {
  const movies = st.movies || [];
  const heroMovies = movies.slice(0, 5);
  const carouselMovies = movies.slice(5);

  return html`
    <section class="hero-slider-container">
      ${heroMovies.length > 0
        ? heroMovies
            .map(
              movie => `
          <div class="hero-slide">
            <img
              class="hero-backdrop"
              src="https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}"
              alt="${escapeAttr(movie.title)} Backdrop"
              onerror="this.onerror=null; this.src='images/placeholder-poster.jpg'"
            />
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
            <h1>Cinemetrics Community</h1>
            <p>Rate, Review, and Discuss</p>
          </div>
        `}
    </section>

    <div class="movies-container">
      <section class="movies-header">
        <h1>Cinemetrics Community: Rate, Review, and Discuss</h1>
        <p>Join the conversation on the most discussed movies right now.</p>
      </section>

      <section class="movie-carousel">
        ${carouselMovies.length > 0
          ? carouselMovies.map(movieCard).join("")
          : html`<p class="no-movies">No movies found.</p>`}
      </section>
    </div>
  `;
}
