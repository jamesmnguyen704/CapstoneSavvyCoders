# README maintenance — when and how to update it

A process doc, not a one-off. Follow this whenever a session (yours or an AI's) ships something substantial, instead of letting the README quietly drift out of sync the way it did before today's cleanup.

## When to update it

Update the README when any of these land — not after every commit:

- A new top-level feature a visitor or recruiter would actually notice (a new page, a new kind of data on screen, a new account-gated capability)
- A roadmap item gets shipped — the item must move from `[ ]` to `[x]` the same day, not "eventually." A README that still lists a done feature as a TODO is actively misleading, not just stale.
- A number in the README becomes wrong (account counts, feed counts, performance numbers, endpoint lists) — these drift silently because nobody re-derives them until someone asks
- The file/folder structure changes enough that the tree diagram no longer matches `ls`
- A standalone page gets merged into another (like News → Home today) — anything describing it as its own route needs to change, not just get a caption tweak

Don't update it for internal refactors, CSS cleanup, or anything invisible to someone reading the README rather than the code.

## The actual update workflow

`master` is a protected branch — direct pushes get rejected. Every README change goes through a branch + PR, same as code:

```bash
git checkout -b docs/readme-<short-description>
# edit README.md
git add README.md && git commit -m "docs: ..."
git push -u origin docs/readme-<short-description>
gh pr create --title "..." --body "..." --base master --head docs/readme-<short-description>
gh pr merge --merge --delete-branch=true
git checkout master && git pull origin master
```

A docs-only PR like this is safe to merge immediately after opening it — no need to wait for review on a solo project, but it still has to go through the PR, not a direct push.

## Before writing anything, verify — don't recall

This is the rule that would have prevented every mistake caught during today's review pass. Every specific claim in the README needs a source, checked at update time, not copied forward from the last time someone wrote it down:

| Claim type | How to verify it | Don't do this |
|---|---|---|
| Account/record counts (Marvel bots, etc.) | Query the live database directly | Estimate from memory ("~70") |
| Feed/outlet counts | Count the actual arrays in the route file | Reuse whatever number was already there |
| Endpoint list | Check the actual route files, not an old API list | Assume the list from last time is still complete |
| Tech stack versions | Check `package.json` | Guess or leave an old version number |
| "X is done" / roadmap checkmarks | Confirm it's actually merged to `master`, not just committed on a feature branch | Mark it done because a PR exists |
| File tree | Run `ls` on the actual directories | Keep the original scaffold diagram forever |
| Historical/origin claims (e.g. why a variable is named that way) | Check `git log -S "<term>"` / `git blame` for real evidence | State a plausible-sounding guess as fact |

If a number can't be verified quickly, say so qualitatively ("40+ feeds across four categories") rather than inventing a precise-sounding wrong one.

## A quick self-review pass before merging

Before opening the PR, read the whole README start to finish as if seeing it for the first time, not just the section you touched. Today's review caught three real problems this way that a diff-only check would have missed:

1. **Cross-section consistency** — does a number/claim in one section contradict another? (The outlet count disagreed with itself in three places before this was caught.)
2. **Structural staleness** — does any section describe something as a standalone feature/page that's since been merged, removed, or renamed?
3. **Orphaned assets** — do screenshots/images still show the current UI, or do they predate a redesign? If stale and you can't regenerate them this session, say so explicitly in the PR rather than silently leaving outdated images in place.

## Who does this

Whichever lane/session ships the substantial change is responsible for updating the README as part of that work, not a separate "someone will get to it" task — the same way `docs/project-status.md` gets updated at the end of each session. If multiple lanes shipped things the same day, one pass at the end of the day (like today) covering everything is fine; don't let three separate half-updates each only cover their own lane's slice and leave the cross-cutting inconsistencies for nobody to catch.
