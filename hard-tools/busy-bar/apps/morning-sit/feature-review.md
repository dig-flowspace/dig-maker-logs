# Morning Sit: features to approve

An interval timer for breath-counting practice that runs on the BUSY Bar
itself, with no PC and no Wi-Fi. This page is the menu, as Dan marked it up,
and the record of what was decided. What was built from it is in
[build-notes.md](build-notes.md).

**Status:** reviewed and decided, 2026-11-13. The three tests on the bar were
run the same day, and their results are under "What the tests showed". One
thing is still unheard: a bell after a long quiet stretch on battery. The app
was built that afternoon and is on the bar at version 0.1.1. A short rehearsal
copy has run there; Morning Sit itself has not. Facts about the bar were read
from the bar that day (firmware 1.3.1, API 27.14.0) or from Flipper's doc.
What nobody has tried yet is marked *untried*.

## How to mark it up

Every option has a checkbox at the start of its row, and each group has a
**Your notes** list under its table.

- To approve an option, put an `x` in its box: `[x]`. Leave the box empty to
  deny it.
- Write anything you like under **Your notes**, against the option's code. For
  example: `- C2: dimmer than you'd think`
- For an option to keep for a later build, leave its box empty and write
  `later` in its note.
- **Pick** in a table says which option I would build. Only your boxes count.
- Where a heading says *pick one*, tick one box.
- Add a row for any idea of your own.

When you're done, say so, and the decisions get read back before anything is
built.

## Already settled

- It runs on the bar alone: no PC, no Wi-Fi. (Dan, 2026-11-13)
- The LED front is the only screen that matters. Nothing is designed for the
  small OLED on the back. (Dan, 2026-11-13)

## Decided

Dan marked the tables below on 2026-11-13 and settled two readings in
conversation. This is the build that came out of it.

- **The bell-ringer is the base (A1).** The bar keeps the time; the count
  stays with you.
- **The breathing light is a switch in Setup (A2),** with a breaths-per-minute
  row beside it. Off, the ember is steady. On, the ember breathes.
- **The ember is a dot (C2).** The note under C asking for the word "Breathe"
  was withdrawn. With the breathing light on, the dot is what swells and
  fades. Dan's brief for it: "a very slow and deliberate breathing. Like water
  flowing in and out."
- **Signals:** light and bell together, with the bell a switch in Setup (B3).
  Three begin a round, two begin a break, one ends the sit (B4). The bell is a
  synthesized bowl bell (B7).
- **The break:** the LEDs wake, with a cue 30 seconds before the next round
  (D1).
- **The programme:** six weeks in Setup (E1), a 45-second settle-in (E4), plain
  controls (E5), breaks between rounds only (E6).
- **Practices:** the morning sit (F1). Breath rest and evening sit are off the
  list.
- **Extras:** Peek (G1) and Dim for the sit (G2).
- **Where it sits:** on a coffee table, with Dan on the floor and his eyes
  closed by intention. So the bell carries the timing, and the lights are for
  open eyes.
- **First:** all three tests on the bar (T1 to T3).

Added by Dan after the first two tests, 2026-11-13:

- **Each bell rings out and settles before the next one starts.** So "three
  bells" is the one bell played three times with quiet between, not three
  strikes ringing over each other. The spacing Dan called perfect: the bell
  rings for 6 seconds, then 1.5 seconds of quiet.
- **Dimming is a fade,** never a jump. The app draws its own picture dimmer
  and leaves the bar's brightness setting alone, so the bar can never be left
  dim. Fading through black to drop the bar's own brightness was tried and
  turned down.
- **A Dim min row in Setup** sets the lowest brightness the LEDs reach during
  a sit. The 12% the test faded to was a little too dim.

## What the tests showed

Run 2026-11-13 with a throwaway app, Sit Test. Dan pressed the bar's real
buttons and did the listening and the looking.

| | Test | Result |
| --- | --- | --- |
| T1 | **Sound** | Works. The bar's stock chime, a bell packed inside the app, and a longer three-strike file all played, each call answering 200. The package with both bell files was 1.2 MB and installed. In a second round the one bell was played three times, 7.5 seconds apart, and each rang out before the next |
| T2 | **Dimming** | Works. The app set the bar's brightness to 5, Dan saw it dim, and four seconds later it was back on `auto`, checked from the PC. The change is a jump: the firmware has no fade of its own. A second round tried two fades drawn by the app, and Dan chose the one that leaves the bar's brightness alone |
| T3 | **Battery run** | Passed, with the bell unheard. Unplugged and untouched, the app ran past its 30 minutes and was still running at 39:40, when the PC read its screen after the cable went back in. The bar did not sleep or switch off, and the dot was still breathing. Its clock agreed with the PC's to the second over three readings. At 30:00 the app asked for the bell: its clock turned green, which it does at that moment. Dan missed the chime, and the test did not keep the bar's answer to that call, so nobody knows whether it sounded. The battery read 36% before the run and 31% after, both readings taken on the cable |

