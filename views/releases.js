// version 2 changed from popular list from TMDB because i dont like those movies
// did a curated list to pull live data from backend fetchupcomingcurated()

import html from "html-literal";

const generateReleaseCards = movies =>
  movies
    ?.sort((a, b) => new Date(a.customDate) - new Date(b.customDate))
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
              ⭐ Rating: ${movie.vote_average?.toFixed(1) || "TBD"}
            </p>
            <button class="trailer-btn" data-id="${movie.id}">
              ▶ Trailer
            </button>
          </div>
        </div>
      `
    )
    .join("");

export default st => html`
  <div class="releases-container">
    <section class="releases-header">
      <h1>My most anticipated movies</h1>
      <p>Discover the biggest movies hitting theaters soon.</p>
    </section>

    <h2 class="year-title">⭐ 2026 Releases</h2>
    <section class="releases-grid">
      ${generateReleaseCards(st.movies2026)}
    </section>

    <h2 class="year-title">⭐ 2027 Releases</h2>
    <section class="releases-grid">
      ${generateReleaseCards(st.movies2027)}
    </section>
  </div>
`;
