# Morning Sit: build notes

Working notes for the app. What was decided, and why, is in
[feature-review.md](feature-review.md). This page says where the app is, what
it does as built, what was filled in along the way, what nobody has seen on
the bar yet, and which numbers are there to be tuned.

**Status:** version 0.1.1, on the bar since 2026-11-13. Morning Sit itself has
**not been run there yet**. A throwaway copy with short times has: Sit
Rehearsal (`shop.sit-rehearsal`), the same code with every screen and bell
going by in four and a half minutes. Dan ran it once that afternoon, at 0.1.0,
and passed it with one change: "Bell is good. Make the breath a bit wider,
slightly more intense, otherwise the rehearsal was perfect." 0.1.1 is that
change, and nobody has looked at it yet. The rehearsal copy comes off the bar
when the tuning is done. Sit Test, the throwaway from the tests, is off.

## Where it is

The source is in
[`soft-tools/bar-apps/shop.morning-sit/`](../../../../soft-tools/bar-apps/shop.morning-sit/scripts/main.js),
beside Attract Mode, where the shop's registry puts apps for the bar. That
folder is the package: the bar gets exactly what is in it.

| File | What it is |
| --- | --- |
| `scripts/main.js` | The runner: keeps the sit's clock, rings the bell, listens to the controls, sends the picture |
| `scripts/programme.js` | The six weeks, and one sit laid out in time: phases, bell strikes |
| `scripts/picture.js` | What the LEDs show at any moment. All the brightness numbers are at the top |
| `scripts/bar.js` | The calls to the bar: draw, remove, clear, settings, play, stop playing |
| `appmeta/settings.json` | The five Setup rows |
| `sounds/bell.snd` | The bell, 6 seconds. The same file, byte for byte, that Dan heard in the tests |

Beside it in `soft-tools/bar-apps/`:
[`make_bell.py`](../../../../soft-tools/bar-apps/make_bell.py) makes the bell,
and [`check_morning_sit.mjs`](../../../../soft-tools/bar-apps/check_morning_sit.mjs)
checks the plan and the picture.

```powershell
# check it on the PC
node soft-tools/bar-apps/check_app.mjs soft-tools/bar-apps/shop.morning-sit --seconds 2300
node soft-tools/bar-apps/check_morning_sit.mjs

# put it on the bar after a change
python soft-tools/scripts/busybar_app.py install soft-tools/bar-apps/shop.morning-sit

# take the rehearsal copy off, when the tuning is done
python soft-tools/scripts/busybar_app.py remove shop.sit-rehearsal

# after changing the bell's recipe
python soft-tools/bar-apps/make_bell.py
```

## The sit, as built

Opening the app starts the sit. There is no opening screen to press through.

| When | The LEDs | The bell |
| --- | --- | --- |
| **Settle-in,** 45 seconds | `WEEK 1` over `4 X 5 MIN`, with a line of warm light between them that draws in to the dot as the 45 seconds run out. Over the last 2.5 seconds it all fades down to the dot | None |
| **A round** | The dot alone, at Dim min. With Breathe on, light flows out of the dot and back, starting when the three bells have rung out and shrinking away over the round's last 10 seconds | Three strikes as it starts |
| **A break** | Over 2.5 seconds the screen wakes: a line of warm light, full width, that draws in to the dot as the break runs out. Half a minute before the next round the line turns to the dot's colour, with a brief glow round it, and the screen dims from there. It is down to the dot when the bells come | Two strikes as it starts |
| **The end** | `WEEK 1 DONE` over `26 MIN`, for two minutes. Then the app closes itself and the bar goes back to its Start / Setup screen | One strike |

Each strike is the same 6-second bell. Strikes in a group start 7.5 seconds
apart. With each strike the whole LED face swells with light and dies away
with the bell. With Bell off, the light still comes, and it is the only
signal.

| Control | What it does |
| --- | --- |
| The big button | Pauses the sit: `PAUSED` over the minutes left, at full brightness. Press again to carry on. The sit's clock stops while paused, so every later bell moves by the length of the pause |
| The wheel, pressed | A look: `ROUND 2 OF 4` over `3 MIN LEFT` for three seconds, no brighter than the round itself. Works in a round and in a break |
| The wheel, turned | Nothing |
| BACK | Ends the sit at once, and stops a bell that is still ringing |

## Setup

| Row | What it does | Values | Starts at |
| --- | --- | --- | --- |
| **Week** | Which week of the programme to sit | 1 to 6 | 1 |
| **Bell** | Whether the bell rings. Off, the light alone marks each change | On, Off | On |
| **Breathe** | Whether the dot breathes during a round | On, Off | Off |
| **BPM** | Breaths a minute, when Breathe is on. Each breath is two parts in, three parts out: 4 seconds and 6 at 6 a minute | 3 to 10 | 6 |
| **Dim min** | The lowest brightness the LEDs reach during a round, in percent. It is the dot's brightness, and the bottom of each breath | 5 to 100, in fives | 20 |

