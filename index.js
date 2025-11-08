// // importing all my core UI "components folder"
// // as state grabs all export from "store folder"
// import { Header, Main, Footer } from "./components";
// import * as state from "./store";
// import Navigo from "navigo";

// // Use Navigo for routing
// const router = new Navigo("/");

// // Render function – builds your SPA dynamically
// // "st" the store object (like "{ header: "Box Office", view: "BoxOffice" })
// // each component will receive "state" & render. router.updatePageLinks() rebinds all <a data-navigo>
// function render(st = state.Home) {
//   console.log("Rendering with state:", st);
//   document.querySelector("#root").innerHTML = `
//     ${Header(st)}
//     ${Main(st)}
//     ${Footer(st)}
//   `;

//   // Let Navigo attach listeners to <a data-navigo> links
//   router.updatePageLinks();
// }

// // Run the initial render (default view)
// render();

// // 🧭 Router setup:
// router
//   .on({
//     "/": () => render(state.Home),
//     movies: () => render(state.Movies),
//     releases: () => render(state.Releases),
//     boxoffice: () => render(state.BoxOffice),
//     about: () => render(state.AboutMe)
//   })
//   .notFound(() => render(state.ViewNotFound))
//   .resolve();

// 🧩 Import core UI components and state
import { Header, Main, Footer } from "./components";
import * as state from "./store";
import Navigo from "navigo";

// 🧭 Initialize the Navigo router
const router = new Navigo("/");

// 🧱 Render function – dynamically builds your SPA view
// "st" = the current state object (e.g., { header: "Movies", view: "Movies" })
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

// 🧭 Router setup
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
