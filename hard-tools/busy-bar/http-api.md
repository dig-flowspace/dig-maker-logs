# HTTP API

How to talk to the bar directly, written against API **27.14.0** (firmware
1.3.1). The bar serves its own complete spec, which always matches its firmware:

```powershell
curl.exe http://10.0.4.20/openapi.yaml -o busybar-openapi.yaml
```

That file is the authority. This page is the shop's map of it.

## Getting in

| Route | Base URL | Authentication |
|---|---|---|
| USB | `http://10.0.4.20/api/…` | None. "A USB connection is considered a secure communication channel" |
| Wi-Fi | `http://<the bar's IP>/api/…` | Off by default. In the bar's web page, Network tab, HTTP API: turn it on and set a password. Send the password as `X-API-Token` on every request |
| Cloud | `https://api.busy.app/busybar/…` | `Authorization: Bearer <token>`. Make the token in your BUSY account, with **BUSY Bar** as its access scope |

Over Wi-Fi without the header, the bar answers 403. The bar shows its own Wi-Fi
address under Settings, Wi-Fi, (the network), View IP Address. It can also mint
named access tokens that work in place of the password and can be revoked one at
a time (`/api/access/tokens`).

The spec marks some endpoints local-only: JavaScript apps, Wi-Fi setup, the live
stream, firmware upload, account linking. Presumably they don't work through the
cloud. They're marked ⌂ below.

Anything that reaches the API can do everything on this page, including
installing firmware and erasing smart-home links. USB is trusted by design.
Over Wi-Fi, keep a password on it or keep it off.

## Conventions

- JSON in and out. Success is `{"result": "OK"}`; failure is
  `{"error": "…", "error_code": "…"}`.
- Colours are `#RRGGBBAA`, alpha last, so opaque white is `#FFFFFFFF`.
- `application_name` is up to 32 characters of `a-z A-Z 0-9 . _ -`. It's an
  app's identity on the bar: drawing, clearing and assets are all keyed to it.

## Drawing

`POST /api/display/draw` is the call that matters. This is the community clock's
plain frame, with the priority the manager adds:

```json
{
  "application_name": "clock",
  "priority": 10,
  "elements": [
    { "id": "0", "type": "text", "text": "12:34:56",
      "x": 36, "y": 15, "align": "bottom_mid",
      "font": "extra_large", "color": "#FFFFFFFF" }
  ]
}
```

| Field | Notes |
|---|---|
| `application_name` | Required |
| `priority` | 1–100, default 50. Who wins the screen, and where the spec's own description of this is out of date: [sharing-the-screen.md](sharing-the-screen.md) |
| `led_notification_color` | Optional `#RRGGBBAA`. Blinks the status LED |
| `elements` | Required, at least one |

Every element has:

| Field | Notes |
|---|---|
| `id` | Required, `a-z A-Z 0-9 . _ -`. Draw the same id again to update it. An id can't change its type: that draw is refused with 400 |
| `type` | `text`, `image`, `animation`, `countdown`, `rectangle` or `xpmbitmap` |
| `x`, `y` | Where the anchor point goes, from the top-left. Default 0 |
| `align` | Which point of the element is the anchor: `top_left` `top_mid` `top_right` `mid_left` `center` `mid_right` `bottom_left` `bottom_mid` `bottom_right` |
| `display` | `front` (the default) or `back` |
| `z_index` | Higher draws on top |
| `timeout` | Seconds until it disappears; 0 means never. Or use … |
| `display_until` | … a Unix time (seconds) to disappear at |

What each type needs:

| Type | Required | Optional |
|---|---|---|
| `text` | `text`, printable ASCII only; `font` | `color`; `width` and `scroll_rate` (pixels a minute) for a scrolling label; `scroll_start_delay` and `scroll_repeat_delay` (ms) |
| `image` | `path` (your uploaded asset) or `stock_path` (`shared/…`) | `opacity` 0–100 |
| `animation` | `path` or `stock_path` | `section` (`default` plays it all), `loop`, `await_previous_end`, `opacity` |
| `countdown` | `timestamp` (Unix seconds, as a string); `direction`: `time_left` or `time_since`; `show_hours`: `when_non_zero` or `always` | `color` |
| `rectangle` | `width`, `height` | `radius`; `fill`: `none` `solid` `gradient_h` `gradient_v`; `fill_colors` (one, or two for a gradient); `border_width` (default 1); `border_color` |
| `xpmbitmap` | `data`: XPM2 source text, at most 32 colours, no bigger than the screen | `opacity` |