What reading the firmware's source (tag 1.3.1) added:

- **A sound file is raw samples:** 16-bit, little-endian, 44.1 kHz, mono, no
  header. Anything else won't play.
- **A new sound cuts off the one playing.** There is no queue.
- **The bar saves a brightness change.** An app that dims the bar and is then
  force-quit leaves it dim.
- **An app can't read how bright the bar really is on `auto`,** only that it
  is on `auto`. So a fade has to be drawn by the app.
- **No idle timer was found.** While an app has something on screen, the bar
  is held out of its low-power mode.

## What the bar allows

Six facts about the bar shape every choice below.

| The bar | What it means for the timer | How we know |
| --- | --- | --- |
| Runs an app with the PC off | The timer is a JavaScript app in the APPS menu, the same kind as [Attract Mode](../../attract-mode.md) | Attract Mode does it today. The bar still reports API 27.14.0 |
| Can't start an app by itself | You open it from the APPS menu. Or flip the selector to Apps, and the last app restarts | Seen with Attract Mode, 2026-11-11 |
| Gives an app no memory between runs | No automatic week advance, no history, no streaks. The week is a row in Setup, turned by hand | Flipper's doc: an app can only read its settings, and storage is closed to it |
| Lets an app play sound files | The bar holds two calendar chimes and a volume blip. A package can carry sounds of its own | *Untried.* Flipper's doc and the bar's spec say so. Neither Flipper's sample app nor Clock plays a sound |
| Lets an app set brightness | The timer could dim the bar for a sit and restore it after | *Untried.* Flipper's doc |
| Has a battery | Unknown whether an app keeps running for 30 minutes with nobody touching the bar | *Untried* |

More on what an app can and can't do: [bar-apps.md](../../bar-apps.md).

## What others do

Other people's designs already do parts of this, and the features below
borrow from them.

