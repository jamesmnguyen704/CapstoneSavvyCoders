// Import core libraries for my backend API
import express from "express"; // framework to create servers and routes
import cors from "cors"; // Allows my frontend Netlify to talk to localhost "Render"
import dotenv from "dotenv"; // Loads environment variables from .env file. API keys, and Database urls
import mongoose from "mongoose"; // something that connects and interacts with MongoDb i think

// utilities i found that will locate the .env file path correctly
import { fileURLToPath } from "url"; // Used to get the current file
import { dirname, join } from "path"; // Used to build paths

// loading env. before importing any router files

// gets my directory path in .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables MongoDB keys, API keys
dotenv.config({ path: join(__dirname, "..", ".env") });

// Debug: confirm env loaded
console.log("TMDB KEY FROM ENV TEST:", process.env.TMDB_API_KEY);

// -------------------------------------------------------
// NOW it is safe to import routers for API endpoints
// -------------------------------------------------------
const commentsRouter = (await import("./routes/comments.js")).default; // handles API comments requests server/routes/comments.js
const moviesRouter = (await import("./routes/movies.js")).default; // Handles API movies requests server/routes/movies.js

// Create the Express instance
const app = express();

// handles database connections with the success/error events
mongoose.connect(process.env.MONGODB);

// Get the database connection and set up error/success logging
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:")); // shows/logs connection error
db.once("open", () => {
  console.log("Successfully opened connection to Mongo!"); // shows/logs successful errors
});

// port from env or "render" or falls back to 3000
const PORT = process.env.PORT || 3000;

// Custom logging middleware: logs every request to the server. this is where i debug and api traffic
const logging = (request, response, next) => {
  console.log(
    `${request.method} ${request.url} ${new Date().toLocaleString("en-us")}`
  );
  next(); // continue to my next middleware/route
};

// Set up middleware for all requests, will allow json processing so backend can read request
app.use(cors()); // lets SPA talk to API
app.use(express.json()); // allows the server to read JSON sent in the BODY of POST, PUT, DELETE requests."BODY PARSER"
app.use(logging); // Logs every request

// Mount routers for API endpoints
app.use("/comments", commentsRouter); // All /comments requests go to server/routes/comments.js
app.use("/movies", moviesRouter); // All /movies requests go to server/routes/movies.js

// Basic root route. makes sure my API works
app.get("/", (req, res) => {
  res.send("Welcome to the Cinemetrics Movie Data API!");
});

// Health check route (used for monitoring, testing, or deployment checks)
app.get("/status", (req, res) => {
  res.json({
    service: "Cinemetrics API",
    message: "Service healthy",
    timestamp: new Date().toISOString()
  });
});

// start the server and listen
const server = app.listen(PORT, () => {
  console.log(`Cinemetrics API running on port ${PORT}`);
});
