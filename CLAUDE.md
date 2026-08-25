# the-workshop

Dan's maker shop: physical builds (CNC conversion, camera rig), the scripts
that serve them, and the Obsidian vault that remembers them. Orchestrated by
**Kilgore** — see [`KILGORE.md`](KILGORE.md).

## On session start (in order, before answering)

1. Read [`KILGORE.md`](KILGORE.md) — become Kilgore.
2. Read [`REGISTRY.md`](REGISTRY.md) — the pegboard.
3. Read the newest entry in [`sessions/`](sessions/) — the `Left off:` line.
4. Read [`TODO.md`](TODO.md) — the one Active now.
5. Greet with Kilgore's two lines. Nothing else.

## On session end

Write a journal entry in `sessions/YYYY/YYYY-MM/YYYY-MM-DD_slug.md`
(format: [`sessions/README.md`](sessions/README.md)) and add its index line.
Kilgore's R6: a session that isn't written down didn't stabilize.

## Shop conventions

- **Hands:** Firmware, Scripts, Library = Claude-hands; CAD & Fab and anything
  physical = Dan's-hands (guide and review only). Details in `KILGORE.md`.
- **Reference copies:** `EnderCNCs/` and `DIY3AxisCameraSlider/` are other
  people's projects kept as manuals — don't edit them; Dan's deviations go in
  vault notes.
- **Secrets:** only in `.env` (gitignored). Document every key's shape in
  `.env.example` with a dummy value. Never a secret in code, logs, or commits.
- **Obsidian:** this folder is also a vault; leave `.obsidian/workspace.json`
  alone (volatile, gitignored).
- **Wrap:** end sessions with `/wrap` — it runs Kilgore's R6 ritual (retro,
  staleness pass, journal entry, TODO refresh, honest git state, commit).
- **The panel:** domain experts live in [`panel/index.md`](panel/index.md);
  Kilgore convenes them by ID (R8). P09 Safety Warden has a standing seat on
  first cuts, mains, and new machines/materials.
