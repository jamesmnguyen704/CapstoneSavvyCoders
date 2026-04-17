// File: views/profile.js
// Purpose: Profile view — decodes the JWT from localStorage and shows user info.
// Notes: Reuses the existing #logoutBtn id so the logout handler in index.js works.
//        Purely read-only — no API calls, no mutations.

import html from "html-literal";

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

function formatExpiry(exp) {
  if (!exp) return "—";
  const ms = exp * 1000;
  const now = Date.now();
  if (ms <= now) return "Expired";
  const mins = Math.round((ms - now) / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.round(mins / 60);
  return `${hrs} hr`;
}

export default () => {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  const payload = token ? decodeToken(token) : null;

  if (!token || !payload) {
    return html`
      <section class="auth-page">
        <h1 class="auth-title">Profile</h1>
        <p class="auth-msg">You are not logged in.</p>
        <p class="auth-switch">
          <a href="/login" data-navigo>Log in</a> ·
          <a href="/signup" data-navigo>Sign up</a>
        </p>
      </section>
    `;
  }

  const initial = (payload.username || "?").charAt(0).toUpperCase();

  return html`
    <section class="profile-page">
      <div class="profile-card">
        <div class="profile-avatar" aria-hidden="true">${initial}</div>
        <h1 class="profile-name">${payload.username || "User"}</h1>
        <p class="profile-email">${payload.email || ""}</p>

        <dl class="profile-meta">
          <div>
            <dt>User ID</dt>
            <dd><code>${payload.id || "—"}</code></dd>
          </div>
          <div>
            <dt>Session expires in</dt>
            <dd>${formatExpiry(payload.exp)}</dd>
          </div>
        </dl>

        <button id="logoutBtn" type="button" class="auth-btn profile-logout">
          Log out
        </button>
      </div>
    </section>
  `;
};
