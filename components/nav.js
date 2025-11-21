import html from "html-literal";
import navItem, { navItemsData, logo, mobileMenu } from "./navItems.js";

const generateNavLinks = () =>
  navItemsData
    .filter(item => !item.isHome)
    .map(item => navItem(item))
    .join("");

export default () => html`
  <nav class="navbar">
    <div class="logo">
      <a href="${logo.href}" data-navigo>${logo.text}</a>
    </div>
    <i class="${mobileMenu.iconClass}" id="${mobileMenu.menuId}"></i>
    <ul class="nav-links" id="${mobileMenu.navLinksId}">
      ${generateNavLinks()}
    </ul>
  </nav>
`;
