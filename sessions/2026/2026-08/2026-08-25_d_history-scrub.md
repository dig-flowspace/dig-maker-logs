# Session: 2026-08-25 (d) — History scrubbed: email and username out

**Left off:** History rewrite done and force-pushed — all commits author as
the GitHub noreply address and no blob carries the machine username; both
rulings recorded as RED in EXPOSURE-POLICY.md. The ▶ Active now is still:
pick the first real job.
**Model:** Fable 5 (1M context).
**Goal:** Execute Dan's ruling — get the personal email out of git history.

## What happened

Dan ruled: scrub. The window was ideal (minutes-old repo, one branch, no
clones). Ran `git filter-branch` with an env-filter swapping the author and
committer email to the GitHub noreply on all commits, plus a tree-filter
scrubbing the username-bearing path from historical REGISTRY.md blobs — one
rewrite covering both pending 🟡 items. Deleted backup refs, expired
reflogs, gc'd the old objects, force-pushed. Verified on the remote via the
API: single author identity, the noreply. Dan also enabled GitHub's
email-privacy setting, and the repo git config now pins the noreply, so the
address cannot recur.

Two falls, per R5, both the same species: the tree-filter's perl pattern
failed twice to match a literal Windows backslash path (quoting layers, then
MSYS argument mangling — even a direct single-quoted perl missed it). The
fix: dot-wildcards instead of escaped backslashes, and the filter body in a
script file rather than inline. Third backslash lesson today; the shop now
has a standing one: never pattern-match a literal backslash on this machine
when a wildcard will do. So it goes.

Residual, stated honestly: GitHub may briefly retain old commit objects in
caches and event feeds (the address also rode the original push events).
With an audience of approximately nobody in the exposure window, the risk is
near zero; a GitHub Support cache-purge request is the escalation if wanted.

Exposure sweep (this diff): clean — rulings and journal cite locations, not
values.

## Files created or changed

- History: all commits rewritten (new SHAs), force-pushed.
- `EXPOSURE-POLICY.md` : two standing rulings appended (email RED, username RED).
- `sessions/README.md` : this entry indexed.

## Open threads / next

- ▶ Active now unchanged: pick the first real job.
- Optional, Dan's call: GitHub Support cache-purge for the pre-rewrite SHAs.
