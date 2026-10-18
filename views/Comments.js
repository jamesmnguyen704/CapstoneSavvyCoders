// File: views/Comments.js
// Purpose: Page wrapper for the Comments component; loads comments for a movie.
// Notes: Expects `state.movieId` and `state.comments` to be populated by router hooks.
import html from "html-literal";
import CommentsComponent from "../components/Comments";

export default state => html`
  <section class="comments-page">
    <div class="comments-page-header">
      ${
        state.moviePoster
          ? `<img class="comments-page-poster" src="https://image.tmdb.org/t/p/w200${state.moviePoster}" alt="${state.movieTitle || ""}" />`
          : ""
      }
      <h1>Comments for ${state.movieTitle || `Movie ID: ${state.movieId}`}</h1>
    </div>

    <div class="comments-wrapper">
      ${CommentsComponent(state)}
    </div>

    <button class="back-btn" data-navigo href="/">⬅ Back to Movies</button>
  </section>
`;
