// File: views/releases.js
// Purpose: Upcoming Releases — curated 2026 / 2027 picks plus a live
//          "Most Anticipated" row pulled from TMDB /discover so the page
//          stays fresh even as curated dates roll by.
// Notes: Past-dated movies are filtered server-side before they reach here.
//        Folded into Theaters as a section (see `upcomingSection` below) —
//        no standalone hero/header here anymore; Theaters keeps its own.

import html from "html-literal";
import { escapeAttr } from "./_cards";

function formatDate(iso) {
  if (!iso) return "TBA";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return "TBA";
  }
}

function releaseCard(movie) {
  const releaseDate = movie.customDate || movie.release_date || "";
  const year = releaseDate ? String(releaseDate).slice(0, 4) : "";
  const rating =
    typeof movie.vote_average === "number" && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : null;

  return `
    <div class="release-card" data-movie-id="${movie.id}">
      <div class="release-poster">
        <img
          src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
          alt="${movie.title} Poster"
          loading="lazy"
        />
        ${
          releaseDate
            ? `<div class="release-overlay">
                 <span class="release-date">${formatDate(releaseDate)}</span>
               </div>`
            : ""
        }
        <div class="card-badges">
          ${year ? `<span class="card-badge card-badge--year">${year}</span>` : ""}
          ${rating ? `<span class="card-badge card-badge--rating">★ ${rating}</span>` : ""}
        </div>
        <button
          class="card-bookmark"
          type="button"
          aria-label="Add to My List"
          data-movie='${encodeCardMovie(movie)}'
        >
          <i class="fa-regular fa-bookmark"></i>
        </button>
      </div>

      <div class="release-info">
        <h3 class="release-title">${escapeAttr(movie.title || "")}</h3>
        <div class="card-actions">
          <button class="trailer-btn" data-id="${movie.id}">▶</button>
          <button class="info-btn" type="button" data-id="${movie.id}" aria-label="More info">
            <i class="fa-solid fa-circle-info"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

// Escapes for both attribute and text contexts — TMDB titles and overviews are
// community-edited, so they reach us as untrusted HTML and land in innerHTML.
// `&` must go first or it would double-escape the entities added after it.
function encodeCardMovie(movie) {
  return escapeAttr(
    JSON.stringify({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path || null,
      release_date: movie.release_date || movie.customDate || null,
      vote_average: typeof movie.vote_average === "number" ? movie.vote_average : null
    })
  );
}

const cardRow = movies => (movies || []).map(releaseCard).join("");

// Curated-rows-only markup — no hero/header of its own (Upcoming folded into
// Theaters, which keeps its own ZIP-lookup hero/header; this renders as a
// section below it on the same page).
export function upcomingSection(st) {
  const movies2026 = (st.movies2026 || []).slice();
  const movies2027 = (st.movies2027 || []).slice();
  const popular = (st.popular || []).slice();

  return html`
    <div class="releases-container">
      <section class="releases-header">
        <h1>My most anticipated movies</h1>
        <p>Hand-picked releases for 2026 and 2027 — past dates drop off automatically.</p>
      </section>

      ${
        popular.length
          ? `
            <h2 class="year-title">
              <i class="fa-solid fa-fire"></i> Most Anticipated
              <span class="year-title-sub">Top upcoming on TMDB</span>
            </h2>
            <section class="movie-carousel">${cardRow(popular)}</section>
          `
          : ""
      }

      ${
        movies2026.length
          ? `
            <h2 class="year-title">⭐ 2026 Releases</h2>
            <section class="movie-carousel">${cardRow(movies2026)}</section>
          `
          : ""
      }

      ${
        movies2027.length
          ? `
            <h2 class="year-title">⭐ 2027 Releases</h2>
            <section class="movie-carousel">${cardRow(movies2027)}</section>
          `
          : ""
      }

      ${
        !popular.length && !movies2026.length && !movies2027.length
          ? `<p class="releases-empty">No upcoming titles right now — check back soon.</p>`
          : ""
      }
    </div>
  `;
}
