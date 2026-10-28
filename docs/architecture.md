# Architecture — Cinemetrics

Current system shape, as of 2026-10-27. This describes what's actually built
and verified, not the target design — see `docs/project-status.md` for
status and `docs/decisions.md` for why specific choices were made.

## Shape

- **Frontend:** vanilla JS, no framework, bundled by Parcel (`npm start` →
  `localhost:1234`). Client-side router is `navigo`.
- **Backend:** Express + MongoDB (Mongoose), run via `npm run server` →
  `node server/start.js` → `localhost:3000` by default (`BACKEND_PORT`).
- **Data sources:** TMDB (movies/TV/cast), a curated set of RSS feeds + The
  Guardian API (news), OpenStreetMap (theater locations).
- **No `.env` in this repo.** Pass `DOTENV_PATH` pointing at the real one, or
  every route silently returns empty data. See the memory/CLAUDE.md note on
  this — it's not discoverable from the repo alone.

## Server entry point

`server/start.js` loads env vars, then imports `server/server.js`, which:
connects MongoDB, starts the HTTP listener, and warms the curated-route
cache. **`server/app.js` itself has no side effects** — it only builds and
exports the Express app (middleware, routes). This split exists so a test can
`import app from "./app.js"` and make real requests against real routes
without opening a network listener or touching the production database (see
`server/app.test.js`).

## Route map and auth model

| Mount | Gate | Notes |
|---|---|---|
| `/movies`, `/person`, `/tv`, `/news` | none | Public, read-only, TMDB/RSS-backed |
| `/comments` | `requireDatabase` | Bot + real-user comments |
| `/auth` | rate-limited (10/15min/IP) + `requireDatabase` | signup/login |
| `/users` | `requireAuth` + hardcoded admin username check | Admin account directory |
| `/user-media` | `requireDatabase` | Native 1-10 ratings, watched/watchlist |
| `/research-cache` | `requireDatabase` + `requireInternalKey` | Bot-comment research fact cache — internal tooling, gated by a shared secret (`RESEARCH_CACHE_KEY`), not a user login. No human reviewer behind a research pass, so this isn't JWT-based. |
| `/editorial-queue` | `requireDatabase` + `requireAuth` + account-policy check | Private queue for researched news candidates. Only the account named in `server/config/publishingPolicy.js` may use it at all. |

Three different auth patterns exist on purpose, for three different trust
models: a user session (`requireAuth`, JWT), an admin check layered on top of
a session (hardcoded username), and a shared-secret header for tooling that
has no human login behind it (`requireInternalKey`). Don't collapse these
into one pattern without checking which trust model actually applies.

## The editorial queue (Gate 2)

`server/models/editorialCandidate.js` — one record per
(storyId, account, platform, angle), enforced by a compound unique Mongo
index (not just an application-level pre-check — see `docs/decisions.md`).
Holds sources, per-claim verification status (`VERIFIED_REPORT` /
`NOT_VERIFIED` / `UNKNOWN` / `CONTRADICTED`), the draft text, and a status
that stops at `READY`. **`READY` means "editorially valid," not "cleared to
publish"** — `AUTHORIZED` / `SCHEDULED` / `PUBLISHED` / `FAILED` /
`CANCELLED` / `MEASURED` exist in the schema's enum for later gates but
nothing in this codebase produces them yet.

`server/services/editorialValidation.js` enforces account/platform/length/
hashtag rules plus a certainty-language check (a draft can't assert an
`UNKNOWN`/`NOT_VERIFIED` claim as settled fact) — but this is explicitly a
defensive check, not the authority on truth: every submission also requires
`claimsReviewed: true`, attributed server-side to the authenticated caller
(`reviewedBy`/`reviewedAt`), never trusted from the request body.

`server/config/publishingPolicy.js` is the single source of truth for which
account may ever publish. `autoPublishingEnabled: false` until Buffer is
connected and verified — nothing currently reads that flag to actually post
anywhere, because no posting code exists yet.

## News discovery

`server/routes/news.js` aggregates RSS + Guardian per category (movies,
Marvel, TV, streaming, gaming), deduped by exact URL and by a normalized
first-8-keyword title signature (`titleKey()`). As of 2026-10-27, a matched
duplicate is attached to the surviving article as `relatedSources[]`
(url, publisher, publishedAt, which rule matched it) instead of being
silently discarded, and every article gets a genuine `firstSeenAt`
persisted in `server/models/newsFirstSeen.js` (Mongo, set once via
`$setOnInsert`, survives restarts — never backfilled from the article's own
`publishedAt`).

**Known limitation:** the title-similarity match only catches near-identical
wire-copy headlines. Differently-worded independent reports on the same
underlying development (e.g. 5 real outlets all covering one casting story
with 5 different headlines) are NOT currently grouped — each shows up as a
separate result with `relatedSources: []`. This is accurately reported
behavior, not a bug introduced by the first-seen work. See
`docs/project-status.md` for the proposed next step (entity-aware
clustering, deterministic-first).

## Tests

No test framework dependency — uses Node's built-in test runner
(`node --test`), available since Node 18+, this repo runs on Node 22.

```
DOTENV_PATH=/path/to/.env node --test --test-concurrency=1 server/*.test.js server/middleware/*.test.js server/routes/*.test.js server/services/*.test.js server/research/*.test.js
```

**`--test-concurrency=1` is required, not optional.** Node's test runner
executes multiple test *files* concurrently by default. Several files here
(`editorialQueue.test.js`, `newsFirstSeen.test.js`,
`newsToEditorialQueue.integration.test.js`) share one real, isolated test
database and each wipes its own collection in `before()`/`after()` — run
concurrently, those cleanup hooks race each other and produce a flaky
failure that has nothing to do with the code under test (found while
preparing the 2026-10-27 checkpoint; every file passes individually, the
race only appears across files). Forcing `--test-concurrency=1` serializes
file execution and removes the race. A future fix would give each DB-backed
test file its own uniquely-named test database instead of sharing one.

`DOTENV_PATH` is required for any test file that touches MongoDB — those
tests connect to an isolated database (same Atlas cluster, a database name
suffixed `_test`), guarded against accidentally falling back to the
production database if the connection-string derivation ever fails (see the
guard at the top of `editorialQueue.test.js` / `newsFirstSeen.test.js`).
Pure-logic tests (`requireInternalKey.test.js`, `news.grouping.test.js`,
`server/research/*.test.js`) need no database and no env file.

## What does NOT exist yet

No Buffer integration, no Threads publishing code, no scheduling, no
breaking-news scoring, no autonomous content producer. Grepping the repo for
Buffer/Threads publish signatures returns nothing — this is a verified
absence, not an assumption.
