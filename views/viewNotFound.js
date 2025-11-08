import html from "html-literal";

export default () => html`
  <section class="not-found">
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/" data-navigo>Go Home</a>
  </section>
`;
