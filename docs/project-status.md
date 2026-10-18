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
- Carried forward from Orchastrator: still need to do the systematic TMDB-credits sweep across `shared/mcuPhases.js`'s `mcuMovieIds` list, and a QA audit of other existing Marvel-movie comment threads against the new rule #8 (same mistake may exist elsewhere, pre-dating the rule).
- **Review gate:** James wants candidate movies/comments run by him before anything posts — not just fact-checked and posted autonomously. Applies to future batches, including the TMDB sweep and QA audit above.

**Committed (Orchastrator, pending — Movie News → Home merge):**
- Folded Movie News into Home as its own section (`movieNewsSection()`, same shared-object-store pattern as `Home.movies`/`Theaters.releases`), retired the standalone `/news` route (redirects to `/`), removed it from the nav, and deleted the dead `tv`/`streaming`/`gaming` tab config in `views/news.js` that nothing could ever reach (`NEWS_TABS` in `index.js` was `["movies"]` only). TV and Games already distributed their own news this same way — News was the one page left out.
- `views/news.js` currently has an unrelated uncommitted image-fallback fix sitting in it too (not from UI or Bot) — my changes are in a different part of the file (TAB_CONFIG/export shape, not the image markup) so there's no line-level conflict, but flagging in case whoever owns that fix wants to commit separately.

**UI lane, in progress (uncommitted `style.css` diff, ~200+ lines):**
- Fixing the `/theaters` page card grid (`.theater-grid`, ~style.css line 4215), working directly with James
- Queued after that: icon-only Trailer/Info button CSS verification on movie cards (text labels already stripped in the JS templates, CSS not yet confirmed live), the "where to watch" badge feature (backend's `movie.availability` logic in `server/routes/movies.js` ~line 420-469 only covers 5 hero items for TMDB API cost reasons — needs a scoped decision before widening), Upcoming section card sizing
- **Newly flagged, not yet started:** hero section on Home needs (1) Trailer/Info buttons made smaller and (2) the hero text block moved from bottom-left to top-left (`.hero-content` is currently `position: absolute; bottom: 18%`, ~style.css line 1594); also a visual bug where two hero slides' text overlaps/ghosts during the crossfade transition (`.hero-slide` crossfade animation, ~style.css line 226 — likely needs z-index/visibility handling between outgoing and incoming slides)

**Untouched by any lane today (pre-existing, belongs to whichever session owns the Nielsen Top 10 feature):**
- `server/routes/{news,tv}.js`, `views/{tv,_gamesData}.js`, untracked `server/services/`, new game-cover images (`cod-black-ops-6.png`, `mario-kart-world.png`). (`views/news.js` now also has my News→Home merge changes mixed in with this lane's existing image-fallback fix — see above.)

## Open items carried forward

- Commit the Home hero-section layout changes once UI's `style.css` lands (to avoid a merge fight) or extract/commit the non-CSS pieces independently
- Resolve the hero crossfade overlap bug and bottom→top-left reposition (UI lane)
- Watch-provider badge feature — needs the API-cost tradeoff decision flagged to James before widening past the 5-item hero limit (UI lane)
- Commit whatever the Nielsen Top 10 / news-tv session owns, once it's done with it
- ~~Exploratory: whether the News tab is redundant with TV page's own news rail~~ **Resolved (2026-10-18):** yes — folded into Home, see above.
