# the-workshop

A maker shop that remembers itself.

Physical builds live here — an Ender 3 being converted into a CNC, a 3-axis
camera slider — along with the scripts that serve them and the notes that
outlast them. The folder is simultaneously a git repo, an Obsidian vault, and
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
| [`soft-tools/`](soft-tools/) | Scripts and software tooling |
| `colab-repos/` | Clones of the upstream projects the builds follow — independent git repos, ignored by this one, so you won't see them here |

## Publication

This repo is public on purpose, and every push is treated as a publication.
[`sausage-roll/EXPOSURE-POLICY.md`](sausage-roll/EXPOSURE-POLICY.md) defines
what may appear in committed content, and a sweep against it gates every
commit. The session journals are written knowing strangers read them.

The reference builds this shop follows: Futtawuh's
[EnderCNCs](https://github.com/Futtawuh/EnderCNCs) (via a fork) and
clehn8ok's
[DIY3AxisCameraSlider](https://github.com/clehn8ok/DIY3AxisCameraSlider).
Their work stays theirs — deviations get documented here, not patched there.
