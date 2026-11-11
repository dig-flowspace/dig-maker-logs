"""Draw Attract Mode's pictures: the two menu icons and the calendar leaf.

Each picture is a block of text, one character a pixel, with a palette that
says which colour each character stands for. Run this after changing one and
the PNG files inside the app's folder are written again. Standard library only.

    python soft-tools/bar-apps/make_art.py
"""

import struct
import zlib
from pathlib import Path

APP = Path(__file__).resolve().parent / "shop.attract-mode"

CLEAR = (0, 0, 0, 0)

# The icon in the bar's APPS menu, front screen: 8 x 8, colour.
ICON_FRONT = """
...a....
...a....
..aWa...
aaWWWaa.
..aWa...
...a....
...a....
........
"""
ICON_FRONT_COLOURS = {".": CLEAR, "a": (255, 170, 0, 255), "W": (255, 255, 255, 255)}

# The same sparkle for the back screen: 11 x 11, greys only.
ICON_BACK = """
.....W.....
.....W.....
.....W.....
....WWW....
...WWWWW...
WWWWWWWWWWW
...WWWWW...
....WWW....
.....W.....
.....W.....
.....W.....
"""
ICON_BACK_COLOURS = {".": CLEAR, "W": (255, 255, 255, 255)}

# A page from a tear-off calendar: 15 x 14. The day number is drawn over it as text.
LEAF = """
.RRRRRRRRRRRRR.
RRRdRRRRRRRdRRR
RRRdRRRRRRRdRRR
RRRRRRRRRRRRRRR
PPPPPPPPPPPPPPP
PPPPPPPPPPPPPPP
PPPPPPPPPPPPPPP
PPPPPPPPPPPPPPP
PPPPPPPPPPPPPPP
PPPPPPPPPPPPPPP
PPPPPPPPPPPPPPP
PPPPPPPPPPPPPPP
PPPPPPPPPPPPPPP
.PPPPPPPPPPPPP.
"""
LEAF_COLOURS = {".": CLEAR, "R": (224, 48, 32, 255), "d": (96, 16, 8, 255), "P": (232, 232, 232, 255)}


def png(rows):
    """Encode rows of (r, g, b, a) pixels as an 8-bit RGBA PNG, the format Flipper's own apps ship."""

    def chunk(kind, data):
        body = kind + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)

    height, width = len(rows), len(rows[0])
    raw = b"".join(b"\x00" + bytes(value for pixel in row for value in pixel) for row in rows)
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


def paint(art, colours, width, height):
    lines = art.strip().splitlines()
    if len(lines) != height or any(len(line) != width for line in lines):
        raise SystemExit("picture is not %d x %d" % (width, height))
    return png([[colours[ch] for ch in line] for line in lines])


def main():
    pictures = {
        "appmeta/icon_front_8x8.png": paint(ICON_FRONT, ICON_FRONT_COLOURS, 8, 8),
        "appmeta/icon_back_11x11.png": paint(ICON_BACK, ICON_BACK_COLOURS, 11, 11),
        "images/leaf.png": paint(LEAF, LEAF_COLOURS, 15, 14),
    }
    for name, data in pictures.items():
        path = APP / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        print("%s  %d bytes" % (name, len(data)))


if __name__ == "__main__":
    main()
