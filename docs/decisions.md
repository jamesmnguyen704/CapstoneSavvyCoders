# Decision log — Cinemetrics

## 2026-10-27 — test suite requires `--test-concurrency=1`, found while preparing a checkpoint

Running every test file together with plain `node --test file1 file2 ...`
produced one flaky failure that didn't reproduce when files were run
individually. Cause: `editorialQueue.test.js`, `newsFirstSeen.test.js`, and
`newsToEditorialQueue.integration.test.js` all connect to the same isolated
test database and each wipes its own collection in `before()`/`after()` —
Node's test runner executes multiple files concurrently by default, so those
cleanup hooks raced each other. Fixed by requiring `--test-concurrency=1`
(see `docs/architecture.md` for the exact command), not by changing any
test's logic. The real fix — giving each DB-backed test file its own
uniquely-named test database — is a reasonable future cleanup, not urgent
enough to block on.

Short entries for consequential technical decisions, newest first. Not a
changelog — only decisions where the "why" wouldn't be obvious from reading
the code, and a future session might otherwise second-guess or redo.

## 2026-10-27 — `/research-cache` and `/editorial-queue` use different auth patterns, on purpose

`requireInternalKey` (shared secret) gates `/research-cache`;
`requireAuth` + a policy check gates `/editorial-queue`. These look
inconsistent but aren't: a research pass has no human login behind it (a
Claude Code session curling the endpoint directly), so a JWT doesn't fit —
there's no user to issue one to. The editorial queue is used by one specific
human account, so a session-based check is the right model there. Don't
unify these into one pattern without re-checking which trust model actually
applies to the caller.

## 2026-10-27 — `claimsReviewed` is attributed server-side, not trusted from the client

The editorial queue requires `claimsReviewed: true` on submission, but
`reviewedBy`/`reviewedAt` are stamped from the authenticated session
(`req.user.username`), never from the request body. This doesn't make a
false attestation impossible — the one authorized account can still submit
`claimsReviewed: true` without having actually reviewed anything — but it
closes the gap ChatGPT's review flagged: before this, there was no durable
record of *who* attested a review at all. A forged review is now at least
traceable, not anonymous.

## 2026-10-27 — the certainty-language check is a regex, deliberately not the authority on truth

`editorialValidation.js` rejects a draft that states an `UNKNOWN`/
`NOT_VERIFIED` claim as settled fact (e.g. "confirmed"), but this is a
defensive net, not fact-checking — a misleading draft with no certainty
words at all ("basically a done deal") sails through the regex untouched.
`claimsReviewed` is the actual backstop. Tests exist proving both halves:
that the regex catches the pattern it's designed for, and that it does
*not* catch what it can't, on purpose (see `editorialQueue.test.js`).

## 2026-10-27 — duplicate prevention is a DB-level unique index, not just a pre-check

`EditorialCandidate` has a compound unique index on
`(storyId, account, platform, angle)`. The route also does a `findOne`
pre-check for a fast, friendly 409 — but the pre-check alone can't survive
two concurrent identical submissions (a true race). The index is the real
guarantee; the pre-check is just better UX on the common path. Proven with
a concurrent-`Promise.all` test, not just a sequential one.

## 2026-10-27 — test suites that touch Mongo use a real Atlas database with `_test` suffixed, not a mocked DB

No `mongodb-memory-server` or similar was added — this repo already has one
real MongoDB Atlas connection string available locally, and swapping the
database name in that same connection string gives a genuinely isolated
database with zero new dependencies. The risk (a broken regex silently
falling back to the production database name) is handled with an explicit
guard that throws if the derived name doesn't visibly differ and contain
`_test` — see `editorialQueue.test.js`'s top-of-file check. If this ever
needs to run in CI without access to that Atlas cluster, that's the point
to revisit, not before.

## 2026-10-27 — `app.js`/`server.js` split, not a bigger refactor

`app.js` used to call `mongoose.connect` and `app.listen` at import time,
which meant no test could import it without opening a real port and
touching production Mongo. Fixed by moving only those two side effects (plus
cache warm-up) into a new `server.js` — no dependency injection, no test
framework added, no unrelated routes touched. The acceptance bar was
narrow on purpose: "can be imported and tested without side effects," not
"is now a fully layered architecture."

## 2026-10-27 — news.js grouping preserves the existing dedupe algorithm's actual matching behavior, doesn't improve it

The milestone was "stop discarding what the existing algorithm already
groups," not "group more things." Verified live that the existing
first-8-keyword title match is narrow enough that 5 real, differently-worded
articles about the same Ghost Rider story aren't grouped by it at all. That's
accurately reported as a known limitation, not quietly patched over by
loosening the match — a looser match is a separate, deliberate algorithm
decision (see `docs/project-status.md`'s next-milestone notes) that needs its
own precision/recall evaluation against real fixtures before shipping.
