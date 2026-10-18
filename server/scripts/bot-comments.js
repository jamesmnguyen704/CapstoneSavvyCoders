// File: server/scripts/bot-comments.js
// Purpose: Create "character" bot accounts (if needed) and post their comments
//          from a researched batch file, following docs/bot-comments-handoff.md.
// Usage:   node server/scripts/bot-comments.js path/to/batch.json
//          (DOTENV_PATH env var works the same way server/start.js reads it)
//
// Batch file shape: a JSON array of entries:
//   { username, movieId, text, isNewAccount?, actorName? }
// `actorName` is required when isNewAccount is true — used to look up a real
// TMDB profile photo for the new account's avatar.
//
// Idempotent: before creating an account or posting a comment, checks what's
// already in the DB and skips it. Safe to rerun after a /auth rate-limit
// restart, a crash, or any partial run — it picks up wherever it left off
// instead of reposting everything from the top.

import dotenv from "dotenv";
import path from "path";
import http from "http";
import mongoose from "mongoose";
import { pathToFileURL } from "url";

dotenv.config({ path: process.env.DOTENV_PATH || path.join(process.cwd(), ".env") });

const { default: User } = await import("../models/user.js");
const { default: Comment } = await import("../models/comments.js");

const PASSWORD = "Avengers2026!";
const PORT = process.env.BACKEND_PORT || process.env.PORT || 3000;
const TMDB_KEY = process.env.TMDB_API_KEY;

function request(method, apiPath, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: "localhost",
      port: PORT,
      path: apiPath,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
    const r = http.request(options, (res) => {
      let chunks = "";
      res.on("data", (c) => (chunks += c));
      res.on("end", () => {
        let parsed;
        try {
          parsed = JSON.parse(chunks);
        } catch {
          parsed = chunks;
        }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}

async function ensureAccount(username, actorName) {
  const existing = await User.findOne({ username }).lean();
  if (existing) {
    console.log(`  - account ${username} already exists, skipping create`);
    return;
  }
  if (!actorName) {
    throw new Error(`New account "${username}" needs an actorName to look up a TMDB avatar`);
  }

  const personRes = await (
    await fetch(`https://api.themoviedb.org/3/search/person?api_key=${TMDB_KEY}&query=${encodeURIComponent(actorName)}`)
  ).json();
  const profilePath = personRes.results?.[0]?.profile_path;
  const avatar = profilePath ? `https://image.tmdb.org/t/p/w300${profilePath}` : null;

  const signupRes = await request("POST", "/auth/signup", {
    username,
    email: `${username}@mcu-roster.test`,
    password: PASSWORD,
  });
  if (signupRes.status !== 200) {
    throw new Error(`Signup failed for ${username}: ${signupRes.status} ${JSON.stringify(signupRes.body)}`);
  }

  await User.updateOne({ username }, { $set: { isCharacter: true, avatar } });
  console.log(`  - created ${username} (avatar: ${avatar || "none found"})`);
}

async function main() {
  const batchPath = process.argv[2];
  if (!batchPath) {
    console.error("Usage: node server/scripts/bot-comments.js path/to/batch.json");
    process.exit(1);
  }
  const { default: roster } = await import(pathToFileURL(path.resolve(batchPath)).href, { with: { type: "json" } });

  if (!process.env.MONGODB) {
    console.error("Missing MONGODB connection string in .env — aborting.");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB);
  console.log("Connected to MongoDB.");

  // Create any new accounts first (deduped, cheap to rerun).
  const newAccounts = new Map();
  for (const c of roster) {
    if (c.isNewAccount && !newAccounts.has(c.username)) newAccounts.set(c.username, c.actorName);
  }
  for (const [username, actorName] of newAccounts) {
    await ensureAccount(username, actorName);
  }

  let posted = 0;
  let skipped = 0;
  let failed = 0;

  for (const c of roster) {
    const user = await User.findOne({ username: c.username }).lean();
    if (!user) {
      console.log(`  ! ${c.username} has no account on file, skipping comment`);
      failed++;
      continue;
    }

    const already = await Comment.findOne({ userId: user._id, movieId: c.movieId, text: c.text }).lean();
    if (already) {
      console.log(`  - skip  ${c.username} on movie ${c.movieId} (already posted)`);
      skipped++;
      continue;
    }

    const loginRes = await request("POST", "/auth/login", { loginId: c.username, password: PASSWORD });
    if (loginRes.status === 429) {
      console.log(`\nHit the auth rate limit at ${c.username}. Restart the backend to clear it, then rerun this`);
      console.log("same command — already-posted comments are skipped automatically.");
      break;
    }
    if (loginRes.status !== 200) {
      console.log(`  ! login failed for ${c.username}: ${loginRes.status} ${JSON.stringify(loginRes.body)}`);
      failed++;
      continue;
    }

    const postRes = await request("POST", "/comments", { movieId: c.movieId, text: c.text }, loginRes.body.token);
    if (postRes.status === 201) {
      console.log(`  + posted ${c.username} -> movie ${c.movieId}`);
      posted++;
    } else {
      console.log(`  ! post failed for ${c.username} -> movie ${c.movieId}: ${postRes.status} ${JSON.stringify(postRes.body)}`);
      failed++;
    }
  }

  console.log(`\nDone. Posted ${posted}, skipped ${skipped} (already there), failed ${failed}.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("bot-comments script failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
