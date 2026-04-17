// File: components/Comments.js
// Purpose: Renders the comment form + list for a movie.
// Notes:
//   - Backend model uses `username` + `text` (not `author`). We accept either
//     for back-compat when reading, and always post `username`.
//   - All user-supplied values are HTML-escaped to prevent XSS.

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function Comments(state) {
  const comments = Array.isArray(state.comments) ? state.comments : [];

  const list = comments.length
    ? comments
        .map(c => {
          const name = escapeHtml(c.username || c.author || "Anonymous");
          const text = escapeHtml(c.text || "");
          const id = escapeHtml(c._id || "");
          return `
            <li class="comment-item">
              <div class="comment-body">
                <strong class="comment-author">${name}</strong>
                <p class="comment-text">${text}</p>
              </div>
              <button data-id="${id}" class="delete-comment" aria-label="Delete comment">
                <i class="fa-solid fa-trash"></i>
              </button>
            </li>
          `;
        })
        .join("")
    : `<li class="comment-empty">Be the first to comment.</li>`;

  return `
    <section class="comments-section">
      <h2>Comments</h2>

      <form id="commentForm" class="comment-form" novalidate>
        <input type="text" id="author" placeholder="Your name" maxlength="60" required />
        <textarea id="text" placeholder="Share your thoughts…" maxlength="600" required></textarea>
        <button type="submit" class="auth-btn comment-submit">Post comment</button>
        <p id="commentMsg" class="auth-msg" role="alert" aria-live="polite"></p>
      </form>

      <ul class="comment-list">
        ${list}
      </ul>
    </section>
  `;
}
