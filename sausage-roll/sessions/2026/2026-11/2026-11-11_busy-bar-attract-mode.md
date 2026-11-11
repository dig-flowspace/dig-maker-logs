# Session: 2026-11-11 — A BUSY Bar arrives, and gets a show of its own

**Left off:** Attract Mode 0.1.0 is installed on the BUSY Bar and was left
playing, but it has only ever been driven from the PC and seen in screen
captures — the next move is Dan's: work the real wheel, BACK and selector,
look at the four scenes on the LEDs, and say what to change. The camera slider
is still the one Active job; none of this touched it.
**Model:** Claude Fable 5.2, switched to part-way through the session.
**Goal:** Get the community's apps running on a new BUSY Bar, and start the
shop's own reference for it. A second goal turned up on the way: a show for
the front screen that runs on the bar itself.

## What happened

Dan plugged in a BUSY Bar, Flipper's desk status light, and wanted
busybar-manager, the community program that runs apps on it. It went in
outside the vault, where its `node_modules` can't flood Obsidian, and it
didn't work: every app crashed before drawing. On Windows, `python3` is a
shortcut to the Microsoft Store. A user variable fixed that, until the manager
was started from a terminal older than the variable. A launcher that reads the
setting from the registry fixed it for good.

The reference pages started the same morning in `hard-tools/busy-bar/`: the
device, the manager, the HTTP API, how apps share one screen, how to write
one, and a step-by-step for running the lot. The bar serves its own API spec,
so the pages were written against that and checked on the bar. The spec turned
out to be wrong about who wins the screen. Other people had measured it, and
by the end of the day so had we.

Then the apps took over. A scroller cycling a clock and a pinball app drew so
often that BACK couldn't hold the bar's own menus for more than a moment. The
first two fixes on offer were home-made. Dan called them clunky and asked what
other people do. They listen to the bar's buttons. **Step Aside** is the
shop's version: it runs under the manager, draws nothing, switches the
manager's apps off when the bar is touched, and brings them back when it has
been left alone.

Dan asked for more: an attract mode on the bar itself. The community apps are
Python programs on the PC, and the bar is only their screen. An app that lives
on the bar is a different animal, a small JavaScript program, and it can't run
theirs. Whether one could animate at all was unknown, so a throwaway app went
onto the bar to find out: 19 to 39 draws a second from text, shapes and
packaged pictures, 9 when every pixel is worked out in code. The community
pinball aims for 15.

So **Attract Mode** got built: the time, the date, a message, and a pinball
scene of the shop's own — a ball hopping along six lamps, JACKPOT, a score
rolling up, INSERT COIN. It is laid out as an etude: each file teaches one
thing about the bar, and its page says which. Most of the work was finding
out how the bar behaves, by drawing from the PC and reading the screen back:
the size of every font, what the firmware does with scrolling text, that an
outranked app is wiped and told nothing. The settings live in the bar's own
Setup screen, built by the firmware from a list.

One thing fell out of the testing that nobody designed. The firmware gives an
app no way to start itself, so there is no true screensaver. But move the
selector off Apps and the show closes; move it back and the bar starts it
again. That will do.

Every press in those tests was sent through the bar's API. The physical
controls are Dan's, and untried.

### Falls (R5)

- **A fix that needed a fresh terminal.** The Python variable worked in the
  window that set it and in no window older. Dan started the manager from VS
  Code and got the same crash back. A fix that depends on which window you
  typed in is half a fix.
- **Two instructions that weren't true.** "Use `npm start`" and "Ctrl+C clears
  the bar" were both written before the manager's source was read. Neither
  holds. Read the source, then write the step.
- **Trusting the spec.** The first draft of the priority rules repeated the
  firmware's spec, and the firmware does otherwise in three places. A spec is
  a claim about a machine. The machine was on the desk.
- **Inventing before looking.** Two home-made fixes for the menu problem,
  before a single search for how others had solved it. They had.
- **A path, eaten twice.** A Windows path went through a shell heredoc, `\t`
  became a tab, and the manager was told about a folder that doesn't exist.
  Hours later, during this very wrap, the same trick turned `\b` into a
  backspace inside the TODO. Caught by reading the bytes. Paths go in as
  arguments or through the file tools, never through a quoted script.
- **Answering a different question.** Asked for an app on the bar, Kilgore
  designed one on the PC with a remote control. Then told Dan that nothing of
  pinball's lives on the bar; four picture files do. Corrected out loud both
  times.
- **The clear that didn't.** The test helper named the app twice in its
  delete call. The bar answers 400 to that, the helper never read the answer,
  and test drawings piled up on the front screen for several minutes. Check
  the status of the cleanup call too. It is now one of the bar's documented
  rules.
- **Back in 0.06 seconds.** The recovery test counted lit pixels and took the
  bar's own "Loading…" screen for the show coming back. The bug it should have
  caught was real: a still scene never noticed it had been wiped. The
  PC-side checker missed it as well, because nobody had taught it that rule.
  The fix is to send the whole frame again once a second. A detector gets
  tried on a known failure before it gets believed — last session's lesson,
  learned again.
