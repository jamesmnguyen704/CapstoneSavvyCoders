// File: views/signup.js
// Purpose: Signup view — renders a signup form and posts to /auth/signup.
// Notes (James-style):
//   - IDs MUST match the handlers in index.js (#signupForm, #username, #email, #password).
//   - index.js attaches the submit listener AFTER render, so this file ONLY renders markup.
//   - state.form.* is optional but nice to preserve user input if the view re-renders.

import html from "html-literal";

export default state => html`
  <section class="auth-page">
    <h1 class="auth-title">${state.header || "Create Account"}</h1>

    <form id="signupForm" class="auth-form">
      <label for="username">Username</label>
      <input
        type="text"
        id="username"
        value="${state.form?.username || ""}"
        placeholder="Choose a username"
        required
      />

      <label for="email">Email</label>
      <input
        type="email"
        id="email"
        value="${state.form?.email || ""}"
        placeholder="your@email.com"
        required
      />

      <label for="password">Password</label>
      <input
        type="password"
        id="password"
        value="${state.form?.password || ""}"
        placeholder="Create a password"
        required
      />

      <button type="submit" class="auth-btn">Sign Up</button>
    </form>

    <p class="auth-switch">
      Already have an account?
      <a href="/login" data-navigo>Log in</a>
    </p>
  </section>
`;

// === END BACKUP ===
