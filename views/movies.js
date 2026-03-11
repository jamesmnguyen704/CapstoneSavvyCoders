// File: views/movies.js
// Purpose: Movies view — displays a grid of movies with poster, title, ratings, and trailer/comment buttons.
// Notes: Expects `st.movies` to be an array of movie objects fetched from the API.
import html from "html-literal";

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
              src="https://image.tmdb.org/t/p/original${movie.backdrop_path ||
                movie.poster_path}" 
              alt="${movie.title} Backdrop" 
              onerror="this.onerror=null; this.src='images/placeholder-poster.jpg'"
            />
            <div class="hero-content">
              <h1>${movie.title}</h1>
              <p>${movie.overview}</p>
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

      <!-- my movie cards -->
      <section class="movie-carousel">
        ${carouselMovies.length > 0
          ? carouselMovies
              .map(movie => {
                const poster = movie.poster_path
                  ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                  : "https://via.placeholder.com/300x450?text=No+Image";

                return html`
                  <div class="movie-card">
                    <img
                      src="${poster}"
                      alt="${movie.title}"
                      class="movie-poster"
                    />

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
          : html`
              <p class="no-movies">No movies found.</p>
            `}
      </section>
    </div>
  `;
}
