import html from "html-literal";

const generateReleaseCards = st =>
  st.upcoming
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
                ${new Date(movie.release_date).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div class="release-info">
            <h3 class="release-title">${movie.title}</h3>

            <p class="release-description">
              ${movie.overview || "No description available."}
            </p>

            <p class="release-genre">
              ⭐ Rating: ${movie.vote_average || "TBD"}
            </p>
          </div>
        </div>
      `
    )
    .join("");

export default st => html`
  <div class="releases-container">
    <section class="releases-header">
      <h1>${st.header || "Upcoming Movie Releases"}</h1>
      <p>Discover the biggest movies hitting theaters soon.</p>
    </section>

    <section class="releases-grid">
      ${st.upcoming && st.upcoming.length
        ? generateReleaseCards(st)
        : "<p>No upcoming movies found.</p>"}
    </section>
  </div>
`;
