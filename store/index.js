// File: store/index.js
// Purpose: Centralized export of all view stores used by the client router.
// Notes: Import this module to access per-view state objects.
import Home from "./home";
import Movies from "./movies";
import Releases from "./releases";
import Marvel from "./marvel";
import AboutMe from "./aboutMe";
import ViewNotFound from "./viewNotFound";
import nav from "./nav";
import Comments from "./Comments";

// NEW AUTH STORES
// Use lowercase filenames to avoid case-sensitive resolution errors on CI/Netlify
import Login from "./login";
import Signup from "./signup";

export {
  Home,
  Movies,
  Releases,
  Marvel,
  AboutMe,
  ViewNotFound,
  nav,
  Comments,
  Login,
  Signup
};

export default {
  Home,
  Movies,
  Releases,
  Marvel,
  AboutMe,
  ViewNotFound,
  nav,
  Comments,
  Login,
  Signup
};
