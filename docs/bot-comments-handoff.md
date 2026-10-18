# Handoff: Marvel Bot Comments + Hot Takes

Written for: whoever (or whichever Claude session) picks up the fan-comment/bot feature next.

## What this feature is

Cinemetrics has fake "character" user accounts that post short, savage, in-character comments on real movie pages. Most are Marvel characters (heroes, villains, X-Men, Fantastic Four, Eternals, Deadpool/Wolverine). A few are real actors self-joking about a non-Marvel movie they're also in (e.g. Inde Navarrette plays Nicky in the horror film *Obsession* and was just cast as Rogue in the new X-Men film — her account jokes about both). A handful are plain honest-critic accounts (`filmcritic`, `popcornreview`, `screentime`, `lastrow`) that post real, non-joke reviews.

As of now: **72 character accounts**, **50+ distinct movies** with comments.

## Required reading before writing a single comment — every time, no exceptions

This feature's knowledge is split across four docs on purpose (plot facts, voice, roster rules, and ensemble craft are different concerns), but they are meant to be used **together as one system**, not read separately or skipped. Any research/writing pass — human or agent — reads all four before producing a line:

1. **This doc (`docs/bot-comments-handoff.md`)** — the roster rules, the pipeline, content rules #1-8, and the ensemble conversation / line-level craft rules below.
2. **`docs/mcu-storyline.md`** — plot facts AND continuity for every MCU film. Use this for more than "what happened in this movie" — a character's line should show awareness of what preceded it where relevant (who's already dead by this point, what unresolved relationship/grudge this movie is paying off, a prior film's callback). A comment that only knows about the one movie it's posted on, when real continuity would make it sharper, is an unfinished comment.
3. **`docs/character-voices.md`** — voice/personality/speech-pattern profiles. A character's line must sound like them, not just contain correct facts about them.
4. **`docs/persona-ensemble-framework.md`** — the project-agnostic methodology behind all of this (why these rules exist, sourced from real research), useful context if extending or questioning a rule rather than just applying it.

**The failure mode this section exists to prevent:** doing real research, writing a genuinely good doc, and then the next pass not knowing to use it — e.g. comments getting written without checking `character-voices.md` for a character who has a profile, or without cross-referencing `mcu-storyline.md` for continuity that was sitting right there. If you're an agent being handed a sub-task that only mentions one of these docs, read the other three anyway — this file is the index that ties them together.

## The research cache — check it before you re-research anything

`GET /research-cache/:movieId` (and `POST` to write back what you find) hits a real Mongo collection (`server/models/movieResearchCache.js`) that persists verified facts and cast-to-roster mappings **per movie, across every research pass, not just within one agent's run.** This exists because research agents were repeatedly re-verifying the same box-office numbers and re-pulling the same 100+ person casts from scratch every single time — see `docs/persona-ensemble-framework.md`'s "Known constraints" section for the full reasoning.

**Required step, both directions:**
1. **Before researching a movie, `GET /research-cache/{movieId}`.** If `verifiedFacts` already has what you need, use it instead of re-running WebSearch/TMDB for the same thing. If `fullCastChecked: true`, trust `castRosterMap` instead of re-pulling the entire credits list for rule #9's cast-completeness check — only re-pull if you have a specific reason to doubt it's stale.
2. **After researching, `POST /research-cache/{movieId}`** with any new `verifiedFacts` (`{fact, source}`) and `castRosterMap` entries (`{username, actorName, tmdbPersonId, character}`) you found, and set `fullCastChecked: true` if you did a full `/credits` pull. This is additive/merged server-side, not a destructive overwrite — safe for two parallel agents to both write to the same movie.

This endpoint only ever touches research metadata, never `Comment`/`User` data — writing to it is not the same as posting content, and doesn't bypass the human-review gate for actual comments.

## How an account works

- Every account signs up through the normal `/auth/signup` flow, password `Avengers2026!` for all of them, email pattern `{username}@mcu-roster.test` (anything ending in `.test` is how the admin panel and backfill scripts identify "this is a bot, not a real visitor").
- `User.isCharacter: true` is the flag that drives the "🎭 Character" badge shown next to their name in comments, and gates them out of the admin Users panel's "real user" bucket.
- `User.avatar` is a real TMDB actor photo (`https://image.tmdb.org/t/p/w300/{profile_path}`), fetched live via `GET /search/person?query={actor name}` — never guessed or invented.
- **Usernames must be short and plain** — `doctordoom`, `wolverine`, `mysterio`. NOT punny handles like `metal_gear_dadneto`. This was a hard correction from the site owner partway through — don't regress on it.
- **Do not invent a new account for every tenuous connection.** The owner explicitly pushed back on this. Only create a new account when there's a real, verified actor/character crossover, or reuse an existing account that fits.

