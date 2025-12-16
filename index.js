// File: index.js
// client side— initializes router, fetches data, and renders views.
// Notes: Attaches auth handlers, intro/trailer modal logic, and router hooks to populate state.

import { Header, Nav, Main, Footer } from "./components";
import * as state from "./store";
import Navigo from "navigo";
import { camelCase } from "lodash";

// Local intro MP4 (Parcel will bundle/serve this)
import teaserMp4 from "./Assets/images/teaser.mp4";
import {
  fetchHomeData,
  fetchPopular,
  fetchUpcomingCurated,
  fetchMarvelMovies,
  fetchMovieVideos,
  fetchComments
} from "./services/api";

// API base URL works with Netlify and Render
// Parcel replaces `process.env.VITE_BACKEND_URL` at build time.
const API_BASE =
  process.env.VITE_BACKEND_URL ||
  (typeof window !== "undefined" && window.__API_BASE__) ||
  "http://localhost:3000";

const router = new Navigo("/");

// my modal helper
function getModalEls() {
  const modal = document.querySelector("#trailerModal");
  const frame = document.querySelector("#trailerFrame");
  const video = document.querySelector("#introVideo");
  return { modal, frame, video };
}

function openIntroModal() {
  const { modal, frame, video } = getModalEls();
  if (!modal || !frame || !video) return;

  // show modal
  modal.classList.remove("hidden");

  // hide iframe trailer
  frame.src = "";
  frame.classList.add("hidden");

  // show video teaser
  video.classList.remove("hidden");
  video.src = teaserMp4;
  video.currentTime = 0;
  video.play().catch(() => {});
}

function openTrailerModal(youtubeKey) {
  const { modal, frame, video } = getModalEls();
  if (!modal || !frame || !video) return;

  // show modal
  modal.classList.remove("hidden");

  // stop/hide intro video
  video.pause();
  video.src = "";
  video.load();
  video.classList.add("hidden");

  // show iframe trailer
  frame.classList.remove("hidden");
  frame.src = `https://www.youtube.com/embed/${youtubeKey}`;
}

function closeTrailerModal() {
  const { modal, frame, video } = getModalEls();
  if (!modal || !frame || !video) return;

  // stop iframe
  frame.src = "";
  frame.classList.add("hidden");

  // stop video
  video.pause();
  video.src = "";
  video.load();
  video.classList.add("hidden");

  // hide modal
  modal.classList.add("hidden");
}

// to prevent duplicate event listeners
let modalListenersAttached = false;

function attachModalListenersOnce() {
  if (modalListenersAttached) return;
  modalListenersAttached = true;

  // One delegated click handler
  document.addEventListener("click", async e => {
    // NAV: Play Intro button
    if (e.target.closest("#playIntroNavBtn")) {
      e.preventDefault();
      openIntroModal();
      return;
    }

    // Cards: Trailer buttons
    const trailerBtn = e.target.closest(".trailer-btn");
    if (trailerBtn) {
      e.preventDefault();
      const movieId = trailerBtn.dataset.id;

      try {
        const videos = await fetchMovieVideos(movieId);
        const trailer = videos.find(v => v.site === "YouTube" && v.type === "Trailer");

        if (!trailer) {
          alert("No trailer available");
          return;
        }

        openTrailerModal(trailer.key);
      } catch (err) {
        console.error("Trailer fetch error:", err);
        alert("Trailer error — check console.");
      }
      return;
    }

    // Close button
    if (e.target.closest(".close-modal")) {
      e.preventDefault();
      closeTrailerModal();
      return;
    }

    // Click outside content closes (backdrop)
    const modal = document.querySelector("#trailerModal");
    if (modal && e.target === modal) {
      closeTrailerModal();
    }
  });

  // ESC closes
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeTrailerModal();
  });
}

// where my rendering happens
async function render(st = state.Home) {
  console.log("Rendering with state:", st);

  const mainContent = await Main(st);

  document.querySelector("#root").innerHTML = `
    ${Header(st)}
    ${mainContent}
    ${Footer(st)}
  `;

  router.updatePageLinks();

  //  attaching my event listeners
  attachModalListenersOnce();

  // auth handlers (need to reattach after each render)
  attachAuthHandlers();
  attachLogout();
}

// auth handlers
// signup
function attachSignupHandler() {
  const form = document.querySelector("#signupForm");
  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const username = document.querySelector("#username").value.trim();
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
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

// login
function attachLoginHandler() {
  const form = document.querySelector("#loginForm");
  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const loginId = document.querySelector("#loginId").value.trim();
    const password = document.querySelector("#password").value.trim();

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      alert("Login successful!");
      router.navigate("/");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert("Login error — check console.");
    }
  });
}

// logout
function attachLogout() {
  const btn = document.querySelector("#logoutBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    localStorage.removeItem("token");
    alert("Logged out!");
    router.navigate("/");
  });
}

function attachAuthHandlers() {
  attachSignupHandler();
  attachLoginHandler();
}

// where my router hooks happen
router.hooks({
  before: async (done, match) => {
    const path = match?.url || "/";
    const view = path === "/" || path === "" ? "home" : camelCase(path.replace("/", ""));

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

// Routes
router
  .on({
    "/": () => render(state.Home),
    "/movies": () => render(state.Movies),
    "/releases": () => render(state.Releases),
    "/marvel": () => render(state.Marvel),
    "/about": () => render(state.AboutMe),
    "/comments/:movieId": () => render(state.Comments),
    "/login": () => render(state.Login),
    "/signup": () => render(state.Signup)
  })
  .notFound(() => render(state.ViewNotFound))
  .resolve();
