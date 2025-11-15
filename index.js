// importing core UI components and state
import { Header, Nav, Main, Footer } from "./components"; //building blocks for my page layout
import * as state from "./store"; // brings all the data ojbjects from store folder that defines the content
import Navigo from "navigo"; // import the router for client side. allowing navigating between pages without fullpage reload
import { camelCase } from "lodash";
import axios from "axios"

const router = new Navigo("/"); //  Initialize the Navigo router

//  Render function – dynamically builds your SPA view
// "st" = the current state object (e.g., { header: "Movies", view: "Movies" })
let currentView = "home";
function render(st = state.Home) {
  console.log("Rendering with state:", st);

  document.querySelector("#root").innerHTML = `
    ${Header(st)}
    ${Main(st)}
    ${Footer(st)}
  `;

  // Rebind all <a data-navigo> links for SPA navigation
  router.updatePageLinks();
}

router.hooks({
  before: async (done, match) => {
    const view = match?.data?.view ? camelCase(match.data.view) : "home";

    console.log("Router before hook running for view:", view);

    switch (view) {

// Home API information pulled
    case "home":
        console.log("Fetching TMDB Home Data");

      try {
      // 1 trending
      const trendingRes = await axios.get(
        `https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.TMDB_API_KEY}`
      );
      state.Home.trending = trendingRes.data.results;

      // 2 Now Playing in the U.S
      const nowPlayingRes = await axios.get(
        `https://api.themoviedb.org/3/movie/now_playing?region=US&api_key=${process.env.TMDB_API_KEY}`
      );
      state.Home.nowPlaying = nowPlayingRes.data.results;

      // 3 popular (U.S.)
      const popularRes = await axios.get(
        `https://api.themoviedb.org/3/movie/popular?region=US&api_key=${process.env.TMDB_API_KEY}`
      );
      state.Home.popular = popularRes.data.results;

} catch (error) {
  console.error("TMDB Home API Error:", error);
}
        break;
    }

    done();
  }
});


// Router setup
router
  .on({
    "/": () => render(state.Home),
    "/movies": () => render(state.Movies),
    "/releases": () => render(state.Releases),
    "/boxoffice": () => render(state.BoxOffice),
    "/about": () => render(state.AboutMe)
  })
  .notFound(() => {
    console.warn("⚠️ Route not found. Rendering ViewNotFound.");
    render(state.ViewNotFound);
  })
  .resolve();
