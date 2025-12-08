// File: components/main.js
// Purpose: Render main application content between Header and Footer.
// Notes: Delegates to views that provide page-specific sections.
import html from "html-literal";
import * as views from "../views";

export default st => html`
  ${views[st.view] ? views[st.view](st) : views.ViewNotFound()}
`;
