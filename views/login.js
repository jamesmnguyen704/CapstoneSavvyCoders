// File: views/login.js
// Purpose: Login view — renders the login form. Submit handler lives in index.js.
// Notes: IDs must match the handler in index.js (#loginForm, #loginId, #password, #authMsg).

import html from "html-literal";

export default state => html`
  <section class="auth-page">
    <h1 class="auth-title">${state.header || "Login"}</h1>

    <form id="loginForm" class="auth-form" novalidate>
      <label for="loginId">Username or Email</label>
      <input
        type="text"
        id="loginId"
        autocomplete="username"
        required
        placeholder="Enter username or email"
      />

      <label for="password">Password</label>
      <input
        type="password"
        id="password"
        autocomplete="current-password"
        required
        placeholder="Enter your password"
      />

      <p id="authMsg" class="auth-msg" role="alert" aria-live="polite"></p>

      <button type="submit" class="auth-btn">Login</button>
    </form>

    <p class="auth-switch">
      No account yet?
      <a href="/signup" data-navigo>Sign up</a>
    </p>
  </section>
`;
