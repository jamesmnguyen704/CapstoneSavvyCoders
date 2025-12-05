import { Header, Nav, Main, Footer } from "./components";
import * as state from "./store";
import Navigo from "navigo";
import { camelCase } from "lodash";
import {
  fetchHomeData,
  fetchPopular,
  fetchUpcoming,
  fetchNowPlaying,
  fetchBoxOffice,
  fetchMovieVideos,
  fetchComments,
  postComment,
  deleteComment
} from "./services/api";

const router = new Navigo("/");

// trailer button
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

// trailer button
function attachTrailerButtons() {
  document.querySelectorAll(".trailer-btn")?.forEach(btn => {
    btn.addEventListener("click", async event => {
      const movieId = event.target.dataset.id;

      // Fetch trailers from backend
      const videos = await fetchMovieVideos(movieId);

      // youtube trailer
      const trailer = videos.find(
        v => v.site === "YouTube" && v.type === "Trailer"
      );

      if (!trailer) {
        alert("No trailer available");
        return;
      }

      // Open modal + load YouTube video
      const modal = document.querySelector("#trailerModal");
      const frame = document.querySelector("#trailerFrame");

      frame.src = `https://www.youtube.com/embed/${trailer.key}`;
      modal.classList.remove("hidden");
    });
  });

  document.querySelector(".close-modal")?.addEventListener("click", () => {
    closeTrailerModal();
  });

  // closing it
  document.querySelector("#trailerModal")?.addEventListener("click", e => {
    if (e.target.id === "trailerModal") {
      closeTrailerModal();
    }
  });
}

function closeTrailerModal() {
  const modal = document.querySelector("#trailerModal");
  const frame = document.querySelector("#trailerFrame");

  frame.src = "";
  modal.classList.add("hidden");
}

// my hooks before rendering
router.hooks({
  before: async (done, match) => {
    const path = match?.url || "/";
    let view = path === "/" || path === "" ? "home" : camelCase(path.replace("/", ""));

    console.log("Router resolved view:", view);

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

          const top = await fetchBoxOffice();
          state.Movies.topGrossing = top || [];
        } catch (err) {
          console.error("Error loading movies:", err);
          state.Movies.movies = [];
          state.Movies.topGrossing = [];
        }
        break;

      case "releases":
        try {
          const upcoming = await fetchUpcoming();
          state.Releases.upcoming = upcoming;
        } catch (err) {
          console.error("Error loading releases:", err);
          state.Releases.upcoming = [];
        }
        break;

      case "comments":
        const movieId = match.data.movieId;
        state.Comments.movieId = movieId;
        state.Comments.comments = await fetchComments(movieId);
        break;
    }

    done();
  }
});

// my routes
router
  .on({
    "/": () => render(state.Home),
    "/movies": () => render(state.Movies),
    "/releases": () => render(state.Releases),
    "/boxoffice": () => render(state.BoxOffice),
    "/about": () => render(state.AboutMe),
    "/comments/:movieId": () => render(state.Comments)
  })
  .notFound(() => {
    console.warn("⚠️ Route not found. Rendering ViewNotFound.");
    render(state.ViewNotFound);
  })
  .resolve();