## The research → write → post pipeline

This is always two phases:

1. **Research + write (delegate to a subagent, in parallel if doing several things at once).** Give it: the request, the existing account list (query the DB or just paste a known list — see below), the TMDB API key location, and tell it NOT to touch the server. It writes a JSON file in the project root (`._something.json`) with `{username, movieId, text}` entries, and a short summary of what it found.
2. **Review the output yourself**, fix anything wrong (wrong movie id, a reused username that's actually a *different* established account than intended, a joke with no real grounding), **then post it yourself** — don't let an agent touch the live server/DB directly for posting.

### Getting the current account list for an agent prompt

```js
// quick one-off:
const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/Users/James/code/SavvyCoders/CapstoneSavvyCoders/.env' });
const User = mongoose.model('User', new mongoose.Schema({}, {strict:false}));
mongoose.connect(process.env.MONGODB).then(async () => {
  const all = await User.find({ isCharacter: true }).select('username').sort('username').lean();
  console.log(all.map(u=>u.username).join(', '));
  await mongoose.disconnect();
});
```

### Posting script: `server/scripts/bot-comments.js` (use this, don't reinvent it)

A real, checked-in, **idempotent** script replaces the old copy-paste-a-new-`._post_X.cjs`-every-time pattern:

```bash
DOTENV_PATH="c:/Users/James/code/SavvyCoders/CapstoneSavvyCoders/.env" node server/scripts/bot-comments.js path/to/batch.json
```

Batch file is a JSON array of `{username, movieId, text, isNewAccount?, actorName?}` (the shape a research subagent should already be writing). `actorName` is required when `isNewAccount` is true — the script looks up a real TMDB profile photo for the new account's avatar itself.

It's safe to rerun: before creating an account or posting a comment it checks what's already in the DB (`Comment.findOne({ userId, movieId, text })`) and skips anything already there, so hitting the `/auth` rate limit mid-batch and restarting the backend no longer risks double-posting — just rerun the same command and it picks up where it left off. A unique DB index on `{userId, movieId, text}` (`server/models/comments.js`) backs this up at the schema level in case a script ever bypasses the check.

### ⚠️ The recurring gotcha: auth rate limiting

`/auth` (both signup AND login) is capped at **10 requests per 15 minutes per IP**. Posting ~10 comments burns through it instantly since each one needs its own login. **Restarting the backend process clears the in-memory counter instantly** — this is the standard workaround, not a hack:

```bash
# find the running backend task id and stop it, then:
cd "C:\Users\James\CapstoneSavvyCoders" && powershell -NoProfile -Command "$env:DOTENV_PATH='c:\Users\James\code\SavvyCoders\CapstoneSavvyCoders\.env'; node server/start.js"
```

Run in background, wait ~7s for "MongoDB connected successfully!" in its output, then just rerun `server/scripts/bot-comments.js` with the same batch file — it's idempotent, so already-posted entries are skipped automatically.

## Content rules that came from real owner feedback (don't relitigate these)

1. **Short, simple usernames.** No puns.
2. **Don't mint new accounts for weak connections.** Reuse established ones.
3. **Ground jokes in something real**, not generic "haha Marvel vs this movie" filler:
   - **Released movies**: use their ACTUAL critical reception (Rotten Tomatoes/Metacritic score, box office vs. budget, a specific thing reviews praised or panned). Research this live via WebSearch + TMDB, every time. Never invent a score.
   - **Unreleased movies**: ground in confirmed plot/casting facts only (check `docs/mcu-storyline.md` for MCU films — it's a maintained chronological reference built for exactly this). Don't speculate on plot that isn't public.
4. **It has to actually be funny**, not just technically accurate. If a batch comes back dry, say so and ask for a funnier pass.
4b. **Check `docs/character-voices.md` before writing a line for any of its ~40 covered characters.** Facts alone aren't enough — a joke can be plot-accurate and still sound generic if it doesn't match that character's actual tone/speech pattern (Tony's armored sarcasm vs. Peter Parker's nervous rambling; Thor's archaic grandiosity vs. Cap's flat plainspokenness). That doc also flags "distinct from" notes specifically so two similar-feeling characters don't end up sounding like copies of each other. Added 2026-10-18 after the owner flagged comments reading generically even when grounded correctly.
4c. **When a movie gets 2+ character comments, make them a thread, not parallel monologues.** Order the comments so later ones explicitly react to or address an earlier one (naming them, @mentioning them, or directly responding to their point) — it should read like people actually talking to each other, not several people shouting into the void about the same movie. Post order matters here: write/post the "setup" comment first and the "reaction" comments after, in sequence. A movie with only one comment has nothing to thread against — that's fine, leave it standalone. Added 2026-10-18 after the owner flagged the MCU-sweep batch for reading as disconnected one-offs.
5. **Real crossovers only** — verify via TMDB credits or WebSearch, never guess an actor's other roles from memory (actors get recast, memory is stale).
6. **Bigger/more popular movies should get more comments.** Supergirl (the one DC movie actually out this year, per the owner) was deliberately built up to ~30 comments; small/obscure titles can have just 1-3.
7. One correction worth remembering: an agent once claimed "Michael Johnston plays Cable" (he doesn't — that's a different actor in an animated series) and nearly created a duplicate account for an actor (Josh Brolin, already `thanos`) who already has one under a different role. **Always sanity-check a crossover claim before creating an account for it.**
8. **A character commenting on a Marvel movie must actually belong there — no random commentary.** Before writing a comment for a roster character on a Marvel-adjacent movie, pull that movie's real cast via TMDB credits (`GET /movie/{id}/credits`). A character may only comment "from inside" the film if (a) they're in the confirmed cast, AND (b) the joke's content specifically connects to something real and particular about that movie (a confirmed plot beat, their specific character's fate/role, a real casting/reception fact) — not a generic "Marvel character reacts to big Marvel movie" riff that could be copy-pasted onto any other title. A character who isn't in the cast can only comment with an explicit, real, specifically-grounded reason for weighing in despite their absence (e.g. a documented snub, a confirmed in-universe death before that film's timeline) — this should be rare, not a default. Real incident: Avengers: Doomsday (TMDB 1003596) had 13 comments pulled (hela, wolverine, galactus, silversurfer, ultron, redskull, zemo, mandarin, thanos, valkyrie, warmachine, deadpool — none of them in the confirmed cast) because they were generic reactions with no actual tie to that film.
9. **Pull the FULL real cast before picking who comments, not just whichever sub-group is easiest to find.** This is a different failure from rule #8 (which guards against characters who aren't in the cast at all) — this guards against using only a *biased subset* of a cast that's actually confirmed. Real incident: after rule #8's cleanup, Doomsday's thread ended up 100% X-Men characters (professorx, mrfantastic, mystique, gambit, invisiblewoman, nightcrawler, cyclops, magneto) with zero core Avengers, even though Chris Hemsworth (Thor), Anthony Mackie (Sam Wilson/Cap), Sebastian Stan (Bucky), and Florence Pugh (Yelena) are all equally confirmed in that same film's real cast — the thread was 13 bad comments short, then accidentally also missing half the actual cast. Before writing a multi-character thread for any movie, list the FULL real cast first (not just the first group found or the most obviously-connected one), and deliberately check whether the selected commenters represent the movie's real ensemble or just one corner of it.
   - **Refinement (2026-10-18):** this rule is about quality, not a strict cast checklist — the owner confirmed cross-franchise banter (e.g. Marvel characters trash-talking a DC movie) is fine *when it's genuinely funny and specific*, trimmed to the sharpest few lines rather than dumping every roster character on one thread. Judge each comment on wit/specificity first; "not in the confirmed cast" is a flag to look harder at quality, not an automatic cut.

