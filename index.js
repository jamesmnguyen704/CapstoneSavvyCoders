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
  deleteComment,
  fetchMovieNews,
  fetchTvNews,
  fetchTopRated,
  fetchMovieDetails,
  fetchAwards,
  searchMovies,
  fetchGenres,
  discoverMovies,
  fetchPersonDetails
} from "./services/api";
import { renderDiscoverResults } from "./views/discover";
import {
  listWatchlist,
  toggleWatchlist,
  inWatchlist
} from "./services/watchlist";

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

    // News tab switch (Movies / TV)
    const newsTabBtn = e.target.closest("[data-news-tab]");
    if (newsTabBtn) {
      e.preventDefault();
      const nextTab = newsTabBtn.dataset.newsTab === "tv" ? "tv" : "movies";
      if (state.News.activeTab === nextTab) return;
      state.News.activeTab = nextTab;
      // Pull from cache if present, else fetch.
      const cached = state.News.cache?.[nextTab];
      if (cached && cached.length) {
        state.News.articles = cached;
        render(state.News);
      } else {
        state.News.articles = [];
        render(state.News);
        (async () => {
          try {
            const articles = nextTab === "tv" ? await fetchTvNews() : await fetchMovieNews();
            state.News.articles = articles;
            if (state.News.cache) state.News.cache[nextTab] = articles;
            render(state.News);
          } catch {
            state.News.articles = [];
            render(state.News);
          }
        })();
      }
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
  attachSearchHandlers();
  attachWatchlistHandler();
  attachInfoButtonHandler();
  attachDiscoverFilterHandlers();
  attachPersonClickHandler();
  syncBookmarkButtons();
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
// Also drives the top progress bar + back-to-top visibility.
function attachScrollAwareNav() {
  const nav = document.querySelector(".navbar");
  if (!nav || nav.__scrollBound) return;
  nav.__scrollBound = true;

  ensureChrome();

  const progress = document.querySelector("#scrollProgress");
  const backToTop = document.querySelector("#backToTop");

  const onScroll = () => {
    const y = window.scrollY;
    if (y > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");

    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? Math.min(100, Math.max(0, (y / h) * 100)) : 0;
      progress.style.width = `${pct}%`;
    }

    if (backToTop) {
      if (y > 600) backToTop.classList.add("visible");
      else backToTop.classList.remove("visible");
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

// Inject site-wide chrome (toast host, scroll progress bar, back-to-top,
// info modal) into <body> exactly once.
function ensureChrome() {
  if (document.querySelector("#scrollProgress")) return;

  const progress = document.createElement("div");
  progress.id = "scrollProgress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  const backToTop = document.createElement("button");
  backToTop.id = "backToTop";
  backToTop.type = "button";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.body.appendChild(backToTop);

  const toastHost = document.createElement("div");
  toastHost.id = "toastHost";
  toastHost.setAttribute("aria-live", "polite");
  document.body.appendChild(toastHost);

  // Movie detail (Info) modal — lazy-populated on open.
  const infoModal = document.createElement("div");
  infoModal.id = "infoModal";
  infoModal.className = "info-modal hidden";
  infoModal.setAttribute("role", "dialog");
  infoModal.setAttribute("aria-modal", "true");
  infoModal.setAttribute("aria-label", "Movie details");
  infoModal.innerHTML = `
    <div class="info-modal-backdrop"></div>
    <div class="info-modal-sheet">
      <button class="info-modal-close" type="button" aria-label="Close">&times;</button>
      <div class="info-modal-body"><div class="info-modal-loading">Loading…</div></div>
    </div>
  `;
  document.body.appendChild(infoModal);

  // Close on backdrop click + Escape key.
  infoModal
    .querySelector(".info-modal-backdrop")
    .addEventListener("click", closeInfoModal);
  infoModal
    .querySelector(".info-modal-close")
    .addEventListener("click", closeInfoModal);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !infoModal.classList.contains("hidden")) {
      closeInfoModal();
    }
  });
}

// -------- Toasts --------
function showToast(message, kind = "info", timeout = 2600) {
  ensureChrome();
  const host = document.querySelector("#toastHost");
  if (!host) return;
  const t = document.createElement("div");
  t.className = `toast toast--${kind}`;
  t.innerHTML = `
    <span class="toast-icon" aria-hidden="true">
      ${kind === "success" ? "✓" : kind === "error" ? "!" : "i"}
    </span>
    <span class="toast-msg"></span>
  `;
  t.querySelector(".toast-msg").textContent = message;
  host.appendChild(t);
  // Force reflow so the transition runs.
  requestAnimationFrame(() => t.classList.add("toast--show"));
  setTimeout(() => {
    t.classList.remove("toast--show");
    setTimeout(() => t.remove(), 300);
  }, timeout);
}

// -------- Watchlist bookmark delegation --------
function attachWatchlistHandler() {
  if (document.__watchlistBound) return;
  document.__watchlistBound = true;

  document.addEventListener("click", e => {
    const btn = e.target.closest(".card-bookmark");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    let movie;
    try {
      movie = JSON.parse(btn.dataset.movie || "null");
    } catch {
      movie = null;
    }
    if (!movie || movie.id == null) return;

    const result = toggleWatchlist(movie);
    if (result === "added") {
      btn.classList.add("card-bookmark--active");
      btn.querySelector("i").className = "fa-solid fa-bookmark";
      btn.setAttribute("aria-label", "Remove from My List");
      showToast(`"${movie.title || "Movie"}" added to My List`, "success");
    } else if (result === "removed") {
      btn.classList.remove("card-bookmark--active");
      btn.querySelector("i").className = "fa-regular fa-bookmark";
      btn.setAttribute("aria-label", "Add to My List");
      showToast("Removed from My List", "info");
    }
  });

  // When /my-list is showing and localStorage changes, re-render.
  window.addEventListener("watchlist:change", () => {
    if (location.pathname === "/my-list") {
      render(state.MyList);
    }
  });
}

// Reflect current watchlist state on any visible bookmark buttons.
function syncBookmarkButtons() {
  document.querySelectorAll(".card-bookmark").forEach(btn => {
    let movie;
    try {
      movie = JSON.parse(btn.dataset.movie || "null");
    } catch {
      movie = null;
    }
    if (!movie || movie.id == null) return;
    if (inWatchlist(movie.id)) {
      btn.classList.add("card-bookmark--active");
      const icon = btn.querySelector("i");
      if (icon) icon.className = "fa-solid fa-bookmark";
    }
  });
}

// -------- Movie detail (Info) modal --------
async function openInfoModal(movieId) {
  ensureChrome();
  const modal = document.querySelector("#infoModal");
  const body = modal.querySelector(".info-modal-body");
  if (!modal || !body) return;

  body.innerHTML = `<div class="info-modal-loading">Loading…</div>`;
  modal.classList.remove("hidden");
  document.body.classList.add("no-scroll");

  const data = await fetchMovieDetails(movieId);
  if (!data) {
    body.innerHTML = `<div class="info-modal-loading">Could not load details.</div>`;
    return;
  }

  const escapeHtml = v =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const runtime = data.runtime
    ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m`
    : "";
  const year = (data.release_date || "").slice(0, 4);
  const rating =
    typeof data.vote_average === "number" && data.vote_average > 0
      ? data.vote_average.toFixed(1)
      : null;

  const genres = (data.genres || [])
    .map(g => `<span class="info-chip">${escapeHtml(g)}</span>`)
    .join("");

  const cast = (data.cast || [])
    .map(
      c => `
    <div class="info-cast-card" data-person-id="${c.id}" role="button" tabindex="0" aria-label="View ${escapeHtml(c.name)}">
      ${
        c.profile_path
          ? `<img src="https://image.tmdb.org/t/p/w185${c.profile_path}" alt="${escapeHtml(c.name)}" loading="lazy" />`
          : `<div class="info-cast-placeholder" aria-hidden="true">👤</div>`
      }
      <span class="info-cast-name">${escapeHtml(c.name)}</span>
      <span class="info-cast-character">${escapeHtml(c.character || "")}</span>
    </div>
  `
    )
    .join("");

  const providers = data.watchProviders || {};
  const renderProviders = (list, label) =>
    list && list.length
      ? `
        <div class="info-provider-row">
          <span class="info-provider-label">${label}</span>
          <div class="info-provider-logos">
            ${list
              .map(
                p => `
                  <span class="info-provider" title="${escapeHtml(p.name)}">
                    ${
                      p.logo
                        ? `<img src="${escapeHtml(p.logo)}" alt="${escapeHtml(p.name)}" />`
                        : escapeHtml(p.name)
                    }
                  </span>
                `
              )
              .join("")}
          </div>
        </div>
      `
      : "";

  const providersHtml =
    renderProviders(providers.stream, "Stream") +
    renderProviders(providers.rent, "Rent") +
    renderProviders(providers.buy, "Buy");

  const similar = (data.similar || [])
    .map(m => {
      const sYear = (m.release_date || "").slice(0, 4);
      const sRating =
        typeof m.vote_average === "number" && m.vote_average > 0
          ? m.vote_average.toFixed(1)
          : null;
      const art = m.backdrop_path
        ? `https://image.tmdb.org/t/p/w500${m.backdrop_path}`
        : `https://image.tmdb.org/t/p/w500${m.poster_path}`;
      return `
    <button class="info-similar-card" data-movie-id="${m.id}" type="button" aria-label="More info on ${escapeHtml(m.title)}">
      <span class="info-similar-art">
        <img src="${art}" alt="${escapeHtml(m.title)}" loading="lazy" />
        <span class="info-similar-play"><i class="fa-solid fa-play"></i></span>
      </span>
      <span class="info-similar-body">
        <span class="info-similar-title">${escapeHtml(m.title)}</span>
        <span class="info-similar-meta">
          ${sYear ? `<span>${sYear}</span>` : ""}
          ${sRating ? `<span class="news-dot">·</span><span>★ ${sRating}</span>` : ""}
        </span>
      </span>
    </button>
  `;
    })
    .join("");

  body.innerHTML = `
    ${
      data.backdrop_path
        ? `<div class="info-backdrop" style="background-image: url('https://image.tmdb.org/t/p/original${data.backdrop_path}')"></div>`
        : `<div class="info-backdrop info-backdrop--placeholder"></div>`
    }
    <div class="info-content">
      <div class="info-poster">
        ${
          data.poster_path
            ? `<img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${escapeHtml(data.title)} Poster" />`
            : ""
        }
      </div>
      <div class="info-main">
        <h2 class="info-title">${escapeHtml(data.title)}</h2>
        ${data.tagline ? `<p class="info-tagline">${escapeHtml(data.tagline)}</p>` : ""}
        <div class="info-meta">
          ${year ? `<span>${year}</span>` : ""}
          ${runtime ? `<span class="news-dot">·</span><span>${runtime}</span>` : ""}
          ${rating ? `<span class="news-dot">·</span><span>★ ${rating}</span>` : ""}
          ${data.director ? `<span class="news-dot">·</span><span>Dir. ${escapeHtml(data.director.name)}</span>` : ""}
        </div>
        ${genres ? `<div class="info-chips">${genres}</div>` : ""}
        ${data.overview ? `<p class="info-overview">${escapeHtml(data.overview)}</p>` : ""}

        <div class="info-cta">
          <button class="trailer-btn" data-id="${data.id}">▶ Watch Trailer</button>
          <button
            class="auth-btn info-save-btn"
            data-movie='${escapeHtml(
              JSON.stringify({
                id: data.id,
                title: data.title,
                poster_path: data.poster_path,
                release_date: data.release_date,
                vote_average: data.vote_average
              })
            )}'
            type="button"
          >
            <i class="fa-regular fa-bookmark"></i>
            <span>Add to My List</span>
          </button>
          ${
            data.homepage || data.imdb_id
              ? `<a class="info-link" href="${
                  data.imdb_id
                    ? `https://www.imdb.com/title/${data.imdb_id}`
                    : data.homepage
                }" target="_blank" rel="noopener noreferrer">
                  <i class="fa-brands fa-imdb"></i> More on IMDb
                </a>`
              : ""
          }
        </div>

        ${providersHtml ? `<div class="info-providers"><h3>Where to Watch</h3>${providersHtml}</div>` : ""}
      </div>
    </div>

    ${cast ? `<div class="info-section"><h3>Top Cast</h3><div class="info-cast">${cast}</div></div>` : ""}
    ${similar ? `<div class="info-section"><h3>If you liked this</h3><div class="info-similar">${similar}</div></div>` : ""}
  `;

  // Wire the "Add to My List" inside the modal.
  const saveBtn = body.querySelector(".info-save-btn");
  if (saveBtn) {
    const icon = saveBtn.querySelector("i");
    const label = saveBtn.querySelector("span");
    const refresh = () => {
      if (inWatchlist(data.id)) {
        icon.className = "fa-solid fa-bookmark";
        label.textContent = "In My List";
        saveBtn.classList.add("info-save-btn--saved");
      } else {
        icon.className = "fa-regular fa-bookmark";
        label.textContent = "Add to My List";
        saveBtn.classList.remove("info-save-btn--saved");
      }
    };
    refresh();
    saveBtn.addEventListener("click", () => {
      let movie;
      try {
        movie = JSON.parse(saveBtn.dataset.movie);
      } catch {
        return;
      }
      const result = toggleWatchlist(movie);
      if (result === "added") {
        showToast(`"${movie.title}" added to My List`, "success");
      } else if (result === "removed") {
        showToast("Removed from My List", "info");
      }
      refresh();
    });
  }

  // Clicking a similar card opens its own detail modal.
  body.querySelectorAll(".info-similar-card, .info-btn-inline").forEach(el => {
    el.addEventListener("click", e => {
      e.preventDefault();
      const id = el.dataset.id || el.dataset.movieId;
      if (id) openInfoModal(id);
    });
  });
}

