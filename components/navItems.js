// File: components/navItems.js
// Purpose: Data and small helpers for building nav links and the mobile menu.
// Notes: Keeps nav item data centralized so the nav component stays simple.
import html from "html-literal";

export default function navItem(item) {
  return html`
    <li>
      <a data-navigo href="${item.url}">
        ${item.text}
      </a>
    </li>
  `;
}

// Top nav — slimmed so the Cinemetrics logo handles Home, and About
// lives in the footer (freeing space up top).
export const navItemsData = [
  { url: "/discover", text: "Discover" },
  { url: "/releases", text: "Upcoming" },
  { url: "/marvel", text: "Marvel" },
  { url: "/movies", text: "Movies" },
  { url: "/awards", text: "Awards" },
  { url: "/news", text: "News" },
  { url: "/my-list", text: "My List" }
];

export const logo = {
  text: "Cinemetrics",
  href: "/"
};

export const mobileMenu = {
  iconClass: "fa-solid fa-bars",
  menuId: "menu-icon",
  navLinksId: "nav-links"
};