## Ensemble Conversation Quality

Added 2026-10-18, synthesized from multi-agent dialogue and improv-comedy research after the owner flagged threads reading as disconnected one-offs rather than a real conversation. Builds on rule 4c above.

**Core principle:** a multi-character thread is a shared comedic scene, not a pile of independent reviews. Every reply after the first must *change what the conversation is about* — add new information, a changed interpretation, or a changed consequence — not just restate the same point in a different voice.

**Before writing a multi-character thread — these are required steps, not loose guidelines:**

1. Pick one verified fact/plot-beat as the shared anchor everyone is reacting to.
2. **Write down an explicit, one-line objective for each character before writing their line** — what they're actually trying to accomplish in this exchange, not just their vibe. ("Tony wants to prove it was an engineering failure." "Natasha wants to expose what everyone else is conveniently ignoring.") A different voice saying the same opinion isn't enough — the objectives themselves have to conflict or diverge. Characters don't have to agree, and don't need to resolve their disagreement.
3. Write turns in order, each one aware of what came before it (setup → challenge/reaction → escalation or reframe → topper/closer), not all independently from a blank slate.
4. A callback (reusing an earlier line/detail) should change its meaning or land a new consequence — not just repeat it.
5. **Do a separate editing pass after drafting the thread** — don't just self-check while writing. Re-read the whole exchange specifically for: does each reply still serve its stated objective, is each voice distinguishable from the others, does the thread actually escalate, and does the ending land. Fix what's weak before it goes in a batch for review — this is a distinct second pass, not a mental checklist while drafting.

