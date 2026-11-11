# busybar-manager

[maxswinkels/busybar-manager](https://github.com/maxswinkels/busybar-manager)
runs HTTP apps for the bar from one dashboard. It switches them on and off,
keeps presets of their settings, cycles several on a timer, schedules them by
the week, and installs new ones from the community library. It's a Node server
with no dependencies; the apps are Python. Unofficial community project, MIT.

**Status:** installed 2026-11-11 at commit 54a4f45, working against the bar over
USB. Started by hand; nothing starts it at login yet.

## Where things are

| What | Where |
|---|---|
| Checkout | `D:\guest-repos\busybar-manager`, outside the vault on purpose: its `node_modules` and the apps' Python environments would flood Obsidian |
| Settings | `config.json` in the checkout. Git-ignored; the dashboard writes it |
| Installed apps | `apps\<slug>\` in the checkout. An app with a `requirements.txt` gets its own `.venv` there |
| Dashboard | `http://127.0.0.1:8321`, this PC only. It has no login, so keep it that way |
| Python | The user variable `BUSYBAR_PYTHON` = `%LOCALAPPDATA%\Programs\Python\Python312\python.exe` |
| Launcher | [`soft-tools/scripts/start-busybar-manager.cmd`](../../soft-tools/scripts/start-busybar-manager.cmd) in the workshop |
| The shop's own apps | [`soft-tools/busybar-apps/`](../../soft-tools/busybar-apps/README.md) in the workshop, listed in the manager's app folders (`appsDirs`). Step Aside lives there |

## Run it

Step by step, with what you should see at each step:
[running-the-manager.md](running-the-manager.md). The short version: double-click
[`start-busybar-manager.cmd`](../../soft-tools/scripts/start-busybar-manager.cmd),
or run it from any terminal. It loads the Python setting itself, then runs
`node server.js` in the checkout.

**Ctrl+C** in its window stops it. Its shutdown stops the apps but doesn't clear
their frames, so look at the bar afterwards. Step 9 of the walkthrough clears
any leftovers.

To update: `git pull`, then `npm run build`, which rebuilds the dashboard.

## Why it's set up this way on Windows

The project is built on a Mac. Four things differ here:

1. **Python.** The manager runs apps with `python3`, which on Windows is the
   Microsoft Store shortcut, not Python. `BUSYBAR_PYTHON` points it at the real
   one. Terminals opened before the variable was set don't have it, and that
   includes VS Code's until VS Code restarts. Without it, every app crashes
   with "Python was not found". This line loads the saved setting into such a
   terminal:
   `$env:BUSYBAR_PYTHON = [Environment]::GetEnvironmentVariable("BUSYBAR_PYTHON", "User")`.
   The launcher does the same before it starts the manager.
2. **Stopping apps.** Windows has no SIGTERM, so a stopped app dies on the spot
   without running its own cleanup. Switching an app off in the dashboard is
   still clean, because the manager clears its frame afterwards. Stopping the
   whole manager isn't: its shutdown stops the apps without clearing their
   frames.
3. **Autostart.** Upstream's is a macOS menu-bar app plus a LaunchAgent. The
   Windows equivalent would be a Task Scheduler task at logon. Not set up.
4. **Build warnings.** `npm run build` reports a few "high severity" advisories.
   They're in build-time tools (Vite and friends), not in anything the running
   manager serves.

Upstream also ships a Docker setup (`docker compose up -d`). Not used here.

## The dashboard

| Tab | What it's for |
|---|---|
| **Apps** | Every app, with an on/off switch, a variation picker, restart, a live log, and who owns the screen. Scrollers are built here too |
| **Schedule** | A weekly timetable: pin an app, or a scroller, to a time window on chosen weekdays |
| **Controller** | Press the bar's buttons and mode selector from the browser |
| **Library** | Install, update and remove community apps |
| **Settings** | Where the bar is (`10.0.4.20` over USB), and any local app folders |

The header shows the connection and the battery. The device preview mirrors the
front screen live.

### Variations

A variation is a named preset for one app: its command-line options, its
environment variables and its priority. Switching variations restarts the app.
The options form is built from the app's own `--help`, so it offers exactly
what the app accepts. Saving changes to the variation that's already selected
doesn't restart the app; press **Restart** on its row.

### Scrollers

A scroller is a named cycle. Each app holds the bar for a few seconds, then
hands over to the next. It's the way to share the screen between apps. Running a
scroller doesn't flip the apps' own switches, and an app you switched on
yourself keeps running alongside. So switch a scroller's apps off by themselves,
or they'll fight it for the screen.

### Schedule

Weekly slots, each a `[start, end)` window on one or more weekdays, never
overlapping on a shared day. The scheduler only touches what its own slots name,
and it uses this PC's local time. A master switch pauses the lot.

## Step Aside

The shop's own app, in
[`soft-tools/busybar-apps/step-aside/`](../../soft-tools/busybar-apps/step-aside/app.py).
It draws nothing. It listens, through the manager, to the bar's buttons, wheel
and selector. When you touch the bar, it switches off every scroller and app the
manager is showing, and pauses the schedule, so the bar's own menus are yours.
Once the bar has been left alone for a while, it switches them all back on. It's
the fix for apps covering the menus; why that happens is in
[sharing-the-screen.md](sharing-the-screen.md).

| Option | Default | What it does |
|---|---|---|
| Idle minutes (`--idle`) | 3 | How long the bar must be left alone before your apps come back |
| Show in Sleep (`--show-in-sleep`) | off | Bring apps back even while the selector is on Sleep |
| Leave alone (`--leave-alone`) | empty | Apps or scrollers never to switch off, comma-separated. Put any app that uses the bar's buttons itself here, such as Claude Approve |

Worth knowing:

- **Tested 2026-11-11.** A BACK press switched the scroller off within a second,
  and the APPS menu stayed put. A minute later (a test setting) the scroller came
  back by itself. The Sleep rule hasn't been tried with the physical selector
  yet.
- It learns the selector's position only when the selector moves. Firmware 1.3.1
  can't report it.
- It records what it switched off in
  `%LOCALAPPDATA%\busybar-step-aside\aside.json`, so a restart can still put
  things back.
- **Switching Step Aside off while your apps are aside leaves them off.** Windows
  stops it too abruptly to tidy up. Switch them back on yourself, or they return
  the next time Step Aside runs and the bar is left alone.

## The library: read before you run

Library apps are other people's Python scripts, and they run as you: your files,
your network, your logins. The manager doesn't sandbox them. Read an app's
`app.py` before switching it on. Worth knowing from the catalogue:

- **claude-limits** reads Claude Code's login token (read-only, it says) to
  fetch your usage.
- **busybar-codex** downloads its real program from GitHub every time it starts.
- Several apps are Mac-only underneath: anything that drives iTerm2, Music, or
  the Codex Mac app.

An installed app lands in `apps\<slug>\` with a `.busybar-library.json` that
records the exact commit. Updates are offered, never forced.

## Its API

The manager is also a proxy. Anything under `/api/` that isn't `/api/_manager/`
goes straight to the bar; that's how apps reach the bar through
`--host 127.0.0.1:8321`. Its own endpoints, handy from a script:

| Call | What it does |
|---|---|
| `GET /api/_manager/state` | Everything: apps, status, screen owner, the bar's connection |
| `POST /api/_manager/apps/<slug>/enable`, `/disable`, `/restart` | Switch an app |
| `POST /api/_manager/library/install` with `{"slug": "clock"}` | Install from the library. The app arrives switched off |
| `GET /api/_manager/apps/<slug>/log` | The last ~500 log lines |
| `GET /events` | Live updates, as server-sent events |

The full list is in the upstream README and `docs/CONTRACT.md`.

## When it goes wrong

| What you see | Why | Fix |
|---|---|---|
| An app says *blocked* | Something with a higher priority owns the screen, usually a running BUSY session | Wait for the session to end, or raise the variation's priority. See [sharing-the-screen.md](sharing-the-screen.md) |
| Every app says *blocked* and the bar is playing Attract Mode | An app running on the bar outranks the manager's priority 10 | End the show with BACK on the bar. The two do the same job; run one or the other ([attract-mode.md](attract-mode.md)) |
| Two apps flicker, or one never shows | Same priority, one screen | A scroller |
| Apps show *crashed*, and their logs say Python was not found | The manager was started from a terminal without `BUSYBAR_PYTHON` | Stop it, then start it with the launcher (step 2 of [running-the-manager.md](running-the-manager.md)) |
| A scroller runs, but nothing shows | Its apps are crashing (see above), or they're also switched on by themselves and fighting it | Fix Python; switch the apps' own switches off |
| Apps cover the bar's menus, and BACK only helps for a moment | Step Aside isn't running | Switch Step Aside on (Apps tab) |
| The dashboard won't load | The manager isn't running | `node server.js` |
| A frozen frame on the bar | The manager stopped while apps were on; on Windows that leaves frames behind | Step 9 of [running-the-manager.md](running-the-manager.md) |
| `node server.js` fails with `EADDRINUSE` | Another manager, or the Docker one, holds 8321 | Stop the other one |
