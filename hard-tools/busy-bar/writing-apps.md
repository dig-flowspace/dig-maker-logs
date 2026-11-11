# Writing apps

How to write an HTTP app the manager can run. Apps that live on the bar itself
are a different animal; see [bar-apps.md](bar-apps.md).

**Status:** the contract below is read from the manager's source and README
(54a4f45) and from the library's apps. The shop's one app for the manager so
far, Step Aside, draws nothing. The first one that draws should be a real app
worth keeping, built so each step teaches one thing, and it becomes this
page's worked example. The bar-app side already has one:
[Attract Mode](attract-mode.md).

## The shape

A folder, named for the app. The name is its *slug*.

```text
my-app/
  app.py            the program; takes --host
  manifest.yaml     name, description, tags
  requirements.txt  optional; gets the app its own .venv
  .env.example      optional; declares environment variables
```

| File | What the manager does with it |
|---|---|
| `app.py` | Runs `python app.py --host 127.0.0.1:8321 <the variation's options>` from the app's folder, with the variation's environment variables set and `PYTHONUNBUFFERED=1`, so the log arrives live |
| `manifest.yaml` | Reads `name`, `description` and `tags`. Without it, the name is the folder's and the description comes from `app.py`'s docstring. Library apps also carry `author`, `preview` and `repo` |
| `requirements.txt` | Makes a `.venv` in the folder and `pip install`s into it before the first start, and again whenever the file changes |
| `.env.example`, `env.example` or `.env.sample` | Each `KEY=value` line becomes an environment field in the variation editor, with the comment lines above it as help |

## Options become controls

The manager runs `app.py --help` and turns the argparse options into a form:

| In argparse | On the dashboard |
|---|---|
| `action="store_true"` | A switch |
| `choices=[…]` | A dropdown |
| `metavar="0-100"`, a range | A slider over that range |
| Anything else | A text box, with the default filled in |

`--host`, `--token`, `--test` and `--help` never appear; the manager owns them.
Once the app has a `.venv`, the `--help` run happens inside it, so the imports
must succeed for the options to show up.

## Rules of the road

1. **Take `--host`, default `10.0.4.20`.** Then the same app runs on its own
   over USB, and under the manager through its proxy, unchanged.
2. **Pick one `application_name` and keep it.** The folder name is best. The
   manager works out which app drew what from it, and clearing is keyed to it.
3. **Don't fight over priority in code.** The manager overrides it on every
   draw: 10, unless the variation says otherwise. A priority you send only
   matters when the app runs alone.
4. **Expect 409, and carry on.** It means something outranks you right now. Try
   again next tick; don't exit.
5. **Clean up on the way out.** Catch SIGTERM and Ctrl+C, then
   `DELETE /api/display/draw?application_name=…`. On Windows the app is killed
   outright and never gets there, and the manager clears for it. On a Mac or
   Linux, it's the app's job.
6. **Redraw, or set timeouts.** An app that redraws every second recovers from
   anything. One that draws once should give its elements a `timeout`, so a
   crash doesn't leave a frozen frame.
7. **Printable ASCII only** in text. The fonts are bitmaps.
8. **Standard library if you can.** No `requirements.txt` means no `.venv` and
   no pip, so the app starts instantly.
9. **Let BACK win.** A short BACK, or a move of the selector, closes your frame
   on the bar. Redraw straight away and you've taken the bar back from whoever
   pressed it. The buttons stream over `/api/status/ws`; listen there, as
   Claude Approve and countdown do, and stay quiet until there's something new
   to say. Step Aside's
   [`app.py`](../../soft-tools/busybar-apps/step-aside/app.py) has a
   stdlib-only WebSocket client, and a decoder for the buttons, wheel and
   selector using Flipper's field numbers, to start from.

## The model: the community clock

`apps\clock\app.py` in the manager's checkout (from busybar-apps, MIT) follows
every rule above in plain Python:

- argparse with `--host` defaulting to `10.0.4.20`, plus real options
  (`--no-seconds`, `--color`, `--date`, `--icon` …) that turn into dashboard
  controls.
- `draw()` posts to `/api/display/draw` with a fixed `application_name`, using
  nothing but `urllib`.
- `tick()` draws once a second. On a 409 it prints "display busy (409),
  retrying..." and keeps going.
- A SIGTERM handler sets a stop flag, and a `finally:` clears the app's
  elements.
- Its 16 × 16 icons are generated in code, uploaded once at start through
  `/api/assets/upload`, then drawn as `image` elements.

The core of it, trimmed:

```python
def draw(elements, **extra):
    body = {"application_name": APP, "elements": elements, **extra}
    req = urllib.request.Request(
        BASE + "/api/display/draw",
        data=json.dumps(body).encode(),
        method="POST",
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=5):
        pass


def tick():
    now = time.localtime()
    try:
        draw(build_elements(now))
    except urllib.error.HTTPError as exc:
        if exc.code != 409:
            raise
        print("display busy (409), retrying...")
```

## Trying things out

- **See the result:** `python soft-tools/scripts/busybar_screens.py` saves both
  screens as PNG ([the script](../../soft-tools/scripts/busybar_screens.py)).
- **Without the bar:** [busybar-emulator](https://github.com/maxswinkels/busybar-emulator)
  is a local stand-in with the same API and fonts. Point `--host` at it
  (`127.0.0.1:8080`).
- **Through the manager while developing:** add your working folder to the app
  folders in the manager's Settings tab (`appsDirs` in `config.json`). A local
  app wins over a library app with the same name.
