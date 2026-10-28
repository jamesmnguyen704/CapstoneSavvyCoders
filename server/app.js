// importing libraries for my backend API
//
// This file only builds the Express app and exports it — no MongoDB connect,
// no app.listen, no cache warm-up. Those are operational side effects that
// belong to the actual running server, not to "what routes exist and how
// are they wired together." Keeping them out of here means a test can
// `import app from "./app.js"` and make requests against real routes
// without opening a socket or touching the production database. See
// server/server.js for the operational half.
import express from "express"; // Framework to create servers and routes
import cors from "cors"; // Allows my frontend (Netlify) or Render to say whats up to my backend API
import mongoose from "mongoose"; // only used here to read connection.readyState in requireDatabase
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { cacheStats } from "./utils/cache.js";
import authRoutes from "./routes/auth.js";
import newsRoutes from "./routes/news.js";
import personRoutes from "./routes/person.js";
import tvRoutes from "./routes/tv.js";
import usersRoutes from "./routes/users.js";
import userMediaRoutes from "./routes/userMedia.js";
import researchCacheRoutes from "./routes/researchCache.js";
import editorialQueueRoutes from "./routes/editorialQueue.js";
import { requireInternalKey } from "./middleware/requireInternalKey.js";

//importing my API endpoint routers
const commentsRouter = (await import("./routes/comments.js")).default; // api request
const moviesRouter = (await import("./routes/movies.js")).default; // movie request

// creating my express instance
const app = express();

// custom middleware logging when it hits API
const logging = (request, response, next) => {
  console.log(
    `${request.method} ${request.url} ${new Date().toLocaleString("en-us")}`
  );
  next();
};

// my middleware starts here
app.use(cors()); // So Spa can talk to API
app.use(express.json()); // so backend can read JSON for
app.use(logging); //loggin request for debug

// Without this, a request to a Mongo-backed route sits through mongoose's 10s
// buffering timeout and then fails with an internal driver message.
const requireDatabase = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Accounts and comments are temporarily unavailable."
    });
  }
  next();
};

// Nothing throttled login/signup before this — a password list against a
// known username had nothing to slow it down. 10 attempts / 15 min per IP is
// generous for a real user who fat-fingers a password a few times, tight
// enough to make guessing impractical.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Try again in a few minutes." }
});

// mounting the router
app.use("/comments", requireDatabase, commentsRouter); // Forward /comments requests
app.use("/movies", moviesRouter); // Forward /movies requests
app.use("/auth", authLimiter, requireDatabase, authRoutes); // user auth routes
app.use("/news", newsRoutes); // movie news (Guardian Film proxy)
app.use("/person", personRoutes); // person/actor detail + filmography
app.use("/tv", tvRoutes); // TV shows + streaming-service browse
app.use("/users", requireDatabase, usersRoutes); // admin-only account directory
app.use("/user-media", requireDatabase, userMediaRoutes); // native ratings + watched/watchlist
app.use("/research-cache", requireDatabase, requireInternalKey, researchCacheRoutes); // bot-comment research fact cache, internal tooling only — gated by a shared secret, not a user login
app.use("/editorial-queue", requireDatabase, editorialQueueRoutes); // Gate 2 private editorial queue — stops at READY, never calls a social publisher

// testing starts here
// Root route to confirm backend is running
app.get("/", (req, res) => {
  res.send("Welcome to the Cinemetrics Movie Data API!");
});

// health check  for Render, Netlify
app.get("/status", (req, res) => {
  res.json({
    service: "Cinemetrics API",
    message: "Service healthy",
    cache: cacheStats(),
    timestamp: new Date().toISOString()
  });
});

// This used to serve the whole repo root as static files, with a catch-all
// falling back to index.html for anything else. Netlify is what actually
// serves the frontend in production (its own _redirects file does the SPA
// fallback) — this process only needs to be an API. Serving the repo root
// here meant anyone could fetch this file, package.json, package-lock.json,
// or anything else in the tree straight off the live Render URL, and the
// catch-all was silently turning every mistyped route into a 200 instead of
// a real 404.
//
// Game cover art and console logos are a different case: they're a folder of
// dozens of images referenced dynamically by filename from data, not a fixed
// handful the bundler can fingerprint one-by-one, so they still need to be
// served as plain static files. Rather than bringing back the repo-root
// catch-all, mount just these two Assets subfolders, each scoped to the
// single directory it serves — nothing else in the repo is reachable here.
app.use(
  "/Assets/game-covers",
  express.static(join(__dirname, "..", "Assets", "game-covers"))
);
app.use(
  "/Assets/console-logos",
  express.static(join(__dirname, "..", "Assets", "console-logos"))
);

// Anything that doesn't match a mounted router falls through to here instead
// of Express's plain-text default — keeps every response on this API JSON-
// shaped, including a typo'd route.
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Catches anything a route handler threw synchronously instead of rejecting
// a promise (those are already handled by each route's own try/catch). Logs
// the real error server-side and returns a generic message — same reasoning
// as the auth error handlers: a stack trace in the response body is free
// reconnaissance for whoever's looking at it.
app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(500).json({ message: "Something went wrong." });
});

export default app;
