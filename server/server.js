// The operational half of app.js's old job: connect to MongoDB, start
// listening, warm the cache. Split out so app.js can be imported by a test
// with no side effects — see app.js's top comment for why.
import axios from "axios";
import mongoose from "mongoose";
import app from "./app.js";

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
