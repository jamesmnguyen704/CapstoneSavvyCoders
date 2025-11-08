import html from "html-literal";

// 🧭 Reusable nav item component
// Creates an <li> element with proper Navigo routing attributes
export default function navItem(item) {
  return html`
    <li>
      <a data-navigo href="${item.url}">
        ${item.text}
      </a>
    </li>
  `;
}

// 🧩 Navigation data used by Nav.js
export const navItemsData = [
  { url: "/", text: "Home" },
  { url: "/releases", text: "Upcoming Releases" },
  { url: "/boxoffice", text: "Box Office" },
  { url: "/movies", text: "Movies" },
  { url: "/about", text: "About" }
];

// 🪩 Logo info
export const logo = {
  text: "Cinemetrics",
  href: "/"
};

// 📱 Mobile menu config (optional for later)
export const mobileMenu = {
  iconClass: "fa-solid fa-bars",
  menuId: "menu-icon",
  navLinksId: "nav-links"
};
