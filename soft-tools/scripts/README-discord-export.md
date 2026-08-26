# discord_export.py — what it is, for the server admin

A single-file Python script that reads one channel's message history and writes
it to a local Markdown or JSON file. It is a read-only archiving tool. Nothing
else.

## What the bot does in your server

| It does | It does not |
|---|---|
| Read the name and type of the one channel you point it at | Post, reply, react, edit, or delete anything |
| Page through that channel's message history | Read any other channel |
| Write the results to a file on the operator's own machine | Read the member list, roles, audit log, or DMs |
| | Connect to voice, or stay connected at all |

The script is HTTP-only and short-lived: it makes a handful of `GET` requests,
writes a file, and exits. It never opens a gateway socket, so it is not present
in your server between runs and receives no live events.

## Permissions it needs

Two, and they can be scoped to a single channel rather than server-wide:

- **View Channel** — without it every request returns 403.
- **Read Message History** — without it, only messages posted after the bot
  joined are visible.

If you would rather grant nothing server-wide, add the bot with no permissions
at all and then add a channel-level permission overwrite on just the channel
being archived. The script will work fine and see nothing else.

## How to verify the claims above

Open `discord_export.py`. Every network call in the file funnels through one
function, `api_get`, which sets `method="GET"` itself — there is no other
request-issuing code, and no `POST`, `PATCH`, `PUT`, or `DELETE` anywhere in
the file. `grep` for them if you like. The endpoints it touches are listed at
the top of the file.

Before any messages are read, the operator can run:

```
python discord_export.py <channel_id> --check
```

which confirms the token and channel access and exits without reading a single
message. Good for a first handshake.

## Running it

Requires Python 3.9 or newer. No `pip install`, no dependencies beyond the
standard library.

```bash
export DISCORD_BOT_TOKEN='...'                 # PowerShell: $env:DISCORD_BOT_TOKEN = '...'
python discord_export.py <channel_id> --check                  # verify access only
python discord_export.py <channel_id> --format md -o channel.md
python discord_export.py <channel_id> --after <message_id>     # only what's new since
```

The token is read from the environment, never passed as a command-line argument
(which would leak it into shell history and the process list) and never printed
or written into the output file.

Get a channel ID by enabling **Settings → Advanced → Developer Mode** in
Discord, then right-clicking the channel and choosing **Copy Channel ID**.

## Limits worth knowing

- Messages inside **threads and forum posts** are not part of a channel's own
  history and will not be captured.
- Messages deleted before the export ran are gone; this reads current state.
- The bot's application must have the **Message Content** intent enabled, or
  Discord returns every message with an empty body. The script detects this and
  warns rather than silently writing a file full of blanks.
