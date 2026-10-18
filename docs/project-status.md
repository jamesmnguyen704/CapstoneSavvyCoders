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

- **myList.js `card()` vs `_cards.js` `movieCard()`**: `views/myList.js` has its own local `card()` reimplementing the poster-tile markup instead of reusing `movieCard()`, because the watchlist card needs a "remove" bookmark state (filled icon, `data-action="remove"`) that `movieCard()` doesn't support yet. Fix: add a `bookmarked`/variant option to `movieCard()`, then delete `myList.js`'s local copy. Not done yet — flagged during the escapeAttr dedup pass, didn't want to rush a behavior change in under a cleanup commit.
- UI is running a design-system audit on `style.css`: adding a spacing/radius/motion token scale, merging ~handful of genuinely-duplicated selectors (`.info-cast-card`, `.info-similar-card`, `.radar-card`, etc. — most of the ~50 multi-defined selectors turned out to be legitimate responsive/override layers, not debt), then building a shared base card class for the highest-traffic cards.

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
- Researching/writing/posting for the 5 approved under-covered-but-popular titles: **Spider-Man: Brand New Day** (969681), **Resident Evil** 2026 (1423191), **Animals** (1236045), **Practical Magic 2** (1302904), **Masterplan** (1561726)

**UI lane, in progress (uncommitted `style.css` diff, ~200+ lines):**
- Fixing the `/theaters` page card grid (`.theater-grid`, ~style.css line 4215), working directly with James
- Queued after that: icon-only Trailer/Info button CSS verification on movie cards (text labels already stripped in the JS templates, CSS not yet confirmed live), the "where to watch" badge feature (backend's `movie.availability` logic in `server/routes/movies.js` ~line 420-469 only covers 5 hero items for TMDB API cost reasons — needs a scoped decision before widening), Upcoming section card sizing
- **Newly flagged, not yet started:** hero section on Home needs (1) Trailer/Info buttons made smaller and (2) the hero text block moved from bottom-left to top-left (`.hero-content` is currently `position: absolute; bottom: 18%`, ~style.css line 1594); also a visual bug where two hero slides' text overlaps/ghosts during the crossfade transition (`.hero-slide` crossfade animation, ~style.css line 226 — likely needs z-index/visibility handling between outgoing and incoming slides)

**Untouched by any lane today (pre-existing, belongs to whichever session owns the Nielsen Top 10 feature):**
- `server/routes/{news,tv}.js`, `views/{news,tv,_gamesData}.js`, untracked `server/services/`, new game-cover images (`cod-black-ops-6.png`, `mario-kart-world.png`)

## Open items carried forward

- Commit the Home hero-section layout changes once UI's `style.css` lands (to avoid a merge fight) or extract/commit the non-CSS pieces independently
- Resolve the hero crossfade overlap bug and bottom→top-left reposition (UI lane)
- Watch-provider badge feature — needs the API-cost tradeoff decision flagged to James before widening past the 5-item hero limit (UI lane)
- Commit whatever the Nielsen Top 10 / news-tv session owns, once it's done with it
- Exploratory, not actioned: whether the News tab is redundant with TV page's own news rail (recommended keeping as-is unless James wants to merge)
