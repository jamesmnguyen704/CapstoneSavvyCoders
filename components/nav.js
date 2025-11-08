import html from "html-literal";
import navItem, { navItemsData, logo, mobileMenu } from "./navItems.js";

// reusable "navItem" components
// navigation links using NavItems compenents
const generateNavLinks = () =>
  navItemsData
    .filter(item => !item.isHome)
    .map(item => navItem(item))
    .join("");

// remove "Home" link.
// "data-navigo" tells router to handle, "data-page" specifiy what page
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

// OLD CODE
// import html from "html-literal";
// import navItem, { navItemsData, logo, mobileMenu } from "./navItems.js";

// // Generate navigation links using navItems component
// const generateNavLinks = () => {
//   return navItemsData
//     .filter(item => !item.isHome)
//     .map(item => navItem(item))
//     .join("");
// };

// export default () => html`
//   <nav class="navbar">
//     <div class="logo">
//       <a href="${logo.href}">${logo.text}</a>
//     </div>
//     <i class="${mobileMenu.iconClass}" id="${mobileMenu.menuId}"></i>
//     <ul class="nav-links" id="${mobileMenu.navLinksId}">
//       ${generateNavLinks()}
//     </ul>
//   </nav>
// `;
