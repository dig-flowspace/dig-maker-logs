# Session: 2026-10-20 — An entomologist on the panel, and legs that telescope

**Left off:** The overhead rig's legs are designed, rendered and documented in
`hard-tools/overhead-rig-legs/`, and nothing is printed or cut — the next move
is Dan's: measure the real conduit and find the lowest lens height he would
actually use, because that sets the upper-tube length, the one cut that can't
be undone.
**Model:** Claude Opus 5.5.
**Goal:** Build flummer's tabletop overhead shooting rig (MakerWorld) without
its pricey, fixed-height carbon legs. Dan asked for a bug expert: look at the
legs the way an insect would, and find how nature gets lower while staying
level, with little material and little room.

## What happened

There is no entomologist on the roster, so one sat provisionally — the second
provisional seat in two sessions, after last time's Surface Modeler.

The bug earned the chair. Insects get low by sprawling: a cockroach takes a
crevice under a quarter of its height by squashing its body and splaying its
legs flat out to the sides. That costs exactly the floor space Dan wanted to
keep, so sprawl was ruled out, and a knee with it (a knee is a sprawl with an
extra joint). When insects need length that comes and goes without taking up
room, they telescope: a female locust digs her egg hole by unfolding her own
abdomen. So the legs telescope. Two more principles crossed over cleanly:
stout near the body and slender at the foot, which beam theory agrees with for
its own reason (a joint's slop costs about the square of its height above a
pinned foot), and lock with geometry rather than grip — the locust's knee has
a catch, Heitler's lump, and a hole and a point are the shop's version of it.

The panel split once: the Entomologist wanted three legs, because a tripod
can't rock; the Frame Wright held four, because four is the design and a soft
foot swallows a millimetre. Four won, with a revisit if it rocks.

The money moved the material. Carbon runs well over a hundred dollars for six
tubes, small-order aluminum barely less, and steel electrical conduit about
$25 for the lot while being stiffer than the carbon. Steel is heavier, but an
insect pays for every milligram because it has to carry it, and a rig that
doesn't walk has no such budget.

Then Dan asked whether the existing model could carry the legs, so only the
legs needed building. The page's own data held more than its photos: a printed
foot, the hubs, and flummer's OpenSCAD source. With Dan's yes, the files came
down and were read end to end. The source settled what the photos had guessed
wrong — the legs sit 10° off vertical, not 12°, in sockets about 126 mm deep,
not 60 — and showed that one setting sizes every part.

With a second yes, a portable OpenSCAD snapshot (checksum-verified, run
headless from a scratch folder, nothing installed) rendered flummer's parts at
the conduit's 23.4 mm and his feet at 18 mm. A control render at his stock
22 mm reproduced his published hub exactly — same volume, same box, same bore
— so the resized parts are his design at a new size, not an imitation. Then
the four new parts: a sleeve, a collar, a TPU top bushing, and a V-block drill
jig. Putting the height holes at 60, 190 and 320 mm on a 380 mm tube makes
them symmetric, so one jig drills all three: flip the tube and pin it through
the middle hole. The build doc carries the cut list, drilling, assembly, a
one-leg test, and three renders, including the rig in side view at its
tallest and lowest.

The build got a shelf: `hard-tools/`, the twin of `soft-tools/`, registered as
workstream 6. flummer's regenerated files stay local in a gitignored folder;
only the new parts and the doc publish.

### Falls (R5)

- **Numbers from photos.** The first spec ran on a photographed angle and a
  guessed socket depth, and both were wrong. Photos frame a question; the
  source sets the cuts.
- **A wrong promise about spare conduit.** Said the leftover 1/2" could take
  the rig lower. The upper tube sets the floor, not the lower one. Caught a
  turn later and corrected out loud.
- **The bolt that was too short.** Specified an M6 × 25; the reach, added up
  in prose, was wrong, and a 25 can't seat its point. Modelling the screw in
  OpenSCAD exposed it, and it is now an M6 × 30. A model checks arithmetic
  that a paragraph only repeats.
