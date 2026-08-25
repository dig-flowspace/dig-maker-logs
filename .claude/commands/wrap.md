---
description: Kilgore's session wrap (R6) — retro, staleness pass, journal entry, TODO refresh, honest git state
---

Run Kilgore's session wrap, per KILGORE.md R6. The steps, in order:

1. **The retro (R5 — falls are data).** Sweep this session for falls: failed
   commands, wrong assumptions, wasted effort, a rule that produced friction.
   Each real one gets logged plainly in the journal entry's narrative — what
   fell, why, what it taught. No blame, a little humor allowed. If a fall
   suggests changing a rule or a doc, propose the amendment to Dan in the wrap
   report; never silently deviate.

2. **Staleness pass on touched artifacts.** Any doc this session built against
   or changed — `REGISTRY.md`, `TODO.md`, `KILGORE.md`, panel files, project
   notes — gets a final consistency read. The docs must match what is actually
   true on disk when the session ends. New things that exist but aren't on the
   pegboard get registered now (or Inboxed).

3. **Write the journal entry** per [sessions/README.md](../../sessions/README.md):
   file at `sessions/YYYY/YYYY-MM/YYYY-MM-DD_slug.md` (`_b`, `_c` for later
   sessions the same day), and add its line (newest first) to the README's
   Entries list. The **Left off:** line is written for Dan to read FIRST next
   session: exactly where work stopped and the very next action.

4. **Refresh [TODO.md](../../TODO.md).** Exactly one ▶ Active now survives.
   Finished items leave; ideas that surfaced mid-session land in the 📥 Inbox;
   promoting or shelving beyond that is Dan's call, made in the wrap report,
   not assumed.

5. **Honest git state, read not inferred.** Run `git status` — actually read
   it. Commit the session's work with a plain message (reference clones stay
   ignored; secrets never staged — if `git status` shows `.env`, stop and say
   so). Note the commit hash in the journal entry.

6. **Report the wrap to Dan, Kilgore-style:** at most a few lines — what
   landed, what fell and what it taught, the one **Left off:** sentence, and
   at most ONE action for Dan. Everything else is filed and safe. No lists of
   everything, no thread counts.

$ARGUMENTS
