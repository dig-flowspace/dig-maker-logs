"""Make Morning Sit's bell: one strike of a bowl bell, built from sine waves.

The bar plays one kind of sound file: raw samples, 16 bits each, low byte
first, 44,100 a second, one channel, no header, named .snd (firmware 1.3.1,
applications/services/audio/audio.h). Run this after changing the recipe and
the file inside the app's folder is written again. Standard library only.

    python soft-tools/bar-apps/make_bell.py

The bar has no queue: a new sound cuts off the one playing. So the app plays
this one strike as many times as it needs, each after the last has rung out.
"""

import array
import math
import random
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parent / "shop.morning-sit" / "sounds" / "bell.snd"

RATE = 44100   # samples a second
LOWEST = 640.0 # the bell's lowest note, in Hz
LENGTH = 6.0   # seconds the strike rings for
FADE = 0.5     # seconds of fade at the end, down to silence
PEAK = 0.5     # the loudest sample, as a share of full scale

# The bell's notes: ratio to the lowest, loudness, seconds to fall to about a
# third, and beats a second. The ratios are not whole numbers, which is what
# makes it a bell and not an organ. Each note is a pair tuned half the beat
# either side, so it pulses slowly as it dies away.
PARTIALS = [
    (1.00, 1.00, 1.60, 0.7),
    (2.71, 0.50, 1.00, 1.1),
    (5.15, 0.28, 0.55, 1.7),
    (8.12, 0.10, 0.25, 2.3),
]


def strike():
    count = int(LENGTH * RATE)
    out = [0.0] * count
    for ratio, loud, tau, beat in PARTIALS:
        decay = [math.exp(-i / (tau * RATE)) for i in range(count)]
        for detune in (-beat / 2, beat / 2):
            w = 2 * math.pi * (LOWEST * ratio + detune) / RATE
            for i in range(count):
                out[i] += 0.5 * loud * decay[i] * math.sin(w * i)

    # The mallet: 6 ms of soft noise. The seed keeps every run the same.
    rnd = random.Random(7)
    tap = int(0.006 * RATE)
    for i in range(tap):
        out[i] += 0.3 * (1 - i / tap) * (rnd.random() * 2 - 1)

    # A 2 ms rise, so the start does not click.
    rise = int(0.002 * RATE)
    for i in range(rise):
        out[i] *= i / rise

    fade = int(FADE * RATE)
    for i in range(fade):
        out[count - fade + i] *= 1 - i / fade

    top = max(abs(v) for v in out) or 1.0
    return [v * PEAK / top for v in out]


def main():
    samples = strike()
    data = array.array("h", (int(round(v * 32767)) for v in samples))
    if sys.byteorder != "little":
        data.byteswap()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "wb") as f:
        data.tofile(f)
    print("%s  %.1f s, %d bytes" % (OUT.name, len(samples) / RATE, OUT.stat().st_size))


if __name__ == "__main__":
    main()
