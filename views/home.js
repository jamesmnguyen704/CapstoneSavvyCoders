import html from "html-literal";

export default st => html`
  <section class="home">
    <p>
      Welcome to Cinemetrics — the movie app James Nguyen built instead of
      having a life for 12 weeks.
    </p>
    <p>
      Dive into trending films, box office chaos, and the upcoming releases I
      definitely didn’t procrastinate on
    </p>
  </section>

  <!-- Trending Movies-->
  <section id="trending">
    <h2>Trending Movies</h2>

    <div class="movie-grid">
      ${st.trending && st.trending.length > 0
        ? st.trending
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

    <div class="movie-grid">
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

    <div class="movie-grid">
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
