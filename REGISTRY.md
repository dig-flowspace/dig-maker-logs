# Registry — the pegboard

> **Pure pointers, no status.** Status lives in [`TODO.md`](TODO.md) and the
> newest [`sessions/`](sessions/) entry — this file only says *what exists and
> where it hangs*, so it can never drift. If it's not here, it isn't
> registered yet (Inbox first).

## Workstreams

| # | Workstream | Bench | Where |
|---|---|---|---|
| 1 | **Ender 3 CNC conversion** — building an EnderCNC from spare Ender parts | CAD & Fab / Firmware | [`EnderCNCs/`](EnderCNCs/) — reference copy of Futtawuh's project (docs, macros, mkdocs manual) |
| 2 | **3-axis camera slider** — ESP32 + PS3-controller motion rig | CAD & Fab / Firmware | [`DIY3AxisCameraSlider/`](DIY3AxisCameraSlider/) — reference copy (schematic, STLs, `main.cpp`) |
| 3 | **Reddit tooling** — planned; creds slot exists, no code yet | Scripts | `.env` (gitignored) / `.env.example` |

> Workstreams 1–2 are **reference copies of other people's projects** — manuals
> for Dan's own builds. Dan's build notes, deviations, and progress live in the
> vault (The Library bench), not by editing the reference copies.

## Satellites (outside this folder, sanctioned access)

| What | Where |
|---|---|
| spoolman2slicer PrusaSlicer templates | `%APPDATA%\spoolman2slicer\templates-prusaslicer` |
| Sibling frameworks (Gregory / Shirley / Felix lineage) | `d:\Projects\.claude\magnus-archive` (Felix — the distilled pattern) |

## Governance organs

| File | Role |
|---|---|
| [`KILGORE.md`](KILGORE.md) | The orchestrator — persona, benches, rules |
| [`REGISTRY.md`](REGISTRY.md) | This pegboard — pointers only |
| [`TODO.md`](TODO.md) | Active now + shelf + Inbox |
| [`sessions/`](sessions/) | The journals — one entry per session, `Left off:` read first |
| [`CLAUDE.md`](CLAUDE.md) | Boot checklist + shop conventions |
| `.env` / `.env.example` | Secrets (ignored) / their documented shape |
| [`panel/`](panel/index.md) | The expert panel — nine personas, Layer 1 routing in `index.md` |
| `.claude/commands/wrap.md` | `/wrap` — Kilgore's session-wrap ritual (R6), migrated from the Gregory/Shirley pattern |
