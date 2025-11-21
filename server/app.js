import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import commentsRouter from "./routes/comments.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

mongoose.connect(process.env.MONGODB);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => {
  console.log("Successfully opened connection to Mongo!");
});

const PORT = process.env.PORT || 3000;
const app = express();

const logging = (request, response, next) => {
  console.log(
    `${request.method} ${request.url} ${new Date().toLocaleString("en-us")}`
  );
  next();
};
app.use(cors());
app.use(express.json());
app.use(logging);

app.use("/comments", commentsRouter);

app.get("/", (req, res) => {
  res.send("🎬 Welcome to the Cinemetrics Movie Data API!");
});

app.get("/status", (req, res) => {
  res.json({
    service: "Cinemetrics API",
    message: "Service healthy",
    timestamp: new Date().toISOString()
  });
});

app.get("/movies", (req, res) => {
  res.json({
    message: "Cinemetrics Movie Endpoint",
    upcoming: "Use /movies/upcoming for future releases",
    trending: "Use /movies/trending for trending movies"
  });
});

app.get("/movies/trending", (req, res) => {
  res.json({
    message: "Top Trending Movies (Demo Data)",
    results: [
      { id: 1, title: "Deadpool & Wolverine" },
      { id: 2, title: "Dune: Part Two" },
      { id: 3, title: "Inside Out 2" }
    ]
  });
});

app.get("/movies/upcoming", (req, res) => {
  res.json({
    message: "Upcoming Movie Releases (Demo Data)",
    results: [
      { id: 101, title: "Avatar 3" },
      { id: 102, title: "Spider-Man: Beyond the Spider-Verse" }
    ]
  });
});

const server = app.listen(PORT, () => {
  console.log(`🎥 Cinemetrics API running on port ${PORT}`);
});
