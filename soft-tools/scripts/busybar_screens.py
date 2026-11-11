#!/usr/bin/env python3
"""Save what the BUSY Bar is showing, both screens, as PNG files.

WHAT IT TOUCHES
---------------
Exactly two HTTP GET requests to the bar, nothing else:

    GET /api/screen?display=0   the front screen, 72 x 16 RGB LEDs
    GET /api/screen?display=1   the back screen, 160 x 80 OLED, 16 grays

It never draws, presses a key or changes a setting. Output is two PNG files.
Standard library only.

    python busybar_screens.py                      # bar on USB, PNGs here
    python busybar_screens.py --out some\\folder
    python busybar_screens.py --host 192.0.2.10    # bar on Wi-Fi; set BUSYBAR_TOKEN

THE FRAME FORMAT (firmware 1.3.1, API 27.14.0)
----------------------------------------------
The response says Content-Type: image/bmp, but the body is base64 text of raw
pixels with no header:

    front  3456 bytes = 72 x 16 x 3, blue-green-red order, rows top to bottom
    back   6400 bytes = 160 x 80 at 4 bits a pixel, low nibble first,
           0 = black, 15 = full white

Checked against the bar on 2026-11-11; busy-lib's README agrees on BGR for
the front. Pixels are scaled up (8x front, 3x back by default) so the files
are readable on a monitor.
"""
import argparse
import base64
import os
import struct
import sys
import urllib.error
import urllib.request
import zlib
from pathlib import Path

FRONT = (0, 72, 16)  # display index, width, height
BACK = (1, 160, 80)


def fetch_frame(host, display, token):
    req = urllib.request.Request(f"http://{host}/api/screen?display={display}")
    if token:
        req.add_header("X-API-Token", token)
    with urllib.request.urlopen(req, timeout=10) as resp:
        return base64.b64decode(resp.read())


def front_pixels(raw, width, height):
    need = width * height * 3
    if len(raw) != need:
        raise ValueError(f"front frame is {len(raw)} bytes, expected {need}")
    return [(raw[i + 2], raw[i + 1], raw[i]) for i in range(0, need, 3)]  # BGR -> RGB


def back_pixels(raw, width, height):
    need = width * height // 2
    if len(raw) != need:
        raise ValueError(f"back frame is {len(raw)} bytes, expected {need}")
    out = []
    for byte in raw:
        for level in (byte & 0x0F, byte >> 4):  # low nibble is the left pixel
            out.append((level * 17,) * 3)
    return out


def write_png(path, pixels, width, height, scale):
    rows = bytearray()
    for y in range(height):
        line = bytearray()
        for x in range(width):
            line += bytes(pixels[y * width + x]) * scale
        rows += (b"\x00" + line) * scale

    def chunk(tag, data):
        body = tag + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)

    w, h = width * scale, height * scale
    path.write_bytes(b"\x89PNG\r\n\x1a\n"
                     + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
                     + chunk(b"IDAT", zlib.compress(bytes(rows), 9))
                     + chunk(b"IEND", b""))


def main():
    p = argparse.ArgumentParser(description="Save both BUSY Bar screens as PNG files.")
    p.add_argument("--host", default="10.0.4.20", help="bar address (default: USB, 10.0.4.20)")
    p.add_argument("--out", default=".", help="folder for busybar-front.png and busybar-back.png")
    p.add_argument("--front-scale", type=int, default=8, help="pixel size for the front screen")
    p.add_argument("--back-scale", type=int, default=3, help="pixel size for the back screen")
    args = p.parse_args()
    token = os.environ.get("BUSYBAR_TOKEN")  # only needed over Wi-Fi

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    host = args.host.replace("http://", "").rstrip("/")
    try:
        for (display, width, height), pixels_of, scale, name in (
            (FRONT, front_pixels, args.front_scale, "busybar-front.png"),
            (BACK, back_pixels, args.back_scale, "busybar-back.png"),
        ):
            raw = fetch_frame(host, display, token)
            write_png(out / name, pixels_of(raw, width, height), width, height, scale)
            print(out / name)
    except urllib.error.HTTPError as exc:
        sys.exit(f"bar answered HTTP {exc.code} (on Wi-Fi, set BUSYBAR_TOKEN)")
    except urllib.error.URLError as exc:
        sys.exit(f"cannot reach the bar at {host}: {exc.reason}")
    except ValueError as exc:
        sys.exit(f"unexpected frame: {exc} (has the firmware changed the format?)")


if __name__ == "__main__":
    main()
