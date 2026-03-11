// version 2 changed from popular list from TMDB because i dont like those movies
// did a curated list to pull live data from backend fetchupcomingcurated()

import html from "html-literal";

const generateReleaseCards = movies =>
  (movies || [])
    .sort((a, b) => new Date(a.customDate) - new Date(b.customDate))
    .map(
      movie => `
        <div class="release-card">
          <div class="release-poster">
            <img
              src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
              alt="${movie.title} Poster"
            />
            <div class="release-overlay">
              <span class="release-date">
                ${new Date(movie.customDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div class="release-info">
            <h3 class="release-title">${movie.title}</h3>

            <!-- description removed for cleaner card layout -->

            <p class="release-genre">
              ⭐ Rating: ${
                movie.vote_average ? movie.vote_average.toFixed(1) : "TBD"
              }
            </p>
            <button class="trailer-btn" data-id="${movie.id}">
              ▶ Trailer
            </button>
          </div>
        </div>
      `
    )
    .join("");

export default st => {
  const upcomingMovies = st.movies2026 || [];
  const heroMovies = upcomingMovies
    .sort((a, b) => new Date(a.customDate) - new Date(b.customDate))
    .slice(0, 5);

  return html`
    <section class="hero-slider-container">
      ${heroMovies.length > 0
        ? heroMovies
            .map(
              movie => `
          <div class="hero-slide">
            <img 
              class="hero-backdrop" 
              src="https://image.tmdb.org/t/p/original${movie.backdrop_path ||
                movie.poster_path}" 
              alt="${movie.title} Backdrop" 
              onerror="this.onerror=null; this.src='images/placeholder-poster.jpg'"
            />
            <div class="hero-content">
              <h1>${movie.title}</h1>
              <p>Releasing: ${new Date(
                movie.customDate
              ).toLocaleDateString()}</p>
              <button class="trailer-btn hero-btn" data-id="${
                movie.id
              }">▶ Watch Trailer</button>
            </div>
          </div>
        `
            )
            .join("")
        : `
          <div class="hero-content">
            <h1>Upcoming Releases</h1>
            <p>Discover the biggest movies hitting theaters soon.</p>
          </div>
        `}
    </section>

    <div class="releases-container">
      <section class="releases-header" style="margin-left: 1rem;">
        <h1>My most anticipated movies</h1>
        <p>Discover the biggest movies hitting theaters soon.</p>
      </section>

      <h2 class="year-title" style="margin-left: 1rem;">⭐ 2026 Releases</h2>
      <section class="movie-carousel" style="margin-left: 1rem;">
        ${generateReleaseCards((st.movies2026 || []).slice(5))}
      </section>

      <h2 class="year-title" style="margin-left: 1rem;">⭐ 2027 Releases</h2>
      <section class="movie-carousel" style="margin-left: 1rem;">
        ${generateReleaseCards(st.movies2027)}
      </section>
    </div>
  `;
};
