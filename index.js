import { Header, Nav, Main, Footer } from "./components";
import * as state from "./store";
import Navigo from "navigo";
import { camelCase } from "lodash";
import { fetchHomeData, fetchUpcoming, fetchPopular } from "./services/api";

const router = new Navigo("/");

let currentView = "home";


function render(st = state.Home) {
  console.log("Rendering with state:", st);

  document.querySelector("#root").innerHTML = `
    ${Header(st)}
    ${Main(st)}
    ${Footer(st)}
  `;
  router.updatePageLinks();
}

router.hooks({
  before: async (done, match) => {
    // Extract view from the URL path
    const path = match?.url || "/";
    let view = "home";

    if (path === "/" || path === "") {
      view = "home";
    } else {
      view = camelCase(path.replace("/", ""));
    }

    console.log("Router match:", match);
    console.log("Path:", path);
    console.log("Resolved view:", view);

    switch (view) {
      case "home":
        const homeData = await fetchHomeData();
        state.Home.trending = homeData.trending;
        state.Home.nowPlaying = homeData.nowPlaying;
        state.Home.popular = homeData.popular;
        break;

      case "movies":
        try {
          const popular = await fetchPopular();
          state.Movies.movies = popular;
        } catch (err) {
          console.error("Error loading movies:", err);
          state.Movies.movies = [];
        }
        break;

      case "releases":
        try {
          const upcoming = await fetchUpcoming();
          console.log("Fetched upcoming movies:", upcoming);
          state.Releases.upcoming = upcoming;
          console.log("State after update:", state.Releases);
        } catch (err) {
          console.error("Error loading releases:", err);
          state.Releases.upcoming = [];
        }
        break;
    }

    done();
  }
});

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
