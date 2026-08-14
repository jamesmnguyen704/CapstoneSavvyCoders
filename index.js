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
  fetchNewsTab,
  fetchInTheaters,
  fetchTheatersNear,
  fetchTvShows,
  fetchTvByProvider,
  fetchTopRated,
  fetchMovieDetails,
  fetchAwards,
  searchMovies,
  fetchGenres,
  discoverMovies,
  fetchPersonDetails
} from "./services/api";
import { renderMoviesResults } from "./views/movies";
import { renderGamesResults } from "./views/games";
import { renderTheaterResults } from "./views/theaters";
import { renderTvShows } from "./views/tv";
import { DEFAULT_ZIP } from "./store/theaters";
import { skeletonCards } from "./views/_cards";
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

// News tabs, in display order. Must match views/news.js TAB_CONFIG and the
// route table in server/routes/news.js.
// Gaming lives on /games and TV + streaming on /tv, each in their own rail,
// so /news is the movie wire only.
const NEWS_TABS = ["movies"];

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

// Pick the best YouTube clip TMDB gave us. Plenty of titles — especially
// unreleased ones — have no `Trailer` at all, so fall back through Teaser →
// Clip → Featurette rather than telling the user "no trailer available".
function pickTrailer(videos = []) {
  const yt = videos.filter(v => v.site === "YouTube" && v.key);
  const byType = type =>
    yt.filter(v => v.type === type).sort((a, b) => (b.official === true) - (a.official === true));

  return (
    byType("Trailer")[0] ||
    byType("Teaser")[0] ||
    byType("Clip")[0] ||
    byType("Featurette")[0] ||
    yt[0] ||
    null
  );
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

  // show iframe trailer. `rel=0` keeps YouTube from suggesting unrelated
  // videos on the end card; `playsinline` matters on iOS Safari.
  frame.classList.remove("hidden");
  frame.src = `https://www.youtube.com/embed/${youtubeKey}?autoplay=1&rel=0&playsinline=1`;
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
        const trailer = pickTrailer(videos);

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

    // News tab switch (Movies / TV / Streaming / Gaming)
    const newsTabBtn = e.target.closest("[data-news-tab]");
    if (newsTabBtn) {
      e.preventDefault();
      const nextTab = NEWS_TABS.includes(newsTabBtn.dataset.newsTab)
        ? newsTabBtn.dataset.newsTab
        : "movies";
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
            const articles = await fetchNewsTab(nextTab);
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
  attachMobileMenu();
  attachCommentHandlers();
  attachScrollAwareNav();
  attachSearchHandlers();
  attachWatchlistHandler();
  attachInfoButtonHandler();
  attachMoviesFilterHandlers();
  attachGamesHandlers();
  attachGameAdaptationHandler();
  attachTheaterHandlers();
  attachTvHandlers();
  attachPersonClickHandler();
  attachMyListTabs();
  attachAwardsCategoryTabs();
  syncBookmarkButtons();
}

// The router's `before` hook awaits every fetch before it lets a view render,
// so a slow route (Marvel and Awards are the worst) used to leave #root
// completely empty — a blank white page, not a slow one. Paint the chrome plus
// a shimmer grid straight away so navigation always feels instant.
function paintRouteSkeleton(st) {
  const root = document.querySelector("#root");
  if (!root) return;

  root.innerHTML = `
    ${Header(st)}
    <main class="route-skeleton" aria-busy="true" aria-live="polite">
      <div class="route-skeleton__head">
        <div class="skeleton skeleton-line route-skeleton__kicker"></div>
        <div class="skeleton skeleton-line route-skeleton__title"></div>
      </div>
      <div class="movies-grid">${skeletonCards(12)}</div>
    </main>
    ${Footer(st)}
  `;

  // Only the chrome is interactive while loading — nav, menu, search.
  router.updatePageLinks();
  attachMobileMenu();
  attachScrollAwareNav();
  attachSearchHandlers();
}

// Views that fetch on navigation, mapped to the store the skeleton borrows its
// header/footer state from. Skipped once a store already holds data so
// revisiting a page doesn't flash a skeleton over content we can still show.
const SKELETON_ROUTES = {
  home: () => [state.Home, state.Home.trending],
  movies: () => [state.Movies, state.Movies.results],
  marvel: () => [state.Marvel, state.Marvel.marvel],
  releases: () => [state.Releases, state.Releases.movies2026],
  awards: () => [state.Awards, state.Awards.sections],
  news: () => [state.News, state.News.articles]
};

function maybePaintSkeleton(view) {
  const entry = SKELETON_ROUTES[view];
  if (!entry) return;
  const [store, data] = entry();
  if (!data || !data.length) paintRouteSkeleton(store);
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

// Mobile nav: toggle the links drawer from the hamburger, and close it
// when the user taps a link or anywhere outside.
function attachMobileMenu() {
  const btn = document.querySelector("#menu-icon");
  const links = document.querySelector("#nav-links");
  if (!btn || !links) return;

  const close = () => {
    links.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  };

  btn.addEventListener("click", e => {
    e.stopPropagation();
    const isOpen = links.classList.toggle("open");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  links.addEventListener("click", e => {
    if (e.target.closest("a")) close();
  });

  document.addEventListener("click", e => {
    if (!links.classList.contains("open")) return;
    if (e.target.closest("#nav-links") || e.target.closest("#menu-icon")) return;
    close();
  });
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

// Awards category tabs — swap the active Oscar category without re-fetching.
function attachAwardsCategoryTabs() {
  if (location.pathname !== "/awards") return;
  const tabs = document.querySelectorAll(".awards-cat-tab");
  if (!tabs.length) return;
  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      const key = btn.dataset.category;
      if (!key || !state.Awards.categories?.[key]) return;
      state.Awards.activeCategory = key;
      state.Awards.sections = state.Awards.categories[key] || [];
      render(state.Awards);
      const el = document.querySelector(".awards-cat-tabs");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

// My List tabbed view — swap the visible panel without a route change.
function attachMyListTabs() {
  if (location.pathname !== "/my-list") return;
  const tabs = document.querySelectorAll(".mylist-tab");
  if (!tabs.length) return;
  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      const next = btn.dataset.tab === "about" ? "about" : "list";
      const url = new URL(window.location.href);
      if (next === "list") url.searchParams.delete("tab");
      else url.searchParams.set("tab", "about");
      window.history.replaceState({}, "", url.toString());
      render(state.MyList);
    });
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

  // Same card shape as the cast, so the two rows read as one system. Clicking
  // a crew member opens the person modal via the existing delegated handler.
  const crew = (data.crew || [])
    .map(
      c => `
    <div class="info-cast-card info-crew-card" data-person-id="${c.id}" role="button" tabindex="0" aria-label="View ${escapeHtml(c.name)}">
      ${
        c.profile_path
          ? `<img src="https://image.tmdb.org/t/p/w185${c.profile_path}" alt="${escapeHtml(c.name)}" loading="lazy" />`
          : `<div class="info-cast-placeholder" aria-hidden="true">🎬</div>`
      }
      <span class="info-cast-name">${escapeHtml(c.name)}</span>
      <span class="info-cast-character info-crew-job">${escapeHtml(c.job || "")}</span>
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

  // Written reviews, Metacritic-style: score chip, author, then the take.
  const reviewsHtml = (data.reviews || []).length
    ? `
      <div class="info-reviews">
        <h3>Reviews <span class="info-reviews-count">${data.review_count} total</span></h3>
        <div class="info-reviews-list">
          ${data.reviews
            .map(r => {
              const score = typeof r.rating === "number" ? r.rating : null;
              // Metacritic's banding: 0-4 negative, 5-6 mixed, 7-10 favourable.
              const band = score === null ? "none" : score >= 7 ? "good" : score >= 5 ? "mixed" : "bad";
              const when = r.created_at
                ? new Date(r.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })
                : "";
              const text = String(r.content || "").replace(/\s+/g, " ").trim();
              const clipped = text.length > 320 ? `${text.slice(0, 319)}…` : text;
              return `
                <article class="info-review">
                  <div class="info-review-head">
                    <span class="info-review-score" data-band="${band}">${
                      score === null ? "–" : score * 10
                    }</span>
                    <div>
                      <span class="info-review-author">${escapeHtml(r.author)}</span>
                      ${when ? `<span class="info-review-date">${when}</span>` : ""}
                    </div>
                  </div>
                  <p class="info-review-text">${escapeHtml(clipped)}</p>
                  ${
                    r.url
                      ? `<a class="info-review-link" href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer">Read full review →</a>`
                      : ""
                  }
                </article>`;
            })
            .join("")}
        </div>
      </div>`
    : "";

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
          ${data.certification ? `<span class="info-cert">${escapeHtml(data.certification)}</span>` : ""}
          ${runtime ? `<span class="news-dot">·</span><span>${runtime}</span>` : ""}
          ${
            rating
              ? `<span class="news-dot">·</span><span>★ ${rating}${
                  data.vote_count ? ` <span class="info-votes">(${formatVotes(data.vote_count)})</span>` : ""
                }</span>`
              : ""
          }
          ${data.director ? `<span class="news-dot">·</span><span>Dir. ${escapeHtml(data.director.name)}</span>` : ""}
          ${
            data.writers && data.writers.length
              ? `<span class="news-dot">·</span><span>Writers ${data.writers
                  .map(w => escapeHtml(w.name))
                  .join(", ")}</span>`
              : ""
          }
        </div>
        ${genres ? `<div class="info-chips">${genres}</div>` : ""}
        ${
          data.keywords && data.keywords.length
            ? `<div class="info-keywords">${data.keywords
                .map(k => `<span class="info-keyword">${escapeHtml(k)}</span>`)
                .join("")}</div>`
            : ""
        }
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
        ${reviewsHtml}
      </div>
    </div>

    ${cast ? `<div class="info-section"><h3>Top Cast</h3><div class="info-cast">${cast}</div></div>` : ""}
    ${crew ? `<div class="info-section"><h3>Director, Writers &amp; Producers</h3><div class="info-cast">${crew}</div></div>` : ""}
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
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.dataset.id;
      if (id) openInfoModal(id);
      return;
    }
    const posterHit = e.target.closest("[data-info-id]");
    if (posterHit && !e.target.closest(".card-bookmark, .trailer-btn, .info-btn")) {
      e.preventDefault();
      e.stopPropagation();
      const id = posterHit.dataset.infoId;
      if (id) openInfoModal(id);
    }
  });
  document.addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const el = e.target.closest("[data-info-id]");
    if (!el) return;
    e.preventDefault();
    const id = el.dataset.infoId;
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

// -------- Movies filters (live, debounced) --------
let moviesDebounceId = null;

async function refreshMovies() {
  state.Movies.loading = true;
  renderMoviesResults(state.Movies);
  const data = await discoverMovies({
    genres: state.Movies.selectedGenres,
    year: state.Movies.year,
    minRating: state.Movies.minRating,
    sort: state.Movies.sort
  });
  state.Movies.results = data.results || [];
  state.Movies.total_results = data.total_results || 0;
  state.Movies.loading = false;
  renderMoviesResults(state.Movies);
  syncBookmarkButtons();
}

function debounceMovies() {
  clearTimeout(moviesDebounceId);
  moviesDebounceId = setTimeout(refreshMovies, 220);
}

function attachMoviesFilterHandlers() {
  const filters = document.querySelector("#moviesFilters");
  if (!filters || filters.__bound) return;
  filters.__bound = true;

  // Genre chip toggle
  filters.addEventListener("click", e => {
    const chip = e.target.closest(".discover-chip");
    if (chip) {
      const id = Number(chip.dataset.genreId);
      const set = new Set(state.Movies.selectedGenres);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      state.Movies.selectedGenres = Array.from(set);
      chip.classList.toggle("discover-chip--active");
      debounceMovies();
      return;
    }
    if (e.target.id === "moviesReset") {
      state.Movies.selectedGenres = [];
      state.Movies.year = "";
      state.Movies.minRating = 0;
      state.Movies.sort = "popularity.desc";
      state.Movies.loading = true;
      // Re-render the whole view so chip UI resets cleanly, THEN refetch —
      // render() only replays `state.Movies.results`, which still holds the
      // old filtered list, so without this the grid never actually resets.
      render(state.Movies).then(refreshMovies);
    }
  });

  const year = filters.querySelector("#moviesYear");
  if (year) {
    year.addEventListener("change", () => {
      state.Movies.year = year.value;
      debounceMovies();
    });
  }
  const rating = filters.querySelector("#moviesRating");
  const ratingOut = filters.querySelector("#moviesRatingValue");
  if (rating) {
    rating.addEventListener("input", () => {
      state.Movies.minRating = Number(rating.value);
      if (ratingOut) ratingOut.textContent = rating.value;
      debounceMovies();
    });
  }
  const sort = filters.querySelector("#moviesSort");
  if (sort) {
    sort.addEventListener("change", () => {
      state.Movies.sort = sort.value;
      debounceMovies();
    });
  }
}

// -------- TV & Streaming (service filter) --------
function attachTvHandlers() {
  const chips = document.querySelector("#tvProviders");
  if (!chips || chips.__bound) return;
  chips.__bound = true;

  chips.addEventListener("click", async e => {
    const chip = e.target.closest("[data-tv-provider]");
    if (!chip) return;
    const provider = chip.dataset.tvProvider;
    if (state.Tv.provider === provider) return;

    state.Tv.provider = provider;
    chips
      .querySelectorAll(".tv-chip")
      .forEach(c => c.classList.toggle("tv-chip--active", c === chip));

    if (provider === "all") {
      state.Tv.loading = false;
      renderTvShows(state.Tv);
      return;
    }

    state.Tv.loading = true;
    renderTvShows(state.Tv);
    const data = await fetchTvByProvider(provider);
    state.Tv.loading = false;
    state.Tv.results = data.results || [];
    state.Tv.totalResults = data.total_results || 0;
    renderTvShows(state.Tv);
  });
}

// -------- In Theaters (ZIP lookup) --------
const ZIP_STORAGE_KEY = "cinemetrics:zip";

async function loadTheaters(zip) {
  state.Theaters.zip = zip;
  state.Theaters.loading = true;
  state.Theaters.error = "";
  renderTheaterResults(state.Theaters);

  const data = await fetchInTheaters(zip);
  state.Theaters.loading = false;
  if (data.error) {
    state.Theaters.error = data.error;
    state.Theaters.results = [];
    state.Theaters.theaters = [];
    state.Theaters.location = null;
    renderTheaterResults(state.Theaters);
    return;
  }

  state.Theaters.error = "";
  state.Theaters.location = data.location;
  state.Theaters.results = data.results || [];
  state.Theaters.radius = data.radius || 25;
  try {
    localStorage.setItem(ZIP_STORAGE_KEY, zip);
  } catch {
    /* private mode — the lookup still works, it just won't be remembered */
  }
  // Movies first…
  state.Theaters.theaters = [];
  state.Theaters.venuesLoading = true;
  renderTheaterResults(state.Theaters);

  // …then the theater rail fills in when OpenStreetMap answers.
  const near = await fetchTheatersNear(zip);
  state.Theaters.venuesLoading = false;
  state.Theaters.theaters = near.theaters || [];
  state.Theaters.radius = near.radius || state.Theaters.radius;
  renderTheaterResults(state.Theaters);
}

function attachTheaterHandlers() {
  const form = document.querySelector("#theaterZipForm");
  if (!form || form.__bound) return;
  form.__bound = true;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const zip = (form.querySelector("#theaterZip")?.value || "").trim();
    if (!/^\d{5}$/.test(zip)) {
      state.Theaters.error = "Enter a 5-digit US ZIP code";
      state.Theaters.results = [];
      state.Theaters.location = null;
      renderTheaterResults(state.Theaters);
      return;
    }
    loadTheaters(zip);
  });
}

// 5256 -> "5.3K", matching how IMDb/Metacritic abbreviate vote counts.
function formatVotes(n) {
  if (!n) return "";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// -------- Games library (platform chips + search) --------
function attachGamesHandlers() {
  const filters = document.querySelector("#gamesFilters");
  if (!filters || filters.__bound) return;
  filters.__bound = true;

  // Delegated on document so the rig cards' "See all" buttons work too — they
  // live outside #gamesFilters. Bound once for the life of the page, since
  // #gamesFilters is recreated on every render.
  if (!document.__gamesChipsBound) {
    document.__gamesChipsBound = true;
    document.addEventListener("click", e => {
    const chip = e.target.closest("[data-game-platform]");
    if (!chip || !document.querySelector("#gamesGrid")) return;
    state.Games.platform = chip.dataset.gamePlatform;
    document
      .querySelectorAll(".game-chip")
      .forEach(c => c.classList.toggle("game-chip--active", c.dataset.gamePlatform === state.Games.platform));
      renderGamesResults(state.Games);
      document.querySelector("#gamesGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const search = filters.querySelector("#gamesSearch");
  if (search) {
    search.addEventListener("input", () => {
      state.Games.search = search.value;
      renderGamesResults(state.Games);
    });
  }
}

// "Watch the adaptation" — reuse the existing search + info modal rather than
// building a second lookup path.
function attachGameAdaptationHandler() {
  if (document.__gameAdaptBound) return;
  document.__gameAdaptBound = true;

  document.addEventListener("click", async e => {
    const btn = e.target.closest("[data-adaptation]");
    if (!btn) return;
    e.preventDefault();
    const original = btn.textContent;
    btn.textContent = "Finding…";
    btn.disabled = true;
    try {
      const results = await searchMovies(btn.dataset.adaptation);
      if (results.length) openInfoModal(results[0].id);
      else btn.textContent = "No adaptation found";
    } catch {
      btn.textContent = "Lookup failed";
    } finally {
      if (btn.textContent === "Finding…") btn.textContent = original;
      btn.disabled = false;
    }
  });
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

    // Paint chrome + shimmer before we start awaiting data.
    maybePaintSkeleton(view);

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
          if (!state.Movies.genres.length) {
            state.Movies.genres = await fetchGenres();
          }
          state.Movies.loading = true;
          const data = await discoverMovies({
            genres: state.Movies.selectedGenres,
            year: state.Movies.year,
            minRating: state.Movies.minRating,
            sort: state.Movies.sort
          });
          state.Movies.results = data.results || [];
          state.Movies.total_results = data.total_results || 0;
          state.Movies.loading = false;
        } catch {
          state.Movies.results = [];
          state.Movies.loading = false;
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
        const tab = NEWS_TABS.includes(state.News.activeTab)
          ? state.News.activeTab
          : "movies";
        // Use per-tab cache if we already fetched this tab.
        if (state.News.cache?.[tab]?.length) {
          state.News.articles = state.News.cache[tab];
          break;
        }
        try {
          const articles = await fetchNewsTab(tab);
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

      case "games":
        // The library is static; only the news rail needs fetching.
        if (!state.Games.news.length) {
          try {
            state.Games.news = await fetchNewsTab("gaming");
          } catch {
            state.Games.news = [];
          }
        }
        break;

      case "tv": {
        // Shows and the combined TV + streaming wire, in parallel.
        const [shows, news] = await Promise.all([
          state.Tv.popular.length ? null : fetchTvShows(),
          state.Tv.news.length ? null : fetchNewsTab("tv-streaming")
        ]);
        if (shows) {
          state.Tv.providers = shows.providers || [];
          state.Tv.popular = shows.popular || [];
          state.Tv.topRated = shows.topRated || [];
          state.Tv.onTheAir = shows.onTheAir || [];
        }
        if (news) state.Tv.news = news;
        break;
      }

      case "theaters": {
        // Prefer the visitor's saved ZIP, else fall back to the default so the
        // page is never empty on arrival.
        try {
          state.Theaters.zip = localStorage.getItem(ZIP_STORAGE_KEY) || DEFAULT_ZIP;
        } catch {
          state.Theaters.zip = DEFAULT_ZIP;
        }
        if (!state.Theaters.results.length) {
          const data = await fetchInTheaters(state.Theaters.zip);
          if (data.error) {
            state.Theaters.error = data.error;
          } else {
            state.Theaters.location = data.location;
            state.Theaters.results = data.results || [];
            state.Theaters.radius = data.radius || 25;
            // Fetched after paint so a cold Overpass call can't stall the route.
            state.Theaters.venuesLoading = true;
            fetchTheatersNear(state.Theaters.zip).then(near => {
              state.Theaters.venuesLoading = false;
              state.Theaters.theaters = near.theaters || [];
              renderTheaterResults(state.Theaters);
            });
          }
        }
        break;
      }

      case "awards":
        try {
          const data = await fetchAwards();
          const categories = data?.categories || {};
          state.Awards.categories = {
            bestPicture: categories.bestPicture || [],
            bestDirector: categories.bestDirector || [],
            bestActor: categories.bestActor || [],
            bestActress: categories.bestActress || [],
            supportingActor: categories.supportingActor || [],
            supportingActress: categories.supportingActress || []
          };
          const active = state.Awards.activeCategory || "bestPicture";
          state.Awards.sections = state.Awards.categories[active] || [];
        } catch {
          state.Awards.sections = [];
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
    "/games": () => render(state.Games),
    "/theaters": () => render(state.Theaters),
    "/tv": () => render(state.Tv),
    "/discover": () => router.navigate("/movies")
  })
  .notFound(() => render(state.ViewNotFound))
  .resolve();
