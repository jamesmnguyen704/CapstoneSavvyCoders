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

export const navItemsData = [
  { url: "/", text: "Home" },
  { url: "/releases", text: "Upcoming Releases" },
  { url: "/boxoffice", text: "Box Office" },
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
