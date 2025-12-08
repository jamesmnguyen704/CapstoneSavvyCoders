// File: views/aboutMe.js
// Purpose: About Me view — personal project notes and author bio.
// Notes: Short page to describe author and project goals.
import html from "html-literal";

export default st => html`
  <section class="about">
    <h1>${st.header || "About My Movie Page"}</h1>
    <p>
      Hey! I'm James. Cinemetrics tracks box office, releases, and movie data.
      This page will expand with my story and goals for the capstone.
    </p>
  </section>
`;