| Who | What they do | Feeds |
| --- | --- | --- |
| The bar's own BUSY timer | An interval timer: work, rest, cycles, autostart. On this bar it is set to 20 / 5 × 3. Set to 5 / 2 × 4 with autostart on, it would run Week 1 with no code. It is built as a status sign for other people, so expect a lit countdown. No session has been watched on this bar | A baseline worth one morning. G4 |
| [San Francisco Zen Center's zendo forms](https://sfzc.org/files/online-zendo-forms) | Three bells begin a period of sitting, two signal the move to walking, and one ends the morning's last sitting | B4 |
| [Mokurai](https://apps.apple.com/app/id6773094693), an iPhone zazen timer | Rounds of sitting with walking between. The number of bell strikes is set separately for opening, for closing before walking, and for the end | B4, E |
| [Ensō](https://apps.apple.com/app/ens%C5%8D-meditation-timer-bell/id840637879), a meditation timer | "A preparation timer to settle in before you begin" | E4 |
| [Zazen Meditation Timer](https://f-droid.org/packages/at.priv.graf.zazentimer/), for Android | Sessions built from timed sections, each with its own bell, strike count and interval | B4 |
| [Dodow](https://livlab.care/en-ca/products/dodow), a sleep light | A light that expands for the in-breath and contracts for the out-breath, about 4 seconds in and 6 out, slowing to 6 breaths a minute. It turns itself off after 8 or 20 minutes | A2, F2 |
| [The breath-counting task](https://pmc.ncbi.nlm.nih.gov/articles/PMC6153891) from mindfulness research (Wong and others, 2018) | People count breaths 1 to 9, pressing one key on breaths 1 to 8 and another on 9. A third key marks a count they caught themselves losing | A3, G3 |

One search found no breathing or meditation app for the BUSY Bar.

## A. Who holds what (pick one)

This is the fork that shapes the rest. "Rooted in the slow counting" can be
read three ways, and these are the three.

| Approve |     | Feature             | What you get                                                                                         | What it costs                                                                                                                         | Pick |
| ------- | --- | ------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| [X]     | A1  | **Bell-ringer**     | The bar holds the time and you hold the count. Nothing on the LEDs gives a number or a pace          | The bar adds nothing to the counting itself                                                                                           | yes  |
| [X]     | A2  | **Breathing light** | The bar holds the pace. The LEDs swell and fade, and you breathe with them                           | For a counting sit it changes the practice: you follow a light instead of counting the breath you have. It suits the breath rest (F2) | no   |
| [ ]     | A3  | **Beads**           | The bar holds the count. One wheel click per out-breath, ten dots filling, a press to go back to one | You can no longer lose count, and catching the loss is the rep. Your hand moves on every breath                                       | no   |

**Your notes:**

- A1: 
- A2: I want this as a feature I can enable/disable with a setting for BPM
- A3:

## B. How it tells you the phase has changed

Three separate choices: the channel, the pattern, and the bell.

### Channel (pick one)

| Approve |     | Feature        | What you get                                               | What it costs                                                                         | Pick |
| ------- | --- | -------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---- |
| [ ]     | B1  | **Light only** | The whole LED face swells and fades. No sound at all       | The bar has to sit where a lowered gaze falls. Closed eyes may miss it                | no   |
| []      | B2  | **Sound only** | A bell. Works with eyes closed                             | A sound in a quiet room, every few minutes. Depends on sound working from an app (T1) | no   |
| [X]     | B3  | **Both**       | Light and a bell together, with the bell a switch in Setup | Depends on sound working from an app (T1)                                             | yes  |

### Pattern (pick one)

| Approve |     | Feature                  | What you get                                                                                                  | What it costs                                    | Pick |
| ------- | --- | ------------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---- |
| [X]     | B4  | **Three, two, one**      | Three signals begin a counting round, two begin a break, one ends the sit. You know the phase without looking | Three bells take several seconds to ring         | yes  |
| [ ]     | B5  | **One signal each time** | The same single signal at every change                                                                        | You have to keep track of which phase comes next | no   |

### Bell (pick one, if there is sound)

| Approve |     | Feature         | What you get                                                                                            | What it costs                                     | Pick |
| ------- | --- | --------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ---- |
| [ ]     | B6  | **Stock chime** | One of the bar's two calendar chimes. It is on the bar now                                              | It was made for calendar alerts, not for sitting  | no   |
| [X]     | B7  | **Bowl bell**   | A bell synthesized by a script and packed in the app. Pitch and decay to taste, and no licence to clear | The bar's sound format has to be worked out first | yes  |

**Your notes:**

- B1:
- B2:
- B3:
- B4:
- B5:
- B6:
- B7:

## C. The LEDs during a counting round (pick one)

This applies if A1 is approved.

| Approve |     | Feature   | What you get                                                        | What it costs                                  | Pick |
| ------- | --- | --------- | ------------------------------------------------------------------- | ---------------------------------------------- | ---- |
| [ ]     | C1  | **Dark**  | Nothing at all                                                      | You can't tell a running timer from a dead one | no   |
| [X]     | C2  | **Ember** | One dim, steady point that says "still running" and nothing else    | A point of light in view for the whole round   | yes  |
| [ ]     | C3  | **Tide**  | A dim line that shortens across the round. The time, without digits | It invites clock-watching                      | no   |

**Your notes:**

- C1:
- C2: "Breathe" is what it should say
- C3:

## D. The break (pick one)

| Approve |     | Feature              | What you get                                                                                                                 | What it costs                           | Pick |
| ------- | --- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ---- |
| [X]     | D1  | **The LEDs wake**    | A warm colour and a shrinking bar. Then a soft cue 30 seconds before the next round, so you are seated when the signal comes | More light and movement in a quiet room | yes  |
| [ ]     | D2  | **Same as counting** | The LEDs stay as they were. Only the signals mark the break                                                                  | No warning before the next round starts | no   |

**Your notes:**

- D1: 
- D2:

## E. The programme

E1 is the base. E2 and E3 add to it. E4 to E6 are separate yes-or-no calls.

The six weeks as they would be built in, for checking. "Whole sit" leaves out
the settle-in (E4).

| Week | Counting | Break | Rounds | Whole sit |
| --- | --- | --- | --- | --- |
| 1 | 5 min | 2 min | 4 | 26 min |
| 2 | 8 min | 2 min | 3 | 28 min |
| 3 | 9 min | 1 min | 3 | 29 min |
| 4 | 13 min | 2 min | 2 | 28 min |
| 5 | 15 min | 1 min | 2 | 31 min |
| 6 | 30 min | none | 1 | 30 min |

| Approve |     | Feature                        | What you get                                                                                                         | What it costs                               | Pick |
| ------- | --- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---- |
| [X]     | E1  | **Six weeks built in**         | Week is a row in Setup, 1 to 6. Repeating a week means leaving the row alone                                         | Changing week means a trip into Setup       | yes  |
| [ ]     | E2  | **A Custom week**              | Three more Setup rows: counting minutes, break minutes, rounds                                                       | A longer Setup list                         | no   |
| [ ]     | E3  | **Week on the opening screen** | The wheel picks the week each time the app opens, starting from the Setup value. Dropping back a week takes one turn | One more thing to look at before every sit  | no   |
| [X]     | E4  | **Settle-in**                  | 45 seconds between pressing Start and the first signal, to get seated                                                | 45 seconds on every sit                     | yes  |
| [X]     | E5  | **Plain controls**             | The big button pauses and resumes. BACK ends the sit. Turning the wheel does nothing, so it can't be bumped          | No way to skip ahead, unless G4 is approved | yes  |
| [X]     | E6  | **Breaks between rounds only** | No break after the last round. That gives the "Whole sit" column above                                               | Week 1 comes out four minutes short of 30   | yes  |

**Your notes:**

- E1:
- E2:
- E3:
- E4:
- E5:
- E6:

## F. Which practices it serves

F1 is the first build. F2 and F3 would be more modes in the same app, chosen
with the wheel on the opening screen.

| Approve |     | Feature         | What you get                                                                               | What it costs                                               | Pick  |
| ------- | --- | --------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ----- |
| [X]     | F1  | **Morning sit** | The six-week interval programme above                                                      | Nothing beyond the build itself                             | yes   |
| [ ]     | F2  | **Breath rest** | 15 minutes. The LEDs swell for 4 seconds and fade for 6. One signal at the end             | A second mode. The bar has to be in view while you lie down | later |
| [ ]     | F3  | **Evening sit** | One 30-minute round. Optionally, one soft cue a few minutes in to mark the end of settling | A third mode, and the cue's timing to choose                | later |

**Your notes:**

- F1:
- F2:
- F3:

## G. Extras (any or none)

| Approve |     | Feature             | What you get                                                                                             | What it costs                                                                                        | Pick |
| ------- | --- | ------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---- |
| [X]     | G1  | **Peek**            | Press the wheel for a three-second look at the round and the minutes left, then back to what was showing | A way to check the clock in the middle of a round                                                    | yes  |
| [X]     | G2  | **Dim for the sit** | The bar's brightness drops for the sit and comes back after                                              | *Untried* from an app (T2). A force-quit may leave the bar dim until brightness is reset in Settings | yes  |
| [ ]     | G3  | **Returns tally**   | One press each time you catch a drift. The count shows once, at the end                                  | It can turn into a score, and it moves your hand                                                     | no   |
| [ ]     | G4  | **Skip**            | A control that jumps to the next phase, as the bar's own timer has                                       | A stray press cuts a round short                                                                     | no   |
| [ ]     | G5  | **Rings itself in** | Left open overnight on a charger, the app begins a sit at a set time                                     | It rings on mornings you skip. *Untried* whether an app can idle that long                           | no   |

**Your notes:**

- G1:
- G2:
- G3:
- G4:
- G5:

## Two questions

Both decide how much the light can carry by itself (B1, C2, D1).

1. How far from you will the bar sit, and how high: floor, low table, desk?
   - Answer: I can place it wherever.  I was going to put it on my coffee table and sit on the floor
2. During counting, are your eyes open, lowered or closed?
   - Answer: my intention is to keep them closed, but I will try different things

## The first step, once the features are settled

A throwaway test app goes onto the bar before any real building. It puts
something on the bar and makes a noise, so it waits for its own yes.

| Approve |     | Test            | What happens on the bar                                                              |
| ------- | --- | --------------- | ------------------------------------------------------------------------------------ |
| [X]     | T1  | **Sound**       | The app plays a stock chime, then a test tone packed with it. A few seconds of noise |
| [X]     | T2  | **Dimming**     | The app drops the brightness, waits, and puts it back                                |
| [X]     | T3  | **Battery run** | The app runs for 30 minutes unplugged, with nobody touching the bar                  |

**Your notes:**

- T1:
- T2:
- T3:

## Sources

Read 2026-11-13, unless marked.

- Flipper's doc at firmware tag 1.3.1: `documentation/JavaScript
  Applications.dox.md` in
  [busybar-firmware](https://github.com/busy-app/busybar-firmware/tree/1.3.1).
  What an app may call, and that it can only read its settings.
- The bar's own `openapi.yaml` (27.14.0), its stock sounds folder and its BUSY
  profile, read over USB.
- [bar-apps.md](../../bar-apps.md): what building Attract Mode showed about
  the bar.
- The store listings of [Mokurai](https://apps.apple.com/app/id6773094693),
  [Ensō](https://apps.apple.com/app/ens%C5%8D-meditation-timer-bell/id840637879)
  and [Zazen Meditation Timer](https://f-droid.org/packages/at.priv.graf.zazentimer/).
- [Dodow](https://livlab.care/en-ca/products/dodow): the maker's product page.
- [Wong and others, 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC6153891),
  "Towards an Objective Measure of Mindfulness: Replicating and Extending the
  Features of the Breath-Counting Task".
- [San Francisco Zen Center, online zendo forms](https://sfzc.org/files/online-zendo-forms),
  a one-page PDF: the bell signals for sitting and walking.
