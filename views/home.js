import html from "html-literal";import html from "html-literal";

import { home } from "../store";import { home } from "../store";



// Home view - delegates to home store component// Home view - delegates to home store component

export default () => html`export default () => html`

  ${home()}  ${home()}

`;`;
