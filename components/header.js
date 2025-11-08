import html from "html-literal";
import nav from "./nav.js";

export default () => html`
  <header>
    ${nav()}
  </header>
`;
