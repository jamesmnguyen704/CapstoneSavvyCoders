// File: index.js
// Purpose: Client entry point — initializes router, fetches data, and renders views.
// Notes: Attaches auth handlers, trailer modal logic, and router hooks to populate state.
import { Header, Nav, Main, Footer } from "./components";
import * as state from "./store";
import Navigo from "navigo";
import { camelCase } from "lodash";

import {
  fetchHomeData,
  fetchPopular,
  fetchUpcomingCurated,
  fetchMarvelMovies,
  fetchMovieVideos,
  fetchComments
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

// ===================== AUTH FORM HANDLERS =====================

// SIGNUP
function attachSignupHandler() {
  const form = document.querySelector("#signupForm");
  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const username = document.querySelector("#username").value.trim();
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();

    try {
      const res = await fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Signup failed");
        return;
      }

      alert("Signup successful! Please log in.");
      router.navigate("/login");
    } catch (err) {
      console.error("SIGNUP ERROR:", err);
      alert("Signup error — check console.");
    }
  });
}

// LOGIN
function attachLoginHandler() {
  const form = document.querySelector("#loginForm");
  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const loginId = document.querySelector("#loginId").value.trim();
    const password = document.querySelector("#password").value.trim();

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // Save token
      localStorage.setItem("token", data.token);

      alert("Login successful!");
      router.navigate("/");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert("Login error — check console.");
    }
  });
}

// LOGOUT
function attachLogout() {
  const btn = document.querySelector("#logoutBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    localStorage.removeItem("token");
    alert("Logged out!");
    router.navigate("/");
  });
}

// Attach both form handlers after render
function attachAuthHandlers() {
  attachSignupHandler();
  attachLoginHandler();
}

// OVERRIDE render to attach handlers after DOM loads
const originalRender = render;
render = async function (st) {
  await originalRender(st);
  attachAuthHandlers();
  attachLogout();
};

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
        } catch {
          state.Movies.movies = [];
        }
        break;

      case "marvel":
        try {
          const data = await fetchMarvelMovies();
          state.Marvel.marvel = Array.isArray(data) ? data : [];
        } catch {
          state.Marvel.marvel = [];
        }
        break;

      case "releases":
        try {
          const curated = await fetchUpcomingCurated();
          state.Releases.movies2026 = curated["2026"];
          state.Releases.movies2027 = curated["2027"];
        } catch {
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

      case "login":
      case "signup":
        break;
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
    "/marvel": () => render(state.Marvel),
    "/about": () => render(state.AboutMe),
    "/comments/:movieId": () => render(state.Comments),

    // AUTH ROUTES
    "/login": () => render(state.Login),
    "/signup": () => render(state.Signup)
  })
  .notFound(() => render(state.ViewNotFound))
  .resolve();
