// File: server/utils/cache.js
// Purpose: In-memory TTL cache for TMDB-backed GET responses.
// Notes: /movies/marvel fans out to dozens of TMDB calls and took ~8-10s on
//        every single request. It's a curated list that barely changes, so
//        caching the assembled JSON is the whole fix.
//
// Bounded on two axes, neither of which existed before:
//   - Expired entries were checked on lookup but never deleted, so a key that
//     expired and was never requested again just sat in memory forever.
//   - There was no size cap at all. The key is the full URL, so every unique
//     query string (every distinct /movies/search?q=... someone ever typed)
//     mints a new entry with no way to age out except a server restart.
const store = new Map();
const MAX_ENTRIES = 500;

/**
 * Express middleware that memoizes successful GET JSON responses by URL.
 *
 * @param {number|(req) => number} ttl  Lifetime in ms, or a fn of the request.
 * @param {(req) => string} keyFn       Cache key. Defaults to the full URL.
 */
export function cacheJson(ttl, keyFn = req => req.originalUrl) {
  return (req, res, next) => {
    // Never cache writes, and never serve a cached body to one.
    if (req.method !== "GET") return next();

    const key = keyFn(req);
    const hit = store.get(key);

    if (hit) {
      if (Date.now() < hit.expires) {
        res.set("X-Cache", "HIT");
        return res.status(hit.status).json(hit.body);
      }
      // Stale — drop it now rather than leaving it for a sweep that might
      // never come if this exact key is never requested again.
      store.delete(key);
    }

    res.set("X-Cache", "MISS");

    // Tap res.json so handlers stay untouched.
    const sendJson = res.json.bind(res);
    res.json = body => {
      // Only successes get stored — a 500 shouldn't stick around for an hour.
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const ms = typeof ttl === "function" ? ttl(req) : ttl;
        // Map preserves insertion order, so the first key is the oldest —
        // a cheap FIFO eviction. Re-inserting an existing key (delete then
        // set) would move it to the back; this path only fires on a fresh
        // key, so plain insertion order is fine.
        if (store.size >= MAX_ENTRIES) {
          store.delete(store.keys().next().value);
        }
        store.set(key, { body, status: res.statusCode, expires: Date.now() + ms });
      }
      return sendJson(body);
    };

    next();
  };
}

// Expired entries only get swept on their own next lookup (above), which
// never happens for a key nobody asks for again. This catches those, so
// memory doesn't grow purely from one-off URLs (a ZIP search, a stray query
// param) that each only ever got hit once.
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.expires) store.delete(key);
  }
}, SWEEP_INTERVAL_MS).unref();

// Generic get/set for handlers that cache per-item (e.g. one entry per movie
// ID inside a batch POST) rather than one entry per full GET response — the
// middleware above only keys by request URL, which doesn't fit a POST body.
// Shares the same store/eviction/sweep, so there's one cache to reason
// about instead of every route growing its own ad hoc Map.
export function getCached(key) {
  const hit = store.get(key);
  if (!hit) return undefined;
  if (Date.now() >= hit.expires) {
    store.delete(key);
    return undefined;
  }
  return hit.body;
}

export function setCached(key, value, ttl) {
  if (store.size >= MAX_ENTRIES) {
    store.delete(store.keys().next().value);
  }
  store.set(key, { body: value, status: 200, expires: Date.now() + ttl });
}

// Escape hatch for a manual refresh, and used by the tests/warm-up path.
export function clearCache(prefix) {
  if (!prefix) return store.clear();
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

export function cacheStats() {
  const now = Date.now();
  return {
    entries: store.size,
    live: [...store.values()].filter(v => now < v.expires).length
  };
}