- **A sentence that claimed too much.** The bar-apps page said the checker
  "has caught every slip so far". It had caught none. Rewritten before it
  shipped.
- **Somebody else's cache.** Tidying Python's cache folders took a file
  belonging to the Discord script with it. Git ignores it and Python rebuilds
  it, so nothing was lost. It was still deleted unseen. Look, then delete.
- **Unexplained.** The manager stopped by itself twice. Its window would have
  said why, and nobody copied the lines.
- **Rule friction, not falls.** The hands table says Dan flashes hardware.
  This session put apps on the bar, took one off, and pressed the bar's
  controls through its API, each after Dan's yes, and never named the bench
  when the work moved from writing pages to loading a device. And the Safety
  Warden holds a standing seat for "every new machine"; a sealed desk gadget
  arrived and nobody asked whether it counts. Two amendments are proposed in
  the wrap rather than the rules being bent quietly.

### Exposure

**Exposure sweep: two GRAY classes found, both ruled GREEN by Dan during the
wrap. No RED.** The diff was read by eye, file by file, then netted with the
policy's three greps, run over every added or changed file. The scope stayed
at the diff: nothing was imported or pasted in.

- **GRAY, ruled GREEN.** Network addresses in the BUSY Bar pages and scripts:
  the address the bar gives itself over USB, which is the same on every unit
  and printed in Flipper's docs; loopback addresses for the manager's
  dashboard; one address from a range reserved for examples. And drive-letter
  paths with no username in them, for the manager's checkout and the workshop
  folder. Both rulings are written into the policy.
- **Emails:** none. **User paths:** two hits, both the policy quoting its own
  patterns, on lines this session didn't touch.
- **The secrets pattern:** benign hits only. The API pages explain that the
  bar wants a password over Wi-Fi; two scripts name the header and the
  environment variable they would send it in; one page names an option and
  another says what a library app reads; the batch file uses the word as a
  keyword; the policy defines its terms; `.env.example` holds its documented
  dummies, one of them new; and this entry uses the word twice. No value
  anywhere.
- **Extra nets:** no MAC address, serial number, long hex string, UUID,
  machine username or network name. The bar's serial and MAC addresses
  crossed the screen in tool output during the session. They are in no file.
- **Pictures:** thirteen PNGs, each one looked at. Menus, clock faces, test
  results and the bar's status icons. Each file holds a header, pixels and an
  end marker: no text chunks, nothing after the end.
- **Quoted material:** single sentences from Flipper's docs, five lines of the
  firmware's spec, and about twenty lines trimmed from the community clock
  (MIT), each credited where it stands. Short and attributed, so they pass as
  upstream attributions.
- One sample log line lost its timestamp, to match its neighbours.

## Files created or changed

- `hard-tools/busy-bar/` : nine reference pages and ten screen captures —
  the front door, running the manager, the device, sharing the screen, the
  manager, the HTTP API, writing apps, apps on the bar, Attract Mode.
- `soft-tools/bar-apps/` : Attract Mode itself (`shop.attract-mode/`), a
  checker that runs a bar app on the PC against a stand-in bar, the script
  that draws its pictures, a README.
- `soft-tools/busybar-apps/` : Step Aside, and a README.
- `soft-tools/scripts/busybar_app.py` : installs, starts, stops and removes a
  bar app, and reads or sets its settings.
- `soft-tools/scripts/busybar_screens.py` : saves both of the bar's screens as
  PNG.
- `soft-tools/scripts/start-busybar-manager.cmd` : starts the manager with the
  right Python from any window.
- `sausage-roll/REGISTRY.md` : workstream 7, a satellite row for the manager's
  checkout, and a wider meaning for the `hard-tools/` shelf.
- `sausage-roll/EXPOSURE-POLICY.md` : the two rulings of 2026-11-11.
- `README.md` : the BUSY Bar on the shop's public face, with credits.
- `.env.example` : the shape of the bar's Wi-Fi password variable.
- `be-productive-already/TODO.md` : the BUSY Bar Inbox entry, rewritten; two
  more framework rulings.
- `sausage-roll/sessions/README.md` : this entry's index line.

Outside the repo, so not in any commit: the manager's checkout and its
settings, one user environment variable, and Attract Mode on the bar itself.

**Commit:** Dan's hands this time, after the wrap. Hash to follow in an
addendum.

## Open threads / next

- **Hands on the bar.** Try Attract Mode with the real controls and look at it
  on the LEDs. Everything so far came through the API and screen captures.
- **Two ways to do one job.** The manager's scroller and Attract Mode can't
  both have the screen. Which is the everyday answer is Dan's call.
- **The manager's two stops.** Next time it stops by itself, copy the last
  lines in its window.
- **Small and waiting:** Step Aside's Sleep rule with the physical selector;
  nothing starts the manager at login; one prediction from the spec nobody
  has watched.
- **Unruled:** the framework questions in the TODO Inbox, two of them new:
  whether putting apps on a device and pressing its controls through its API
  are Claude-hands once Dan has said yes, and whether the Safety Warden's
  standing seat covers a bought desk gadget.
