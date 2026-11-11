#!/usr/bin/env python3
"""Step Aside: touch the bar and your apps step aside; leave it alone and they
come back, like a screensaver.

Runs under busybar-manager like any app, but draws nothing. It listens to the
bar's buttons, wheel and mode selector. When you touch the bar, it switches off
whatever the manager is showing (scrollers, apps, and the schedule), so the
bar's own menus are yours. Once the bar has been left alone for the idle time,
it switches them back on. It doesn't bring them back while the selector is on
Sleep, unless told to.

Why it's needed: a short BACK makes the bar close an app's frame, but an app
that keeps redrawing puts it straight back, so the menus can't be used while a
scroller runs. See hard-tools/busy-bar/sharing-the-screen.md in the-workshop.

WHAT IT TOUCHES
---------------
Only the manager, at --host (default 127.0.0.1:8321):

    GET  /api/status/ws                  the bar's status stream, passed through
                                         by the manager; only listened to
    GET  /api/_manager/state             what's switched on
    POST /api/_manager/scrollers/<id>/disable and /enable
    POST /api/_manager/apps/<slug>/disable    and /enable
    PUT  /api/_manager/schedule          the schedule's master switch

It also writes one small file, recording what it switched off, so that a restart
can still put things back: %LOCALAPPDATA%/busybar-step-aside/aside.json.

The input format is Flipper's own, from github.com/busy-app/busybar-protobuf
(state.proto, input.proto):

    State.updates = 2  ->  StateUpdate.input = 11  ->  InputEvent
    InputEvent: button_event = 1 {button, action}, switch_event = 2 {position},
                encoder_event = 3 {delta, sint32}

proto3 leaves zero values out, so an empty event is OK, PRESS or BUSY.
Standard library only.
"""
import argparse
import base64
import json
import os
import queue
import select
import signal
import socket
import struct
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

APP = Path(__file__).resolve().parent.name  # the manager knows an app by its folder
BUTTONS = {0: "OK", 1: "BACK", 2: "START"}
POSITIONS = {0: "BUSY", 1: "CUSTOM", 2: "Sleep", 3: "APPS", 4: "SETTINGS"}
SLEEP = 2
STATE_FILE = (Path(os.environ.get("LOCALAPPDATA") or Path.home() / ".local" / "state")
              / "busybar-step-aside" / "aside.json")


def log(message):
    print(message, flush=True)


def arguments(argv=None):
    p = argparse.ArgumentParser(
        description="Touch the bar and your apps step aside; leave it alone and they come back.")
    p.add_argument("--host", default="127.0.0.1:8321",
                   help="the manager's address (default 127.0.0.1:8321)")
    p.add_argument("--idle", type=int, default=3, metavar="1-60",
                   help="minutes the bar must be left alone before your apps come back")
    p.add_argument("--show-in-sleep", action="store_true",
                   help="bring apps back even while the selector is on Sleep")
    p.add_argument("--leave-alone", default="",
                   help="apps or scrollers never to switch off, comma-separated (e.g. claude-approve)")
    args = p.parse_args(argv)
    if not 1 <= args.idle <= 60:
        p.error("--idle must be between 1 and 60 minutes")
    args.host = args.host.replace("http://", "").rstrip("/")
    args.leave_alone = {name.strip() for name in args.leave_alone.split(",") if name.strip()}
    return args


# --- reading the bar's input events ------------------------------------------

def _varint(buf, pos):
    value, shift = 0, 0
    while pos < len(buf):
        byte = buf[pos]
        pos += 1
        value |= (byte & 0x7F) << shift
        if not byte & 0x80:
            return value, pos
        shift += 7
        if shift > 63:
            break
    raise ValueError("bad varint")


def _fields(buf):
    """Yield (field, wire type, value) for each top-level protobuf field."""
    pos = 0
    while pos < len(buf):
        key, pos = _varint(buf, pos)
        field, wire = key >> 3, key & 7
        if wire == 0:
            value, pos = _varint(buf, pos)
        elif wire == 2:
            length, pos = _varint(buf, pos)
            if pos + length > len(buf):
                raise ValueError("truncated field")
            value, pos = buf[pos:pos + length], pos + length
        elif wire in (1, 5):
            width = 8 if wire == 1 else 4
            value, pos = buf[pos:pos + width], pos + width
        else:
            raise ValueError(f"unsupported wire type {wire}")
        yield field, wire, value


def input_events(frame):
    """Yield ("button", name), ("selector", position) or ("wheel", delta)."""
    for field, wire, update in _fields(frame):
        if field != 2 or wire != 2:                    # State.updates
            continue
        for ufield, uwire, event in _fields(update):
            if ufield != 11 or uwire != 2:             # StateUpdate.input
                continue
            for efield, ewire, body in _fields(event):
                if ewire != 2:
                    continue
                values = {f: v for f, w, v in _fields(body) if w == 0}
                if efield == 1 and values.get(2, 0) == 0:          # a PRESS
                    yield "button", BUTTONS.get(values.get(1, 0), "a button")
                elif efield == 2:
                    yield "selector", values.get(1, 0)
                elif efield == 3:
                    raw = values.get(1, 0)
                    delta = (raw >> 1) ^ -(raw & 1)                 # zigzag (sint32)
                    if delta:
                        yield "wheel", delta


