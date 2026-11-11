#!/usr/bin/env python3
"""Put a JavaScript app onto the BUSY Bar, start it, stop it, take it off.

A bar app is a folder named for its id, holding appmeta/manifest.json and
scripts/main.js. This packs the folder the way the bar expects and makes the
calls. How bar apps work: hard-tools/busy-bar/bar-apps.md.

WHAT IT TOUCHES
---------------
Only the bar's app calls, and only the ones the command names:

    install   POST /api/apps/stage, then POST /api/apps/install
              (with --launch: POST /api/apps/quit first, POST /api/apps/launch after)
    launch    POST /api/apps/launch
    quit      POST /api/apps/quit
    remove    DELETE /api/apps          the app's saved settings stay on the bar
    list      GET /api/apps/list
    settings  GET /api/apps/settings, and PUT when you give it values

`pack` talks to nothing; it only writes the .tgz. Standard library only.

    python busybar_app.py install soft-tools/bar-apps/shop.attract-mode --launch
    python busybar_app.py list
    python busybar_app.py settings shop.attract-mode
    python busybar_app.py settings shop.attract-mode "message=Back at 3" seconds=15 show_date=false
    python busybar_app.py quit
    python busybar_app.py remove shop.attract-mode
    python busybar_app.py --host 192.0.2.10 list        # bar on Wi-Fi; set BUSYBAR_TOKEN

THE PACKAGE (firmware 1.3.1)
----------------------------
A gzipped tar whose one top-level entry is the app's folder, named exactly as
the manifest's id. Files and folders starting with a dot, and __pycache__, are
left out. Checked against the bar on 2026-11-11.
"""
import argparse
import io
import json
import os
import re
import sys
import tarfile
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

APP_ID = re.compile(r"^[a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,31}$")

# What a refusal means, by call and HTTP status. From the bar's own spec and
# Flipper's busy-cli.
MEANINGS = {
    "stage": {
        400: "the bar rejected the package",
        409: "the app asks for a newer API than this firmware has: lower api_version in the manifest, or update the bar",
        413: "the package is too large",
        508: "the bar could not save the package; is its storage full?",
    },
    "install": {400: "the bar did not install the staged app"},
    "launch": {
        404: "no app with that id is installed",
        409: "something with a higher priority is running, such as a BUSY session",
        503: "the bar failed to start the app",
    },
    "quit": {409: "no app is running"},
    "remove": {404: "no app with that id is installed", 503: "the app is running and would not stop"},
    "settings": {404: "no such app, or it has no settings", 400: "the bar refused those values"},
}


class Bar:
    def __init__(self, host):
        self.host = host.replace("http://", "").rstrip("/")
        self.token = os.environ.get("BUSYBAR_TOKEN")  # only needed over Wi-Fi

    def call(self, method, path, query=None, body=None, content_type="application/octet-stream"):
        url = f"http://{self.host}{path}"
        if query:
            url += "?" + urllib.parse.urlencode(query)
        req = urllib.request.Request(url, data=body, method=method)
        if self.token:
            req.add_header("X-API-Token", self.token)
        if body is not None:
            req.add_header("Content-Type", content_type)
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                return resp.status, resp.read()
        except urllib.error.HTTPError as exc:
            return exc.code, exc.read()
        except urllib.error.URLError as exc:
            sys.exit(f"cannot reach the bar at {self.host}: {exc.reason}")


def explain(what, status, raw):
    """One line for a call the bar refused."""
    try:
        said = json.loads(raw).get("error", "")
    except (ValueError, AttributeError):
        said = raw.decode("utf-8", "replace").strip()[:120]
    meaning = MEANINGS.get(what, {}).get(status)
    hint = " (on Wi-Fi, set BUSYBAR_TOKEN)" if status in (401, 403) else ""
    return f"{what}: the bar answered HTTP {status}" + (f", {said!r}" if said else "") + (f": {meaning}" if meaning else "") + hint


def pack(folder):
    """Check an app's folder and return (id, name, version, the .tgz as bytes)."""
    folder = Path(folder).resolve()
    manifest_path = folder / "appmeta" / "manifest.json"
    if not manifest_path.is_file():
        sys.exit(f"{folder} is not an app folder: it has no appmeta/manifest.json")
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except ValueError as exc:
        sys.exit(f"appmeta/manifest.json is not valid JSON: {exc}")
    app_id = manifest.get("id", "")
    if not APP_ID.match(app_id):
        sys.exit("manifest id: at most 32 letters, digits, _ - and ., not starting with a period")
    if folder.name != app_id:
        sys.exit(f'the folder is "{folder.name}" but the manifest id is "{app_id}": they must match')
    if not (folder / "scripts" / "main.js").is_file():
        sys.exit("scripts/main.js is missing")

    buffer = io.BytesIO()
    with tarfile.open(fileobj=buffer, mode="w:gz", format=tarfile.USTAR_FORMAT) as tar:
        for path in [folder] + sorted(folder.rglob("*")):
            inside = path.relative_to(folder).parts
            if any(part.startswith(".") or part == "__pycache__" for part in inside):
                continue
            info = tar.gettarinfo(str(path), arcname=path.relative_to(folder.parent).as_posix())
            info.uid = info.gid = 0
            info.uname = info.gname = ""
            info.mode = 0o755 if path.is_dir() else 0o644
            if path.is_file():
                with path.open("rb") as handle:
                    tar.addfile(info, handle)
            elif path.is_dir():
                tar.addfile(info)
    return app_id, manifest.get("name", app_id), manifest.get("version", "?"), buffer.getvalue()