**Fonts.** They're bitmap fonts, hence ASCII only. Sizes in pixels, measured
on this bar's front screen 2026-11-11:

| Font | Digits are | `88:88` is | `Wednesday` is | Notes |
|---|---|---|---|---|
| `tiny` | 3 wide, 4 tall | 17 wide | 37 wide | |
| `small` | 3 wide, 5 tall | 17 | 37 | |
| `normal` | 5 wide, 7 tall | 25 | 47 | Thin strokes |
| `condensed` | 4 wide, 7 tall | 21 | 47 | `normal`'s letters with narrower digits |
| `bold` | 6 wide, 7 tall | 29 | 58 | Heavy strokes |
| `large` | 6 wide, 9 tall | 29 | 57 | Thin strokes |
| `extra_large` | 7 wide, 10 tall | 34 | 70 | Heavy, and capitals only: small letters draw as capitals |
| `global` | 5 wide, 7 tall | 25 | 48 | |
| `superscript` | 3 wide, 5 tall | 17 | 47 | Small digits beside `normal`'s letters |

Widths vary by character (`1` is narrower than `8`), with a one-pixel gap
between characters. Text drawn at `y` 0 from its top edge starts two rows
down, one row for `tiny` and `global`. Small letters with tails hang one or
two rows below the digits.

**How draws add up.** Each draw adds to what the app already has on screen.
A text element with a `width` is a window that wide, with the text at its
left edge; with a `scroll_rate` too, the bar slides longer text round and
round inside it. More of what was found by trying is in
[bar-apps.md](bar-apps.md), under "How the screen behaves".

**Clearing:** `DELETE /api/display/draw?application_name=<app>` removes that
app's elements. To remove only some, send a JSON body instead:
`{"application_name": "<app>", "element_ids": ["a", "b"]}`. The app's name
goes in the address or in the body, never both; the bar answers 400 to both
(seen here). Leaving the name out everywhere deletes the elements whoever
owns them (spec; not tried here).

**Refusals take time.** A draw that is outranked is held for a second and a
half before the bar answers 409 (seen here).

## Assets and sound

| Call | What it does |
|---|---|
| `POST /api/assets/upload?application_name=<app>&file=<path>` | Upload a file, sent as the raw body, into the app's own asset folder. Paths up to 64 characters; folders are made as needed. 413 if too big |
| `DELETE /api/assets/upload?application_name=<app>` | Delete all of that app's assets |
| `POST /api/audio/play` with `{"application_name", "path"}` or `"stock_path"` | Play a `.snd` file |
| `DELETE /api/audio/play` | Stop playback |

PNG works for images; the community clock uploads its icons as PNG. The official
docs cap a back-screen image at 255 KB.

## Reading the screen

`GET /api/screen?display=0` returns the front screen; `display=1` returns the
back. The response says `Content-Type: image/bmp`, but the body is **base64
text of raw pixels**, with no header:

| Screen | Decoded size | Layout |
|---|---|---|
| Front | 3456 bytes | 72 × 16, 3 bytes a pixel in **blue, green, red** order, rows top to bottom |
| Back | 6400 bytes | 160 × 80, 4 bits a pixel, **low nibble first**; 0 is black, 15 is white |

Checked on this bar 2026-11-11; busy-lib's README agrees on BGR.
[busybar_screens.py](../../soft-tools/scripts/busybar_screens.py) does the
decoding and saves both screens as PNG.

## Every endpoint

### System

| Call | What it does |
|---|---|
| `GET /api/version` | The API version, `api_semver` |
| `GET /api/status` | The four below, in one call |
| `GET /api/status/device` | Serial number and MAC addresses. Keep these out of the repo |
| `GET /api/status/firmware` | Firmware version and build, radio and Matter versions |
| `GET /api/status/system` | Uptime, boot time, the auto-update flag |
| `GET /api/status/power` | Charging state, battery %, voltages |
| `GET /api/transport` | `usb` or `wifi`: how you're connected |
| `POST /api/log_dump` | Write the bar's log buffer to `/ext/log.txt`, or `?filename=` |

### Display and input

| Call | What it does |
|---|---|
| `POST`, `DELETE /api/display/draw` | Draw, clear. Above |
| `GET /api/screen?display=0` or `1` | Capture a screen. Above |
| `GET`, `POST /api/display/brightness` | `0`–`100` or `auto`, for both screens |
| `POST /api/input?key=…` | Press a control: `up` `down` `ok` `back` `start`, or a mode: `busy` `custom` `off` `apps` `settings`. `up` and `down` are the wheel; `up` moves down a menu. The mode keys act like moving the selector, which then disagrees with where the real one sits until you send the real position |

