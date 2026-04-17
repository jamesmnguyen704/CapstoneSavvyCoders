// File: views/signup.js
// Purpose: Signup view — renders the signup form. Submit handler lives in index.js.
// Notes: IDs must match the handler in index.js (#signupForm, #username, #email, #password, #authMsg).

import html from "html-literal";

export default state => html`
  <section class="auth-page">
    <h1 class="auth-title">${state.header || "Create Account"}</h1>

    <form id="signupForm" class="auth-form" novalidate>
      <label for="username">Username</label>
      <input
        type="text"
        id="username"
        autocomplete="username"
        value="${state.form?.username || ""}"
        placeholder="Choose a username"
        required
      />

      <label for="email">Email</label>
      <input
        type="email"
        id="email"
        autocomplete="email"
        value="${state.form?.email || ""}"
        placeholder="your@email.com"
        required
      />

      <label for="password">Password</label>
      <input
        type="password"
        id="password"
        autocomplete="new-password"
        value="${state.form?.password || ""}"
        placeholder="Create a password (min 6 characters)"
        minlength="6"
        required
      />

      <p id="authMsg" class="auth-msg" role="alert" aria-live="polite"></p>

      <button type="submit" class="auth-btn">Sign Up</button>
    </form>

    <p class="auth-switch">
      Already have an account?
      <a href="/login" data-navigo>Log in</a>
    </p>
  </section>
`;
