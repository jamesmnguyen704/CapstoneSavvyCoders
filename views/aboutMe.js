import html from "html-literal";

// view will "CALL" "store" component
// if "state" has header use it. If not, than default.
export default st => html`
  <section class="about">
    <h1>${st.header || "About My Movie Page"}</h1>
    <p>
      Hey! I'm James. Cinemetrics tracks box office, releases, and movie data.
      This page will expand with my story and goals for the capstone.
    </p>
  </section>
`;
