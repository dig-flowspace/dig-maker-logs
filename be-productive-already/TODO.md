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
- Tabletop overhead rig — flummer's MakerWorld model 1556093 (CC BY-SA), built
  without the carbon tubes. Panel convened 2026-10-20 with a provisional
  Entomologist seat (not on the roster). Verdict: flummer's parts, regenerated
  from his `.scad` at `Tube_Diameter` 23.4 (feet at 18); telescoping legs
  adjusted at the foot (3/4" EMT upper 4 × 360 mm over 1/2" EMT lower
  4 × 380 mm, bars 2 × 660), hub top 412–668 mm; new parts are a sleeve, a
  collar and a TPU top bushing per leg, locked by a cone-tipped finger screw —
  about $25 of conduit instead of $120+ of carbon. Source, STLs, drill jig and
  build doc in `hard-tools/overhead-rig-legs/` (workstream 6); designed and
  rendered, nothing printed or cut. Gate before any cut: the lowest useful
  lens height, which sets the upper-tube length.
- Framework rulings waiting on Dan. From 2026-10-20: (1) The panel has needed
  a provisional seat twice — the Surface Modeler (2026-09-21) and the
  Entomologist (2026-10-20): make them permanent, or write a guest-seat rule
  into `panel/index.md`? (2) KILGORE.md's hands table makes CAD & Fab
  advise-only, but Dan asked for CAD source and STLs that session: amend it so
  Claude may draft CAD files on request, with printing, cutting and anything
  physical staying Dan's? From 2026-11-11: (3) The same table says "Dan
  flashes hardware". That session Claude put apps on the BUSY Bar, took one
  off, and pressed the bar's controls through its API, each time after Dan's
  yes. Write that in — installs and simulated presses on a device are
  Claude-hands once Dan has said yes, the physical controls and firmware
  flashing stay Dan's — or keep all of it Dan's-hands? (4) The Safety Warden's
  standing seat covers "every new machine". A sealed, bought desk gadget
  arrived and the Warden was not convened. Scope the seat to things that cut,
  heat, move or take mains, or say that gadgets count?
- BUSY Bar — workstream 7, started 2026-11-11. Three things exist.
  **The manager** (maxswinkels/busybar-manager, MIT) is installed at
  `D:\guest-repos\busybar-manager`, outside both vaults, and started with
  `soft-tools/scripts/start-busybar-manager.cmd`. On Windows it needs the user
  env var `BUSYBAR_PYTHON`, because `python3` here is the Store stub.
  **The reference** is `hard-tools/busy-bar/`: nine pages, written against
  firmware 1.3.1 / API 27.14.0 and checked on the bar.
  **Two apps of the shop's own.** Step Aside
  (`soft-tools/busybar-apps/step-aside/`) runs under the manager and gets the
  manager's apps out of the way when the bar is touched. Attract Mode
  (`soft-tools/bar-apps/shop.attract-mode/`, 0.1.0, installed on the bar) runs
  on the bar itself: clock, date, a message, and a pinball scene. It can't
  start itself, but moving the selector off Apps and back restarts it.
  Open:
  - Attract Mode has only been driven from the PC and seen in captures. The
    real wheel, BACK and selector want trying by hand, and the scenes want
    Dan's eye on the LEDs.
  - The manager and Attract Mode do the same job two ways, and can't both
    have the screen. Which is the everyday answer is Dan's call.
  - The manager stopped by itself twice on 2026-11-11, cause unknown. The
    last lines in its window would say why.
  - Step Aside's Sleep rule hasn't been tried with the physical selector.
  - Nothing starts the manager at login; a Task Scheduler logon task would.
  - One prediction from the firmware's spec nobody has watched: what a BUSY
    session leaves behind for an app that drew once and stopped.
  - The manager side has no app of the shop's that draws. The first should be
    an etude, and become `writing-apps.md`'s worked example.
