// File: server/scripts/seed.js
// Purpose: Seed a few test users so local/dev has accounts ready to log in with.
// Usage:   npm run seed
// Notes:
//   - Loads .env the same way server/start.js does.
//   - Idempotent: skips users that already exist (matched by username or email).
//   - Relies on the User model's pre-save hook to hash passwords with bcrypt.

import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";

dotenv.config({ path: process.env.DOTENV_PATH || path.join(process.cwd(), ".env") });

// Import the model AFTER env is loaded so any import-time env reads work.
const { default: User } = await import("../models/user.js");

const TEST_USERS = [
  { username: "alice", email: "alice@test.com", password: "password123" },
  { username: "bob", email: "bob@test.com", password: "password123" },
  { username: "carol", email: "carol@test.com", password: "password123" }
];

async function main() {
  if (!process.env.MONGODB) {
    console.error("Missing MONGODB connection string in .env — aborting seed.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB);
  console.log("Connected to MongoDB. Seeding test users…");

  let created = 0;
  let skipped = 0;

  for (const u of TEST_USERS) {
    const username = u.username.toLowerCase();
    const email = u.email.toLowerCase();

    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      console.log(`  - skip  ${username} (already exists)`);
      skipped++;
      continue;
    }

    await User.create({ username, email, password: u.password });
    console.log(`  - add   ${username} / ${email}  (password: ${u.password})`);
    created++;
  }

  console.log(`\nDone. Created ${created}, skipped ${skipped}.`);
  await mongoose.disconnect();
}

main().catch(async err => {
  console.error("Seed failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
