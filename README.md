# Cinemetrics — Project README

**Project summary:**

- Cinemetrics is a small movie SPA (single page app) built with native ES modules, Parcel bundler on the frontend, and an Express + MongoDB backend. It consumes TMDB and provides movie lists, trailers, and a simple JWT-based auth system (signup/login).

**This README covers:**

- System & software requirements
- Install steps
- Environment variables (.env) and required keys
- How to run the project locally (frontend + backend)
- Quick tests (signup/login + health checks)
- Files changed / features added during recent work
- Troubleshooting tips

---

**1) Requirements (local dev machine)**

- Node.js (v16+ recommended)
- npm (comes with Node)
- Internet access for TMDB images & API during dev
- MongoDB Atlas account (or local MongoDB) with a connection string
- Optional: Resend API key (for sending welcome emails) — not required to run server

**2) Quick repo setup**

1. Clone the repo.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root (do not commit it). Example keys used by this app:

```
TMDB_API_KEY=<your_tmdb_api_key>
TMDB_ACCESS_TOKEN=<optional_tmdb_bearer_token>
MONGODB=<your_mongodb_connection_string>
JWT_SECRET=dev_secret_change_me
BACKEND_PORT=3000
RESEND_API_KEY=<optional_resend_api_key>
EMAIL_FROM=you@example.com
```

Notes:

- The app now prefers `BACKEND_PORT` for the backend port (so `PORT` won't accidentally affect Parcel/frontend). Parcel is started with `--port 1234` in `package.json`.
- Make sure `.env` is listed in `.gitignore` and **do not** push secrets.

**3) Available npm scripts** (see `package.json`)

- `npm run app:watch` — start backend with `nodemon` (watches `server/`)
- `npm run server` — run server directly (`node server/app.js`)
- `npm run dev` or `npm start` — start Parcel dev server for the frontend (explicitly set to port 1234)
- `npm run build` — build the frontend for production

Example to run both locally (open two terminals):

```bash
# terminal 1 — backend
npm run app:watch

# terminal 2 — frontend
npm run dev
```

**4) Quick API checks**

- Backend health: `curl -i http://localhost:3000/status`
- Frontend root: `curl -I http://localhost:1234`

**5) Auth endpoints (examples)**

Signup (creates a user):

```bash
curl -i -X POST http://localhost:3000/auth/signup \
	-H "Content-Type: application/json" \
	-d '{"username":"testuser","email":"test@example.com","password":"secret"}'
```

Login (returns JWT token):

```bash
curl -i -X POST http://localhost:3000/auth/login \
	-H "Content-Type: application/json" \
	-d '{"loginId":"testuser","password":"secret"}'
```

Client-side (quick JS snippet) — paste into browser console to log in and save token:

```javascript
(async () => {
  const res = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loginId: "you@example.com", password: "yourpass" }),
  });
  const data = await res.json();
  if (res.ok) localStorage.setItem("token", data.token);
  else console.error(data);
})();
```

**6) Changes implemented during this session**

- Backend: - `server/models/user.js` — Mongoose user schema with `username`, `email`, `password`, bcrypt hashing, and `comparePassword` helper. Usernames/emails are saved lowercased. - `server/controllers/auth.js` — `signup` and `login` handlers implemented. Login now lowercases the `loginId` before lookup to avoid case-sensitive misses. - `server/routes/auth.js` — mounted `/auth/signup` and `/auth/login` routes. - `server/app.js` — now prefers `process.env.BACKEND_PORT || process.env.PORT || 3000` for port selection.

- Frontend: - `views/login.js` and `views/signup.js` created to render auth forms. - `store/login.js` and `store/signup.js` created (minimal state) to avoid import breakages. - `components/nav.js` updated to show login/signup or welcome/logout based on `localStorage.token`. - `views/index.js` exports updated to include `login` and `signup` so the router resolves `/login` and `/signup`.

- CSS/layout fixes: - Fixed malformed CSS block that broke cascade (closed `.marvel-title` properly). - Added defensive/grid overrides so `.marvel-grid`, `.movies-grid`, `.movie-grid`, and `.releases-grid` render as CSS Grid and not horizontal flex when not desired. - Added `.navbar` and `.nav-links` base styles to enforce horizontal nav layout on desktop. - Increased `.logo a` size/weight (makes "Cinemetrics" prominent in nav bar). - Adjusted poster heights and `.movie-card` layout to make movie cards more proportional on Home / Movies pages. - Tightened `.marvel-card` min-height and `.marvel-phase-row` spacing to reduce vertical gaps on the Marvel page. - `.marvel-overview` now wraps (overrides `white-space: nowrap`) so descriptions don't run in a single line.

**7) Important tips / troubleshooting**

- Port conflict: If `3000` or `1234` is already in use, free the ports or change ports. Example to free ports on Windows Git Bash:
  `bash npx kill-port 3000 1234`
  Or identify processes with `netstat -ano | findstr ":3000"` and kill with `taskkill /PID <PID> /F`.

- If the frontend shows a NotFound or blank page for `/login`, confirm `views/index.js` exports `login` and `signup` and that the router resolves the path.

- If signup returns success but login says `User not found`, the cause was case mismatches — the login lookup was updated to perform a lowercase comparison. If problems persist, check server logs; they show meaningful errors (e.g., DB connection issues).