function closeInfoModal() {
  const modal = document.querySelector("#infoModal");
  if (!modal) return;
  modal.classList.add("hidden");
  document.body.classList.remove("no-scroll");
}

function attachInfoButtonHandler() {
  if (document.__infoBound) return;
  document.__infoBound = true;
  document.addEventListener("click", e => {
    const btn = e.target.closest(".info-btn");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const id = btn.dataset.id;
    if (id) openInfoModal(id);
  });
}

// -------- Search (debounced live dropdown) --------
let searchDebounceId = null;
let searchActiveIndex = -1;
let searchResults = [];

function attachSearchHandlers() {
  const input = document.querySelector("#navSearch");
  const dropdown = document.querySelector("#navSearchResults");
  if (!input || !dropdown || input.__searchBound) return;
  input.__searchBound = true;

  const closeDropdown = () => {
    dropdown.classList.remove("open");
    searchActiveIndex = -1;
  };

  const renderResults = items => {
    if (!items.length) {
      dropdown.innerHTML = `<div class="search-empty">No matches.</div>`;
      return;
    }
    dropdown.innerHTML = items
      .map(
        (m, i) => `
        <button class="search-item" role="option" data-idx="${i}" data-id="${m.id}" type="button">
          ${
            m.poster_path
              ? `<img src="https://image.tmdb.org/t/p/w92${m.poster_path}" alt="" loading="lazy" />`
              : `<div class="search-thumb-placeholder">🎬</div>`
          }
          <span class="search-item-body">
            <span class="search-item-title">${(m.title || "").replace(/</g, "&lt;")}</span>
            <span class="search-item-meta">${(m.release_date || "").slice(0, 4)} ${
          typeof m.vote_average === "number" && m.vote_average > 0
            ? `· ★ ${m.vote_average.toFixed(1)}`
            : ""
        }</span>
          </span>
        </button>
      `
      )
      .join("");
  };

  input.addEventListener("input", () => {
    const q = input.value.trim();
    clearTimeout(searchDebounceId);
    if (q.length < 2) {
      closeDropdown();
      searchResults = [];
      return;
    }
    dropdown.innerHTML = `<div class="search-loading">Searching…</div>`;
    dropdown.classList.add("open");
    searchDebounceId = setTimeout(async () => {
      const results = await searchMovies(q);
      searchResults = results;
      renderResults(results);
    }, 260);
  });

  input.addEventListener("keydown", e => {
    if (!dropdown.classList.contains("open")) return;
    const items = dropdown.querySelectorAll(".search-item");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      searchActiveIndex = Math.min(items.length - 1, searchActiveIndex + 1);
      items.forEach((el, i) => el.classList.toggle("active", i === searchActiveIndex));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      searchActiveIndex = Math.max(0, searchActiveIndex - 1);
      items.forEach((el, i) => el.classList.toggle("active", i === searchActiveIndex));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = searchActiveIndex >= 0 ? items[searchActiveIndex] : items[0];
      if (pick) {
        openInfoModal(pick.dataset.id);
        closeDropdown();
        input.value = "";
      }
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  });

  dropdown.addEventListener("click", e => {
    const btn = e.target.closest(".search-item");
    if (!btn) return;
    openInfoModal(btn.dataset.id);
    closeDropdown();
    input.value = "";
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".nav-search")) closeDropdown();
  });

  // Global "/" shortcut focuses search (classic streaming UX).
  document.addEventListener("keydown", e => {
    if (e.key !== "/" || e.ctrlKey || e.metaKey) return;
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea") return;
    e.preventDefault();
    input.focus();
  });
}

