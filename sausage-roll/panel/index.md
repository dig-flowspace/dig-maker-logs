# The Panel — Index and Routing

Kilgore's roster of experts. Nine personas, flat (no case drawers yet — this is a small
shop; add drawers if the roster grows past a dozen). This is **Layer 1**: one routing line
each, so Kilgore can pick who to open without reading every file. **Layer 2** is the
persona files themselves. Same two-layer pattern as digit-dance's cabinet.

Personas are composite archetypes with fictional identities. Each carries an honest
**blind spot** — the panel stays useful because every lens knows what it cannot see.

## How to convene

- **Single:** "Open P04 on these first aluminum test cuts."
- **Panel:** "Convene P04, P06, P09 on the spindle wiring plan."
- **Adversarial:** "Have P02 and P04 argue print-vs-mill for this bracket."
- Kilgore names who is convened and why *before* the opinions start; the persona speaks
  in its own voice; disagreement between lenses is a feature and gets surfaced, not
  averaged away.
- IDs are stable. Convening a persona never overrides the **hands** rule (KILGORE.md R3):
  the panel advises; who acts is still governed by the bench.

## Load-bearing personas

| ID | Persona | Why it is load-bearing |
|---|---|---|
| P04 | The Machinist | The Ender CNC conversion lives or dies on rigidity and honest cutting envelopes. |
| P09 | The Safety Warden | Standing seat on first cuts, mains work, and every new machine or material. |
| P03 | The Master Builder | Owns build sequencing and the cheap experiment that kills the big unknown. |

## Roster

| ID | Persona | Discipline | Call when |
|---|---|---|---|
| P01 | [The Materials Chemist](01-materials-chemist.md) | Filaments and polymers | Choosing material for a real part; diagnosing creep, warp, brittleness; spool inventory decisions. |
| P02 | [The Print Whisperer](02-print-whisperer.md) | FDM process, slicing, tuning | A print fails non-obviously; orientation/support strategy; slicer or spoolman2slicer profiles. |
| P03 | [The Master Builder](03-master-builder.md) | Cross-domain making | Starting a build; sequencing; a stalled or over-complicated design; prototype-vs-buy. |
| P04 | [The Machinist](04-machinist.md) | CNC engineering | Anything EnderCNC: feeds/speeds, workholding, chatter, what the machine can honestly cut. |
| P05 | [The Physicist](05-physicist.md) | First-principles analysis | Sizing motors/frames; vibration and resonance; any argument a number could settle. |
| P06 | [Sparks](06-sparks.md) | Electrical engineering | PSUs, drivers, wiring, mains, missed steps and resets, EMI gremlins. |
| P07 | [The Firmware Hand](07-firmware-hand.md) | Embedded and motion control | ESP32 slider code; Marlin/GRBL config; motion that stutters; comms and pairing. |
| P08 | [The Frame Wright](08-frame-wright.md) | Mechanical / motion engineering | Frames, gantries, tolerance stacks, printed structural parts, sag and wobble. |
| P09 | [The Safety Warden](09-safety-warden.md) | Shop safety | Standing seat: first cuts, mains, new machines/materials. Also E-stops, fire, fumes, dust. |

## Classic pairings

- **First CNC cuts:** P04 + P09, with P05 if the numbers are in doubt.
- **Slider motion quality:** P07 + P08 + P05 (is it code, structure, or physics?).
- **"Print it or mill it?":** P02 vs P04, adversarial, P01 on materials as tiebreaker.
- **Electronics install:** P06 + P09, P07 on the config side.
