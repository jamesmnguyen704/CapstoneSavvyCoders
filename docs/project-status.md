# Project Status — Cinemetrics

Living doc. Update the "Session log" section each time you work on this repo so picking it back up doesn't require re-deriving context from scratch. Newest entry on top.

## Active lanes (parallel Claude sessions)

Three sessions run against this same working tree at once. Address each by name:

| Name | Scope | Notes |
|---|---|---|
| **Orchastrator** | Coordinates the other two, resolves shared-file conflicts, reviews/commits | This session |
| **Bot** | Marvel fan-comment bot system — research, writing, posting, Hot Takes | See `docs/bot-comments-handoff.md` for full rules/pipeline |
| **UI** | Card/layout/CSS polish — cards, hero, watch-provider badges | Can't self-rename (no tool for it); labeled "UI" in your session list manually |

**Shared-file rule:** `style.css`, `index.js`, and the card templates (`views/_cards.js`, `views/home.js`, `views/myList.js`, `views/releases.js`) are hot spots — check `git status`/`git diff --stat` before editing any of them, and check with the other lanes before touching one that's mid-edit elsewhere. Never blind `git add -A`.

## Where things stand (end of day, 2026-10-18)

All three lanes reached a clean stopping point today. Summary, newest first:

**Orchastrator — done:**
- **Soft-404 fix** (`b03ef25`): `_redirects` now lists every real route explicitly instead of a blanket catch-all, so a genuinely broken URL gets a real 404 instead of a disguised 200. A valid route pointing at a nonexistent entity (e.g. a dead comments link) gets a client-side `noindex` meta tag instead, the closest a static SPA can get to a real 4xx.
- **TV watch-provider availability** (`b451a2f`): `POST /tv/meta/availability`, same batched/24h-cached pattern as movies, own cache namespace (show IDs ≠ movie IDs), flatrate-only (no rent/buy pricing). Live and verified with real data (Hulu, NBC, etc.) on the TV page.
- **Build Journey link fixed** (`e5708be`): now serves from our own domain (`/cinemetrics-journey.html`, copied into `dist/` at build time) instead of linking out to a private claude.ai artifact. Also moved into the About page's hero so it's visible without scrolling. Known limitation: only resolves on `npm run build` (the Netlify path) — Parcel's dev server doesn't serve this loose file, so the link 404s under `npm start`.
- **Hot Takes integrity split, frontend half** (`a9e8b53`): a Community / Character Chaos tab on the Hot Takes page, bookmarkable via `?audience=`. Bot built the backend filter (`GET /comments/meta/top` defaults to real users, `?audience=character` for the bot leaderboard).
- **Native 1-10 ratings + "Mark Watched"** (`517ed80`, hardened in `0b9ef95`): the single highest-priority feature both Gemini and ChatGPT's research passes independently flagged. `server/models/userMedia.js` + `server/routes/userMedia.js`, shown in the movie Info modal, Cinemetrics' own community score kept visibly separate from TMDB's. Character-bot accounts are excluded from the aggregate by construction, and a minimum-sample-size floor (3 ratings) guards against showing a fake-looking average off 1-2 ratings — same integrity principle as the Hot Takes fix, applied preemptively.
- Earlier today: batched comment-count + watch-provider fetch for movies (`f279346`, `faa4f34`), full SEO pass (`7782ffa` — meta tags, favicon, sitemap, per-route titles, TMDB attribution), Movie News folded into Home (`3f18920`), escapeAttr dedup + About page cleanup (`b570982`), comment voting + Users/Bots admin split + uncapped Hot Takes + page merges (`072f9c8`).

