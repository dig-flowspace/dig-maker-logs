# TODO

> Exactly **one** ▶ Active now. Everything else is shelved (safe, not lost) or
> in the 📥 Inbox (seen, not yet registered). Promoting and shelving is Dan's
> call.

## ▶ Active now

- ▶ **3-axis camera slider** — build against the
  `colab-repos/DIY3AxisCameraSlider/` reference, with the dead Ronin-S head as
  the motor-and-frame donor (three gimbal BLDC motors with hall sensors, rigid
  3-axis frame). First decision, before anything is cut: test a known-genuine
  BG37 grip, or commit to the donor path? Cutting is the irreversible step.

## On the shelf

- Ender 3 CNC conversion — build against the `colab-repos/EnderCNCs/` reference.
- Reddit tooling — fill `.env` from `.env.example` when it starts.

## 📥 Inbox

- Plasticity concepts guide — `dig-documentation-destination/guides/software/cad/plasticity/`
  (20 sections, 44-figure register, per-page definitions blocks, all drawn SVG).
  Committed and pushed. Build 26.1.3, Studio, Windows, Parasolid.
  **Documentation pass done 2026-09-21**: the official manual settled the
  sixteen interface regions (§3 rewritten), filled all three §20 lookup tables,
  produced `reference/shortcut-map.md` (~250 commands and keys), and wrote the
  §4 and §8 definitions blocks from primary sources. §19 Q1, Q6 and Q11 closed.
  Two things still gate real depth: **the interface walk** (§19 Q9 — menu
  paths, what greys each command out, and the four behavioural questions;
  needs Dan at the keyboard), and **the §2 on-ramp object** (Dan's pick, or
  delegate it). Remaining bulk work: the other 16 definitions blocks and the
  44 figures.
- MGN12 primer written (in the EnderCNCs clone, `docs/models/mgn/references/`).
  Two things it leaves behind: a ruling on whether a notes shelf may live inside
  a reference copy at all — REGISTRY.md currently says no — and five open
  questions in the guide's section 11. The first two gate any parts order:
  which variant this shop is building, and what the rails register against on
  an extrusion frame.
- Discord channel export — script written and self-tested offline; error paths
  verified against the live API. Blocked on the bot actually being installed in
  the target server. The app is private, so only its owner can install it, and
  only into a server where they hold Manage Server.
