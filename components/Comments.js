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

function timeAgo(dateString) {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Comments(state) {
  const comments = Array.isArray(state.comments)
    ? [...state.comments].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    : [];
  const currentUser = state.currentUser || null;

  const list = comments.length
    ? comments
        .map(c => {
          const name = escapeHtml(c.username || c.author || "Anonymous");
          const text = escapeHtml(c.text || "");
          const id = escapeHtml(c._id || "");
          const avatar = c.avatar ? escapeHtml(c.avatar) : null;
          const characterBadge = c.isCharacter
            ? `<span class="comment-character-badge" title="Fan-made character account, not a real Cinemetrics user">🎭 Character</span>`
            : "";
          // Server enforces real ownership on delete; this just hides the
          // button for comments that would be rejected anyway.
          const isOwn = currentUser && c.username === currentUser.username;
          return `
            <li class="comment-item">
              ${
                avatar
                  ? `<img class="comment-avatar" src="${avatar}" alt="${name}" loading="lazy" />`
                  : `<span class="comment-avatar comment-avatar--fallback">${name.charAt(0).toUpperCase()}</span>`
              }
              <div class="comment-body">
                <strong class="comment-author">${name}</strong>
                ${characterBadge}
                <span class="comment-time">${timeAgo(c.createdAt)}</span>
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
