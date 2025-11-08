import html from "html-literal";// testing//

import { releases } from "../store";import { fetchUpcomingMovies } from "../utils/timdbApi.js";



// Releases view - delegates to releases store componentexport default async function ReleasesView() {

export default () => html`  const movies = await fetechUpcomingMovies();

  ${releases()}

`;   return `
    <section class="releases">
      <h2>🎬 Upcoming Releases</h2>
      <div class="movie-grid">
        ${movies.map(movie => `
          <div class="movie-card">
            <img src="${movie.poster}" alt="${movie.title}" />
            <h3>${movie.title}</h3>
            <p>📅 ${movie.releaseDate}</p>
            <p>⭐ ${movie.rating.toFixed(1)}</p>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}
