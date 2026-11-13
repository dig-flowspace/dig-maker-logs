# The shop's own apps for the bar itself

Apps that live on the BUSY Bar and run there, with the PC off if need be. They
show up in the bar's APPS menu. The apps the manager runs on this PC are a
different kind and live next door, in [`busybar-apps/`](../busybar-apps/README.md).

| Here | What it is |
| --- | --- |
| [`shop.attract-mode/`](shop.attract-mode/scripts/main.js) | Attract Mode: a show for the front screen. Clock, date, a message, a pinball scene |
| [`shop.morning-sit/`](shop.morning-sit/scripts/main.js) | Morning Sit: an interval timer for breath-counting practice. Rounds of counting and breaks, six weeks of them, marked by a bell |
| [`check_app.mjs`](check_app.mjs) | Runs an app on the PC against a stand-in for the bar, and checks every request it makes |
| [`check_morning_sit.mjs`](check_morning_sit.mjs) | Checks Morning Sit's plan against its six-week table, looks for jumps in brightness, and prints any moment of its picture as text |
| [`make_art.py`](make_art.py) | Draws Attract Mode's pictures from text, one character a pixel |
| [`make_bell.py`](make_bell.py) | Makes Morning Sit's bell from sine waves, in the one sound format the bar plays |

Each app is one folder, named for its id. The folder is the package: the bar
gets exactly what is in it.

After changing an app:

```powershell
node soft-tools/bar-apps/check_app.mjs soft-tools/bar-apps/shop.attract-mode
python soft-tools/scripts/busybar_app.py install soft-tools/bar-apps/shop.attract-mode --launch
```

For Morning Sit, give the checker time for a whole sit, and run its own
check as well:

```powershell
node soft-tools/bar-apps/check_app.mjs soft-tools/bar-apps/shop.morning-sit --seconds 2300
node soft-tools/bar-apps/check_morning_sit.mjs
```

How to use Attract Mode, and how it's built:
[attract-mode.md](../../hard-tools/busy-bar/attract-mode.md). What was decided
for Morning Sit, and the notes from building it:
[apps/morning-sit/](../../hard-tools/busy-bar/apps/morning-sit/build-notes.md).
What a bar app can do, and how the bar's screen behaves:
[bar-apps.md](../../hard-tools/busy-bar/bar-apps.md).
