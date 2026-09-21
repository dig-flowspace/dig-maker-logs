# Session: 2026-09-21 — A guide to a program nobody explained

**Left off:** The Plasticity guide has its skeleton, its command inventory, its
shortcut map and a completed documentation pass — the next move is Dan picking
the §2 on-ramp object (the one thing the reader builds end to end), after which
the only work that still needs Dan at the keyboard is the interface walk in §19
question 9.
**Model:** Claude Opus 5 (1M context).
**Goal:** Dan bought Plasticity Studio, found it overwhelming, and wanted a
guide that explains the *concepts* rather than the buttons. Panel first, then
outline, then draft.

## What happened

Dan's actual complaint was sharper than "it's overwhelming." It was: *"All these
hidden, multi-step features that you would only know if you knew about the
concept of reference planes."* That sentence became the guide's thesis. You
cannot find a feature whose concept you do not have — and no menu can fix it,
because menus are organised by what things *are*, never by what you are trying
to do.

So the guide got two facing pages: §3 walks the interface region by region, and
§20 runs the same ground backwards, need by need, ending in a table of *why is
this greyed out*. Twenty sections in all, every page carrying its own
definitions block, because unfamiliar vocabulary is the cheapest cause of
feeling stupid and the easiest to remove.

**The panel had a hole and it got said out loud.** None of the nine personas
covers CAD or NURBS. A provisional "Surface Modeler" was seated for the
session; whether that becomes a permanent P10 is still Dan's call. Pretending
an existing persona could cover it would have been the worse move.

Two questions turned out to have much better answers than expected.

*"Can you connect to my instance of Plasticity?"* No — no screenshot tool, no
computer use, verified rather than assumed. But reading the **installed build**
proved far more valuable than any screenshot: version 26.1.3, Studio, Windows,
Parasolid kernel, and the complete command registry extracted from the compiled
bundle's constant pool. 188 commands, 175 with display names. An unbounded
unknown became a countable checklist. Dan ruled on publishing it: identifiers
and display names are the same class of fact as a printed shortcut card, and no
source code was recovered.

*The documentation pass* then did what the extraction could not. The vendor's
own manual numbers its interface — sixteen regions, with real names. It
publishes every default shortcut across five pages, now transcribed onto one.
And it settled a question the guide had been hedging: continuity tooling
exists, by name, so §8's whole argument has an instrument. Three open questions
closed.

The honest line, written into §19: a manual describes intent, only the program
describes behaviour. Names, keys and layout are now sourced. What greys a
command out is not, and no amount of reading will settle it.

### Falls (R5)

- **Heredocs keep losing.** A batched multi-file `cat <<'EOF'` died on quoting
  and wrote *nothing* — discovered only because the next step listed the files.
  Later a single large heredoc failed the same way. Lesson learned twice, which
  is once too many: past a certain size, use the Write tool and stop being
  clever. The near-miss is the interesting part — a failed write that nobody
  checks looks exactly like a successful one.
- **The hostname was in the file I wrote.** Guessed `docs.plasticity.xyz`,
  got `ENOTFOUND`. The correct `doc.plasticity.xyz` was sitting in the command
  inventory I had extracted an hour earlier. Read your own artifact before
  guessing at the world.
- **Decoded a table and believed it.** First extraction paired each command id
  with the next string and produced things like `U+du9+` as "display names."
  They were six-character icon hashes. Inspecting the raw bytes showed the real
  order — id, hash, label — and fixing the stride yielded 175 real names. A
  decoder that returns plausible garbage is worse than one that crashes.
- **Then misread the win.** A second field looked like another label table
  until the leading `/` registered: it was the vendor's documentation path map,
  which turned out to be the more useful of the two. Being wrong twice about
  the same bytes produced a better result than being right once.
- **Ordering, twice.** Inserted workstream 5 above workstream 4, and open
  question 11 above question 10. Both caught by lint (MD029) or by eye, both
  fixed with a script. Appending is not the same as inserting.
- **Markdown lint, repeatedly.** MD025 fired because every page carries both a
  frontmatter `title:` and an H1. That is deliberate — machine-readable
  provenance plus a human heading — so the rule was configured off rather than
  the design bent to satisfy it. MD013 exempted tables, which cannot wrap.
- **Source Control could not see the repo.** Not gitignore (the reference
  clones are ignored too and show fine), not scan depth (already set to 2). VS
  Code had enumerated repositories when the window opened, before the clone
  existed. A window reload fixed it. Worth remembering: "my tool cannot see it"
  is often "my tool looked before it existed."

### Exposure

**Exposure sweep: clean.** Both repos read by eye and netted with the policy's
greps. Every hit was benign and pre-existing — the policy quoting its own
grep patterns, the documented dummies in `.env.example`, and Discord's
`/users/@me` API route, which is a URL and not a filesystem path. The
documentation repo returned nothing on any of the three nets. No emails outside
`noreply`, no machine paths, no credential-shaped strings. The command
inventory's provenance deliberately records its source path *relative to the
install*, so no machine username travels with it.

## Files created or changed

**`the-workshop`:**

- `.gitignore` : ignore `dig-documentation-destination/` — Dan's own repo,
  cloned into the tree for workspace convenience, not ours to track.
- `sausage-roll/REGISTRY.md` : registered the documentation repo and
  workstream 5, the Plasticity guide, under The Library.
- `be-productive-already/TODO.md` : Inbox entry for the guide, rewritten to
  the true state after the documentation pass.

**`dig-documentation-destination`** (Dan's repo, independent):

- `README.md` : the repo's front door — a library of perspectives, plus the
  authorship scheme and house rules.
- `guides/software/cad/plasticity/` : 20 sections, index, figure register.
- `.../03-interface-map.md` : rewritten around the manual's sixteen named
  interface regions, each with the occasion you would open it.
- `.../20-where-everything-lives.md` : three lookup tables filled — concept to
  command, intent to prerequisite chain, and greyed-out to cause.
- `.../reference/command-inventory.md` : 188 commands read from the install.
- `.../reference/shortcut-map.md` : every published command and default key,
  from five manual pages onto one.
- `.../04-brep-vs-mesh.md`, `.../08-curves-and-continuity.md` : definitions
  written from primary sources, including the G0–G3 ladder.
- `.../19-version-notes-and-open-questions.md` : the documentation pass
  recorded; questions 1, 6 and 11 closed.

## Open threads / next

- **The §2 on-ramp object** — which single object the reader builds end to end.
  Everything in that section follows from the pick. Dan's call, or delegable.
- **The interface walk** (§19 Q9) — menu paths, what greys each command out,
  and four behavioural questions. The one pass that cannot be done from outside
  the software. Much smaller than it was this morning: what exists and what it
  is called are both answered now.
- **Depth work** — 16 remaining definitions blocks, 44 figures to draw.
- **Unruled:** whether "shelf" language leaves the framework docs too (Dan
  struck it from the documentation repo; `TODO.md` and `REGISTRY.md` still use
  it as house idiom), and whether The Surface Modeler becomes a permanent P10.
