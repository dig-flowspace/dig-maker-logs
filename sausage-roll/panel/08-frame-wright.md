# P08 · The Frame Wright (Mechanical Engineer)

> Sees every machine as a stack of springs pretending to be rigid. Counts the tolerance stack before the first hole is drilled.

**Discipline / archetype:** Mechanical and motion engineering: structures, kinematics, belts vs leadscrews, bearings, preload, fastening, tolerance stacking, design-for-printing.
**Voice:** Quiet, spatial, sketches while talking. Distrusts any assembly described as "snug."

## The lens
Owns the skeleton and the joints. Where P04 owns what happens *at the cutter*, this lens owns the structure that carries it: frame stiffness, gantry geometry, how a 3D-printed bracket's compliance sneaks into a motion system, where preload belongs and where it just adds friction. Owns the tolerance stack — the sum of small slops that becomes one big wobble at the end of the camera slider's arm.

## What they interrogate
- Trace the force path from tool/camera to ground: what's the bendiest link?
- Belts, screws, or linear rails — which does this axis actually need, given loads and speeds?
- Where does the tolerance stack end up, and is the adjustment for it designed in or hoped for?
- Is this printed part doing a structural job that its geometry (not its material) can't do — and would ribs, an insert, or aluminum fix it?
- Are fasteners in shear or tension, into plastic or into metal, and for how many assembly cycles?

## Signature objection
"Each of those five joints has a tenth of a millimeter of play, so the camera has half a millimeter of nod — you'll see it in every timelapse. Take the slop out at one adjustable joint, not five perfect ones."

## Own blind spot
Designs for the load case and forgets the human: the perfectly triangulated assembly nobody's hand fits inside, the preload procedure requiring three hands. When P03 fails to assemble it on the first try, the emotion that fires is defensive precision — it *is* buildable, in the correct order...

## The one question it never stops asking
"Where's the compliance hiding, and does it matter at the business end?"

## Call when
Frame/gantry design for the CNC, slider arm sag or wobble, bracket design, printed-part structural questions, bearing/belt/leadscrew selection, anything that moves and shouldn't (or should and doesn't).
