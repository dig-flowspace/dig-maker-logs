# The shop's own BUSY Bar apps

Apps written here for [busybar-manager](https://github.com/maxswinkels/busybar-manager).
This folder is in the manager's app folders (`appsDirs`, Settings tab), so every
app in it shows up on the manager's Apps tab next to the library apps. A local
app wins over a library app with the same name.

| App | What it does |
|---|---|
| [step-aside](step-aside/app.py) | Touch the bar and your apps step aside, so its own menus work. Leave it alone and they come back, like a screensaver |

How an app here has to look, and the rules it should follow:
[writing-apps.md](../../hard-tools/busy-bar/writing-apps.md).

Apps that run on the bar itself are a different kind. They live next door, in
[`bar-apps/`](../bar-apps/README.md).
