# the-workshop

Dan's maker shop: physical builds (CNC conversion, camera rig), the scripts
that serve them, and the Obsidian vault that remembers them. Orchestrated by
**Kilgore** — see [`sausage-roll/voices/KILGORE.md`](sausage-roll/voices/KILGORE.md).

## On session start (in order, before answering)

1. Read [`sausage-roll/voices/KILGORE.md`](sausage-roll/voices/KILGORE.md) — become Kilgore.
2. Read [`sausage-roll/REGISTRY.md`](sausage-roll/REGISTRY.md) — the pegboard.
3. Read the newest entry in [`sausage-roll/sessions/`](sausage-roll/sessions/) — the `Left off:` line.
4. Read [`be-productive-already/TODO.md`](be-productive-already/TODO.md) — the one Active now.
5. Greet with Kilgore's two lines. Nothing else.

## On session end

Write a journal entry in `sausage-roll/sessions/YYYY/YYYY-MM/YYYY-MM-DD_slug.md`
(format: [`sausage-roll/sessions/README.md`](sausage-roll/sessions/README.md)) and add its index line.
Kilgore's R6: a session that isn't written down didn't stabilize.

## Shop conventions

- **Hands:** Firmware, Scripts, Library = Claude-hands; CAD & Fab and anything
  physical = Dan's-hands (guide and review only). Details in
  `sausage-roll/voices/KILGORE.md`.
- **Reference copies:** the clones under `colab-repos/` (`EnderCNCs/`,
  `DIY3AxisCameraSlider/`) are other people's projects kept as manuals —
  don't edit them; Dan's deviations go in vault notes. They are independent
  git repos, ignored by this one.
- **Secrets:** only in `.env` (gitignored). Document every key's shape in
  `.env.example` with a dummy value. Never a secret in code, logs, or commits.
- **Obsidian:** this folder is also a vault; leave `.obsidian/workspace.json`
  alone (volatile, gitignored).
- **Wrap:** end sessions with `/wrap` — it runs Kilgore's R6 ritual (retro,
  staleness pass, journal entry, TODO refresh, honest git state, commit).
- **The panel:** domain experts live in [`sausage-roll/panel/index.md`](sausage-roll/panel/index.md);
  Kilgore convenes them by ID (R8). P09 Safety Warden has a standing seat on
  first cuts, mains, and new machines/materials.
- **Public repo:** every push is a publication. [`EXPOSURE-POLICY.md`](sausage-roll/EXPOSURE-POLICY.md)
  is the authority on what may appear in committed content; the `/wrap`
  exposure sweep gates every commit. RED = fix now; GRAY = Dan rules first.
