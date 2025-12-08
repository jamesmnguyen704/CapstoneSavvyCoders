// File: components/footer.js
// Purpose: Site footer markup and small site credits.
// Notes: Kept minimal so changes to footer text are easy.
import html from "html-literal";

export default () => html`
  <footer>
    <p>&copy; ${new Date().getFullYear()} Cinemetrics. All rights reserved.</p>
  </footer>
`;
