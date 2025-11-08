import html from "html-literal";

export default () => html`
  <footer>
    <p>&copy; ${new Date().getFullYear()} Cinemetrics. All rights reserved.</p>
  </footer>
`;
