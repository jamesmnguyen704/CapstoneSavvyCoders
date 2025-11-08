import html from "html-literal";

// Navigation item component - renders individual nav items
export default item => html`
  <li>
    <a
      href="${item.url || item.href}"
      ${item.target
        ? `target="${item.target}"`
        : `data-page="${item.page || item.href}"`}
    >
      ${item.text}
    </a>
  </li>
`;

// Navigation items data
export const navItemsData = [
  {
    href: "home.html",
    url: "home.html",
    text: "Home",
    page: "home",
    isHome: true
  },
  {
    href: "releases.html",
    url: "releases.html",
    text: "Upcoming Releases",
    page: "releases"
  },
  {
    href: "boxoffice.html",
    url: "boxoffice.html",
    text: "Box Office",
    page: "boxoffice"
  },
  {
    href: "movies.html",
    url: "movies.html",
    text: "Movies",
    page: "movies"
  },
  {
    href: "about.html",
    url: "about.html",
    text: "About",
    page: "about"
  }
];

// Logo configuration
export const logo = {
  href: "home.html",
  text: "Cinemetrics"
};

// Mobile menu configuration
export const mobileMenu = {
  iconClass: "fa-solid fa-bars",
  menuId: "menu-icon",
  navLinksId: "nav-links"
};
