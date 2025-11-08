import html from "html-literal";import html from "html-literal";

import { boxoffice } from "../store";import { boxoffice } from "../store";



// Box office view - delegates to boxoffice store component// Box office view - delegates to boxoffice store component

export default () => html`export default () => html`

  ${boxoffice()}  ${boxoffice()}

`;`;
