import { Header, Nav, Main, Footer } from "./components";
import * as state from "./store";
import Navigo from "navigo";
import { camelCase } from "lodash";

import {
  fetchHomeData,
  fetchPopular,
  fetchUpcomingCurated,
  fetchNowPlaying,
  fetchMarvelMovies,
  fetchMovieVideos,
  fetchComments,
  postComment,
  deleteComment
} from "./services/api";

const router = new Navigo("/");

// ===================== RENDER =====================
async function render(st = state.Home) {
  console.log("Rendering with state:", st);

  const mainContent = await Main(st);

  document.querySelector("#root").innerHTML = `
    ${Header(st)}
    ${mainContent}
    ${Footer(st)}
  `;

  router.updatePageLinks();
  attachTrailerButtons();
}

// ===================== TRAILER HANDLING =====================
function attachTrailerButtons() {
  document.querySelectorAll(".trailer-btn")?.forEach(btn => {
    btn.addEventListener("click", async event => {
      const movieId = event.target.dataset.id;
      const videos = await fetchMovieVideos(movieId);

      const trailer = videos.find(
        v => v.site === "YouTube" && v.type === "Trailer"
      );

      if (!trailer) {
        alert("No trailer available");
        return;
      }

      const modal = document.querySelector("#trailerModal");
      const frame = document.querySelector("#trailerFrame");

      frame.src = `https://www.youtube.com/embed/${trailer.key}`;
      modal.classList.remove("hidden");
    });
  });

  document.querySelector(".close-modal")?.addEventListener("click", () => {
    closeTrailerModal();
  });

  document.querySelector("#trailerModal")?.addEventListener("click", e => {
    if (e.target.id === "trailerModal") closeTrailerModal();
  });
}

function closeTrailerModal() {
  const modal = document.querySelector("#trailerModal");
  const frame = document.querySelector("#trailerFrame");

  frame.src = "";
  modal.classList.add("hidden");
}


// ===================== ROUTER HOOKS =====================
router.hooks({
  before: async (done, match) => {
    const path = match?.url || "/";
    let view =
      path === "/" || path === "" ? "home" : camelCase(path.replace("/", ""));

    console.log("Router resolved view:", view);

    switch (view) {
      case "home": {
        const home = await fetchHomeData();
        state.Home.trending = home.trending;
        state.Home.nowPlaying = home.nowPlaying;
        state.Home.popular = home.popular;
        break;
      }

      case "movies":
        try {
          const popular = await fetchPopular();
          state.Movies.movies = popular;
        } catch (err) {
          state.Movies.movies = [];
        }
        break;

      // ================= MARVEL PAGE =================
      case "marvel":
        try {
          console.log("Fetching Marvel movies...");
          const data = await fetchMarvelMovies();
          state.Marvel.marvel = Array.isArray(data) ? data : [];
        } catch (err) {
          console.error("Error loading Marvel:", err);
          state.Marvel.marvel = [];
        }
        break;

      case "releases":
        try {
          const curated = await fetchUpcomingCurated();
          state.Releases.movies2026 = curated["2026"];
          state.Releases.movies2027 = curated["2027"];
        } catch (err) {
          state.Releases.movies2026 = [];
          state.Releases.movies2027 = [];
        }
        break;

      case "comments": {
        const movieId = match.data.movieId;
        state.Comments.movieId = movieId;
        state.Comments.comments = await fetchComments(movieId);
        break;
      }
    }

    done();
  }
});

// ===================== ROUTES =====================
router
  .on({
    "/": () => render(state.Home),
    "/movies": () => render(state.Movies),
    "/releases": () => render(state.Releases),
    "/marvel": () => render(state.Marvel),     // FINAL ROUTE
    "/about": () => render(state.AboutMe),
    "/comments/:movieId": () => render(state.Comments)
  })
  .notFound(() => render(state.ViewNotFound))
  .resolve();
