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
  fetchComments,
  postComment,
  deleteComment
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
  attachCommentHandlers();
  attachScrollAwareNav();
}

// Render inline status text inside an auth form (#authMsg is the <p> in the view).
function setAuthMsg(text, kind = "error") {
  const el = document.querySelector("#authMsg");
  if (!el) return;
  el.textContent = text || "";
  el.classList.remove("auth-msg--error", "auth-msg--success");
  if (text) el.classList.add(`auth-msg--${kind}`);
}

function setAuthSubmitting(form, submitting, labelWhenIdle) {
  const btn = form?.querySelector("button[type='submit']");
  if (!btn) return;
  btn.disabled = submitting;
  btn.textContent = submitting ? "Please wait…" : labelWhenIdle;
}

// auth handlers
// signup
function attachSignupHandler() {
  const form = document.querySelector("#signupForm");
  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();
    setAuthMsg("");

    const username = document.querySelector("#username").value.trim();
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value;

    if (!username || !email || !password) {
      setAuthMsg("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setAuthMsg("Password must be at least 6 characters.");
      return;
    }

    setAuthSubmitting(form, true, "Sign Up");
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthMsg(data.message || "Signup failed. Try a different username or email.");
        return;
      }

      setAuthMsg("Account created! Redirecting to login…", "success");
      setTimeout(() => router.navigate("/login"), 900);
    } catch (err) {
      console.error("SIGNUP ERROR:", err);
      setAuthMsg("Network error. Please try again.");
    } finally {
      setAuthSubmitting(form, false, "Sign Up");
    }
  });
}

// login
function attachLoginHandler() {
  const form = document.querySelector("#loginForm");
  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();
    setAuthMsg("");

    const loginId = document.querySelector("#loginId").value.trim();
    const password = document.querySelector("#password").value;

    if (!loginId || !password) {
      setAuthMsg("Enter your username/email and password.");
      return;
    }

    setAuthSubmitting(form, true, "Login");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthMsg(data.message || "Invalid credentials.");
        return;
      }

      localStorage.setItem("token", data.token);
      setAuthMsg("Welcome back! Redirecting…", "success");
      setTimeout(() => router.navigate("/"), 600);
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setAuthMsg("Network error. Please try again.");
    } finally {
      setAuthSubmitting(form, false, "Login");
    }
  });
}

// logout
function attachLogout() {
  const btn = document.querySelector("#logoutBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    localStorage.removeItem("token");
    router.navigate("/");
  });
}

function attachAuthHandlers() {
  attachSignupHandler();
  attachLoginHandler();
}

// Comments: submit + delete handlers (re-attached after each render).
function attachCommentHandlers() {
  const form = document.querySelector("#commentForm");
  const list = document.querySelector(".comment-list");
  const movieId = state.Comments?.movieId;

  if (form && movieId) {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const msg = document.querySelector("#commentMsg");
      const username = document.querySelector("#author").value.trim();
      const text = document.querySelector("#text").value.trim();

      if (!username || !text) {
        if (msg) {
          msg.textContent = "Name and comment are required.";
          msg.classList.add("auth-msg--error");
        }
        return;
      }

      try {
        await postComment({ movieId: Number(movieId), username, text });
        state.Comments.comments = await fetchComments(movieId);
        render(state.Comments);
      } catch {
        if (msg) {
          msg.textContent = "Couldn't post comment. Please try again.";
          msg.classList.add("auth-msg--error");
        }
      }
    });
  }

  if (list && movieId) {
    list.addEventListener("click", async event => {
      const btn = event.target.closest(".delete-comment");
      if (!btn) return;
      const id = btn.dataset.id;
      if (!id) return;

      btn.disabled = true;
      try {
        await deleteComment(id);
        state.Comments.comments = await fetchComments(movieId);
        render(state.Comments);
      } catch {
        btn.disabled = false;
      }
    });
  }
}

// Scroll-aware nav: adds .scrolled when page is scrolled past threshold.
function attachScrollAwareNav() {
  const nav = document.querySelector(".navbar");
  if (!nav || nav.__scrollBound) return;
  nav.__scrollBound = true;

  const setScrolled = () => {
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  setScrolled();
  window.addEventListener("scroll", setScrolled, { passive: true });
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
      case "profile":
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
    "/signup": () => render(state.Signup),
    "/profile": () => render(state.Profile)
  })
  .notFound(() => render(state.ViewNotFound))
  .resolve();
