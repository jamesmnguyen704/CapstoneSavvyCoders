# Cinemetrics — read this first

This file is auto-loaded at the start of every Claude Code session in this repo. Read the docs it points to before assuming you know the current state — don't rely on conversation memory alone, it doesn't carry across sessions.

## Always check first

- **`docs/project-status.md`** — running log of what's done, what's in progress, and what's open. Updated at the end of each work session. Check this before starting work and update it before you stop.
- **`docs/bot-comments-handoff.md`** — everything about the Marvel fan-comment bot system (roster, content rules, posting pipeline, rate-limit workaround).
- **`docs/mcu-storyline.md`** — chronological MCU plot/casting reference, used to ground unreleased-movie bot comments in confirmed facts.
- **`docs/ai-research-findings.md`** — the actual findings (not just the prompts) from an external Gemini/ChatGPT research pass on the whole site: what's confirmed-and-fixed, what's recommended-but-not-built, and an explicit "don't bother" list. Check before re-suggesting something already covered here.

## Multiple sessions run against this repo at once

James often has 2-3 Claude Code sessions open in parallel. If you see named peers via `ListAgents` (e.g. "Bot", "UI", "Orchastrator"), check `docs/project-status.md`'s "Active lanes" table for who owns what before starting overlapping work.

**Before editing `style.css`, `index.js`, or the shared card templates** (`views/_cards.js`, `views/home.js`, `views/myList.js`, `views/releases.js`): run `git status` / `git diff --stat` on them first. These files get fought over across sessions — a large uncommitted diff sitting in one means another lane is mid-task on it.

## Environment essentials

- No `.env` in the repo — pass `DOTENV_PATH` or every route silently returns empty data.
- `/auth` (signup + login) rate-limits at 10 req/15min per IP. If bulk account work starts 429ing, restart the backend process — it clears the in-memory counter instantly.
- Building with Parcel while the dev server is already running serves a stale bundle that looks like a real bug. Don't run both at once.

## Before committing

Never blind `git add -A` — this tree frequently has uncommitted work from other sessions mixed in. Check `git status -sb` and stage specific files you actually own.
