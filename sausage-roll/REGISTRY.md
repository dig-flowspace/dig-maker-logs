# Registry — the pegboard

> **Pure pointers, no status.** Status lives in
> [`TODO.md`](../be-productive-already/TODO.md) and the newest
> [`sessions/`](sessions/) entry — this file only says *what exists and
> where it hangs*, so it can never drift. If it's not here, it isn't
> registered yet (Inbox first).

## The shelves (top-level layout)

| Folder | What hangs there |
|---|---|
| [`sausage-roll/`](.) | How the sausage gets made — Kilgore ([`voices/`](voices/)), the panel, the journals, this pegboard, the exposure policy |
| [`be-productive-already/`](../be-productive-already/) | [`TODO.md`](../be-productive-already/TODO.md) — Active now + shelf + Inbox |
| [`soft-tools/`](../soft-tools/) | Scripts and software tooling (Claude-hands) |
| `colab-repos/` | Reference clones of other people's projects — independent git repos, ignored by this one |

## Workstreams

| # | Workstream | Bench | Where |
|---|---|---|---|
| 1 | **Ender 3 CNC conversion** — building an EnderCNC from spare Ender parts | CAD & Fab / Firmware | `colab-repos/EnderCNCs/` — reference copy of Futtawuh's project (docs, macros, mkdocs manual) |
| 2 | **3-axis camera slider** — ESP32 + PS3-controller motion rig | CAD & Fab / Firmware | `colab-repos/DIY3AxisCameraSlider/` — reference copy (schematic, STLs, `main.cpp`) |
| 3 | **Reddit tooling** — planned; creds slot exists, no code yet | Scripts | `.env` (gitignored) / `.env.example` |
| 4 | **Discord channel export** — read-only history archiver, built to be handed to a server admin for review | Scripts | [`soft-tools/scripts/discord_export.py`](../soft-tools/scripts/discord_export.py), [`soft-tools/scripts/README-discord-export.md`](../soft-tools/scripts/README-discord-export.md) |

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
| [`voices/KILGORE.md`](voices/KILGORE.md) | The orchestrator — persona, benches, rules |
| [`REGISTRY.md`](REGISTRY.md) | This pegboard — pointers only |
| [`../be-productive-already/TODO.md`](../be-productive-already/TODO.md) | Active now + shelf + Inbox |
| [`sessions/`](sessions/) | The journals — one entry per session, `Left off:` read first |
| [`../CLAUDE.md`](../CLAUDE.md) | Boot checklist + shop conventions |
| [`../README.md`](../README.md) | The shop's public face — what strangers read first |
| `../.vscode/settings.json` | Workspace git settings — repo scan depth 2 so `colab-repos/` repos show in Source Control |
| `.env` / `.env.example` | Secrets (ignored) / their documented shape |
| [`panel/`](panel/index.md) | The expert panel — nine personas, Layer 1 routing in `index.md` |
| `../.claude/commands/wrap.md` | `/wrap` — Kilgore's session-wrap ritual (R6), migrated from the Gregory/Shirley pattern |
| [`EXPOSURE-POLICY.md`](EXPOSURE-POLICY.md) | **Publication boundary** — GREEN/RED/GRAY tiers + sweep mechanics; gates every /wrap commit |
