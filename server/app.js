// ================================
// Import core libraries for my backend API
// ================================
import express from "express"; // Framework to create servers and routes
import cors from "cors"; // Allows my frontend (Netlify) or Render to talk to my backend API
import dotenv from "dotenv"; // Loads environment variables from .env file (API keys, MongoDB URL, etc.)
import mongoose from "mongoose"; // Library that connects and interacts with MongoDB

// ================================
// Utilities used to locate .env file correctly
// ================================
import { fileURLToPath } from "url"; // Used to get the current file path
import { dirname, join } from "path"; // Used to build paths for loading .env

// Get my directory path to reference .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ================================
// Load environment variables
// -------------------------------
// Locally: loads .env file
// Render: ignores .env path but injects values automatically
// ================================
dotenv.config({ path: join(__dirname, "..", ".env") });

// Debugging test to verify .env variables are being read
console.log("TMDB KEY FROM ENV TEST:", process.env.TMDB_API_KEY);

// ================================
// Import API endpoint routers
// ================================
const commentsRouter = (await import("./routes/comments.js")).default; // Handles API comment requests
const moviesRouter = (await import("./routes/movies.js")).default; // Handles API movie requests

// ================================
// Create the Express instance
// ================================
const app = express();

// ================================
// Connect to MongoDB with logging improvements
// -------------------------------
// Added .then() / .catch() so Render logs helpful errors
// ================================
mongoose
  .connect(process.env.MONGODB)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Also attach old-school event loggers for more detail
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => {
  console.log("Successfully opened connection to Mongo!");
});

// ================================
// Define PORT
// -------------------------------
// Locally: PORT comes from .env → usually 3000
// Render: PORT overridden dynamically, but requires fallback
// ================================
const PORT = process.env.PORT || 3000;

// ================================
// Custom logging middleware
// -------------------------------
// Logs every request hitting my API for debugging
// ================================
const logging = (request, response, next) => {
  console.log(
    `${request.method} ${request.url} ${new Date().toLocaleString("en-us")}`
  );
  next(); // Continue to next middleware/route
};

// ================================
// Global Middleware
// ================================
app.use(cors()); // Lets my SPA talk to my API
app.use(express.json()); // Allows backend to read JSON from POST/PUT/DELETE
app.use(logging); // Log every request for debugging

// ================================
// Mount Routers
// ================================
app.use("/comments", commentsRouter); // Forward /comments requests
app.use("/movies", moviesRouter); // Forward /movies requests

// ================================
// Test Routes
// ================================

// Root route – used to confirm backend is running
app.get("/", (req, res) => {
  res.send("Welcome to the Cinemetrics Movie Data API!");
});

// Health check — used for Render, Netlify, debugging, etc.
app.get("/status", (req, res) => {
  res.json({
    service: "Cinemetrics API",
    message: "Service healthy",
    timestamp: new Date().toISOString()
  });
});

// ================================
// Start the server (IMPORTANT for Render)
// -------------------------------
// MUST listen on "0.0.0.0" or Render CANNOT reach the server
// ================================
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cinemetrics API running on port ${PORT}`);
});
