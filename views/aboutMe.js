import html from "html-literal";import html from "html-literal";
import { about } from "../store";import { about } from "../store";

// About view - delegates to about store component// About view - delegates to about store component

export default () => html`export default () => html`

  ${about()}  ${about()}

`;`;
