# Prompt for Gemini / ChatGPT — Cinemetrics site review

Copy everything below the line into Gemini or ChatGPT.

---

I built a movie/TV/games discovery web app called Cinemetrics as a coding bootcamp capstone project, and I want your help researching how to make it better and more likely to get real visitors. Here's what it actually is and what's already built, so your suggestions are grounded in reality instead of generic advice.

**Stack:** Vanilla JavaScript single-page app (no React — a hand-rolled component/view layer, Parcel bundler, a client-side router), Express + MongoDB backend, deployed on Netlify (frontend) + Render (backend). Data comes from the TMDB (The Movie Database) API.

**What's already built:**
- Browse trending/popular/top-rated movies, TV shows (with streaming-provider filters), games, and a dedicated Marvel Cinematic Universe hub with a release timeline.
- Real-time "In Theaters" lookup by ZIP code with nearby cinema info.
- User accounts (JWT auth, bcrypt password hashing, rate-limited login).
- A comment system on every movie page, including thumbs up/down voting and a "Hot Takes" leaderboard ranking the busiest comment threads site-wide.
- A fairly unusual feature: ~100+ "character" bot accounts (named after real Marvel characters, played by their real actors) that post in-character comments grounded in real critical reviews (for released movies) or confirmed plot/casting facts (for unreleased ones) — basically a fan-fiction comment layer alongside real user comments.
- Movie "ratings" currently just show TMDB's own score — there's no native way for a real visitor to rate a movie themselves yet.
- I just added basic SEO fundamentals (meta tags, Open Graph/Twitter cards, sitemap, per-page titles, TMDB attribution) since none of that existed before.

**What I want from you:**
1. Research what similar sites (Letterboxd, Trakt, JustWatch, IMDb, TMDB's own site) do well that I'm missing, and suggest 3-5 concrete features that would be realistic for a solo/small-team project to add — not "build a mobile app," something scoped to a web app like this.
2. Look into the TMDB API docs yourself and tell me if there are data/endpoints I'm probably not using yet that would make the site noticeably better (e.g. richer person/cast pages, "similar movies," keywords, collections, watch providers I'm not surfacing).
3. Suggest realistic ways to actually get people to visit a project like this — not generic "do SEO" advice, but specific tactics that fit a passion project/portfolio piece built by one person (where to share it, what makes people stick around, what would make someone bookmark it vs. bounce).
4. Give me your honest take on the bot-comment-system idea specifically — is it a fun differentiator worth leaning into further, or a gimmick I should de-emphasize? If you think it's worth leaning into, what would make it better?

Be specific and prioritized — tell me what you'd actually do first if this were your project, not an exhaustive list of everything possible.
