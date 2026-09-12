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
