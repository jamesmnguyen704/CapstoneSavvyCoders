import html from "html-literal";

//reusable nav item template

export default item => html`
  <li>
    <a href="#" data-navigo data-page="${item.page}">
      ${item.text}
    </a>
  </li>
`;
// function to take any nav item data and return html
export const navItemsData = [
  { url: "/", text: "Home", isHome: true },
  { url: "/releases", text: "Upcoming Releases" },
  { url: "/boxoffice", text: "Box Office" },
  { url: "/movies", text: "Movies" },
  { url: "/about", text: "About" }
];
// consistency and configuration objects
// clickable home link log
export const logo = {
  href: "/",
  text: "Cinemetrics"
};

// mobile menu config
export const mobileMenu = {
  iconClass: "fa-solid fa-bars",
  menuId: "menu-icon",
  navLinksId: "nav-links"
};
