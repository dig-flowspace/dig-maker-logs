# Session: 2026-09-11 — The Ronin-S dies, the slider gains a donor

**Left off:** Ronin-S firmware update abandoned after a reproducible 99%
failure; every mechanical, power and compatibility cause eliminated by test.
Leading suspect is the replacement BG37 grip (bought new, never proven with
this head; original grip discarded). Dan's call: the head becomes a donor for
Workstream 2, the 3-axis camera slider. Next action: decide whether to test a
known-genuine BG37 before cutting — cutting is the irreversible step.
**Model:** Opus 5 (1M context).
**Goal:** Get the Ronin-S onto firmware V2.4.1.30. Did not happen. Got
something better instead.

## What happened

Bench: Firmware, Dan's-hands throughout (the gimbal is his; I guided). P07
Firmware Hand convened on the comms fault, P06 Sparks and P07 on the donor
question at the end.

DJI Pro Assistant reported `device Gimbal(1) is not connected`, failing at 0%.
The error was **literal**: the top section was physically detached from the
grip, on a misreading of a guide that says "do not power on the top section"
(a power instruction, not an invitation to disassemble). Reassembled, and the
failure moved 0% -> 99%. Whole payload transferred; the head was on the bus
for all of it.

99% is the Assistant finishing the write, rebooting the modules, and polling
each one to confirm. One module never answered. After the failure the gimbal
chimes on power-up but the motors stay dead.

Ruled out by test, in order: grip-to-gimbal contact (clean), two-stage
power-on sequence (correct), battery level (full), axis locks (free), grip
model (BG37, correct for Ronin-S — BG18 is the Ronin-SC part and would have
been the tidy answer).

The break came from Dan: "this is a newer battery because the old one was
gross." The head had worked **before** — but with a *different* grip. DJI
gimbals authenticate the battery grip; a failed handshake produces exactly
this triad — boots, chimes, refuses to arm the motors — and a firmware run
that writes fine then fails deterministically at final verification. One
mechanism, every symptom, no dead hardware. Untestable now: the original grip
is gone, so the one-variable swap is unavailable.

Falls, per R5:

1. **I assumed the gimbal had been working, and never asked.** It had — with
   the old grip. Held that assumption for four rounds while theorising about
   firmware. The provenance of every part belongs in the first question set,
   before any software theory.
2. **Stochastic fixes for a deterministic fault.** Sent Dan after battery
   charge and USB selective suspend — both cures for *random-in-time*
   failures. It failed at exactly 99% every run. Determinism means a check
   being run and failed; that is logic, not electrons. Dan spotted the
   mismatch before I did.
3. **The 0% error meant what it said.** "Gimbal(1) is not connected" — the
   gimbal was not connected. Reading the error literally would have saved a
   round trip.
4. **Built an indexed-module theory (one dead axis board) and retired it one
   message later** when the grip's provenance surfaced. Not wrong to theorise
   — wrong to theorise before the cheap questions were exhausted.

Motors almost certainly never died. Brushless motors are coils and magnets;
you kill them with water or a hard stall, not a failed download. What fails is
the drive (no valid program) or the permission (no battery handshake).

Ending: repurpose. DJI firmware is signed and closed — no reprogramming those
boards, ever. But the head is three precision gimbal motors with hall sensors
in a rigid 3-axis aluminium frame, and prior art exists for driving salvaged
DJI gimbal motors with SimpleFOC / STorM32 / SimpleBGC (see DJI-Gimbal-FOC,
which found two ratiometric linear hall sensors per motor — though that work
is on the smaller drone gimbals, not a Ronin-S). Workstream 2 needs exactly
those parts. Dan chose the donor path and felt good about it, which is the
correct response to a bad evening that produced a good component.

5. **Wrap-time fall: the sweep greps drowned in vendored JS.** The policy's
   net, run as written, returned 1.2 MB of minified plugin bundles — twice —
   because `main.js` and `styles.css` from community plugins match every
   pattern by accident. Re-run with those paths excluded, the result was
   readable in one screen. A net you cannot read is not a net. Proposed
   amendment to EXPOSURE-POLICY.md § Sweep mechanics, for Dan's ruling: add
   `-- ':!*.obsidian/plugins/*main.js' ':!*.obsidian/plugins/*styles.css'` to
   the three greps, on the grounds that vendored third-party bundles are
   reviewed on arrival (step 1 scope) rather than on every subsequent sweep.

Arrivals this session: two new Obsidian plugins (excalidraw, templater) —
swept specifically per the last session's lesson that every new plugin is an
importer. Excalidraw's `data.json` carries `apiKey`/`taskboneAPIkey` fields,
all empty strings; no local paths, no emails, no transcripts. Tracked as code,
consistent with the existing editing-toolbar plugin.

**Exposure sweep: clean.** Scope: session diff plus untracked arrivals, with
the policy greps run over the full tracked tree as the net. No RED. No GRAY
held. The only secret-shaped hits were `.env.example`'s documented dummy
values (GREEN by policy) and empty settings fields.

## Files created or changed

- `be-productive-already/TODO.md` : Ronin-S logged to Inbox mid-session, then
  Active now promoted to the camera slider with the Ronin-S head as donor.
- Machine change (outside the repo, reversible): USB selective suspend
  disabled on the Balanced power plan, AC and DC, via `powercfg`. Set the
  value index back to `1` to restore. Did not fix anything — see fall 2.

## Open threads / next

- **Before cutting:** a known-genuine BG37 from a returnable source would test
  the grip theory. If it resurrects the gimbal, a working Ronin-S beats a
  donor. Cutting is irreversible; the donor option is not time-limited.
- If cutting: photograph and document the flex PCB and every connector
  *before* disassembly. The ribbons are fragile and there are no datasheets.
- Ronin-S is a 2018 discontinued product — price any DJI repair against a
  used replacement before committing.
- Not done: Upload Error Log was never clicked. Free, and it names the module
  that did not answer.