## Filled in while building

The review didn't settle these. Each is the plainest reading, and each is easy
to change. The rehearsal showed Dan the first three and the breath's wait,
and he called the run perfect apart from the breath's width and strength. The
others he hasn't seen.

- **The settle-in screen** shows the week and its shape, so a wrong Week row
  is caught before the eyes close.
- **The cue before a round is light only:** the break's line changes colour
  and the screen starts to dim. No sound, so it can't be mistaken for a bell.
- **The closing screen,** and the app closing itself two minutes after the
  last bell. Left open, the app would hold the bar awake until the battery
  ran out.
- **The paused screen** shows the minutes left, and a look is ignored while
  paused.
- **A look is ignored** during settle-in and on the closing screen, which
  already say what there is to say.
- **The breath waits** for the three bells to ring out, 21 seconds into the
  round.
- **Dim min goes to 100,** not 50. The 20% it starts at is a guess from one
  remark about text. A lone dot may want more.
- **A bell that fails is reported.** If the bar ever refuses to play the
  bell, the closing screen says `BELL ERR` and the bar's answer in place of
  the minutes. That is the one thing the battery run could not tell us.

## Seen on the bar

The rehearsal copy's one run, 2026-11-13, on the cable, with the bell on and
Breathe on at 6 a minute and Dim min at 20. Dan watched and listened. The PC
read the front screen once a second throughout.

- **Dan's verdict,** in his words: "Bell is good. Make the breath a bit
  wider, slightly more intense, otherwise the rehearsal was perfect." He had
  been asked whether the bell rang clean while its light swelled. The run put
  in front of him the settle-in, three, two and one bells with their light,
  the dot, the breath, the break and its cue, and the closing screen.
- **The text sits where it was planned:** rows 1 to 5 and 10 to 14, centred,
  with the dot between. Read from the PC's captures.
- **The app closed itself** and the bar went back to its Start / Setup
  screen. The PC saw the app's picture for 272 seconds of the 275 planned,
  reading once a second.
- **The breath, at 0.1.0,** reached 40 pixels wide. Dan asked for it a bit
  wider and slightly more intense. At 0.1.1 it reaches 50 pixels, and each
  layer is about a third brighter at the top of the breath.

## Not yet seen on the bar

- **The breath at 0.1.1.** Wider and brighter than the one Dan saw.
- **Morning Sit itself.** The same code as the rehearsal, with the real
  times. Nobody has sat through it.
- **The big button, the wheel and BACK.** The PC's captures show no look and
  no pause during the rehearsal, and it ran to its end, so BACK wasn't
  pressed. All three have only been pressed on the PC's stand-in.
- **Stopping a bell on BACK.** The call is in the bar's spec. No app here has
  made it on the bar.
- **Bell off, Breathe off for a whole round, and any Dim min but 20.**
- **A bell after a long quiet stretch on battery.** Unheard in the battery
  run, and the rehearsal ran on the cable with its bells at most 75 seconds
  apart. Week 1 rings its second group of bells five minutes in, which is the
  first real test.

## Numbers to tune

All in `scripts/picture.js` unless it says otherwise.

| What | Name in the code | Now |
| --- | --- | --- |
| The dot's colour | `EMBER` | `#FFA030` |
| The colour of text, and of the line in a break | `WARM` | `#FFD6AA` |
| Brightness when awake: dot, line, text | `DOT_AWAKE`, `BAR_AWAKE`, `TEXT_AWAKE` | 90%, 55%, 80% |
| The lowest that text is ever drawn | `TEXT_FLOOR` | 15% |
| The bell's light: the whole face, and its middle | `BLOOM`, `BLOOM_CORE` | 16%, 30% |
| How fast the bell's light rises, and how slowly it dies | `RISE_MS`, `FALL_MS` | 0.35 s, 1.5 s |
| How far the breath reaches, in three layers | `LAYERS` | 48, 30 and 16 pixels wider than the dot; 2, 4 and 6 rows tall. At 0.1.0: 38, 24 and 12 |
| How bright the breath gets | `GLOW_BASE`, `GLOW_SWING`, `DOT_SWING` | 0.45, 0.26 and 0.3, on the eye's scale. At a Dim min of 20 that draws each layer at 21% and the dot at 56% at the top of a breath. At 0.1.0 the last two were 0.2 and 0.25: 16% and 49% |
| The in-breath's share of a breath | `IN_SHARE` | 0.4 |
| A fade between bright and dim | `FADE_MS`, in `programme.js` | 2.5 s |
| Settle-in, the cue's lead, the closing screen | `SETTLE_MS`, `CUE_MS`, `END_MS`, in `programme.js` | 45 s, 30 s, 2 min |
| From one strike to the next | `STRIKE_MS`, in `programme.js` | 7.5 s |
| How long a look lasts | `PEEK_MS`, in `main.js` | 3 s |
| The bell itself | the top of `make_bell.py` | 640 Hz, four partials, 6 s |

