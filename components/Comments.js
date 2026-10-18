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
  const currentUser = state.currentUser || null;

  const list = comments.length
    ? comments
        .map(c => {
          const name = escapeHtml(c.username || c.author || "Anonymous");
          const text = escapeHtml(c.text || "");
          const id = escapeHtml(c._id || "");
          // Server enforces real ownership on delete; this just hides the
          // button for comments that would be rejected anyway.
          const isOwn = currentUser && c.username === currentUser.username;
          return `
            <li class="comment-item">
              <div class="comment-body">
                <strong class="comment-author">${name}</strong>
                <p class="comment-text">${text}</p>
              </div>
              ${
                isOwn
                  ? `<button data-id="${id}" class="delete-comment" aria-label="Delete comment">
                       <i class="fa-solid fa-trash"></i>
                     </button>`
                  : ""
              }
            </li>
          `;
        })
        .join("")
    : `<li class="comment-empty">Be the first to comment.</li>`;

  // Posting requires an account now, so a signed-out visitor gets a prompt
  // instead of a form the server would just reject.
  const formOrPrompt = currentUser
    ? `
      <form id="commentForm" class="comment-form" novalidate>
        <p class="comment-as">Commenting as <strong>${escapeHtml(currentUser.username)}</strong></p>
        <textarea id="text" placeholder="Share your thoughts…" maxlength="600" required></textarea>
        <button type="submit" class="auth-btn comment-submit">Post comment</button>
        <p id="commentMsg" class="auth-msg" role="alert" aria-live="polite"></p>
      </form>
    `
    : `
      <p class="comment-login-prompt">
        <a href="/login" data-navigo>Log in</a> to leave a comment.
      </p>
    `;

  return `
    <section class="comments-section">
      <h2>Comments</h2>

      ${formOrPrompt}

      <ul class="comment-list">
        ${list}
      </ul>
    </section>
  `;
}
