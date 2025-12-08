// File: views/movies.js
// Purpose: Movies view — displays a grid of movies with poster, title, ratings, and trailer/comment buttons.
// Notes: Expects `st.movies` to be an array of movie objects fetched from the API.
import html from "html-literal";

export default function Movies(st) {
  const movies = st.movies || [];

  return html`
    <div class="movies-container">
      <section class="movies-header">
        <h1>${st.header || "Movies"}</h1>
        <p>Browse the most popular movies available right now.</p>
      </section>

      <!-- my movie cards -->
      <section class="movies-grid">
        ${
          movies.length > 0
            ? movies
                .map(movie => {
                  const poster = movie.poster_path
                    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                    : "https://via.placeholder.com/300x450?text=No+Image";

                  return html`
                    <div class="movie-card">
                      <img src="${poster}" alt="${movie.title}" class="movie-poster"/>

                      <h3 class="movie-title">${movie.title}</h3>

                      <p class="movie-rating">
                        ⭐ ${movie.vote_average || "N/A"}
                      </p>

                      <button class="comment-btn" data-movieid="${movie.id}">
                        View Comments
                      </button>

                      <button class="trailer-btn" data-id="${movie.id}">
                        ▶ Trailer
                      </button>
                    </div>
                  `;
                })
                .join("")
            : html`<p class="no-movies">No movies found.</p>`
        }
      </section>

    </div>
  `;
}
