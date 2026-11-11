# Running the manager, step by step

From a cold start to apps on the bar, and back to a clean stop. Every command is
for PowerShell. Each step says what you should see, so you know it worked before
moving on.

The one-time setup is already done on this PC. Skip to *Every time* below, or
work through the setup to check it or to rebuild on another machine.

## One-time setup

Already done here on 2026-11-11.

1. **Node.js 22 or newer.** Run `node --version`. You should see `v22` or
   higher; this PC has v24.

2. **Python 3.** Run `py -0p`. You should see each installed Python and its
   path. Note the path of the one you want the apps to use. This PC uses 3.12.

3. **Get the manager.**

   ```powershell
   git clone https://github.com/maxswinkels/busybar-manager.git D:\guest-repos\busybar-manager
   ```

4. **Build the dashboard.**

   ```powershell
   cd D:\guest-repos\busybar-manager
   npm run build
   ```

   It should finish with `✓ built in …`. It also reports a few "high severity
   vulnerabilities". Those are in the build tools, not in anything the manager
   serves.

5. **Point it at Python.** On Windows, the `python3` the manager would use is a
   Microsoft Store shortcut, not Python. This sets the real one for your user
   account; swap in your path from step 2 if it differs:

   ```powershell
   [Environment]::SetEnvironmentVariable("BUSYBAR_PYTHON", "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe", "User")
   ```

   Then close that terminal. The setting only reaches terminals opened after it.

## Every time

### 1. Plug in the bar

Connect it with USB-C. Then open `http://10.0.4.20/api/version` in a browser.

**You should see** `{"api_semver":"27.14.0"}`, or a higher number if the bar has
updated itself.

If the page won't load, check the cable. Windows should list a *Flipper FZCO
Network Interface* among its network adapters.

### 2. Start the manager

In the workshop folder, double-click `soft-tools\scripts\start-busybar-manager.cmd`.
Or run it from any terminal, VS Code's included:

```powershell
D:\the-workshop\soft-tools\scripts\start-busybar-manager.cmd
```

The launcher loads the Python setting itself, and that matters. The manager
finds Python through `BUSYBAR_PYTHON`, and a terminal opened before that was
saved doesn't have it; VS Code's terminals stay that way until VS Code restarts.
Start the manager by hand from one of those, and every app crashes before it
draws anything, with "Python was not found" in its log.

### 3. Check that it started

A window titled **BUSY Bar manager** opens. **You should see:**

```text
Apps will run with: …\Python312\python.exe
Dashboard: http://127.0.0.1:8321    Stop: Ctrl+C in this window

[…] busybar-manager listening on 127.0.0.1:8321 (bar=http://10.0.4.20:80, appsDirs=[…])
```

That window *is* the manager. Leave it open; the manager stops when it closes.
Any app you left switched on starts by itself.

If the window shows an error containing `EADDRINUSE` instead, a manager is
already running, probably in another window. Use that one, or stop it first.

**By hand, without the launcher:** load the setting, then run node directly.
Not `npm start`: node alone is one process, so Ctrl+C reaches it cleanly.

```powershell
$env:BUSYBAR_PYTHON = [Environment]::GetEnvironmentVariable("BUSYBAR_PYTHON", "User")
cd D:\guest-repos\busybar-manager
node server.js
```

### 4. Open the dashboard

Go to `http://127.0.0.1:8321`.

**You should see** the dashboard: a connection indicator and the bar's battery in
the header, and a preview that mirrors the bar's front screen live.

If you get a plain-text note about building the dashboard instead, run
`npm run build` once (setup step 4), then reload.

### 5. Put an app on the bar

On the **Apps** tab, switch an app on and watch the bar.

**You should see** the app on the bar within a few seconds, and its row showing
it owns the screen.

If its row says *blocked*, something on the bar outranks it, usually a running
BUSY or CUSTOM session. End the session or wait it out, and the app comes in by
itself. [device.md](device.md) has what each mode does to apps.

Only one app shows at a time. Switch on two at the same priority and the first
keeps the screen, while the other shows *blocked*; step 6 has the fix.

**Step Aside keeps the bar's own menus usable** while apps run. Touch the bar (a
button, the wheel or the selector) and whatever the manager is showing steps
aside. Leave the bar alone for 3 minutes and it all comes back, except while the
selector is on Sleep. It's on the Apps tab like any other app; there's more in
[manager.md](manager.md).

### 6. Tune an app, or share the screen

- **Change how an app looks:** pick its options, save them as a *variation*,
  and choose **Select & restart**. Changing the variation that's already
  selected? **Save** doesn't restart the app and *Select & restart* is greyed
  out, so press **Restart** on the app's row to apply the change.
- **Show several apps in turn:** first switch **off** the apps' own switches.
  A scroller never touches them, and an app that's on by itself keeps running
  alongside the scroller and fights it for the screen. Then, on the Apps tab,
  use **+ Add Scroller**. Give it a name and a number of seconds per app, add
  each app once, save, and switch the scroller on. Each app gets the bar for
  its turn, then hands over.

### 7. Get more apps

On the **Library** tab, pick an app, but read its code before you install it:
library apps are other people's Python, and they run as you. Each one's code is
at `github.com/maxswinkels/busybar-apps`, under `apps/<its name>/`. Then
**Install**. It arrives switched off; switch it on from the Apps tab.

**Install** here means "download to this PC", into the manager's `apps` folder.
The program is never copied to the bar. It won't show up in the bar's APPS
menu, and it draws only while the manager is running. The bar's own apps are a
different kind: see "Three kinds of app" in [device.md](device.md).

### 8. Stop the manager

Click into the manager's window and press **Ctrl+C**.

**You should see** two more lines:

```text
[…] received SIGINT, stopping apps...
[…] apps stopped, exiting.
```

If you started it with the launcher, the window then asks
`Terminate batch job (Y/N)?`. Press **Y** and the window closes. Started by
hand, you just get the prompt back.

Don't close the window with its X. That kills the manager without even that
much.

Then look at the bar. The manager's shutdown stops the apps but doesn't clear
their frames, and on Windows the apps are cut off before they can clear their
own. So the last frame can stay behind, frozen. If it did, do step 9.

### 9. Clear leftover frames

```powershell
Get-ChildItem D:\guest-repos\busybar-manager\apps -Directory | ForEach-Object {
  curl.exe -s -X DELETE "http://10.0.4.20/api/display/draw?application_name=$($_.Name)"
}
```

**You should see** `{"result":"OK"}` once for each installed app.

This clears every installed app's frame, because apps draw under their folder
names. It's safe to run any time; with the manager running, the apps simply
redraw. An app that draws under some other name needs its own line, with the
name its `app.py` uses.

## Updating

1. Stop the manager (step 8).
2. In `D:\guest-repos\busybar-manager`, run `git pull`, then `npm run build`.
3. Start it again (step 3).

That updates the manager itself. Library apps update separately: the Apps tab
shows an *update available* chip and an Update button.

## Not set up yet

Nothing starts the manager at login, so it only runs while its window is open.
Upstream's autostart is macOS-only; on Windows the equivalent would be a Task
Scheduler task at logon.

For anything else that goes wrong, see "When it goes wrong" in
[manager.md](manager.md).
