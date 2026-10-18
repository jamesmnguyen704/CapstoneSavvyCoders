# Handoff: Marvel Bot Comments + Hot Takes

Written for: whoever (or whichever Claude session) picks up the fan-comment/bot feature next.

## What this feature is

Cinemetrics has fake "character" user accounts that post short, savage, in-character comments on real movie pages. Most are Marvel characters (heroes, villains, X-Men, Fantastic Four, Eternals, Deadpool/Wolverine). A few are real actors self-joking about a non-Marvel movie they're also in (e.g. Inde Navarrette plays Nicky in the horror film *Obsession* and was just cast as Rogue in the new X-Men film — her account jokes about both). A handful are plain honest-critic accounts (`filmcritic`, `popcornreview`, `screentime`, `lastrow`) that post real, non-joke reviews.

As of now: **~105 character accounts**, **24+ distinct movies** with comments, **~90 total comments**.

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

### Posting script pattern (copy this every time)

```js
// ._post_X.cjs — login as each account, post their comment
const http = require('http');
const roster = require('./._X.json'); // [{username, movieId, text}]
const PASSWORD = "Avengers2026!";
function req(method, path, body, token) { /* standard http.request wrapper, see any ._post_*.cjs in git history */ }
(async () => {
  for (const c of roster) {
    const loginRes = await req("POST", "/auth/login", { loginId: c.username, password: PASSWORD });
    if (loginRes.status !== 200) { console.log(c.username, "LOGIN FAILED", loginRes.status); continue; }
    const r = await req("POST", "/comments", { movieId: c.movieId, text: c.text }, loginRes.body.token);
    console.log(`${c.username}: ${r.status === 201 ? "posted" : "FAILED"}`);
  }
})();
```

### ⚠️ The recurring gotcha: auth rate limiting

`/auth` (both signup AND login) is capped at **10 requests per 15 minutes per IP**. Posting ~10 comments burns through it instantly since each one needs its own login. **Restarting the backend process clears the in-memory counter instantly** — this is the standard workaround, not a hack:

```bash
# find the running backend task id and stop it, then:
cd "C:\Users\James\CapstoneSavvyCoders" && powershell -NoProfile -Command "$env:DOTENV_PATH='c:\Users\James\code\SavvyCoders\CapstoneSavvyCoders\.env'; node server/start.js"
```
Run in background, wait ~7s for "MongoDB connected successfully!" in its output, then continue posting from wherever the batch left off (the posting scripts above are idempotent to resume from an index — track how many succeeded and slice the array).

## Content rules that came from real owner feedback (don't relitigate these)

1. **Short, simple usernames.** No puns.
2. **Don't mint new accounts for weak connections.** Reuse established ones.
3. **Ground jokes in something real**, not generic "haha Marvel vs this movie" filler:
   - **Released movies**: use their ACTUAL critical reception (Rotten Tomatoes/Metacritic score, box office vs. budget, a specific thing reviews praised or panned). Research this live via WebSearch + TMDB, every time. Never invent a score.
   - **Unreleased movies**: ground in confirmed plot/casting facts only (check `docs/mcu-storyline.md` for MCU films — it's a maintained chronological reference built for exactly this). Don't speculate on plot that isn't public.
4. **It has to actually be funny**, not just technically accurate. If a batch comes back dry, say so and ask for a funnier pass.
5. **Real crossovers only** — verify via TMDB credits or WebSearch, never guess an actor's other roles from memory (actors get recast, memory is stale).
6. **Bigger/more popular movies should get more comments.** Supergirl (the one DC movie actually out this year, per the owner) was deliberately built up to ~30 comments; small/obscure titles can have just 1-3.
7. One correction worth remembering: an agent once claimed "Michael Johnston plays Cable" (he doesn't — that's a different actor in an animated series) and nearly created a duplicate account for an actor (Josh Brolin, already `thanos`) who already has one under a different role. **Always sanity-check a crossover claim before creating an account for it.**

## Hot Takes feature

`GET /comments/meta/top?limit=N` (in `server/routes/comments.js`, registered before `/:movieId` so Express doesn't swallow the path) aggregates ALL comments by `movieId`, ranks by **distinct voices first, then raw comment count** (a thread with 5 different characters talking feels busier than one person posting 5 times), fetches each movie's title/poster from TMDB, and returns the top N. The frontend page is `/hot-takes` (`views/hotTakes.js` + `store/hotTakes.js`), linked from the nav. **No special-casing needed** — any movie with comments is automatically eligible, confirmed working as of this handoff (verified it correctly surfaces a movie with just 1 comment as the lowest-ranked entry).

## Other related features built alongside this

- **Thumbs up/down voting** on every comment (`Comment.likedBy`/`dislikedBy` arrays, `POST /comments/:id/vote` with `{type: "like"|"dislike"}`, toggles on repeat click). Already live.
- **Admin-only "Users" tab** on My List (gated to username `aznjames704`, both client AND server side) shows every account with a movie-count stat.
- Comments render both on the standalone `/comments/:movieId` page (shows the real movie title + poster now, not a raw ID) and embedded directly in the movie detail modal.

## Known open items not yet done

- A systematic TMDB-credits sweep of every movie in `shared/mcuPhases.js`'s `mcuMovieIds` list hasn't been fully exhausted for crossover opportunities — an agent did one broad pass (`._character_discovery.json`, since deleted) but it's worth another look with the "real reception" + "no weak connections" rules now locked in.
- Watch-provider badges on movie cards (top-right, "Now streaming on X" / "Playing in theaters") are mid-implementation elsewhere in this session — check `server/routes/movies.js` around the `availability` field before duplicating that work.
