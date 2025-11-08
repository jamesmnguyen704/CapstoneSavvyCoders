import html from "html-literal";import html from "html-literal";

import { movies } from "../store";import { movies } from "../store";



// Movies view - delegates to movies store component// Movies view - delegates to movies store component

export default () => html`export default () => html`

  ${movies()}  ${movies()}

`;`;