# --- a minimal WebSocket client (RFC 6455) for /api/status/ws ----------------

class Wire:
    """Buffered reads over a socket."""

    def __init__(self, sock):
        self.sock, self.buf = sock, bytearray()

    def read(self, n):
        while len(self.buf) < n:
            chunk = self.sock.recv(65536)
            if not chunk:
                raise OSError("the stream closed")
            self.buf += chunk
        out = bytes(self.buf[:n])
        del self.buf[:n]
        return out

    def readline(self):
        while b"\n" not in self.buf:
            chunk = self.sock.recv(4096)
            if not chunk:
                raise OSError("the stream closed")
            self.buf += chunk
        end = self.buf.index(b"\n") + 1
        line = bytes(self.buf[:end])
        del self.buf[:end]
        return line


def send_frame(sock, opcode, payload=b""):
    """Client frames must be masked."""
    mask = os.urandom(4)
    head = bytearray([0x80 | opcode])
    n = len(payload)
    if n < 126:
        head.append(0x80 | n)
    elif n < 65536:
        head.append(0x80 | 126)
        head += struct.pack(">H", n)
    else:
        head.append(0x80 | 127)
        head += struct.pack(">Q", n)
    sock.sendall(bytes(head) + mask + bytes(b ^ mask[i % 4] for i, b in enumerate(payload)))


def read_frame(wire):
    b0, b1 = wire.read(2)
    length = b1 & 0x7F
    if length == 126:
        length = struct.unpack(">H", wire.read(2))[0]
    elif length == 127:
        length = struct.unpack(">Q", wire.read(8))[0]
    mask = wire.read(4) if b1 & 0x80 else None
    data = wire.read(length) if length else b""
    if mask:
        data = bytes(b ^ mask[i % 4] for i, b in enumerate(data))
    return bool(b0 & 0x80), b0 & 0x0F, data


