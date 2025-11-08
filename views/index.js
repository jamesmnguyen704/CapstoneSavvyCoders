// Views index - central export point for all views

// Components: import { Header, Footer } from "./components"
// Store: import { Home, Movies } from "./store"
// Views: import { Home, AboutMe } from "./views"
// Views → What users see (presentation)
// Store → Data and state management
// Components → Reusable UI pieces

export { default as Home } from "./home";
export { default as AboutMe } from "./aboutMe";
export { default as BoxOffice } from "./boxoffice";
export { default as Movies } from "./movies";
export { default as Releases } from "./releases";
export { default as ViewNotFound } from "./viewNotFound";
