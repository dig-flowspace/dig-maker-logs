# BUSY Bar — shop reference

The BUSY Bar is Flipper Devices' desk status light: a 72 × 16 RGB LED screen on
the front, a small OLED on the back, a mode selector, a wheel and two buttons on
top, and an HTTP API that lets any program on this PC draw on it. This folder is
what the shop knows about it: what the controls do, how the screen gets shared,
how to run community apps through busybar-manager, and how to talk to the bar
directly.

**Status:** first pass, 2026-11-11. Every fact here was checked against the bar
itself (firmware 1.3.1, API 27.14.0) or a published source, named on each page.
What only the bar in your hands can settle is marked *untested*.

## The pages

| Page | Open it when |
|---|---|
| [running-the-manager.md](running-the-manager.md) | You want apps on the bar: every step, from a cold start to a clean stop |
| [device.md](device.md) | You want to know what a control or a mode does |
| [sharing-the-screen.md](sharing-the-screen.md) | An app says *blocked*, two apps fight, or a frame won't go away |
| [manager.md](manager.md) | You're running apps: start, stop, update, troubleshoot |
| [http-api.md](http-api.md) | You're talking to the bar directly |
| [writing-apps.md](writing-apps.md) | You're building an app of your own, to run on this PC |
| [bar-apps.md](bar-apps.md) | You want an app that lives on the bar and runs with the PC off |
| [attract-mode.md](attract-mode.md) | You're using or changing Attract Mode, the shop's own show for the front screen |

## Quick facts

| | |
|---|---|
| The bar over USB | `http://10.0.4.20` — no password over USB, by design |
| Its own API spec | `http://10.0.4.20/openapi.yaml` — always matches its firmware |
| Its own web page | `http://10.0.4.20/` |
| Firmware / API | 1.3.1 / 27.14.0 when this was written; auto-update is on |
| Start the manager | Double-click `soft-tools/scripts/start-busybar-manager.cmd` ([the launcher](../../soft-tools/scripts/start-busybar-manager.cmd)) |
| Manager dashboard | `http://127.0.0.1:8321`, while the manager is running |
| Menus usable while apps run | Step Aside, on the manager's Apps tab ([manager.md](manager.md)) |
| A show with no PC | Selector on Apps, then Attract Mode, then Start ([attract-mode.md](attract-mode.md)) |
| Put a bar app on the bar | `python soft-tools/scripts/busybar_app.py install <its folder> --launch` ([the script](../../soft-tools/scripts/busybar_app.py)) |
| Manager checkout | `D:\guest-repos\busybar-manager` |
| See both screens | `python soft-tools/scripts/busybar_screens.py` ([the script](../../soft-tools/scripts/busybar_screens.py)) |

The bar updates itself. Before trusting [http-api.md](http-api.md), check that
`http://10.0.4.20/api/version` still says 27.14.0. If it doesn't, the bar's own
`openapi.yaml` is the truth.

## Untested

Things the firmware's spec predicts that nobody has watched happen yet:

- **What a BUSY session leaves behind.** An app that redraws every second comes
  back when the session ends. One that drew once and stopped might not.

And one thing tried only from the PC:

- **Attract Mode with the real controls.** Every press in its tests was sent
  through `POST /api/input`: the wheel, BACK, and the selector moving off Apps
  and back. The real buttons, wheel and selector should do the same.

## Sources

- Official docs, read 2026-11-11: [docs.busy.app/bar](https://docs.busy.app/bar)
  — basics/controls, modes, tech-specs, apps-and-integrations, dev/http-api.
- Firmware source at tag 1.3.1:
  [busy-app/busybar-firmware](https://github.com/busy-app/busybar-firmware/tree/1.3.1)
  — the OpenAPI spec under `applications/services/web_server/openapi/`, and
  `documentation/JavaScript Applications.dox.md`.
- The bar's own `openapi.yaml` (27.14.0), fetched over USB.
- [busy-app/busy-tools](https://github.com/busy-app/busy-tools), Flipper's
  tooling for bar apps — how a package is packed and installed.
- [maxswinkels/busybar-manager](https://github.com/maxswinkels/busybar-manager)
  at commit 54a4f45 — its README, `docs/CONTRACT.md` and `server.js`.
- [maxswinkels/busybar-apps](https://github.com/maxswinkels/busybar-apps) (MIT)
  and [maxswinkels/busybar-emulator](https://github.com/maxswinkels/busybar-emulator).
- [@busy-app/busy-lib](https://www.npmjs.com/package/@busy-app/busy-lib) 0.17.0,
  its README — the screen frame format.
- Other people's measurements and fixes: firmware issues
  [#1120](https://github.com/busy-app/busybar-firmware/issues/1120) (priority on
  1.3.1) and [#959](https://github.com/busy-app/busybar-firmware/issues/959) /
  [#1007](https://github.com/busy-app/busybar-firmware/pull/1007) (reading the
  selector), [busybar-wm](https://github.com/viirtualp1/busybar-wm)'s
  `docs/display-server.md` (how a real bar settles conflicts, and what BACK
  does), and [SprintTicker](https://github.com/Istalry/SprintTicker).

The manager, the app library and the emulator are unofficial community projects,
not Flipper's. "BUSY Bar" is Flipper Devices' trademark.