def cmd_pack(bar, args):
    app_id, name, version, data = pack(args.folder)
    out = Path(args.out or ".") / f"{app_id}.tgz"
    out.write_bytes(data)
    print(f"{name} {version}: {out} ({len(data)} bytes)")


def cmd_install(bar, args):
    if str(args.source).endswith((".tgz", ".tar")):
        data = Path(args.source).read_bytes()
        app_id = None
    else:
        app_id, _, _, data = pack(args.source)
    if args.launch:
        bar.call("POST", "/api/apps/quit")  # 409 just means nothing was running
    status, raw = bar.call("POST", "/api/apps/stage", body=data)
    if status != 200:
        sys.exit(explain("stage", status, raw))
    staged = json.loads(raw)
    app = staged["staged"]
    was = staged.get("installed")
    print(f"staged {app['name']} {app['version']} ({len(data)} bytes)" + (f", replacing {was['version']}" if was else ""))
    status, raw = bar.call("POST", "/api/apps/install", {"install_key": staged["install_key"]})
    if status != 200:
        sys.exit(explain("install", status, raw))
    print(f"installed {app['id']}")
    if args.launch:
        status, raw = bar.call("POST", "/api/apps/launch", {"app_id": app_id or app["id"]})
        if status != 200:
            sys.exit(explain("launch", status, raw))
        print("launched")


def cmd_launch(bar, args):
    status, raw = bar.call("POST", "/api/apps/launch", {"app_id": args.app_id})
    if status != 200:
        sys.exit(explain("launch", status, raw))
    print(f"launched {args.app_id}")


def cmd_quit(bar, args):
    status, raw = bar.call("POST", "/api/apps/quit")
    if status == 409:
        print("no app was running")
    elif status != 200:
        sys.exit(explain("quit", status, raw))
    else:
        print("stopped the running app")


def cmd_remove(bar, args):
    status, raw = bar.call("DELETE", "/api/apps", {"app_id": args.app_id})
    if status != 200:
        sys.exit(explain("remove", status, raw))
    print(f"removed {args.app_id}; its saved settings, if any, are still on the bar")


def cmd_list(bar, args):
    status, raw = bar.call("GET", "/api/apps/list")
    if status != 200:
        sys.exit(explain("list", status, raw))
    for app in json.loads(raw)["apps"]:
        print(f"{app['id']:<26} {app['name']:<18} {app['version']:<8} {app.get('author', '')}")


def cmd_settings(bar, args):
    status, raw = bar.call("GET", "/api/apps/settings", {"app_id": args.app_id})
    if status != 200:
        sys.exit(explain("settings", status, raw))
    document = json.loads(raw)
    values = document["values"]
    for pair in args.values:
        key, sep, text = pair.partition("=")
        if not sep or key not in values:
            sys.exit(f'"{pair}": write it as name=value, with one of: {", ".join(values)}')
        old = values[key]
        if isinstance(old, bool):
            if text.lower() not in ("true", "false"):
                sys.exit(f"{key} is a switch: true or false")
            values[key] = text.lower() == "true"
        elif isinstance(old, int):
            try:
                values[key] = int(text)
            except ValueError:
                sys.exit(f"{key} is a whole number")
        elif isinstance(old, str):
            values[key] = text
        else:
            sys.exit(f"{key} is not a plain value; change it from the bar's web page")
    if args.values:
        # The bar wants the whole document back, every field present.
        body = json.dumps(document).encode("utf-8")
        status, raw = bar.call("PUT", "/api/apps/settings", {"app_id": args.app_id}, body, "application/json")
        if status != 200:
            sys.exit(explain("settings", status, raw))
    for key, value in values.items():
        print(f"{key:<16} {json.dumps(value)}")


def main():
    p = argparse.ArgumentParser(description="Install, start, stop and remove JavaScript apps on the BUSY Bar.")
    p.add_argument("--host", default="10.0.4.20", help="bar address (default: USB, 10.0.4.20)")
    sub = p.add_subparsers(dest="command", required=True)

    s = sub.add_parser("install", help="pack an app folder (or take a .tgz) and install it")
    s.add_argument("source", help="the app's folder, or a .tgz")
    s.add_argument("--launch", action="store_true", help="stop whatever app is running, then start this one")
    s.set_defaults(run=cmd_install)

    s = sub.add_parser("pack", help="only write the .tgz")
    s.add_argument("folder", help="the app's folder")
    s.add_argument("--out", help="folder for the .tgz (default: here)")
    s.set_defaults(run=cmd_pack)

    s = sub.add_parser("launch", help="start an installed app")
    s.add_argument("app_id")
    s.set_defaults(run=cmd_launch)

    s = sub.add_parser("quit", help="stop the running app")
    s.set_defaults(run=cmd_quit)

    s = sub.add_parser("remove", help="take an app off the bar")
    s.add_argument("app_id")
    s.set_defaults(run=cmd_remove)

    s = sub.add_parser("list", help="show the apps on the bar")
    s.set_defaults(run=cmd_list)

    s = sub.add_parser("settings", help="show an app's settings, or change some")
    s.add_argument("app_id")
    s.add_argument("values", nargs="*", metavar="name=value")
    s.set_defaults(run=cmd_settings)

    args = p.parse_args()
    args.run(Bar(args.host), args)


if __name__ == "__main__":
    main()