Brightness is drawn through the alpha in each colour. The bar's own
brightness setting is never touched, so a force-quit can't leave the bar dim.
Fades step evenly as the eye sees them: a 0-to-1 scale, squared before it is
drawn.

## The rehearsal copy

A throwaway, built from the real source by a script kept in the session's
scratch folder, not in the repo. To make one again, copy the app's folder to
`shop.sit-rehearsal` and change five things:

| In | Change |
| --- | --- |
| `appmeta/manifest.json` | `id` to `shop.sit-rehearsal`, `name` to `Sit Rehearsal` |
| `scripts/bar.js` | `APP` to `shop.sit-rehearsal` |
| `scripts/programme.js` | `SETTLE_MS` to 15000 and `END_MS` to 20000 |
| `scripts/programme.js` | Every row of `WEEKS` to `{ count: 1.5, rest: 1, rounds: 2 }` |
| `appmeta/settings.json` | `breathe` starts `true` |

That gives 15 seconds of settle-in, two rounds of a minute and a half with a
one-minute break between, and 20 seconds of closing screen: 4 minutes 35
seconds from Start to the app closing itself.

## What the bar does

From the firmware's source at tag 1.3.1, and from the tests. These belong in
[bar-apps.md](../../bar-apps.md), which still calls sound and brightness
untried.

- **A sound file is raw samples:** 16-bit, little-endian, 44.1 kHz, mono, no
  header, named `.snd`. The firmware's own converter is `scripts/audio.py`.
- **Playing one:** `POST /api/audio/play` with
  `{"application_name": "<the app's id>", "path": "sounds/x.snd"}`. The bar
  looks in the app's own folder. For one of the bar's three stock sounds, send
  `"stock_path": "shared/sounds/<name>.snd"` instead of `path`:
  `calendar_event_starts`, `calendar_reminder_ends`, `volume_change`. 200
  means it is playing; 404 means it could not be played.
- **A new sound cuts off the one playing.** There is no queue. The player
  reads the file from storage as it goes, so length is not a memory problem. A
  1.2 MB package installed without complaint.
- **Brightness** reads as `{"value": "auto"}` or `{"value": "50"}`. Setting it
  (`POST /api/display/brightness?value=auto` or 0 to 100) jumps, and the bar
  saves it. An app can't read how bright the bar really is on `auto`. Morning
  Sit leaves it alone.
- **Staying awake:** while an app has something drawn, the bar is held out of
  its low-power mode. No idle timer was found in the source, and Sit Test ran
  39 minutes on battery untouched.
- **Overlapping shapes add their light.** Each translucent shape is blended
  over what is under it, so two shapes at 20% make 36% where they overlap,
  not 20%. Read from the firmware's drawing code, and the battery run's
  captures agree.
- **The big button** reaches an app as key `start`, action `short`. Dan
  pressed the real one through two rounds of tests. The wheel's press (`ok`)
  and BACK were not reported on.
- **With nothing of the app's on the back screen,** the bar shows its own
  ACTIVE frame there, with a grey copy of the front.
- **After a launch** the bar shows its own "Loading" for about half a second.
  A screen capture taken at once catches that, not the app.

## How it was checked

On the PC only. The bar runs a different JavaScript engine, so none of this
is proof.

- **[`check_app.mjs`](../../../../soft-tools/bar-apps/check_app.mjs)** ran
  whole sits against the stand-in: every week, breathing on and off at 3, 6
  and 10 breaths a minute, Dim min at 5, 20 and 100, bell on and off, with a
  pause and a look in each. More than 200 runs, and no request the bar would
  refuse. It learned three things for this: pressing the big button and the
  wheel (`--press`), checking that a sound file ships with the app, and
  noticing an app that ends by itself.
- **`check_morning_sit.mjs`** checks the plan against the six-week table and
  the wording of every screen, then draws every frame of weeks 1, 3 and 6,
  40 ms apart, and looks for any pixel that jumps. Where something changes
  quickly it slices the time finer: a fade or a moving edge changes less in a
  shorter step, and a jump does not. It caught two: a glow whose ends moved a
  whole pixel at a time, and the break's line brightening the dot just before
  a round. Both are fixed. With the second fault put back for one run, the
  check failed, as it should.
- **Traces** of the stand-in showed the bells at the right seconds, a pause
  moving every later bell by its own length, a look fading in and out, and
  BACK during a bell stopping the sound before clearing the screen.
