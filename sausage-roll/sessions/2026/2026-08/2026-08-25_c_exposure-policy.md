# Session: 2026-08-25 (c) — Published, renamed, and the exposure gate goes in

**Left off:** Repo is public as dig-flowspace/dig-maker-logs; /wrap now runs a
gating exposure sweep against EXPOSURE-POLICY.md before every commit+push. One
🟡 ruling is pending from Dan (commit-author email — see wrap report); the
▶ Active now is still: pick the first real job.
**Model:** Fable 5 (1M context).
**Goal:** Publish-safety. Dan published the repo (intentionally public),
renamed it to dig-maker-logs, and asked for a SUPER tight wrap: a dedicated
allowed/never/gray policy file and an exposure review in every wrap.

## What happened

Renamed the published repo via `gh repo rename` (old URL redirects; local
remote auto-updated, protocol flipped to SSH by gh config — verified
reachable). Wrote `EXPOSURE-POLICY.md`: 🟢 GREEN (explicitly allowed) /
🔴 RED (never, blocks commit) / 🟡 GRAY (held until Dan rules), plus sweep
mechanics and a Standing rulings ledger so no gray question is asked twice.
Rewrote `/wrap`: the sweep is now step 5 and hard-gates step 6
(commit-and-push); an unrun sweep is a failed wrap; findings are named by
file and line, never by repeating the value into committed files.

First live sweep ran against everything already public. Findings: the
commit-author email (a personal address, on every commit — 🟡 pending Dan's
ruling; GitHub noreply is the alternative) and a local path in REGISTRY.md
carrying the machine username (🟡, redacted in the working tree to an
%APPDATA% form; it remains in git history — scrub decision is Dan's). No 🔴
anywhere. Secret-pattern grep hits were all benign prose.

Two falls, logged per R5: sed and then awk both mangled the Windows
backslash path during the redaction (awk helpfully turned \t into a real
tab). Lesson: for literal Windows-path surgery, use the Edit tool, not
shell string tools. So it goes.

Exposure sweep (this session's diff): clean — new files contain no emails,
no user paths, no secrets; findings above are referenced by location only.

## Files created or changed

- `EXPOSURE-POLICY.md` : NEW — the publication boundary, three tiers + sweep
  mechanics + standing rulings.
- `.claude/commands/wrap.md` : rewritten — sweep gates commit; push added and
  licensed by the sweep.
- `REGISTRY.md` : policy row added; satellite path de-usernamed.
- `CLAUDE.md` : public-repo convention bullet.
- `sessions/README.md` : this entry indexed.

## Open threads / next

- 🟡 pending: commit-author email ruling (noreply vs keep) — and whether the
  two already-public values (email in history, username in one old blob)
  warrant a history rewrite or a shrug. Dan's call, recorded to Standing
  rulings either way.
- ▶ Active now unchanged: pick the first real job.
