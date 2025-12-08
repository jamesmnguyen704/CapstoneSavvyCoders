// File: views/signup.js
// Purpose: Signup view — renders a signup form and posts to /auth/signup.
// Notes: Form handler attaches in `index.js` after render.
import html from "html-literal";

export default state => html`
  <section class="auth-container">
    <h2>${state.header}</h2>

    <form id="signupForm">
      <label>Username</label>
      <input
        type="text"
        id="username"
        value="${state.form.username}"
        required
      />

      <label>Email</label>
      <input type="email" id="email" value="${state.form.email}" required />

      <label>Password</label>
      <input
        type="password"
        id="password"
        value="${state.form.password}"
        required
      />

      <button type="submit">Sign Up</button>
    </form>
  </section>
`;