// -------- Discover filters (live, debounced) --------
let discoverDebounceId = null;

async function refreshDiscover() {
  state.Discover.loading = true;
  renderDiscoverResults(state.Discover);
  const data = await discoverMovies({
    genres: state.Discover.selectedGenres,
    year: state.Discover.year,
    minRating: state.Discover.minRating,
    sort: state.Discover.sort
  });
  state.Discover.results = data.results || [];
  state.Discover.total_results = data.total_results || 0;
  state.Discover.loading = false;
  renderDiscoverResults(state.Discover);
  syncBookmarkButtons();
}

function debounceDiscover() {
  clearTimeout(discoverDebounceId);
  discoverDebounceId = setTimeout(refreshDiscover, 220);
}

function attachDiscoverFilterHandlers() {
  const filters = document.querySelector("#discoverFilters");
  if (!filters || filters.__bound) return;
  filters.__bound = true;

  // Genre chip toggle
  filters.addEventListener("click", e => {
    const chip = e.target.closest(".discover-chip");
    if (chip) {
      const id = Number(chip.dataset.genreId);
      const set = new Set(state.Discover.selectedGenres);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      state.Discover.selectedGenres = Array.from(set);
      chip.classList.toggle("discover-chip--active");
      debounceDiscover();
      return;
    }
    if (e.target.id === "discoverReset") {
      state.Discover.selectedGenres = [];
      state.Discover.year = "";
      state.Discover.minRating = 0;
      state.Discover.sort = "popularity.desc";
      // Re-render the whole view so chip UI resets cleanly.
      render(state.Discover);
    }
  });

  const year = filters.querySelector("#discoverYear");
  if (year) {
    year.addEventListener("change", () => {
      state.Discover.year = year.value;
      debounceDiscover();
    });
  }
  const rating = filters.querySelector("#discoverRating");
  const ratingOut = filters.querySelector("#discoverRatingValue");
  if (rating) {
    rating.addEventListener("input", () => {
      state.Discover.minRating = Number(rating.value);
      if (ratingOut) ratingOut.textContent = rating.value;
      debounceDiscover();
    });
  }
  const sort = filters.querySelector("#discoverSort");
  if (sort) {
    sort.addEventListener("change", () => {
      state.Discover.sort = sort.value;
      debounceDiscover();
    });
  }
}

