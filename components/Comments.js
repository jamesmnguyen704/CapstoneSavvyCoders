export default function Comments(state) {
  // File: components/Comments.js
  // Purpose: Small reusable component to render a list of comments for a movie.
  // Notes: Expects `comments` array on the state and a `movieId` when used.
  return `
    <section>
      <h2>Comments</h2>
      <form id="commentForm">
        <input type="text" id="author" placeholder="Your Name" required />
        <textarea id="text" placeholder="Your Comment" required></textarea>
        <button type="submit">Submit</button>
      </form>

      <ul>
        ${state.comments
          .map(
            c => `
          <li>
            <strong>${c.author}:</strong> ${c.text}
            <button data-id="${c._id}" class="delete-comment">Delete</button>
          </li>
        `
          )
          .join("")}
      </ul>
    </section>
  `;
}
