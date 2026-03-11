// File: views/home.js
// Purpose: Home page view — displays trending, now playing, and popular movies.
// Notes: Uses state passed from the router to render movie grids and trailer buttons.
import html from "html-literal";

export default st => {
  // Extract the Top 5 Trending Movies for the Auto-Sliding Hero Banner
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
              alt="${movie.title} Backdrop" 
              onerror="this.onerror=null; this.src='images/placeholder-poster.jpg'"
            />
            <div class="hero-content">
              <h1>${movie.title}</h1>
              <p>${movie.overview}</p>
              <button class="trailer-btn hero-btn" data-id="${movie.id}">▶ Watch Trailer</button>
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

    <!-- Trending Movies-->
    <section id="trending">
      <h2>Trending Movies</h2>

      <div class="movie-carousel">
        ${st.trending && st.trending.length > 0
          ? st.trending
              .slice(1) // Skip the first movie since it's in the Hero Banner
              .map(
                movie => `
        <div class="movie-card">
          <img
            src="https://image.tmdb.org/t/p/w300${movie.poster_path}"
            alt="${movie.title}"
            onerror="this.onerror=null; this.src='images/placeholder-poster.jpg'"
          />
          <h3>${movie.title}</h3>
          <!-- Trailer Button -->
          <button
            class="trailer-btn"
            data-id="${movie.id}">
            ▶ Trailer
          </button>
        </div>
      `
              )
              .join("")
          : `<p>Loading trending movies...</p>`}
      </div>
    </section>

    <!-- Now Playing -->
    <section id="now-playing">
      <h2>Now Playing in U.S. Theaters</h2>

      <div class="movie-carousel">
        ${st.nowPlaying && st.nowPlaying.length > 0
          ? st.nowPlaying
              .map(
                movie => `
        <div class="movie-card">
          <img
            src="https://image.tmdb.org/t/p/w300${movie.poster_path}"
            alt="${movie.title}"
            onerror="this.onerror=null; this.src='images/placeholder-poster.jpg'"
          />
          <h3>${movie.title}</h3>

          <!-- Trailer Button -->
          <button
            class="trailer-btn"
            data-id="${movie.id}">
            ▶ Trailer
          </button>
        </div>
      `
              )
              .join("")
          : `<p>Loading movies currently in theaters...</p>`}
      </div>
    </section>

    <!-- Popular Movies -->
    <section id="popular">
      <h2>Popular in the U.S.</h2>

      <div class="movie-carousel">
        ${st.popular && st.popular.length > 0
          ? st.popular
              .map(
                movie => `
        <div class="movie-card">
          <img
            src="https://image.tmdb.org/t/p/w300${movie.poster_path}"
            alt="${movie.title}"
            onerror="this.onerror=null; this.src='images/placeholder-poster.jpg'"
          />
          <h3>${movie.title}</h3>

          <!-- Trailer Button -->
          <button
            class="trailer-btn"
            data-id="${movie.id}">
            ▶ Trailer
          </button>
        </div>
      `
              )
              .join("")
          : `<p>Loading popular movies...</p>`}
      </div>
    </section>
  `;
};
