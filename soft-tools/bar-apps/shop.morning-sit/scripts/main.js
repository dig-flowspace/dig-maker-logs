// Morning Sit: an interval timer for breath-counting practice, run by the bar
// itself. Rounds of counting with breaks between, six weeks of them, marked
// by a bell: three strikes begin a round, two begin a break, one ends the sit.
//
//   the big button      pauses the sit, and carries on
//   the wheel, pressed  a three-second look at the round and the minutes left
//   the wheel, turned   nothing, so a bump can't change anything
//   BACK                ends the sit
//
// This file is the runner. It keeps the sit's clock, rings the bell when the
// plan says so, listens to the controls, and sends the picture to the bar.
// The plan is laid out in programme.js. What the screen shows is in picture.js.

import { APP, draw, remove, clear, settings as readSettings, play, hush } from "./bar.js";
import { BELL_MS, plan, phaseAt, untilNext } from "./programme.js";
import { picture } from "./picture.js";

const BELL = "sounds/bell.snd";

// Used until the bar's copy has been read, and for any value that comes back
// missing or of the wrong kind. LIMITS holds the least and the most of each number.
const DEFAULTS = { week: 1, bell: true, breathe: false, bpm: 6, dim_min: 20 };
const LIMITS = { week: [1, 6], bpm: [3, 10], dim_min: [5, 100] };

const REFRESH = 1000;   // ms between sending the whole frame again, changed or not
const MAX_STEP = 2000;  // the most one turn of the loop may add to the clocks
const PEEK_MS = 3000;   // how long a look at the round and the minutes lasts
const PEEK_FADE = 250;  // ms for the look to come up, and to go
const PAUSE_FADE = 400; // ms for the paused screen to come up, and to go
const FADE_STEP = 60;   // the most of either fade that one turn of the loop may cover, in ms

let settings = tidy(null);
let sit = plan(settings.week);
let t = 0;           // the sit's clock: ms of sitting, not counting pauses
let w = 0;           // a clock that never stops, for the look, the pause and the bell's light
let last = 0;        // Date.now() at the last turn of the loop
let paused = false;
let pause = 0;       // how far the paused screen has come up, 0 to 1
let peek = 0;        // how far the look has come up, 0 to 1
let peekUntil = -1;  // on the w clock: when the look starts to go
let struck = 0;      // how many of the plan's strikes have been rung
let rungAt = -1;     // on the w clock: when the last one was
let trouble = 0;     // the bar's answer, if it ever refused to play the bell
let presses = [];    // "pause" and "peek", not yet acted on
let running = true;
let wake = null;     // call it to end the current wait early
let shown = {};      // what this app has on the bar's screen: id -> the element, as text
let lastWhole = 0;   // when the whole frame was last sent

function tidy(values) {
    const out = {};
    for (const key in DEFAULTS) {
        let value = values ? values[key] : undefined;
        if (typeof value !== typeof DEFAULTS[key] || value !== value) { // the second test catches NaN
            value = DEFAULTS[key];
        }
        if (LIMITS[key]) {
            value = Math.max(LIMITS[key][0], Math.min(LIMITS[key][1], Math.round(value)));
        }
        out[key] = value;
    }
    return out;
}

// Move `from` toward `to` by at most `step`.
function toward(from, to, step) {
    return from < to ? Math.min(to, from + step) : Math.max(to, from - step);
}

// Send the frame: the elements that changed, and once a second all of them.
// If another program takes the screen for a moment the bar wipes this app's
// elements and tells it nothing; the resend puts them back.
async function paint(frame) {
    const now = Date.now();
    const whole = now - lastWhole >= REFRESH || now < lastWhole;
    const next = {};
    const send = [];
    for (const element of frame) {
        const asText = JSON.stringify(element);
        next[element.id] = asText;
        if (shown[element.id] !== asText || whole) {
            send.push(element);
        }
    }
    const gone = Object.keys(shown).filter(id => !(id in next));
    let status = 200;
    if (send.length > 0) {
        status = await draw(send);
    }
    if (gone.length > 0) {
        await remove(gone); // the dot is in every frame, so this never empties the screen
    }
    if (status === 409) {
        // Something more important has the screen, and the bar has wiped this
        // app's elements. Forget them, so everything is sent again later.
        shown = {};
        lastWhole = 0;
        return status;
    }
    if (status !== 200) {
        console.error(`${APP}: draw answered ${status}`);
    }
    shown = next;
    if (whole) {
        lastWhole = now;
    }
    return status;
}

