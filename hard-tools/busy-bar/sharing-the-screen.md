# Sharing the screen

One front screen, and many things that want it: the bar's own modes and apps,
plus every app the manager runs. The firmware settles it with a priority number
from 1 to 100. Its spec (1.3.1) puts the rule like this:

> A draw request is accepted when its priority is greater than or equal to (>=)
> the priority of the currently running system app. Equal-priority requests
> from a different application_name override whatever is on screen. System app
> priority levels: stub/poweroff apps = 0 (always preemptable), any standard
> built-in app = 10, active BUSY/CUSTOM work session = 90.

**On 1.3.1 that text is out of date in three places,** according to people who
measured it:

- **A BUSY or CUSTOM session blocks every draw,** at any priority up to 100,
  whether it's running or paused. The firmware's own tests give a session
  priority 101. (Firmware issue
  [#1120](https://github.com/busy-app/busybar-firmware/issues/1120), confirmed
  there on API 27.14.0, the same as this bar.)
- **A running app from the APPS menu** (Clock, Weather, this shop's Attract
  Mode) needs priority 51 or more, up from 11 on firmware 1.2.4. (#1120. Seen
  here against Attract Mode, which draws at 50 as Flipper's Clock does: a PC
  draw at 50 was refused, and one at 51 took the screen and wiped the app's
  elements.)
- **Between HTTP apps, the one on screen keeps it.** Another app needs a
  strictly higher priority, and then it wipes every element the old owner had.
  At equal priority the bar holds the draw for 1.5 s, then answers 409.
  ([busybar-wm](https://github.com/viirtualp1/busybar-wm)'s measurements on a
  real bar, in its `docs/display-server.md`. The 1.5 s hold was seen here too,
  for draws at 50, 40 and 10 against a running app.)

A refused draw comes back as HTTP **409**, "Not drawn due to low priority". The
manager shows that as *blocked*. The official docs don't cover any of this.

## What beats what, on this bar

| What the bar is doing | An app at 10 … | Source |
|---|---|---|
| Sleep | takes the screen | Seen here, 2026-11-11 |
| A menu (Apps, Settings), or BUSY/CUSTOM before you start a session | takes the screen | Seen here, 2026-11-11 |
| An app from the APPS menu running (Clock, Weather, Attract Mode) | gets 409; it needs 51 or more | Seen here with Attract Mode; #1120 |
| A BUSY or CUSTOM session, running or paused | gets 409, at any priority | Seen here; #1120 |
| Another HTTP app on screen | gets 409, unless strictly higher | busybar-wm |

The first time the manager ran here, every clock frame came back 409 while a
BUSY session was on. On this firmware, nothing gets past a session.

## BACK and the selector take the screen back, briefly

Press **BACK** while an app's frame is up and the bar closes the app layer: it
wipes the app's elements and goes back to its own screen. Moving the selector
does the same. (busybar-wm, measured on a real bar.)

But an app that keeps redrawing (the clock every second, pinball many times a
second) puts its frame straight back. That's why a running scroller seems to
hijack the menus: BACK works, then its effect is undone a moment later. The
manager doesn't read the bar's buttons, so it never knows you pressed BACK.

### What others do about it

- **Draw only when there's something to say.** busybar-wm shows "the Bar's own
  screen when nobody has anything to say": an app marks itself *idle* or
  *urgent*, and idle frames show only when nothing else wants the screen.
  Claude Approve draws a card only while a prompt is waiting.
- **Treat BACK as the user's.** The bar's buttons stream over its status
  WebSocket (`/api/status/ws`), and these apps listen to it. In busybar-wm,
  BACK means "back to automatic". Claude Approve "hands the question back to
  the screen". [SprintTicker](https://github.com/Istalry/SprintTicker) lets
  BACK dismiss a prompt.
- **Follow the selector.** Firmware issue
  [#959](https://github.com/busy-app/busybar-firmware/issues/959) asks for the
  selector's position, so apps can decide "whether to render the updates -
  based on the switch position". Selector moves already stream over the same
  WebSocket. Reading the current position is in an open pull request
  ([#1007](https://github.com/busy-app/busybar-firmware/pull/1007)), not in
  1.3.1.
- **Keep always-on things on the bar itself.** The bar's own Clock and Weather,
  and JavaScript apps installed from `.tgz` files, live in the APPS menu. You
  open them with the controls and BACK exits. Nothing to fight over.

busybar-manager does none of these by itself. A running app or scroller keeps
drawing at a fixed priority, whatever you press.

**What this shop does:** two things, one for each side.

- For the manager's apps: Step Aside, an app the manager runs, adds the second
  and third ideas. Any touch on the bar switches the manager's apps off, and
  they come back after a few idle minutes, except on Sleep. Details in
  [manager.md](manager.md).
- For an always-on show: [Attract Mode](attract-mode.md) follows the fourth
  idea. It lives on the bar, so BACK and the selector work the way they do for
  any app in the APPS menu. While it runs, the manager's apps (priority 10)
  are refused; run one or the other.

## Priority in the manager

The manager stamps every draw with the priority of the app's current variation,
**10** unless you change it, and ignores whatever the app itself asked for. Its
source explains the low default: "so anything started by hand outside the
manager (which draws at whatever the app itself declares, normally higher) takes
the screen without a fight."

Outside the manager, a draw that sends no priority gets the API's default, 50.

| Set it to | For | Shows over |
|---|---|---|
| **1–9** | Things that should show only while the bar sleeps | Sleep only. In the menus it gets 409 (seen here at 9) |
| **10** | Background apps: a clock, pinball | Sleep, the menus and idle modes |
| **11–50** | Alerts that should land on top of background apps | The above, plus lower-priority HTTP apps |
| **51–100** | Alerts that must also beat a running built-in app | All of the above. Still never a session |

## Two apps, one screen

Two apps at the same priority don't share. Whichever drew first keeps the
screen, and the other gets 409 until the first one stops. To share:

- **A scroller** (manager, Apps tab, *+ Add Scroller*): each app gets the bar
  for a few seconds, then hands over. The clean fix.
- **The schedule**: give each app its own hours.
- **Different priorities**, when one should simply win.

## Keeping the bar dark

Sleep can't hold the screen against an app. It sits at priority 0, and the
lowest an app can draw at is 1. The manager doesn't follow the selector either,
so it keeps drawing. Seen on this bar 2026-11-11: the selector on Sleep, and
the scroller still showing.

For a dark bar, stop the drawing:

- **With Step Aside running, move the selector to Sleep.** The move switches
  the apps off, and Step Aside won't bring them back while the selector stays
  there.
- **Switch the scroller or app off** on the Apps tab. The manager stops the app
  and clears its frame, unless you've also switched that app on by itself.
- **Give it hours** on the Schedule tab, and switch its own switch off. It then
  runs only inside its slots, and Sleep stays dark the rest of the time.
- **Stop the manager**, then clear any leftover frame (step 9 of
  [running-the-manager.md](running-the-manager.md)).

## Frames that won't leave

An element stays until its app deletes it or its own timeout runs out. Usually
that's handled:

- An app clears its elements when it stops. On Windows it doesn't get the
  chance: there's no SIGTERM, so a stop kills the process outright. When you
  switch an app off in the dashboard, the manager clears the frame for it.
- When the **manager itself** stops, it clears nothing. That goes for a proper
  Ctrl+C as much as a closed window: its shutdown stops the apps without
  clearing their frames, and on Windows the apps are cut off before they can
  clear their own. Each running app's last frame stays on the bar, frozen.

With nothing left drawing, a short press of **BACK** on the bar should clear it:
BACK closes the app layer (busybar-wm, measured; not tried here). Or send one
request per app, using the name the app draws under (usually its folder name).
In PowerShell, type `curl.exe`; plain `curl` is a different command there:

```powershell
curl.exe -X DELETE "http://10.0.4.20/api/display/draw?application_name=clock"
```

Step 9 of [running-the-manager.md](running-the-manager.md) clears every
installed app's frame in one go.

Elements can also expire on their own: `timeout` (seconds) or `display_until` (a
Unix time) on each element. An app that sets a short timeout and redraws faster
than that leaves nothing behind when it dies.
