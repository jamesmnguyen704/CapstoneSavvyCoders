// File: components/header.js
// Purpose: Top-level header component that includes the navigation.
// Notes: Keeps the header markup separate for easy styling and reuse.
import html from "html-literal";
import nav from "./nav.js";

export default () => html`
  <header>
    ${nav()}
  </header>
`;