class Listener(threading.Thread):
    """Puts the bar's input events on a queue; reconnects with backoff."""

    def __init__(self, host, events):
        super().__init__(daemon=True)
        self.host, self.events = host, events

    def run(self):
        backoff, last_error = 1.0, None
        while True:
            try:
                self.session()
                backoff, last_error = 1.0, None
            except Exception as exc:  # keep listening, whatever went wrong
                text = str(exc) or type(exc).__name__
                if text != last_error:
                    log(f"lost the bar's input stream ({text}); retrying")
                    last_error = text
                backoff = min(30.0, backoff * 2)
            time.sleep(backoff)

    def session(self):
        name, _, port = self.host.partition(":")
        sock = socket.create_connection((name, int(port or 80)), timeout=10)
        try:
            key = base64.b64encode(os.urandom(16)).decode()
            sock.sendall((f"GET /api/status/ws HTTP/1.1\r\nHost: {self.host}\r\n"
                          "Upgrade: websocket\r\nConnection: Upgrade\r\n"
                          f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
            wire = Wire(sock)
            status = wire.readline().decode("latin-1").strip()
            if " 101" not in status:
                raise OSError(f"the stream was refused: {status or 'no answer'}")
            while wire.readline() not in (b"\r\n", b"\n"):
                pass
            send_frame(sock, 0x1, json.dumps({"enable": True}).encode())
            log("listening to the bar's buttons, wheel and selector")
            sock.settimeout(60)
            message, kind = bytearray(), 0
            while True:
                if not wire.buf:
                    ready, _, _ = select.select([sock], [], [], 25)
                    if not ready:              # a quiet bar: check the line is alive
                        send_frame(sock, 0x9)
                        continue
                fin, opcode, data = read_frame(wire)
                if opcode == 0x8:
                    raise OSError("the bar closed the stream")
                if opcode == 0x9:
                    send_frame(sock, 0xA, data)
                    continue
                if opcode == 0xA:
                    continue
                if opcode in (0x1, 0x2):
                    message, kind = bytearray(data), opcode
                else:
                    message += data
                if fin and kind == 0x2:
                    try:
                        for event in input_events(bytes(message)):
                            self.events.put(event)
                    except ValueError:
                        pass                   # not ours to understand
        finally:
            sock.close()


# --- talking to the manager --------------------------------------------------

class Manager:
    def __init__(self, host):
        self.base = f"http://{host}/api/_manager"

    def call(self, method, path, body=None):
        data = json.dumps(body).encode() if body is not None else (b"" if method != "GET" else None)
        req = urllib.request.Request(self.base + path, data=data, method=method,
                                     headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read()
        return json.loads(raw) if raw else None

    def state(self):
        return self.call("GET", "/state")

    def switch(self, kind, key, on):
        self.call("POST", f"/{kind}/{urllib.parse.quote(str(key), safe='')}/{'enable' if on else 'disable'}")

    def schedule(self, on):
        self.call("PUT", "/schedule", {"enabled": on})


def load_aside():
    try:
        record = json.loads(STATE_FILE.read_text(encoding="utf-8"))
        return record if record.get("scrollers") or record.get("apps") or record.get("schedule") else None
    except (OSError, ValueError):
        return None


def save_aside(record):
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    tmp = STATE_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(record, indent=2), encoding="utf-8")
    os.replace(tmp, STATE_FILE)


def clear_aside():
    try:
        STATE_FILE.unlink()
    except OSError:
        pass


def describe(kind, value):
    if kind == "button":
        return value
    if kind == "selector":
        return f"the selector ({POSITIONS.get(value, value)})"
    return "the wheel"


def step_aside(manager, record, args, why):
    """Switch off everything the manager is showing. Returns the record of what's off."""
    state = manager.state()
    record = record or {"scrollers": [], "apps": [], "schedule": False}
    turned = []
    known = {s["id"] for s in record["scrollers"]}
    for scroller in state.get("scrollers") or []:
        if scroller.get("enabled") and scroller["id"] not in known \
                and scroller.get("name") not in args.leave_alone:
            manager.switch("scrollers", scroller["id"], False)
            record["scrollers"].append({"id": scroller["id"], "name": scroller.get("name", "")})
            turned.append(f"scroller '{scroller.get('name', '')}'")
    for app in state.get("apps") or []:
        slug = app["slug"]
        if app.get("enabled") and slug != APP and slug not in record["apps"] \
                and slug not in args.leave_alone:
            manager.switch("apps", slug, False)
            record["apps"].append(slug)
            turned.append(slug)
    if (state.get("schedule") or {}).get("enabled") and not record["schedule"] \
            and "schedule" not in args.leave_alone:
        manager.schedule(False)
        record["schedule"] = True
        turned.append("the schedule")
    if not turned:
        return record if record["scrollers"] or record["apps"] or record["schedule"] else None
    save_aside(record)
    log(f"{why}: stepping aside ({', '.join(turned)})")
    return record


def come_back(manager, record, minutes):
    """Switch back on what step_aside switched off. Raises if the manager can't be reached."""
    names = []
    for scroller in record["scrollers"]:
        try:
            manager.switch("scrollers", scroller["id"], True)
            names.append(f"scroller '{scroller['name']}'")
        except urllib.error.HTTPError as exc:
            if exc.code != 404:                # 404: it was deleted meanwhile
                raise
    for slug in record["apps"]:
        try:
            manager.switch("apps", slug, True)
            names.append(slug)
        except urllib.error.HTTPError as exc:
            if exc.code != 404:
                raise
    if record["schedule"]:
        manager.schedule(True)
        names.append("the schedule")
    clear_aside()
    log(f"left alone for {minutes} min: bringing back {', '.join(names) or 'nothing'}")


def main():
    args = arguments()
    manager = Manager(args.host)
    events = queue.Queue()
    Listener(args.host, events).start()

    stop = threading.Event()
    for sig in (signal.SIGINT, signal.SIGTERM):
        signal.signal(sig, lambda *_: stop.set())

    record = load_aside()
    if record:
        log("found apps I'd switched off before a restart; they come back once the bar is left alone")
    log(f"stepping aside on any touch; back after {args.idle} min untouched"
        + ("" if args.show_in_sleep else ", but not while the selector is on Sleep"))

    last_touch, last_sweep, retry_at = time.monotonic(), 0.0, 0.0
    selector, said_sleep = None, False     # 1.3.1 can't report the selector until it moves
    while not stop.is_set():
        try:
            kind, value = events.get(timeout=1.0)
        except queue.Empty:
            kind, value = None, None
        now = time.monotonic()
        if kind:
            last_touch, said_sleep = now, False
            if kind == "selector":
                selector = value
            if record is None or now - last_sweep >= 5:
                last_sweep = now
                try:
                    record = step_aside(manager, record, args, describe(kind, value))
                except (OSError, ValueError) as exc:
                    log(f"couldn't reach the manager to step aside ({exc})")
            continue
        if record and now - last_touch >= args.idle * 60 and now >= retry_at:
            if selector == SLEEP and not args.show_in_sleep:
                if not said_sleep:
                    log("the selector is on Sleep: keeping the bar dark")
                    said_sleep = True
                continue
            try:
                come_back(manager, record, args.idle)
                record = None
            except (OSError, ValueError) as exc:
                log(f"couldn't reach the manager to bring apps back ({exc}); trying again in 30 s")
                retry_at = now + 30

    if record:                             # stopped by hand: leave things as they were
        try:
            come_back(manager, record, args.idle)
        except (OSError, ValueError):
            log("stopped while apps were switched off; they'll come back next time I run")


if __name__ == "__main__":
    sys.exit(main())
