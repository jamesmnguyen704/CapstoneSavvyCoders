// importing libraries for my backend API
import express from "express"; // Framework to create servers and routes
import axios from "axios"; // used to prime the response cache at boot
import cors from "cors"; // Allows my frontend (Netlify) or Render to say whats up to my backend API
import mongoose from "mongoose"; // MongoDB library that connects and interacts
import { cacheStats } from "./utils/cache.js";
import authRoutes from "./routes/auth.js";
import newsRoutes from "./routes/news.js";
import personRoutes from "./routes/person.js";
import tvRoutes from "./routes/tv.js";

//importing my API endpoint routers
const commentsRouter = (await import("./routes/comments.js")).default; // api request
const moviesRouter = (await import("./routes/movies.js")).default; // movie request

// creating my express instance
const app = express();

// Connect MongoDB for logging. .then() and .catch() so render can catch errors
mongoose
  .connect(process.env.MONGODB)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// event loggers for more detail
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => {
  console.log("Successfully opened connection to Mongo!");
});

// defining my port. Prefer BACKEND_PORT for local dev, fall back to PORT, then 3000
const PORT = process.env.BACKEND_PORT || process.env.PORT || 3000;

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

// mounting the router
app.use("/comments", requireDatabase, commentsRouter); // Forward /comments requests
app.use("/movies", moviesRouter); // Forward /movies requests
app.use("/auth", requireDatabase, authRoutes); // user auth routes
app.use("/news", newsRoutes); // movie news (Guardian Film proxy)
app.use("/person", personRoutes); // person/actor detail + filmography
app.use("/tv", tvRoutes); // TV shows + streaming-service browse

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

// Start the server, listen to 0.0.0.0 so render can reach server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cinemetrics API running on port ${PORT}`);
  warmCache();
});

// Prime the expensive curated routes at boot so the first visitor hits a warm
// cache instead of paying the ~10s TMDB fan-out. Failures are non-fatal — the
// route just stays cold and fills on first request.
async function warmCache() {
  const routes = ["/movies/marvel", "/movies/upcoming-curated"];
  // Sequential: warming these in parallel stacks three TMDB fan-outs on top of
  // each other and trips the rate limiter, leaving the cache full of holes.
  for (const route of routes) {
    const started = Date.now();
    try {
      await axios.get(`http://127.0.0.1:${PORT}${route}`, { timeout: 60000 });
      console.log(`Warmed ${route} in ${Date.now() - started}ms`);
    } catch (err) {
      console.warn(`Warm-up skipped for ${route}:`, err.message);
    }
  }
}