// Move the clocks on, then act on any presses.
function step(now) {
    let passed = now - last;
    last = now;
    // The bar's clock can be set while the app runs. A step backward or a
    // long one forward is the clock being set, not time passing.
    if (passed < 0) {
        passed = 0;
    } else if (passed > MAX_STEP) {
        passed = MAX_STEP;
    }
    w += passed;
    if (!paused) {
        t += passed;
    }
    // The paused screen and the look move a little each turn, however long
    // the turn was, so neither can jump: a fade is always several frames.
    const moved = Math.min(passed, FADE_STEP);
    pause = toward(pause, paused ? 1 : 0, moved / PAUSE_FADE);
    peek = toward(peek, w < peekUntil ? 1 : 0, moved / PEEK_FADE);

    while (presses.length > 0) {
        const what = presses.shift();
        const kind = phaseAt(sit, t).kind;
        if (what === "pause" && kind !== "end") {
            paused = !paused;
            peekUntil = -1;
        } else if (what === "peek" && !paused && (kind === "round" || kind === "break")) {
            peekUntil = w + PEEK_FADE + PEEK_MS;
        }
    }
}

// Ring the next strike if it is due. The bar has no queue, and a new sound
// cuts off the one playing, so a strike also waits for the last to ring out.
async function ring() {
    if (struck >= sit.strikes.length || sit.strikes[struck] > t) {
        return;
    }
    if (rungAt >= 0 && w - rungAt < BELL_MS) {
        return;
    }
    struck += 1;
    rungAt = w;
    if (settings.bell) {
        let status = -1; // what stands if the call itself fails
        try {
            status = await play(BELL);
        } catch (error) {
            console.error(`${APP}: ${error.message}`);
        }
        if (status !== 200) {
            trouble = status; // the closing screen says so: a bell that did not ring should not pass unseen
            console.error(`${APP}: the bell answered ${status}`);
        }
    }
}

const unbind = listen("input", event => {
    if (event.action !== "short") {
        return; // which leaves out every turn of the wheel
    }
    if (event.key === "back") {
        running = false;
    } else if (event.key === "start") {
        presses.push("pause");
    } else if (event.key === "ok") {
        presses.push("peek");
    } else {
        return;
    }
    if (wake) {
        wake();
    }
});

// Wait `ms`, or until a button cuts the wait short.
function sleep(ms) {
    return new Promise(resolve => {
        const timer = setTimeout(() => {
            wake = null;
            resolve();
        }, ms);
        wake = () => {
            clearTimeout(timer);
            wake = null;
            resolve();
        };
    });
}

async function run() {
    try {
        settings = tidy(await readSettings());
    } catch (error) {
        console.error(`${APP}: ${error.message}`);
    }
    sit = plan(settings.week);
    last = Date.now();

    while (running) {
        const began = Date.now();
        let wait = 1000;
        try {
            step(began);
            if (t >= sit.end) {
                break; // the closing screen has had its time
            }
            await ring();
            const frame = picture({
                sit: sit,
                t: t,
                dim: settings.dim_min / 100,
                breathe: settings.breathe,
                breathMs: 60000 / settings.bpm,
                pause: pause,
                peek: peek,
                rung: rungAt < 0 ? -1 : w - rungAt,
                trouble: trouble
            });
            // The bar holds a refused draw for a second and a half before it
            // answers 409, so after one there is no need to wait long.
            wait = await paint(frame.elements) === 409 ? 200 : frame.hurry;
            if (!paused) {
                wait = Math.min(wait, untilNext(sit, t)); // never sleep through a bell or the start of a fade
            }
            if (struck < sit.strikes.length && sit.strikes[struck] <= t) {
                wait = Math.min(wait, BELL_MS - (w - rungAt)); // a strike is waiting for the last one to ring out
            }
            if (peek >= 1 && peekUntil > w) {
                wait = Math.min(wait, peekUntil - w);     // nor through the end of a look
            }
            if (pause !== (paused ? 1 : 0) || peek !== (w < peekUntil ? 1 : 0)) {
                wait = Math.min(wait, 40);                // the paused screen or the look is on its way up or down
            }
        } catch (error) {
            console.error(`${APP}: ${error.message}`);
            shown = {};
        }
        if (running) {
            await sleep(Math.max(10, wait - (Date.now() - began)));
        }
    }

    // On the way out, cut short a bell that is still ringing, then clear.
    if (settings.bell && rungAt >= 0 && w - rungAt < BELL_MS) {
        try {
            await hush();
        } catch (error) {
            console.error(`${APP}: ${error.message}`);
        }
    }
    await clear();
    setTimeout(unbind, 10); // with no listener and no timer left, the app ends
}

run().catch(error => {
    console.error(`${APP}: ${error.message}`);
    setTimeout(unbind, 10);
});