- **The checker that cried wolf.** The first mesh check rounded vertices and
  reported open edges on every part, including flummer's published hub,
  which prints fine. An exact-match check showed every mesh closed. Test the
  checker on a known-good file before believing it about a new one.
- **A warning dressed as a failure.** Portable OpenSCAD complained it had no
  font config, and the jig's engraved labels looked lost. Counting triangles
  on the engraving floor showed they were there all along.
- **Browser friction, three ways.** MakerWorld refuses plain fetches, its
  Customize button opened outside the session's tabs, and Chrome parked the
  download behind a prompt. The page's own data answered the first two; the
  finished bytes, checked as a complete zip, answered the third. When the
  interface won't show it, the page has often already sent it.
- **Claims caught in review.** "None of flummer's parts need supports" was
  never checked, and "the bit lies flat on the bench" is impossible for a bit
  at tube-centre height. Both rewritten before they shipped.
- **The verdict before the sweep.** During the wrap, this entry's exposure
  paragraph got drafted before the sweep had run. The run then showed it
  incomplete: it missed the plugin bundles and claimed the session added no
  hits, when the paragraph itself is one. Rewritten from the actual output.
  Evidence first, verdict second, even in prose.
- **Rule friction, not a fall.** The hands table makes CAD & Fab advise-only,
  and this session drafted CAD source and STLs at Dan's explicit request. An
  amendment is proposed in the wrap rather than the rule being quietly bent.
  Likewise the promise to read flummer's source and not run it held until Dan
  said yes.

### Exposure

**Exposure sweep: clean.** The diff was read by eye, then netted with the
policy's three greps, run against the staged tree. Every hit outside this
entry was pre-existing and already dispositioned: third-party Obsidian plugin
bundles and themes (their authors' own published attributions, and words like
"token" in minified code), the policy quoting its own patterns, the documented
dummies in `.env.example`, earlier journals describing their own sweeps, and
the Discord exporter's token handling and its `/users/@me` API route — a URL,
not a filesystem path. The only new hit is this paragraph naming them. The
binaries were checked separately, because a grep reads text: the STL headers
carry only "OpenSCAD Model", the PNG renders have no text chunks, and no
username or path appears anywhere in their bytes. flummer's own files are
gitignored and never staged.

## Files created or changed

- `hard-tools/overhead-rig-legs/README.md` : the build doc — heights,
  shopping, printing, cutting, drilling, assembly, a one-leg test.
- `hard-tools/overhead-rig-legs/overhead-rig-legs.scad` : source for the four
  new parts, in flummer's style; CC BY-SA remix, his `metric_hex()` credited.
- `hard-tools/overhead-rig-legs/stl/` : collar, sleeve, TPU top bushing, drill
  jig.
- `hard-tools/overhead-rig-legs/images/` : side elevation, joint section,
  parts.
- `.gitignore` : keeps `stl/from-flummer/` (his regenerated files) local.
- `sausage-roll/REGISTRY.md` : the `hard-tools/` shelf; workstream 6.
- `README.md` : the new shelf, the new build, and flummer's rig among the
  reference builds.
- `be-productive-already/TODO.md` : Inbox entries for the rig and for two
  framework rulings.
- `sausage-roll/sessions/README.md` : this entry's index line.

**Commit:** `41f2420`.

## Open threads / next

- **Measure, then find the floor.** Measure the conduit actually bought, and
  set the camera over real work at a few heights to find the lowest lens
  height in use. That sets the upper-tube length, the irreversible cut.
- **One leg first.** Build and load-test one leg before making three more.
- **Unruled:** the panel has needed a provisional seat twice (the Surface
  Modeler, the Entomologist) — make them permanent, or write a guest-seat rule
  into `panel/index.md`? And amend the hands table so Claude may draft CAD
  files on request, with printing, cutting and anything physical staying
  Dan's?
