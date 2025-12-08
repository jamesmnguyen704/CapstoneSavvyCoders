// File: components/nav.js
// Purpose: Render the top navigation bar and authentication links.
// Notes: Shows Login/Signup when not authenticated; when a JWT is present
// in localStorage the username is decoded and a welcome + logout button is shown.
import html from "html-literal";
import navItem, { navItemsData, logo, mobileMenu } from "./navItems.js";

// Build normal nav links
const generateNavLinks = () =>
  navItemsData
    .filter(item => !item.isHome)
    .map(item => navItem(item))
    .join("");

// Build Login / Signup or Welcome / Logout
const generateAuthLinks = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Not logged in
    return html`
      <a href="/login" data-navigo>Login</a>
      <a href="/signup" data-navigo>Sign Up</a>
    `;
  }

  // Logged in → decode username
  let username = "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    username = payload.username;
  } catch (err) {
    console.error("Token decode failed:", err);
  }

  return html`
    <span class="welcome">Welcome, ${username}!</span>
    <button id="logoutBtn">Logout</button>
  `;
};

export default state => html`
  <nav class="navbar">
    <div class="nav-left">
      <a href="/" data-navigo class="logo">${logo.text}</a>
      <ul class="nav-links">
        ${generateNavLinks()}
      </ul>
    </div>

    <div class="nav-right">
      ${generateAuthLinks()}
    </div>
  </nav>
`;
