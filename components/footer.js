// File: components/footer.js
// Purpose: Site footer markup and small site credits.
// Notes: Kept minimal so changes to footer text are easy.
import html from "html-literal";

export default () => html`
  <footer class="site-footer">
    <div class="site-footer-inner">
      <p class="site-footer-copy">
        &copy; ${new Date().getFullYear()} Cinemetrics. All rights reserved.
      </p>
      <nav class="site-footer-nav" aria-label="Footer">
        <a href="/about" data-navigo>About</a>
      </nav>
    </div>
  </footer>
`;
