// File: views/home.js
// Purpose: Home page — hero slider + the "Browse All" filter/grid section
//          (Trending/Popular/Top Rated are now just sort options there,
//          instead of three separate duplicate rows below the hero).
//          "Now Playing in U.S. Theaters" lives on its own /theaters page,
//          where it pairs with the ZIP lookup and nearby-cinema list.
// Notes: Uses state populated by the router (fetchHomeData + fetchTopRated).

import html from "html-literal";
import placeholderPoster from "url:../Assets/images/placeholder-poster.jpg";
import { browseAllSection } from "./movies";
import { movieNewsSection } from "./news";
import { escapeAttr } from "./_cards";

// "Playing in theaters" vs "Now streaming on Netflix" — the backend tags each
// trending title by checking TMDB's now_playing list and watch providers.
function availabilityBadge(movie) {
  const a = movie.availability;
  if (!a || !a.type) return "";
  const logo = a.logo
    ? `<img class="hero-avail-logo" src="${a.logo}" alt="" aria-hidden="true" />`
    : "";
  return `
    <span class="hero-avail" data-type="${escapeAttr(a.type)}">
      ${a.type === "theaters" ? `<i class="fa-solid fa-film" aria-hidden="true"></i>` : logo}
      ${escapeAttr(a.label)}
    </span>
  `;
}

export default st => {
  const heroMovies = st.trending ? st.trending.slice(0, 5) : [];

  return html`
    <section class="hero-slider-container">
      ${heroMovies.length > 0
        ? heroMovies
            .map(
              (movie, i) => `
          <div class="hero-slide">
            <img
              class="hero-backdrop"
              src="https://image.tmdb.org/t/p/w1280${movie.backdrop_path}"
              alt="${escapeAttr(movie.title)} Backdrop"
              ${i === 0 ? "" : 'loading="lazy"'}
              onerror="this.onerror=null; this.src='${placeholderPoster}'"
            />
            <div class="hero-content">
              <span class="hero-kicker">Featured · Trending Now</span>
              <h1>${escapeAttr(movie.title)}</h1>
              ${availabilityBadge(movie)}
              <p>${escapeAttr(movie.overview || "")}</p>
              <div class="hero-actions">
                <button class="trailer-btn hero-btn" data-id="${movie.id}">▶ Watch Trailer</button>
                <button class="info-btn hero-info-btn" type="button" data-id="${movie.id}">
                  <i class="fa-solid fa-circle-info"></i> More Info
                </button>
              </div>
            </div>
          </div>
        `
            )
            .join("")
        : `
          <div class="hero-content">
            <h1>Welcome to Cinemetrics</h1>
            <p>Dive into trending films, box office chaos, and upcoming releases.</p>
          </div>
        `}
    </section>

    <section id="browse-all">
      ${browseAllSection(st.movies || {})}
    </section>

    <section id="movie-news">
      ${movieNewsSection(st.news || {})}
    </section>
  `;
};