### BUSY timer

| Call | What it does |
|---|---|
| `GET /api/busy/snapshot` | The timer right now: `NOT_STARTED`, or a running infinite, simple or interval timer with its time left and `is_paused` |
| `PUT /api/busy/snapshot` | Start the timer from a given state |
| `GET`, `PUT /api/busy/profiles/busy` (or `/custom`) | Read or replace a mode's profile: title, timer, theme, smart-home trigger |

### Settings

| Call | What it does |
|---|---|
| `GET`, `POST /api/name` | The device name, up to 20 characters |
| `GET`, `POST /api/audio/volume` | 0–100; `silent=1` skips the beep |
| `GET`, `POST /api/access` | Wi-Fi API access: `disabled`, `enabled` (presumably no password at all; avoid), or `key`, a 4–10 digit password |
| `GET`, `POST`, `DELETE /api/access/tokens`; `DELETE /api/access/tokens/{short_id}` | Named access tokens: list, create (the full token is shown once), revoke all, revoke one |

### Time

| Call | What it does |
|---|---|
| `GET /api/time` | The bar's clock, ISO 8601 with time zone |
| `POST /api/time/timestamp?timestamp=…` | Set the clock; the zone suffix is required |
| `GET`, `POST /api/time/timezone`; `GET /api/time/tzlist` | The time zone by name, and the list of names |

### Storage

Files live under `/ext`. Paths are letters, digits and `. _ -`.

| Call | What it does |
|---|---|
| `POST /api/storage/write?path=…` | Upload, sent as the raw body. `append=1` appends |
| `GET /api/storage/read?path=…` | Download |
| `GET /api/storage/list?path=…` | List a folder |
| `DELETE /api/storage/remove?path=…` | Delete a file |
| `POST /api/storage/mkdir?path=…` | Make a folder |
| `POST /api/storage/rename?path=…&new_path=…` | Move or rename a file |
| `GET /api/storage/status` | Used, free and total bytes |

### Firmware updates

| Call | What it does |
|---|---|
| `POST /api/update/check`, then `GET /api/update/status` | Look for an update, then poll the result |
| `GET /api/update/changelog?version=…` | What's in a version |
| `POST /api/update/install?version=…` | Download and install it. Refused when the battery is low |
| `POST /api/update/abort_download` | Stop a download |
| `GET`, `POST /api/update/autoupdate` | Auto-update on or off, and its `HH:MM` window |
| `POST /api/update` ⌂ | Upload a firmware `.tar` yourself |

### Wi-Fi, Bluetooth, smart home, account

| Call | What it does |
|---|---|
| `GET /api/wifi/status` | Connection state, with network details when connected |
| `POST /api/wifi/connect` ⌂, `POST /api/wifi/disconnect` ⌂, `GET /api/wifi/networks` ⌂ | Join, leave, scan |
| `GET /api/ble/status`, `POST /api/ble/enable`, `POST /api/ble/disable`, `DELETE /api/ble/pairing` | Bluetooth |
| `GET`, `POST`, `DELETE /api/smart_home/pairing` | Matter pairing: status; start (returns QR and manual codes); erase all, which reboots the bar |
| `GET`, `POST /api/smart_home/switch` | The bar's emulated Matter switch: its state, and its behaviour at startup |
| `GET /api/account/info`, `/api/account/status`, `/api/account/backend` | The linked BUSY account and its MQTT connection |
| `POST /api/account/link` ⌂, `DELETE /api/account` ⌂, `PUT /api/account/backend` ⌂ | Link, unlink, set the MQTT backend |

### On-bar JavaScript apps ⌂

| Call | What it does |
|---|---|
| `POST /api/apps/stage`, then `POST /api/apps/install?install_key=…` | Upload a `.tgz`, then install it with the key the first call returned |
| `GET /api/apps/list` | Installed apps |
| `POST /api/apps/launch?app_id=…`, `POST /api/apps/quit` | Run one, stop it. Launch is refused while a higher-priority app runs |
| `DELETE /api/apps?app_id=…` | Remove one, keeping its settings |
| `GET`, `PUT`, `DELETE /api/apps/settings?app_id=…` | An app's settings document: read, replace, reset |

### Live stream ⌂

`GET /api/status/ws` is a WebSocket. Send `{"enable": true}`, then receive
protobuf-encoded state updates, screen frames included. It takes a limited
number of clients. busy-lib's `StateStream` decodes it in a browser; the
manager's live mirror uses it.
