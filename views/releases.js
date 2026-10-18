// File: views/releases.js
// Purpose: Upcoming Releases — curated 2026 / 2027 picks plus a live
//          "Most Anticipated" row pulled from TMDB /discover so the page
//          stays fresh even as curated dates roll by.
// Notes: Past-dated movies are filtered server-side before they reach here.
//        Folded into Theaters as a section (see `upcomingSection` below) —
//        no standalone hero/header here anymore; Theaters keeps its own.

import html from "html-literal";
import { movieCard } from "./_cards";

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

// Upcoming titles reuse the universal movieCard() (same corner-badge layout
// as every other page) instead of a bespoke release-card — the only thing
// this page needs on top is the formatted release date under the title.
const cardRow = movies =>
  (movies || [])
    .map(m =>
      movieCard(m, {
        dateLabel: formatDate(m.customDate || m.release_date)
      })
    )
    .join("");

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
