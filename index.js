// importing core UI components and state
import { Header, Nav, Main, Footer } from "./components";
import * as state from "./store";
import Navigo from "navigo";
import { camelCase } from "lodash";
import { fetchHomeData } from "./services/api";
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
    const view = match?.data?.view ? camelCase(match.data.view) : "home";

    switch (view) {
      case "home":
        // Fetch all home page data from TMDB
        const homeData = await fetchHomeData();
        state.Home.trending = homeData.trending;
        state.Home.nowPlaying = homeData.nowPlaying;
        state.Home.popular = homeData.popular;
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
