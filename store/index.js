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
import Profile from "./profile";
import News from "./news";
import MyList from "./myList";
import Games from "./games";
import Theaters from "./theaters";
import Tv from "./tv";
import HotTakes from "./hotTakes";

// Movies folded into Home as a "Browse All" section (no more standalone
// /movies route) — this keeps them the SAME object so every handler that
// already reads/writes state.Movies directly keeps working unchanged.
Home.movies = Movies;

// Upcoming folded into Theaters as a curated-releases section below the
// ZIP/theater UI (no more standalone /releases route) — same pattern: keep
// them the SAME object so every handler that already reads/writes
// state.Releases directly keeps working unchanged.
Theaters.releases = Releases;

// Movie News folded into Home as its own section (no more standalone /news
// route) — same pattern again: keep it the SAME object so every handler
// that already reads/writes state.News directly keeps working unchanged.
Home.news = News;

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
  Signup,
  Profile,
  News,
  MyList,
  Games,
  Theaters,
  Tv,
  HotTakes
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
  Signup,
  Profile,
  News,
  MyList,
  Games,
  Theaters,
  Tv,
  HotTakes
};
