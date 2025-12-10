// importing libraries for my backend API
import dotenv from "dotenv"; // loads environment variables from .env file (API keys, MongoDB URL)
// Load environment variables immediately so other modules see them at import time
import express from "express"; // Framework to create servers and routes
import cors from "cors"; // Allows my frontend (Netlify) or Render to say whats up to my backend API
import mongoose from "mongoose"; // MongoDB library that connects and interacts
import authRoutes from "./routes/auth.js";

// my utilities to help with my .emv
import { fileURLToPath } from "url"; // to get the current file path
import { dirname, join } from "path"; // build paths for loading .env

// Get my directory path to reference .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// testing .env variables are being read
console.log("TMDB KEY FROM ENV TEST:", process.env.TMDB_API_KEY);

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

// mounting the router
app.use("/comments", commentsRouter); // Forward /comments requests
app.use("/movies", moviesRouter); // Forward /movies requests
app.use("/auth", authRoutes); // user auth routes

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
    timestamp: new Date().toISOString()
  });
});

// Serve static files from the root directory
import path from "path";
app.use(express.static(join(__dirname, "..")));

// SPA fallback: serve index.html for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "..", "index.html"));
});

// Start the server, listen to 0.0.0.0 so render can reach server
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cinemetrics API running on port ${PORT}`);
});
