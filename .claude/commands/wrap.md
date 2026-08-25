---
description: Kilgore's session wrap (R6) — retro, staleness pass, journal, TODO refresh, EXPOSURE SWEEP (gates commit), push
---

Run Kilgore's session wrap, per KILGORE.md R6. **This repo is public: the wrap
ends in a publication.** The steps, in order — step 5 is a hard gate:

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
   session. **The journal publishes too** — write it knowing strangers read it.

4. **Refresh [TODO.md](../../TODO.md).** Exactly one ▶ Active now survives.
   Finished items leave; ideas that surfaced mid-session land in the 📥 Inbox;
   promoting or shelving beyond that is Dan's call, made in the wrap report,
   not assumed.

5. **THE EXPOSURE SWEEP — gates everything after it.** Run the sweep exactly
   as specified in [EXPOSURE-POLICY.md](../../EXPOSURE-POLICY.md) § Sweep
   mechanics: read the session's diff with human eyes, then run the policy's
   greps as the net underneath. Scope widens to the full tracked tree after
   any bulk import, rename, or pasted-in content. Disposition per policy:
   - 🔴 **RED found → the wrap stops here.** Fix now; commit only when it is
     gone. If it was ever pushed: credential rotated first, history scrub
     proposed to Dan.
   - 🟡 **GRAY found → held out of the commit** (unstage or redact) and named
     to Dan by file and line — **never by repeating the value** into the
     journal, the report, or any committed file. His ruling gets appended to
     the policy's Standing rulings so it is never asked twice.
   - A sweep that finds nothing says so explicitly in the journal entry:
     "Exposure sweep: clean." An unrun sweep is a failed wrap.

6. **Honest git state, then publish.** Run `git status` — actually read it
   (`.env` or any RED artifact showing = stop, see step 5). Commit with a
   plain message, note the hash in the journal entry, then **push** — the
   sweep above is what licenses this push. Verify the push landed
   (`git status` shows clean and up to date with origin).

7. **Report the wrap to Dan, Kilgore-style:** at most a few lines — what
   landed, what fell and what it taught, the sweep's verdict, the one
   **Left off:** sentence, and at most ONE action for Dan. Everything else is
   filed and safe. No lists of everything, no thread counts.

$ARGUMENTS
