import html from "html-literal";

// converting my footer from static html into reusable Javascript component using template literals
// using html-literal for templating
// creates a function component that returns html
//()`` uses backticks instead of quotes to allow multiple html
export default () => html`
  <footer>
    <p>&copy; 2025 Movies. All rights reserved by James Nguyen.</p>
  </footer>
`;
