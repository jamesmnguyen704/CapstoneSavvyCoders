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

// updated and change this to Marvel(Replaced Box Office → Marvel)
export const navItemsData = [
  { url: "/", text: "Home" },
  { url: "/releases", text: "Upcoming Releases" },
  { url: "/marvel", text: "Marvel" }, // ✅ FIXED
  { url: "/movies", text: "Movies" },
  { url: "/about", text: "About" }
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
