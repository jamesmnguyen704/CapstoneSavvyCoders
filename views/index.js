// File: views/index.js
// Purpose: Barrel exports for all view components used by the client router.
// Notes: Export views here so `components/main` can lookup views by state.view.
export { default as Home } from "./home";
export { default as AboutMe } from "./aboutMe";
export { default as marvel } from "./marvel";
export { default as Movies } from "./movies";
export { default as Releases } from "./releases";
export { default as login } from "./login";
export { default as signup } from "./signup";
export { default as ViewNotFound } from "./viewNotFound";
