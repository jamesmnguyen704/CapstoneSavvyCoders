// File: views/login.js
// Purpose: Login view — renders a login form and posts to /auth/login.
// Notes: Form handler attaches in `index.js` after render.
import html from "html-literal";

export default state => html`
  <section class="auth-page">
    <h1>Login</h1>

    <form id="loginForm">
      <label>Username or Email</label>
      <input type="text" id="loginId" required />

      <label>Password</label>
      <input type="password" id="password" required />

      <button type="submit">Login</button>
    </form>

    <p>No account? <a href="/signup" data-navigo>Sign up</a></p>
  </section>
`;
