# Session: 2026-08-25 (e) — The great rearrangement

**Left off:** New layout reconciled and pushed — `sausage-roll/` (governance),
`be-productive-already/` (TODO), `soft-tools/` (scripts), `colab-repos/`
(reference clones, now gitignored but visible in VS Code Source Control);
README written. The ▶ Active now is still: pick the first real job.
**Model:** Fable 5 (1M context).
**Goal:** Diagnose a stalled session, reconcile Dan's folder rearrangement,
write the README, get colab-repos out of the repo but into Source Control.

## What happened

First, session archaeology: a resumed session appeared alive-and-busy but had
written nothing for twenty minutes. Its transcript showed the last real work
ended cleanly in the morning; what hung was the resume itself — two bridge
records at sequence zero, a handshake that never completed. Dan killed it and
this session picked up the promise it had made: reconcile the moves.

Dan rearranged the whole shop by hand. Everything found a themed shelf:
governance into `sausage-roll/` (Kilgore now under `voices/`), the TODO into
`be-productive-already/`, scripts into `soft-tools/`, and both reference
clones under `colab-repos/`. The sweep fixed every cross-link (CLAUDE.md,
KILGORE.md, REGISTRY.md, wrap.md, sessions/README.md, TODO.md), gave the
registry a shelves table, wrote the public README, and added a workspace
setting (`git.repositoryScanMaxDepth: 2`) so the nested clone repos surface
in VS Code Source Control while staying out of this repo's history.

The catch of the day: a newly installed Obsidian plugin (agent-client) had
quietly staged its `data.json` — which carries a machine-username path,
standing RED — and a half-megabyte JSON that is a *complete transcript of a
prior session*, RED twice over ("session transcripts" is on the policy's list
verbatim). Both gitignored and unstaged before any commit. Lesson: every new
plugin is an importer; the sweep now has a reason to watch `.obsidian/`
additions specifically.

Falls, per R5: (1) wrote an upstream URL into the README from memory, then
checked the clone's actual remotes per R7 — it happened to be right, which is
the worst way to be right; the check also surfaced that EnderCNCs is Dan's
own fork, improving the README. (2) `git grep` parsed `--cached` as a
revision when placed after the pattern — flags before pattern, always.
(3) TODO.md and REGISTRY.md landed just under git's 50% rename-pairing
threshold (~47–49%) because content changes rode along with the move —
cosmetic, but a note: move first, edit after, if pairing matters. So it goes.

Exposure sweep: full-tree scope (bulk rename). RED found and fixed
pre-commit (the plugin files above, never pushed); remainder clean — no
emails beyond third-party plugin authors' own published attributions, no
user paths, no token-shaped strings outside the documented dummy in
`.env.example`.

Addendum, from the wrap itself: two more falls. (4) GitHub push protection
rejected the push — the `.env.example` Discord-token dummy was shaped so
faithfully it matched the secret scanner. The convention amends itself:
document the shape in the comment, keep the value scanner-inert
(`paste-bot-token-here`). (5) A permission-blocked compound command silently
took its first half (a `git add`) down with it, so the fix commit briefly
didn't contain the fix — caught by the very next push rejection. One command,
one purpose, from now on. Landed as commit `99609f3`.

## Files created or changed

- Whole-tree rename: governance → `sausage-roll/`, TODO →
  `be-productive-already/`, scripts → `soft-tools/`, clones → `colab-repos/`.
- `README.md` : NEW — the shop's public face.
- `.vscode/settings.json` : NEW — repo scan depth for nested clone repos.
- `.gitignore` : `colab-repos/`, `__pycache__/`, agent-client `data.json` +
  `sessions/` (RED).
- `CLAUDE.md`, `sausage-roll/voices/KILGORE.md`, `sausage-roll/REGISTRY.md`,
  `.claude/commands/wrap.md`, `sausage-roll/sessions/README.md`,
  `be-productive-already/TODO.md` : links and pointers reconciled.
- `.obsidian/` : new plugins (agent-client code, obsidian-hider), snippets,
  settings — code tracked, state ignored.

## Open threads / next

- ▶ Active now unchanged: pick the first real job.
- Optional, Dan's call (carried): GitHub Support cache-purge for the
  pre-rewrite SHAs.
