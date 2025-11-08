import html from "html-literal";
import oops404 from "url:../Assets/images/oops-404.jpg";

export default () => html`
  <section class="not-found">
    <img src="${oops404}" alt="404 Error" class="error-image" />
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/" data-navigo>Go Home</a>
  </section>
`;
