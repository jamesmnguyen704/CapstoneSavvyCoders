# Project Status — Cinemetrics

Living doc. Update the "Session log" section each time you work on this repo so picking it back up doesn't require re-deriving context from scratch. Newest entry on top.

## Active lanes (parallel Claude sessions)

Three sessions run against this same working tree at once. Address each by name:

| Name | Scope | Notes |
|---|---|---|
| **Orchastrator** | Coordinates the other two, resolves shared-file conflicts, reviews/commits | This session |
| **Bot** | Marvel fan-comment bot system — research, writing, posting, Hot Takes | See `docs/bot-comments-handoff.md` for full rules/pipeline |
| **UI** | Card/layout/CSS polish — Theaters grid, card buttons, watch-provider badges | Can't self-rename (no tool for it); labeled "UI" in your session list manually |

**Shared-file rule:** `style.css`, `index.js`, and the card templates (`views/_cards.js`, `views/home.js`, `views/myList.js`, `views/releases.js`) are hot spots — check `git status`/`git diff --stat` before editing any of them, and check with the other lanes before touching one that's mid-edit elsewhere. `style.css` in particular has had large (200+ line) uncommitted diffs sitting in the tree at a time — never blind `git add -A`.

## Open items carried forward (top of file so they don't get buried)

- UI is running a design-system audit on `style.css`: adding a spacing/radius/motion token scale, merging ~handful of genuinely-duplicated selectors (`.info-cast-card`, `.info-similar-card`, `.radar-card`, etc. — most of the ~50 multi-defined selectors turned out to be legitimate responsive/override layers, not debt), then building a shared base card class for the highest-traffic cards.
- ~~Bot's comment-posting script isn't idempotent on rerun~~ **Done (2026-10-18):** added a unique Mongo index on `{userId, movieId, text}` (`server/models/comments.js`) and a real, checked-in, idempotent script (`server/scripts/bot-comments.js`, `npm run bot-comments -- path/to/batch.json`) that skips anything already posted. Safe to rerun after an `/auth` rate-limit restart now.
- ~~New for UI: universal card redesign~~ **Done (2026-10-18):** rating top-left, info top-right, trailer bottom-left, comment-count bottom-right, standardized sizing — confirmed stable across Movies/Theaters/Upcoming after a dev-server restart.
- ~~UI priority: the Home hero section~~ **Done (2026-10-18):** Trailer/Info buttons shrunk, text block moved bottom-left → top-left, and the crossfade ghosting bug fixed (fade-out window no longer overlaps the next slide's fade-in in real time — verified via opacity sampling across a full loop). Also caught and fixed a self-introduced regression from the card redesign: `.info-btn` becoming `position: absolute` had broken `.hero-info-btn` on both Home and Marvel's phase hero. All in `style.css`, not yet committed.

## Session log

Work on this feature set has been ongoing since **Friday 2026-10-16**. Earlier days' detailed blow-by-blow isn't captured here (it predates this doc), but the big-picture carryover is: the Marvel fan-comment bot system (~105 character accounts, Hot Takes, voting) and the Home/Movies + Theaters/Upcoming page merges were both built across that Fri–Sun span, not in one sitting. Entries below start from today since that's what's tracked in detail; add new dated entries above this note as work continues.

### 2026-10-18

**Committed (`072f9c8`):**
- Thumbs up/down voting on comments (`likedBy`/`dislikedBy` arrays, `POST /comments/:id/vote`)
- Admin panel split into separate **Users** and **Bots** tabs (`?tab=users` / `?tab=bots`) so the ~105 character accounts aren't lumped in with real signups
- Hot Takes (`GET /comments/meta/top`) no longer silently caps at 8 — was defaulting to 8/capping at 20 with no way for the frontend to ask for more; now returns every movie with comments unless a `limit` query param is passed
- Standalone comments page (`/comments/:movieId`) shows the real movie title + poster instead of a bare ID
- Finished the Home+Movies and Theaters+Upcoming page merges (Browse All / Upcoming sections embedded via shared store objects, old standalone routes redirect)
- Added `docs/bot-comments-handoff.md`

**Committed (`b570982`):**
- Moved the "Browse All Movies" section up to right under the hero slider on Home; added a **"Trending now"** sort option to its dropdown (now the default), replacing the three separate "Trending Movies" / "Popular in the U.S." / "Top Rated of All Time" rows that duplicated the same data
- Deduped `escapeAttr()` — it was copy-pasted byte-identical into 8 view files; all now import the one export from `views/_cards.js`
- About page cleanup: fixed Education & Credentials chronological order (was jumping 2025→2023→2024→2025→2012), removed the duplicate LinkedIn/GitHub links repeated in the closing section, replaced a redundant learning card, linked to the build-journey page
- My List admin tab order changed to About → Bots → Users → My List; top nav link renamed "My List" → "About"
- Added `CLAUDE.md` (auto-loaded on every session) and this file

**Published (not in the repo — hosted on claude.ai):**
- [Cinemetrics Journey](https://claude.ai/artifact/TNSVWei7DfiKPmp1jjFJrL) — a build-timeline page generated from real git/GitHub history (152 commits, 60 PRs, Oct 2025–present), with per-phase "Concepts" and "Tools" tags and a dedicated Savvy Coders fundamentals callout. Linked from the About page. **Currently private** — James needs to open its Share menu on claude.ai and make it shared/public, or the About page link 403s for everyone but him. Source file `cinemetrics-journey.html` sits untracked in the repo root for editing; not wired into the app's routing.

**Database cleanup:**
- Deleted 5 junk bot accounts (`bear`, `bison`, `bryan`, `carl`, `paul`) — signups with no comments and no real character names, leftover from an earlier bad batch

**Bot lane, in progress:**
- Posted a `rogue` (Inde Navarrette) comment on *Obsession*
- Batch 1 posted (9 comments): **Spider-Man: Brand New Day** (969681), **Resident Evil** 2026 (1423191), **Animals** (1236045), **Practical Magic 2** (1302904), **Masterplan** (1561726). 4 new verified accounts created: `aliciamasters` (Kerry Washington), `ronan` (Lee Pace), `wolfsbane` (Maisie Williams), `erskine` (Stanley Tucci).
- Batch 2 posted (5 comments, James-selected from a 12-movie gossip/trendy-angle research pass): **Toy Story 5** (1084244), **Insidious: Out of the Further** (1291595), **Whalefall** (1255833), **Digger** (1248832), **You Can See Everything** (1765072) — all `popcornreview` except `thanos` on Whalefall (Josh Brolin, confirmed cast).
- **New hard rule added to `docs/bot-comments-handoff.md` (#8):** a roster character can only comment "from inside" a Marvel movie if they're in its confirmed TMDB cast *and* the joke specifically ties to that film — no generic "Marvel character reacts to any Marvel movie" filler. Added after James caught `hela` commenting on *Avengers: Doomsday* despite not being in its cast; audited and removed 13 similar bad comments from that thread (`hela`, `wolverine`, `galactus`, `silversurfer`, `ultron`, `redskull`, `zemo`, `mandarin`, `thanos`, `valkyrie`, `warmachine`, `deadpool`).
- **Review gate:** James wants candidate movies/comments run by him before anything posts — not just fact-checked and posted autonomously. Applied to everything below.
- **TMDB-credits sweep: done (2026-10-18).** All 34 previously-uncovered core MCU films from `shared/mcuPhases.js`'s `mcuMovieIds` list now have comments — 97 total, reusing only existing roster accounts (no new accounts needed), each confirmed against real TMDB cast credits for the specific film.
- **QA audit against rule #8: done (2026-10-18).** Audited every other Marvel-adjacent thread beyond Doomsday; found the same mistake at much larger scale — Supergirl (1081003) had all 20 of its character commenters NOT in its real cast (29 comments total), Street Fighter (1153576) had 10/11, plus smaller violations on Spider-Man: Brand New Day, Animals, Superman (2025), The Batman: Part II, Man of Tomorrow, and Dune: Part Three. **Refined rule #8 per James:** this isn't a strict cast checklist — cross-franchise banter is fine when genuinely funny/specific, trimmed to the sharpest lines rather than dumping every roster character on one thread. Rebuilt Supergirl down to 8 comments and Street Fighter down to 8 (7 character + `screentime`); removed the other 8 single-comment violations outright. 46 comments deleted total.
- **Two rounds of craft research folded into `docs/bot-comments-handoff.md`:** James had me draft research prompts for ChatGPT and Gemini after flagging that even grounded/threaded comments still read generically. Added `docs/character-voices.md` (voice/personality profiles for ~40 most-prominent characters — tone, verified catchphrases, "distinct from" notes vs. similar-feeling characters) plus a new **"Ensemble Conversation Quality"** section: threads must escalate/puncture/subvert rather than restate (four-flavors-of-agreement, @-mention-theater anti-patterns), a two-topper cap, punchline/stat placed last in the sentence, no filler openers ("I agree," "well said, however"), and status-shift dynamics (grandiose characters get punctured, oblivious ones misread metaphors literally). Reorder/removal sanity tests included for self-checking a thread before posting.
- All of the above is now live: 112 comments posted in this pass (8 Supergirl + 7 Street Fighter rewrites + 97 MCU sweep), via the idempotent `server/scripts/bot-comments.js` script across ~11 rate-limit-triggered backend restarts, all coordinated with Orchastrator/UI beforehand — no collisions, no duplicate posts.

**Orchastrator, committed (`3f18920` → `faa4f34`):**
- Folded Movie News into Home as its own section (`movieNewsSection()`, same shared-object-store pattern as `Home.movies`/`Theaters.releases`), retired the standalone `/news` route (redirects to `/`), removed it from the nav, and deleted the dead `tv`/`streaming`/`gaming` tab config in `views/news.js` that nothing could ever reach. TV and Games already distributed their own news this same way — News was the one page left out.
- SEO/discoverability pass (`7782ffa`): real favicon, meta description, Open Graph/Twitter Card tags, `robots.txt`, `sitemap.xml`, per-route `document.title` (was hardcoded to "Cinemetrics" everywhere), TMDB attribution in the footer (required by their API terms, was missing entirely).
- Batched + cached comment-count fetch (`f279346`) wired into Home/Theaters/TV so every card can show a comment-count badge — `POST /comments/meta/counts`, one request per page instead of one per card.
- Batched + cached watch-provider lookup (`faa4f34`) — `POST /movies/meta/availability`, 24h per-movie cache via new `getCached`/`setCached` on the shared TTL store, wired into Home's Browse All grid only (Theaters is redundant — everything there is already "in theaters"; TV needs its own version, different TMDB ID namespace). This is the feature both Gemini and ChatGPT independently flagged as a top-3 recommendation in a site-review research pass James ran — see `docs/gemini-chatgpt-site-review-prompt.md` / `-followup-prompt.md`.
- `views/news.js` had an unrelated image-fallback fix from the Nielsen/news lane sitting in it at the same time — different part of the file, no line-level conflict, committed separately as its own thing.

**Orchastrator, in progress (not yet committed) — native ratings/watched/watchlist:**
Both Gemini and ChatGPT's research passes independently ranked this as the single highest-priority missing feature, so building it now: `server/models/userMedia.js` (one record per user per movie: 1-10 rating, watched bool, watchlisted bool — Cinemetrics' own data, not synced to/from TMDB's account endpoints), `server/routes/userMedia.js` (`GET/POST /user-media/:movieId` auth-gated for a user's own state, `GET /user-media/meta/rating/:movieId` public for the aggregate community score), mounted in `server/app.js`. Frontend: a 1-10 rating row + "Mark Watched" toggle added to the movie Info modal (`index.js`'s `openInfoModal`), shown only when logged in, with the aggregate Cinemetrics community score displayed separately from TMDB's score (not blended — ChatGPT's specific recommendation). No custom CSS yet (reuses `.auth-btn` for baseline button styling) — functional but unstyled, same incremental pattern as comment-count/availability (data wiring first, UI polish as a follow-up). Not yet live on the backend — needs a restart to pick up the new routes (Bot's next restart will cover it).

**UI lane status (all `style.css`, not yet committed — card redesign and hero section both done, see "Open items carried forward" at top):**
- Done: universal card redesign (rating/info/trailer/comment-count corners), Home hero section (button sizing, bottom-left→top-left reposition, crossfade ghosting bug)
- Current: James gave the call on watch-provider badges — batch + cache per grid (now built server-side, see above) rather than one TMDB call per card. UI is building the poster-corner overlay against the live `movie.availability` field.
- Backlog, deliberately deprioritized (real debt, not user-visible): dead `.release-card`/`.release-poster` CSS from the releases.js rewrite, a hardcoded `#fff`/`#111`/`#000` color-token audit pass.

**Untouched by any lane today (pre-existing, belongs to whichever session owns the Nielsen Top 10 feature):**
- `server/routes/{news,tv}.js`, `views/{tv,_gamesData}.js`, untracked `server/services/`, new game-cover images (`cod-black-ops-6.png`, `mario-kart-world.png`)

## Open items carried forward

- Commit the native ratings/watched/watchlist feature once smoke-tested against a live backend restart (Orchastrator)
- Extend watch-provider availability to TV (needs its own TMDB `/tv/` endpoint lookup, different ID namespace than movies) — not prioritized yet
- Style the new ratings/watched widget in the Info modal (currently unstyled, reuses `.auth-btn`) — candidate for UI once the CSS cleanup backlog above comes up
- **Verified-but-unfixed from the Gemini/ChatGPT research passes:** Hot Takes currently ranks 100% bot-driven content (109 character accounts vs. 1 real user) as if it were "busiest conversations" — both AIs flagged this as a false-social-proof risk once given full context. No decision yet on whether/how to fix (filter to human-only, or split into separate "Community" vs "Character Chaos" leaderboards).
- Also verified-but-unfixed: the SPA serves every URL (including broken ones) as HTTP 200 (`_redirects: /* /index.html 200`) — a soft-404 that could hurt search indexing of genuinely dead links.
- Commit whatever the Nielsen Top 10 / news-tv session owns, once it's done with it