**Line-level craft rules** (added 2026-10-18, second research pass — these are about the individual lines within a thread, not the thread's overall shape above):

- **No filler openers.** Never start a reply with "I agree," "you make a good point, but," "well said, however," or any other polite transition. Start mid-strike — straight into the counter-point, the escalation, or the literal misreading.
- **Two-topper cap.** A single premise/comparison can be escalated at most twice in a row (setup → topper → topper). The next line after that must puncture it, subvert it, or close the beat — not add a third topper. Keeps threads from fatiguing past their payoff.
- **Punchline/stat goes last.** Don't bury the number or the punch word mid-sentence and then explain it — end the sentence on it. "After six months of marketing, the opening weekend made exactly $14 million" lands harder than "It only made $14 million, which proves the marketing failed."
- **Status moves, it doesn't sit still.** A grandiose/high-status character (Doom, Thor, Magneto) earns more from getting punctured by a blunt real fact than from just being grandiose in a vacuum; an oblivious character (Drax, Groot) earns more from taking someone else's metaphor literally than from landing their own zinger. Think about who's "winning" the exchange line to line, and let that shift.
- **Keep it tight.** A reply dragging in backstory or over-explaining its own reference kills the rhythm — aim for roughly one or two sentences, not a paragraph.

**Anti-patterns to avoid** (the actual failure modes, not just "make it good"):

- **Four flavors of agreement** — every character restates the same verdict in their own voice. Fix: give them different interpretations, not just different word choice.
- **@-mention theater** — a reply name-drops another character but doesn't actually engage their point. An @mention alone isn't a real reply.
- **Punchline resets** — every character sets up and lands their own self-contained joke instead of reacting to the one before it.
- **Forced consensus** — don't make everyone agree just because they're being cooperative; real disagreement is more interesting than fake harmony.
- **Endless topping** — know when the exchange has landed its payoff and stop; don't keep adding comments past the natural ending.

**Quick sanity checks before posting a thread:**

- *Reorder test:* if you could shuffle the replies and the thread would read almost the same, they're not actually responding to each other.
- *Removal test:* if deleting a middle comment doesn't change the ending's impact, it's probably filler — cut it.

## Hot Takes feature

`GET /comments/meta/top?limit=N` (in `server/routes/comments.js`, registered before `/:movieId` so Express doesn't swallow the path) aggregates ALL comments by `movieId`, ranks by **distinct voices first, then raw comment count** (a thread with 5 different characters talking feels busier than one person posting 5 times), fetches each movie's title/poster from TMDB, and returns the top N. The frontend page is `/hot-takes` (`views/hotTakes.js` + `store/hotTakes.js`), linked from the nav. **No special-casing needed** — any movie with comments is automatically eligible, confirmed working as of this handoff (verified it correctly surfaces a movie with just 1 comment as the lowest-ranked entry).

## Other related features built alongside this

- **Thumbs up/down voting** on every comment (`Comment.likedBy`/`dislikedBy` arrays, `POST /comments/:id/vote` with `{type: "like"|"dislike"}`, toggles on repeat click). Already live.
- **Admin-only "Users" tab** on My List (gated to username `aznjames704`, both client AND server side) shows every account with a movie-count stat.
- Comments render both on the standalone `/comments/:movieId` page (shows the real movie title + poster now, not a raw ID) and embedded directly in the movie detail modal.

## Known open items not yet done

- A systematic TMDB-credits sweep of every movie in `shared/mcuPhases.js`'s `mcuMovieIds` list hasn't been fully exhausted for crossover opportunities — an agent did one broad pass (`._character_discovery.json`, since deleted) but it's worth another look with the "real reception" + "no weak connections" rules now locked in.
- Watch-provider badges on movie cards (top-right, "Now streaming on X" / "Playing in theaters") are mid-implementation elsewhere in this session — check `server/routes/movies.js` around the `availability` field before duplicating that work.