- `RESEND_API_KEY` warning is informational — it only disables sending emails (welcome emails) and does not block signup/login.

- Database confirmations: use MongoDB Compass or shell to inspect the `users` collection:

```js
use cinemetrics
db.users.find({}, { username:1, email:1, createdAt:1 }).pretty()
```

**8) Next suggestions / improvements**

- Add client-side inline error messages for signup/login instead of alerts.
- Add form validation and stronger password policy.
- Add a simple profile view that decodes the JWT and shows the username.
- Implement logout server-side invalidation if needed (currently purely client-side clearing of `localStorage`).

---

Possible additions:

- Add a small script to seed test users into the DB.
- Add a README section with screenshots and a small checklist for deployment (Netlify + Render) including environment variable mapping.

This README can be expanded with screenshots and exact file-by-file diffs as needed.

**Troubleshooting & Lessons Learned**

- **Initial problems encountered:**

  - **Layout breaks:** movie cards rendered horizontally and the nav stacked vertically due to malformed and cascading CSS rules.
  - **Malformed CSS:** missing/extra braces and a `white-space: nowrap` somewhere caused descriptions not to wrap.
  - **Port conflicts / dev server confusion:** Parcel occasionally bound to the wrong port; `PORT` env collisions caused the frontend/backend to compete for `3000`.
  - **Route NotFound for auth pages:** client views like `login` and `signup` weren't exported, causing the router to show NotFound.
  - **Case-sensitive login lookup:** DB saved `username`/`email` lowercased but login lookup was case-sensitive, causing "User not found" errors.
  - **Missing local assets & MIME/CSP hiccups:** attempts to self-host Font Awesome and other assets created transient build and MIME issues during experiments.

- **Workarounds and additions made to get things working:**

  - **Defensive CSS fixes:** corrected malformed blocks, added explicit grid rules for `.movies-grid`, `.marvel-grid`, `.movie-grid`, and `.releases-grid` to stop unwanted horizontal flow.
  - **Exported views:** updated `views/index.js` to export `login` and `signup` so routes resolve properly.
  - **Normalized login:** lowercased `loginId` in `server/controllers/auth.js` so lookups match stored lowercase emails/usernames.
  - **Explicit backend port:** added `BACKEND_PORT` environment variable and made `server/app.js` prefer it (`process.env.BACKEND_PORT || process.env.PORT || 3000`) so Parcel on `1234` and backend on `3000` don't collide.
  - **Poster & card sizing:** set poster heights and `object-fit: cover` so cards remain proportional and consistent across breakpoints.
  - **Port management tips:** documented `npx kill-port 3000 1234` and `taskkill` commands to free blocked ports quickly.

- **Lessons learned (project-level):**

  - **Make the happy path explicit:** prefer explicit ports and environment variable names so different tools don't accidentally steal the same port.
  - **Normalize data early:** store and compare canonical forms (e.g., lowercase emails/usernames) to avoid case-sensitivity bugs.
  - **Protect CSS cascade:** small syntax mistakes in CSS can break large parts of the UI; validate with the browser devtools and keep styles modular.
  - **Iterate & test incrementally:** make small changes and verify locally before broad refactors — commit checkpoints frequently so you can revert experimental steps.
  - **Log everything:** both frontend and backend logs helped track where requests were failing (e.g., which endpoint, what payload reached server).

- **Week-by-week incremental learning & applied changes**

  - **Week 1 — Project scaffold & frontend:** learned Parcel + native ES modules and basic app structure; scaffolded `index.html`, entry `index.js`, and a basic nav. Applied: initial routing and skeleton pages.
  - **Week 2 — Backend & database:** learned Mongoose basics and schema design; created `server/app.js`, `server/models/user.js`, and connected to MongoDB. Applied: user schema with bcrypt hashing and a simple auth controller prototype.
  - **Week 3 — TMDB integration:** learned TMDB API basics and image paths; integrated poster fetching and basic movie list rendering. Applied: TMDB API calls in `services/api.js` and movie-list views.
  - **Week 4 — Layout & styling polish:** learned CSS Grid/Flex quirks and responsive techniques; fixed poster sizing and added defensive grid rules. Applied: `style.css` corrections, `.marvel-overview` wrapping, and reduced card heights.
  - **Week 5 — Auth UI + router fixes:** learned client-side form handling and state flows; exported `login`/`signup` views and attached handlers to POST to backend. Applied: view exports, client auth handlers, and `localStorage` token save.
  - **Week 6 — Dev ergonomics & reliability:** learned to manage dev ports, environment variables, and server restart workflows. Applied: `BACKEND_PORT` env var, updated `package.json` scripts for explicit ports, and documented port-kill tips.
  - **Week 7 — Polishing & documentation:** learned that documentation accelerates onboarding and debugging; started this README and captured lessons and troubleshooting steps. Applied: this `README.md` (expanded), and CSS + auth bug fixes recorded above.

- **Practical next steps (based on lessons):**
  - Add a `CONTRIBUTING.md` with coding guidelines and a checklist for making safe CSS changes.
  - Add small unit/integration tests around `auth` handlers (signup/login) so regressions are caught early.
  - Consider adding a small `seed` script to populate test users and example data for local dev.
