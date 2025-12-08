// File: views/Comments.js
// Purpose: Page wrapper for the Comments component; loads comments for a movie.
// Notes: Expects `state.movieId` and `state.comments` to be populated by router hooks.
import html from "html-literal";
import CommentsComponent from "../components/Comments";

export default state => html`
  <section class="comments-page">
    <h1>Comments for Movie ID: ${state.movieId}</h1>

    <div class="comments-wrapper">
      ${CommentsComponent(state)}
    </div>

    <button class="back-btn" data-navigo href="/movies">⬅ Back to Movies</button>
  </section>
`;