// -------- Person (cast) modal --------
function ensurePersonModal() {
  if (document.querySelector("#personModal")) return;
  const modal = document.createElement("div");
  modal.id = "personModal";
  modal.className = "info-modal hidden";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Person details");
  modal.innerHTML = `
    <div class="info-modal-backdrop"></div>
    <div class="info-modal-sheet person-modal-sheet">
      <button class="info-modal-close" type="button" aria-label="Close">&times;</button>
      <div class="info-modal-body person-modal-body">
        <div class="info-modal-loading">Loading…</div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => {
    modal.classList.add("hidden");
    // Only pop body scroll-lock if no other modal is open.
    const infoOpen = !document
      .querySelector("#infoModal")
      ?.classList.contains("hidden");
    if (!infoOpen) document.body.classList.remove("no-scroll");
  };
  modal.querySelector(".info-modal-backdrop").addEventListener("click", close);
  modal.querySelector(".info-modal-close").addEventListener("click", close);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) close();
  });
}

async function openPersonModal(personId) {
  ensurePersonModal();
  const modal = document.querySelector("#personModal");
  const body = modal.querySelector(".person-modal-body");
  body.innerHTML = `<div class="info-modal-loading">Loading…</div>`;
  modal.classList.remove("hidden");
  document.body.classList.add("no-scroll");

  const data = await fetchPersonDetails(personId);
  if (!data) {
    body.innerHTML = `<div class="info-modal-loading">Could not load person details.</div>`;
    return;
  }

  const escapeHtml = v =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const age = (() => {
    if (!data.birthday) return "";
    const birth = new Date(data.birthday);
    const end = data.deathday ? new Date(data.deathday) : new Date();
    const years = Math.floor((end - birth) / (365.25 * 24 * 3600 * 1000));
    return `${years}${data.deathday ? " at death" : ""}`;
  })();

  const fmtDate = iso => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return "";
    }
  };

  const cast = (data.cast || [])
    .map(c => {
      const year = (c.release_date || "").slice(0, 4);
      const rating =
        typeof c.vote_average === "number" && c.vote_average > 0
          ? c.vote_average.toFixed(1)
          : null;
      return `
        <div class="person-credit-card" data-movie-id="${c.id}" role="button" tabindex="0">
          <img src="https://image.tmdb.org/t/p/w300${c.poster_path}" alt="${escapeHtml(c.title)}" loading="lazy" />
          <div class="person-credit-body">
            <span class="person-credit-title">${escapeHtml(c.title)}</span>
            ${c.character ? `<span class="person-credit-character">as ${escapeHtml(c.character)}</span>` : ""}
            <span class="person-credit-meta">
              ${year ? year : ""}${rating ? ` · ★ ${rating}` : ""}
            </span>
          </div>
        </div>
      `;
    })
    .join("");

  body.innerHTML = `
    <div class="person-header">
      ${
        data.profile_path
          ? `<img class="person-photo" src="https://image.tmdb.org/t/p/w342${data.profile_path}" alt="${escapeHtml(data.name)}" />`
          : `<div class="person-photo person-photo--placeholder" aria-hidden="true">👤</div>`
      }
      <div class="person-meta-block">
        <span class="news-kicker">${escapeHtml(data.known_for_department || "Artist")}</span>
        <h2 class="person-name">${escapeHtml(data.name)}</h2>
        <dl class="person-meta">
          ${
            data.birthday
              ? `<div><dt>Born</dt><dd>${escapeHtml(fmtDate(data.birthday))}${age ? ` · ${escapeHtml(age)}` : ""}</dd></div>`
              : ""
          }
          ${data.deathday ? `<div><dt>Died</dt><dd>${escapeHtml(fmtDate(data.deathday))}</dd></div>` : ""}
          ${data.place_of_birth ? `<div><dt>From</dt><dd>${escapeHtml(data.place_of_birth)}</dd></div>` : ""}
        </dl>
        ${
          data.imdb_id
            ? `<a class="info-link" href="https://www.imdb.com/name/${escapeHtml(data.imdb_id)}" target="_blank" rel="noopener noreferrer">
                <i class="fa-brands fa-imdb"></i> IMDb profile
              </a>`
            : ""
        }
      </div>
    </div>
    ${
      data.biography
        ? `<div class="person-section">
             <h3>Biography</h3>
             <p class="person-bio">${escapeHtml(data.biography)}</p>
           </div>`
        : ""
    }
    ${
      cast
        ? `<div class="person-section">
             <h3>Filmography</h3>
             <div class="person-credits">${cast}</div>
           </div>`
        : ""
    }
  `;

  // Clicking any credit card opens the movie info modal.
  body.querySelectorAll(".person-credit-card").forEach(el => {
    const open = () => {
      const id = el.dataset.movieId;
      if (id) openInfoModal(id);
    };
    el.addEventListener("click", open);
    el.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });
}

// Cast cards inside the info modal are clickable — open the person modal.
function attachPersonClickHandler() {
  if (document.__personBound) return;
  document.__personBound = true;
  document.addEventListener("click", e => {
    const card = e.target.closest(".info-cast-card");
    if (!card) return;
    const id = card.dataset.personId;
    if (!id) return;
    openPersonModal(id);
  });
}

// where my router hooks happen
router.hooks({
  before: async (done, match) => {
    const path = match?.url || "/";
    const view = path === "/" || path === "" ? "home" : camelCase(path.replace("/", ""));

    console.log("Router resolved view:", view);

    switch (view) {
      case "home": {
        const [home, topRated] = await Promise.all([
          fetchHomeData(),
          fetchTopRated()
        ]);
        state.Home.trending = home.trending;
        state.Home.nowPlaying = home.nowPlaying;
        state.Home.popular = home.popular;
        state.Home.topRated = topRated;
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
          state.Releases.movies2026 = curated["2026"] || [];
          state.Releases.movies2027 = curated["2027"] || [];
          state.Releases.popular = curated.popular || [];
        } catch {
          state.Releases.movies2026 = [];
          state.Releases.movies2027 = [];
          state.Releases.popular = [];
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

      case "news": {
        const tab = state.News.activeTab === "tv" ? "tv" : "movies";
        // Use per-tab cache if we already fetched this tab.
        if (state.News.cache?.[tab]?.length) {
          state.News.articles = state.News.cache[tab];
          break;
        }
        try {
          const articles = tab === "tv" ? await fetchTvNews() : await fetchMovieNews();
          state.News.articles = articles;
          if (state.News.cache) state.News.cache[tab] = articles;
        } catch {
          state.News.articles = [];
        }
        break;
      }

      case "myList":
        // Pure-local data; render() reads it from localStorage on its own.
        break;

      case "awards":
        try {
          state.Awards.sections = await fetchAwards();
        } catch {
          state.Awards.sections = [];
        }
        break;

      case "discover":
        try {
          if (!state.Discover.genres.length) {
            state.Discover.genres = await fetchGenres();
          }
          state.Discover.loading = true;
          const data = await discoverMovies({
            genres: state.Discover.selectedGenres,
            year: state.Discover.year,
            minRating: state.Discover.minRating,
            sort: state.Discover.sort
          });
          state.Discover.results = data.results || [];
          state.Discover.total_results = data.total_results || 0;
          state.Discover.loading = false;
        } catch {
          state.Discover.results = [];
          state.Discover.loading = false;
        }
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
    "/profile": () => render(state.Profile),
    "/news": () => render(state.News),
    "/my-list": () => render(state.MyList),
    "/awards": () => render(state.Awards),
    "/discover": () => render(state.Discover)
  })
  .notFound(() => render(state.ViewNotFound))
  .resolve();
