// File: server/utils/cache.js
// Purpose: In-memory TTL cache for TMDB-backed GET responses.
// Notes: /movies/marvel and /movies/awards fan out to dozens of TMDB calls and
//        took ~8-10s each on every single request. They're curated lists that
//        barely change, so caching the assembled JSON is the whole fix.

const store = new Map();

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

    if (hit && Date.now() < hit.expires) {
      res.set("X-Cache", "HIT");
      return res.status(hit.status).json(hit.body);
    }

    res.set("X-Cache", "MISS");

    // Tap res.json so handlers stay untouched.
    const sendJson = res.json.bind(res);
    res.json = body => {
      // Only successes get stored — a 500 shouldn't stick around for an hour.
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const ms = typeof ttl === "function" ? ttl(req) : ttl;
        store.set(key, { body, status: res.statusCode, expires: Date.now() + ms });
      }
      return sendJson(body);
    };

    next();
  };
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
