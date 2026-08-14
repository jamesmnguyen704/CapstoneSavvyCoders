// File: views/theaters.js
// Purpose: "In Theaters" — enter a ZIP, see what's playing now, and jump
//          straight into Fandango / AMC / Regal / Cinemark with the movie and
//          location already filled in.
// Notes: There is no free showtimes API, so we deep-link out rather than
//        pretend to know exact times. On mobile these are universal links, so
//        they open the chain's native app when it's installed.
import html from "html-literal";
import { skeletonCards } from "./_cards";

function escapeAttr(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function ticketRow(tickets = []) {
  if (!tickets.length) return "";
  return `
    <div class="theater-tickets">
      ${tickets
        .map(
          t => `
        <a
          class="theater-ticket theater-ticket--${escapeAttr(t.name.toLowerCase())}"
          href="${escapeAttr(t.url)}"
          target="_blank"
          rel="noopener noreferrer"
        >${escapeAttr(t.name)}</a>`
        )
        .join("")}
    </div>
  `;
}

function theaterCard(movie) {
  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
    : null;
  const rating =
    typeof movie.vote_average === "number" && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : null;

  return `
    <article class="theater-card">
      <div class="theater-poster-wrap">
        ${
          poster
            ? `<img class="theater-poster" src="${poster}" alt="${escapeAttr(movie.title)}" loading="lazy" />`
            : `<div class="theater-poster theater-poster--placeholder" aria-hidden="true">🎬</div>`
        }
        ${rating ? `<span class="theater-rating">★ ${rating}</span>` : ""}
        <button class="theater-info" type="button" data-id="${movie.id}" aria-label="More info on ${escapeAttr(movie.title)}">
          <i class="fa-solid fa-circle-info"></i>
        </button>
      </div>
      <h3 class="theater-title">${escapeAttr(movie.title)}</h3>
      <span class="theater-tickets-label">Get tickets</span>
      ${ticketRow(movie.tickets)}
    </article>
  `;
}

function venueList(state) {
  if (state.venuesLoading) {
    return Array.from({ length: 6 })
      .map(() => `<div class="venue venue--skeleton"><span class="skeleton venue-skeleton-line"></span></div>`)
      .join("");
  }
  const venues = state.theaters || [];
  if (!venues.length) {
    return `<p class="venue-empty">No theaters found within ${state.radius || 25} miles.</p>`;
  }
  return venues
    .map(
      v => `
      <a class="venue" href="${escapeAttr(v.maps)}" target="_blank" rel="noopener noreferrer">
        <span class="venue-dist">${v.distance}<small>mi</small></span>
        <span class="venue-body">
          <span class="venue-name">${escapeAttr(v.name)}</span>
          ${v.address ? `<span class="venue-address">${escapeAttr(v.address)}</span>` : ""}
        </span>
      </a>`
    )
    .join("");
}

function venuePanel(state) {
  return `
    <h2 class="venue-head">
      Closest theaters
      <span class="venue-sub">within ${state.radius || 25} miles</span>
    </h2>
    <div class="venue-list">${venueList(state)}</div>
  `;
}

// Re-renders only the results block so typing/submitting doesn't rebuild the
// header and steal focus from the ZIP field.
export function renderTheaterResults(state) {
  const region = document.querySelector("#theaterResults");
  const venues = document.querySelector("#theaterVenues");
  const status = document.querySelector("#theaterStatus");
  if (!region) return;

  if (status) status.innerHTML = statusLine(state);
  if (venues) venues.innerHTML = venuePanel(state);

  if (state.loading) {
    region.innerHTML = `<div class="theater-grid">${skeletonCards(9)}</div>`;
    return;
  }
  if (state.error) {
    region.innerHTML = `<p class="theater-empty">${escapeAttr(state.error)}</p>`;
    return;
  }
  if (!state.results.length) {
    region.innerHTML = `<p class="theater-empty">Enter your ZIP code to see what's playing near you.</p>`;
    return;
  }
  region.innerHTML = `<div class="theater-grid">${state.results.map(theaterCard).join("")}</div>`;
}

function statusLine(state) {
  if (state.loading) return `Finding theaters…`;
  if (state.error) return "";
  if (state.location) {
    const { city, state: st, zip } = state.location;
    return `Showing <b>${state.results.length}</b> films in theaters near <b>${escapeAttr(
      [city, st].filter(Boolean).join(", ")
    )} ${escapeAttr(zip)}</b>`;
  }
  return "";
}

export default state => html`
  <section class="theaters-page">
    <header class="theaters-header">
      <span class="theaters-kicker">Now Playing</span>
      <h1>In Theaters</h1>
      <p class="theaters-subtitle">
        Enter your ZIP code to see what's on near you, then jump straight to
        Fandango, AMC, Regal or Cinemark with the movie and location already
        filled in.
      </p>

      <form class="theater-zip-form" id="theaterZipForm" novalidate>
        <label class="sr-only" for="theaterZip">ZIP code</label>
        <input
          id="theaterZip"
          class="theater-zip-input"
          type="text"
          inputmode="numeric"
          pattern="[0-9]{5}"
          maxlength="5"
          placeholder="ZIP code"
          value="${escapeAttr(state.zip || "")}"
          autocomplete="postal-code"
        />
        <button class="theater-zip-btn" type="submit">Find theaters</button>
      </form>

      <p class="theater-status" id="theaterStatus">${statusLine(state)}</p>
    </header>

    <div class="theaters-layout">
      <div id="theaterResults">
        ${
          state.loading
            ? `<div class="theater-grid">${skeletonCards(9)}</div>`
            : state.error
              ? `<p class="theater-empty">${escapeAttr(state.error)}</p>`
              : state.results.length
                ? `<div class="theater-grid">${state.results.map(theaterCard).join("")}</div>`
                : `<p class="theater-empty">Enter your ZIP code to see what's playing near you.</p>`
        }
      </div>
      <aside class="theater-venues" id="theaterVenues">${venuePanel(state)}</aside>
    </div>
  </section>
`;
