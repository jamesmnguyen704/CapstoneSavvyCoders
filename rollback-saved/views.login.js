// BACKUP of views/login.js — saved before rollback
// === BEGIN BACKUP ===
// File: views/login.js
// Purpose: Login view — simple login screen for the Cinemetrics app.
// Notes (James-style): This form connects directly to my login handler in index.js.
//                      IDs MUST match exactly or the page won’t read the input values.
//                      index.js listens for: #loginForm, #loginId, #password.

import html from "html-literal";

export default state => html`
  <section class="auth-page">
    <h1 class="auth-title">Login</h1>

    <form id="loginForm" class="auth-form">
      <label for="loginId">Username or Email</label>
      <input type="text" id="loginId" required placeholder="Enter username or email" />

      <label for="password">Password</label>
      <input type="password" id="password" required placeholder="Enter your password" />

      <button type="submit" class="auth-btn">Login</button>
    </form>

    <p class="auth-switch">
      No account yet?
      <a href="/signup" data-navigo>Sign up</a>
    </p>
  </section>
`;

// === END BACKUP ===
