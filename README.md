# the-workshop

A maker shop that remembers itself.

Physical builds live here — an Ender 3 being converted into a CNC, a 3-axis
camera slider, telescoping legs for a tabletop overhead camera rig — along
with the scripts that serve them and the notes that
outlast them. So does one bought gadget, a BUSY Bar desk light, with the
shop's reference pages for it and a show written to run on it. The folder is simultaneously a git repo, an Obsidian vault, and
a Claude Code workspace, and the interesting part is the machinery that keeps
those three honest with each other.

## How it works

Sessions are run by **Kilgore**, an orchestrator persona
([`sausage-roll/voices/KILGORE.md`](sausage-roll/voices/KILGORE.md)) with a
short list of hard rules: exactly one job live at a time, every session ends
with a written journal entry, physical work belongs to human hands, and
domain questions with real stakes go to a panel of nine expert lenses instead
of being guessed at. Continuity across sessions — and across model swaps —
comes entirely from the written record, not from anyone's memory.

## The shelves

| Folder | What it holds |
|---|---|
| [`sausage-roll/`](sausage-roll/) | How the sausage gets made: the orchestrator, the expert panel, the session journals, the registry, the exposure policy |
| [`be-productive-already/`](be-productive-already/) | The TODO — one active job, a shelf, an inbox |
| [`soft-tools/`](soft-tools/) | Scripts and software tooling, and the shop's own apps for the BUSY Bar |
| [`hard-tools/`](hard-tools/) | Physical builds: CAD source, printable files, build docs. Also the [BUSY Bar reference](hard-tools/busy-bar/README.md) |
| `colab-repos/` | Clones of the upstream projects the builds follow — independent git repos, ignored by this one, so you won't see them here |

## Publication

This repo is public on purpose, and every push is treated as a publication.
[`sausage-roll/EXPOSURE-POLICY.md`](sausage-roll/EXPOSURE-POLICY.md) defines
what may appear in committed content, and a sweep against it gates every
commit. The session journals are written knowing strangers read them.

The reference builds this shop follows: Futtawuh's
[EnderCNCs](https://github.com/Futtawuh/EnderCNCs) (via a fork) and
clehn8ok's
[DIY3AxisCameraSlider](https://github.com/clehn8ok/DIY3AxisCameraSlider), and
flummer's
[Tabletop overhead shooting rig](https://makerworld.com/en/models/1556093-tabletop-overhead-shooting-rig).
Their work stays theirs — deviations get documented here, not patched there.

The BUSY Bar pages lean on Flipper Devices' firmware, docs and tools, and on
maxswinkels's community
[busybar-manager](https://github.com/maxswinkels/busybar-manager). "BUSY Bar"
is Flipper Devices' trademark; nothing here is official.
