// Lightweight start script that loads environment variables before importing app
import dotenv from "dotenv";

// Load .env first so any modules imported by app.js see the variables
dotenv.config({ path: process.env.DOTENV_PATH || "./.env" });

// Dynamically import the real app after env is loaded
(async () => {
  try {
    await import("./app.js");
  } catch (err) {
    console.error("Failed to start app:", err);
    process.exit(1);
  }
})();