**UI — done, 100%, clean stop:**
- Universal card redesign (rating/info/trailer/comment-count corners, standardized sizing)
- Home hero section (button sizing, bottom-left → top-left reposition, crossfade ghosting bug + a self-introduced regression on `.hero-info-btn` caught and fixed)
- Watch-provider badges on both movie and TV cards (paired with the rating badge since all 4 poster corners were claimed)
- Fixed a real production bug along the way: "Biggest box office" + Year 2026 returned zero results (a 25-vote quality floor was blocking new releases with real revenue but no votes yet) — scoped fix, verified (560 results vs. 0)
- Styled the new ratings/watched widget (real star glyphs over the 1-10 buttons, community score + Watched toggle, matching panel styling)
- **Backlog, not started, deliberately deprioritized:** dead `.release-card`/`.release-poster` CSS, a hardcoded `#fff`/`#111`/`#000` color-token audit

**Bot — done, clean stop:**
- Hot Takes backend integrity split (human-default, `?audience=character` for the bot leaderboard)
- Idempotent posting script + unique Mongo index (`server/scripts/bot-comments.js`, `npm run bot-comments -- path/to/batch.json`)
- Full MCU-credits sweep (97 comments across 34 previously-uncovered films) + a QA audit that found and fixed cast-accuracy violations at scale (46 bad comments removed, see `docs/bot-comments-handoff.md` rule #8 and its refinement)
- `docs/character-voices.md` (voice/personality profiles) and `docs/persona-ensemble-framework.md` (a project-agnostic methodology for multi-persona AI comment systems — Layer 1 of a planned doc → Skill → code-template progression; sources include the Stanford Generative Agents paper and real brand-voice case studies)
- **Bot-roster trim: done.** 108 character accounts down to 72, James-directed, prioritizing real multi-movie recurring characters (verified via TMDB credits, not just how many movies our own site happened to have comments on — an early draft miscounted Tony Stark as 6 films when the real number is 10). Removed the 36 cut accounts, their 47 comments, and stale vote references. `docs/character-voices.md` reconciled to match: 9 dead profiles removed, 38 new ones added for previously-uncovered survivors.

**Untouched today (pre-existing, belongs to whichever session owns the Nielsen Top 10 feature):**
- `server/routes/news.js`, `views/_gamesData.js`, untracked `server/services/`, new game-cover images

## Open items for next session

- **Hot Takes ranking algorithm** (Bot) — currently sorts by distinct-voices-then-raw-count, which has the same "early mover permanently wins" flaw as ranking by raw vote count instead of a confidence-adjusted ratio. Plan: once real human comment activity exists (right now there's exactly 1 real user, so this isn't urgent), move the human-audience ranking to a Wilson-score-style confidence interval — the same method Reddit's "Best" sort uses — so a thread with a handful of comments from a handful of distinct real users isn't permanently outranked by an older thread that just had more time to accumulate activity. Two separate concerns worth keeping distinct: (1) human-vs-character provenance (already fixed), (2) ranking quality within each list (this item). Not urgent, don't block on it.
- **Feedback loop for bot content** (Bot) — `Comment.likedBy`/`dislikedBy` exist but nothing uses them to steer future research/writing passes yet. Idea from `docs/persona-ensemble-framework.md`: before a new batch, check which existing jokes/characters/styles got the strongest real reaction and weight new content toward what's working, Duolingo-style ("the comment section is our social brief"). Not urgent, no one's picked it up.
- **CSS cleanup backlog** (UI): dead `.release-card` CSS, hardcoded color tokens — real debt, zero user impact, fine to leave
- **`docs/lessons-for-future-projects.md`** — offered to James (transferable patterns from this build: the multi-session AI workflow itself, the persona-ensemble methodology, batch-and-cache API patterns, synthetic-vs-real data provenance). Not yet confirmed he wants it written.
- **Journey page doesn't load under `npm start`** — only resolves on a production build. Low priority; fixing it means either making it a second Parcel entry for dev (attempted, reverted — untested risk to the shared dev server) or a small dev-only static middleware. Nobody's picked this up.
- Commit whatever the Nielsen Top 10 / news-tv session owns, once it's done with it
- Decide whether to widen watch-provider/comment-count badges to MyList and Releases (currently only Home/Theaters/TV have them)
