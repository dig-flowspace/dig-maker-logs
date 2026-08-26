#!/usr/bin/env python3
"""Read-only export of a single Discord channel's message history.

FOR THE SERVER ADMIN REVIEWING THIS
-----------------------------------
This script makes HTTP GET requests to exactly three Discord endpoints and
nothing else:

    GET /users/@me                       confirm the token works, name the bot
    GET /channels/{channel_id}           read the channel's name and type
    GET /channels/{channel_id}/messages  page through history, 100 at a time

Every request goes through api_get() below, which sets method="GET" itself and
is the only function in this file that touches the network. There is no code
path that sends a message, edits or deletes anything, reads the member list,
enumerates other channels, or writes anything back to Discord. Output goes to a
local file or stdout. Run with --check to verify access without reading a
single message.

The bot needs exactly two permissions, and they can be granted on one channel
only rather than server-wide:

    View Channel          without it, every request returns 403
    Read Message History  without it, history before the bot joined is invisible

It also needs the Message Content intent enabled in the Developer Portal
(Bot > Privileged Gateway Intents), or Discord blanks every message body.

KNOWN LIMITS
------------
Messages inside threads and forum posts are not part of a channel's own
history and will not appear here. Neither will messages deleted before the
export ran.

USAGE
-----
    export DISCORD_BOT_TOKEN='...'          # never pass a token as an argument
    python discord_export.py <channel_id> --check
    python discord_export.py <channel_id> --format md -o channel.md
    python discord_export.py <channel_id> --after <message_id>   # incremental

Python 3.9+. No third-party packages.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

API_ROOT = "https://discord.com/api/v10"
USER_AGENT = "DiscordBot (https://github.com/dig-flowspace/dig-maker-logs, 0.1)"
PAGE_SIZE = 100
MAX_RETRIES = 5

DIAGNOSIS = {
    401: (
        "Discord rejected the token (401). Check that DISCORD_BOT_TOKEN holds "
        "the token from the Bot tab -- not the client secret and not the "
        "application ID -- and that it has not been reset since you copied it."
    ),
    403: (
        "The token works but this channel is closed to the bot (403). It needs "
        "both 'View Channel' and 'Read Message History' HERE. Check the "
        "channel's own permission overwrites, not just the server-wide role: a "
        "channel-level deny beats a server-level allow."
    ),
    404: (
        "No channel with that ID is visible to this bot (404). Either the ID is "
        "wrong or the bot was never added to that server. To get the ID: enable "
        "Settings > Advanced > Developer Mode in Discord, then right-click the "
        "channel and choose Copy Channel ID."
    ),
}


class ApiError(RuntimeError):
    """A Discord response we cannot recover from, carrying a plain-English cause."""


def log(message: str) -> None:
    print(message, file=sys.stderr)


def api_get(path: str, token: str, params: dict | None = None):
    """The only network call in this script. GET only, by construction."""
    url = API_ROOT + path
    if params:
        url += "?" + urllib.parse.urlencode(params)

    for attempt in range(1, MAX_RETRIES + 1):
        request = urllib.request.Request(url, method="GET")
        request.add_header("Authorization", "Bot " + token)
        request.add_header("User-Agent", USER_AGENT)
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                payload = json.loads(response.read().decode("utf-8"))
                _respect_rate_limit(response.headers)
                return payload
        except urllib.error.HTTPError as exc:
            if exc.code == 429:
                wait = _retry_after(exc)
                log(f"  rate limited, sleeping {wait:.1f}s")
                time.sleep(wait)
                continue
            if 500 <= exc.code < 600 and attempt < MAX_RETRIES:
                wait = 2 ** attempt
                log(f"  Discord returned {exc.code}, retrying in {wait}s")
                time.sleep(wait)
                continue
            raise ApiError(
                DIAGNOSIS.get(exc.code, f"Discord returned HTTP {exc.code} for {path}.")
            ) from exc
        except urllib.error.URLError as exc:
            if attempt < MAX_RETRIES:
                time.sleep(2 ** attempt)
                continue
            raise ApiError(f"Could not reach Discord: {exc.reason}") from exc

    raise ApiError(f"Gave up after {MAX_RETRIES} attempts on {path}.")


def _respect_rate_limit(headers) -> None:
    """Pause when the bucket is empty so we never earn a 429 in the first place."""
    if headers.get("X-RateLimit-Remaining") != "0":
        return
    try:
        time.sleep(min(float(headers.get("X-RateLimit-Reset-After", 0)) + 0.1, 10.0))
    except (TypeError, ValueError):
        pass


def _retry_after(exc: urllib.error.HTTPError) -> float:
    try:
        return min(float(json.loads(exc.read().decode("utf-8"))["retry_after"]), 60.0)
    except Exception:
        try:
            return min(float(exc.headers.get("Retry-After")), 60.0)
        except (TypeError, ValueError):
            return 5.0


def fetch_messages(token: str, channel_id: str, after: str | None, cap: int | None):
    """Page through history. Returns messages oldest-first."""
    collected: dict[str, dict] = {}
    key = "after" if after else "before"
    cursor = after

    while True:
        params = {"limit": PAGE_SIZE}
        if cursor:
            params[key] = cursor
        page = api_get(f"/channels/{channel_id}/messages", token, params)
        if not page:
            break

        for message in page:
            collected[message["id"]] = message

        # Discord does not guarantee page ordering, so derive the next cursor
        # from the ids themselves rather than from the first or last element.
        ids = [int(m["id"]) for m in page]
        cursor = str(max(ids)) if key == "after" else str(min(ids))

        log(f"  {len(collected)} messages")
        if len(page) < PAGE_SIZE or (cap and len(collected) >= cap):
            break

    ordered = sorted(collected.values(), key=lambda m: int(m["id"]))
    if cap:
        # Backfilling walks newest-first, so a cap keeps the newest N.
        ordered = ordered[-cap:] if key == "before" else ordered[:cap]
    return ordered


def _stamp(iso: str) -> datetime:
    return datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone(timezone.utc)


def render_markdown(messages: list[dict], channel: dict) -> str:
    name = channel.get("name") or channel.get("id")
    lines = [f"# #{name}", ""]

    if not messages:
        lines.append("*No messages found.*")
        return "\n".join(lines) + "\n"

    first, last = _stamp(messages[0]["timestamp"]), _stamp(messages[-1]["timestamp"])
    lines += [
        f"{len(messages)} messages, {first:%Y-%m-%d} to {last:%Y-%m-%d}. Times are UTC.",
        "",
    ]

    current_day = None
    for message in messages:
        when = _stamp(message["timestamp"])
        day = when.strftime("%Y-%m-%d")
        if day != current_day:
            current_day = day
            lines += ["", f"## {day}", ""]

        author = message.get("author", {})
        who = author.get("global_name") or author.get("username") or "unknown"
        if author.get("bot"):
            who += " [bot]"
        lines.append(f"**{who}** · {when:%H:%M}")

        body = (message.get("content") or "").strip()
        if body:
            lines += ["", body]

        for attachment in message.get("attachments", []):
            lines.append(
                f"- attachment: [{attachment.get('filename')}]({attachment.get('url')})"
            )
        for embed in message.get("embeds", []):
            lines.append(f"- embed: {embed.get('title') or embed.get('url') or 'embed'}")
        if not body and not message.get("attachments") and not message.get("embeds"):
            lines.append("*(empty)*")
        lines.append("")

    return "\n".join(lines) + "\n"


def warn_if_content_missing(messages: list[dict]) -> None:
    """An all-empty export almost always means the privileged intent is off."""
    if len(messages) < 5:
        return
    empty = sum(1 for m in messages if not (m.get("content") or "").strip())
    if empty / len(messages) > 0.9:
        log("")
        log(f"WARNING: {empty} of {len(messages)} messages came back empty.")
        log("That is the signature of a missing Message Content intent. Enable it at")
        log("Developer Portal > your app > Bot > Privileged Gateway Intents, then re-run.")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Read-only export of one Discord channel's history.",
        epilog="The bot token is read from the DISCORD_BOT_TOKEN environment "
               "variable and is never printed or written to the output.",
    )
    parser.add_argument(
        "channel_id", help="numeric channel ID (Developer Mode > Copy Channel ID)"
    )
    parser.add_argument("--format", choices=("md", "json"), default="md")
    parser.add_argument("-o", "--out", help="output file (default: stdout)")
    parser.add_argument(
        "--after",
        metavar="MESSAGE_ID",
        help="only fetch messages newer than this ID, for incremental pulls",
    )
    parser.add_argument(
        "--limit", type=int, metavar="N", help="stop after roughly N messages"
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="verify token and channel access, then exit without reading messages",
    )
    args = parser.parse_args()

    token = os.environ.get("DISCORD_BOT_TOKEN", "").strip()
    if not token:
        log("DISCORD_BOT_TOKEN is not set.")
        log("  bash/zsh:   export DISCORD_BOT_TOKEN='...'")
        log("  PowerShell: $env:DISCORD_BOT_TOKEN = '...'")
        return 2

    try:
        identity = api_get("/users/@me", token)
        log(f"Authenticated as {identity.get('username')} ({identity.get('id')}).")

        channel = api_get(f"/channels/{args.channel_id}", token)
        log(f"Channel #{channel.get('name')} is readable.")

        if args.check:
            log("Access confirmed. No messages were read.")
            return 0

        log("Fetching history...")
        messages = fetch_messages(token, args.channel_id, args.after, args.limit)

    except ApiError as exc:
        log("")
        log(str(exc))
        return 1

    if args.format == "json":
        rendered = json.dumps(messages, indent=2, ensure_ascii=False) + "\n"
    else:
        rendered = render_markdown(messages, channel)

    if args.out:
        with open(args.out, "w", encoding="utf-8") as handle:
            handle.write(rendered)
        log(f"Wrote {len(messages)} messages to {args.out}")
    else:
        sys.stdout.write(rendered)

    warn_if_content_missing(messages)
    return 0


if __name__ == "__main__":
    sys.exit(main())
