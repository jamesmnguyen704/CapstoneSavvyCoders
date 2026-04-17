// File: services/watchlist.js
// Purpose: Small localStorage-backed watchlist store. No backend required.
// Notes:
//   - Stores a compact projection (id, title, poster_path, year) — enough
//     to render a card without re-fetching TMDB.
//   - All functions are safe to call during SSR / before DOM is ready
//     (guarded by typeof check).

const KEY = "cm_watchlist_v1";

function read() {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    // Let other parts of the app (and other tabs) know it changed.
    window.dispatchEvent(new CustomEvent("watchlist:change", { detail: items }));
  } catch {
    /* storage full / disabled — silently ignore */
  }
}

export function listWatchlist() {
  return read();
}

export function inWatchlist(id) {
  if (id == null) return false;
  const needle = String(id);
  return read().some(m => String(m.id) === needle);
}

export function addToWatchlist(movie) {
  if (!movie || movie.id == null) return false;
  const list = read();
  if (list.some(m => String(m.id) === String(movie.id))) return false;
  list.unshift({
    id: movie.id,
    title: movie.title || movie.name || "Untitled",
    poster_path: movie.poster_path || null,
    year: extractYear(movie.release_date || movie.customDate),
    vote_average: typeof movie.vote_average === "number" ? movie.vote_average : null,
    addedAt: Date.now()
  });
  write(list);
  return true;
}

export function removeFromWatchlist(id) {
  if (id == null) return false;
  const needle = String(id);
  const list = read();
  const next = list.filter(m => String(m.id) !== needle);
  if (next.length === list.length) return false;
  write(next);
  return true;
}

export function toggleWatchlist(movie) {
  if (!movie || movie.id == null) return null;
  if (inWatchlist(movie.id)) {
    removeFromWatchlist(movie.id);
    return "removed";
  }
  addToWatchlist(movie);
  return "added";
}

function extractYear(dateStr) {
  if (!dateStr) return null;
  const m = String(dateStr).match(/^(\d{4})/);
  return m ? Number(m[1]) : null;
}
