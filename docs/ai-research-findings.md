# AI Research Findings — Gemini + ChatGPT site review

Two independent AI research passes were run against the real Cinemetrics codebase (not just a description of it) on 2026-10-18, using the prompts in `gemini-chatgpt-site-review-prompt.md` and a follow-up in `gemini-chatgpt-followup-prompt.md` that corrected some context gaps from round one. This doc preserves the actual *findings*, not just the prompts — round one alone was missing context and produced some redundant suggestions; round two, given the fuller picture, converged hard with both models landing on the same revised priorities.

## Where both converged (highest confidence)

1. **Hot Takes was 100% bot-driven and presented as community activity.** 109 character-bot accounts vs. 1 real user — "busiest conversations" was entirely synthetic. Both recommended splitting into separate surfaces rather than hiding the bots. **Status: fixed** — `GET /comments/meta/top` now defaults to real users, `?audience=character` is a separate dataset, frontend has a Community/Character Chaos tab (`a9e8b53`).
2. **The soft-404 problem.** Netlify's `_redirects` served every URL — including broken ones — as HTTP 200. **Status: fixed** — explicit route list instead of a catch-all, plus a client-side `noindex` tag for valid-route/missing-entity cases (`b03ef25`).
3. **Native ratings + Watched/Watchlist is the single highest-priority missing feature.** The "does it work at N=1 user" test: a watchlist and personal rating history are useful immediately; Hot Takes/social features need a crowd to mean anything. **Status: built** — 1-10 ratings + Watched toggle, Cinemetrics' own score kept separate from TMDB's, bot accounts excluded from the aggregate (`517ed80`, `0b9ef95`).
4. **`append_to_response` is used in some places but not the main movie-detail route**, which still fires 4 separate TMDB calls (details, credits, similar, watch/providers). Downgraded from "big gap" to "small, measured cleanup" once the AIs learned it was already partially in use. **Status: not done.** Also recommended: swap `/similar` (naive genre/keyword overlap) for `/recommendations` (TMDB's actual collaborative filtering) in that same consolidation.
5. **Watch-provider badges were already being built** when round two ran — both said "extend, don't rebuild," and specifically: don't bother putting badges on the Theaters page (everything there is tautologically "in theaters"), do extend to TV. **Status: done** for movies (Home) and TV; "my services" personalization (letting a user filter to only their own subscriptions) is the recommended *next* step, not yet built.
6. **Stop minting new bot accounts.** 109 was already "a massive maintenance footprint" — deepen voice quality and curation instead of growing the roster. (James's own call independently landed here too — the roster was trimmed from 108 to 72 on 2026-10-18.)

## Also recommended, lower priority, not yet built

- **Real person/cast pages** using TMDB's `combined_credits` endpoint — clicking an actor currently dead-ends instead of becoming a browsing path (movie → actor → filmography → another movie).
- **Franchise/collection pages** via TMDB's `belongs_to_collection`/`/collection/{id}` — good fit for a site already interested in franchises; MCU should stay hand-curated (richer than TMDB's generic collection data) but other franchises (Alien, John Wick, etc.) could use this for free.
- **A small "Discover" filter tool** ("I have Netflix + Max, want something under 100 minutes, horror, well-reviewed") — TMDB's `/discover` endpoint already supports all these filters combined; framed as more useful than another generic "Popular This Week" carousel.
- **Box-office dollar amounts on cards** — TMDB's list endpoints don't return revenue, only per-movie detail calls do. Recommended approach: one-time extraction + permanent cache (revenue for a released movie never changes, so unlike watch-provider data this doesn't even need a TTL). Logged as backlog, not started.

## Explicitly "don't bother" (both models agreed)

- Migrating off the vanilla-JS SPA to React/Next — "nothing in the product evidence says the hand-rolled view layer is hurting users," and the unusual architecture is itself part of the portfolio story.
- A commercial showtimes API (Gracenote etc.) — cost-prohibitive for a solo project; the ZIP→Overpass cinema lookup + booking-site deep links is the right call at this scale.
- A follower/friend graph or social feed — "a network feature with one human participant has essentially no network value."
- Expanding bot accounts further (see above).
- Treating synthetic bot engagement as an SEO/growth hack — Google's guidance explicitly targets content produced at scale to manipulate rankings; the character layer should exist because it's funny, not as a volume play.

## Workflow/process observations (not about the app itself)

Both models were also asked about the 3-session parallel Claude Code workflow used to build all of this. Notable points:

- **Git worktrees** for lane isolation were independently recommended by both AI reports *and* a separate Claude Code features research agent run earlier the same day — three independent sources landing on the same answer. Not adopted yet (mid-session migration was judged too risky given how much uncommitted work existed at the time); worth doing for the *next* multi-lane effort from a clean start.
- **"Interface contract first"**: agree on a field shape/endpoint contract before two sessions build against it in parallel, rather than discovering a mismatch after the fact. This was already happening organically in practice (e.g. the `movie.availability` and `commentCount` field-shape handoffs between Orchastrator and UI) but isn't written down as a standing rule anywhere.
- **Evidence-based handoffs**: a completed task report should state what was verified (tests run, routes smoke-tested, screenshots taken), not just "done." Mostly followed in practice this session via direct curl/syntax-check verification before reporting completion.
- **One session as the final integration authority** for shared contracts and conflicting implementations — this session (Orchastrator) already filled that role de facto.

## Open threads raised by Bot (not yet resolved)

- Whether `likedBy`/`dislikedBy` on comments (currently unused as a signal) should feed back into which bot comment styles get reused — a feedback loop for comment quality.
- Whether Hot Takes' within-audience ranking should move from the current voiceCount+count sort to something like a Wilson-score lower-bound approach (Reddit's method), to avoid a thread with 2 comments outranking one with 50 just on a raw ratio. Treated as a separate, secondary concern from the human/bot provenance split (which was the P0 fix and is done).

## See also

- `gemini-chatgpt-site-review-prompt.md` / `-followup-prompt.md` — the actual prompts, if this research needs to be re-run or extended
- `project-status.md` — day-to-day build log and current open items
- `persona-ensemble-framework.md` — Bot's methodology doc for the character-comment system specifically
