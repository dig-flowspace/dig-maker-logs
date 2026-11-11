// Attract Mode: a show for the bar's front screen, run by the bar itself.
// The scenes play in turn. Turn the wheel to change scene; BACK ends the show.
//
// This file is the runner. It knows nothing about what any scene looks like.
// A scene is an object with:
//   id        its name in the settings: "show_" + id switches it on and off
//   title     its name on the back screen
//   interval  how often to ask it for a frame, in ms
//   frame     (the time, ms since the scene went up, the settings) -> every element on screen
//   duration  optional: (the settings) -> how long its turn lasts, in ms
//   wanted    optional: (the settings) -> false to leave it out of the show
//
// The lesson here: describe the whole frame, send only the difference. The
// runner remembers what is on screen, compares each new frame with that,
// draws the elements that changed and removes the ones that are gone.

import { APP, draw, remove, clear, settings as readSettings } from "./bar.js";
import { box } from "./elements.js";
import { clock } from "./clock.js";
import { date } from "./date.js";
import { message } from "./message.js";
import { pinball } from "./pinball.js";

const SCENES = [clock, date, message, pinball];

// Used until the bar's copy has been read, and for any value that comes back
// missing or of the wrong kind.
const DEFAULTS = {
    seconds: 10,
    show_clock: true,
    show_date: true,
    show_message: true,
    show_pinball: true,
    time_format: "24h",
    message: "Hello from the workshop"
};

const REFRESH = 1000; // ms between sending the whole frame again, changed or not
const GREY = "#FFFFFF80";

// A black sheet over the whole front screen, in front of everything.
const CURTAIN = box("curtain", 0, 0, 72, 16, "#000000FF");
CURTAIN.z_index = 100;

let settings = tidy(null);
let scene = null;   // the scene on screen
let sceneStart = 0; // when it went up: the clock its animation runs on
let dwellStart = 0; // when its turn began
let dwell = 0;      // how long its turn lasts, in ms
let shown = {};     // what this app has on the bar's screens: id -> the element, as text
let lastWhole = 0;  // when the whole frame was last sent
let running = true;
let turns = 0;      // wheel clicks not yet acted on
let wake = null;    // call it to end the current wait early

function tidy(values) {
    const out = {};
    for (const key in DEFAULTS) {
        const value = values ? values[key] : undefined;
        out[key] = typeof value === typeof DEFAULTS[key] ? value : DEFAULTS[key];
    }
    return out;
}

// The scenes that are switched on, in order. With every one off, the clock plays anyway.
function lineup() {
    const on = SCENES.filter(s => settings["show_" + s.id] && (!s.wanted || s.wanted(settings)));
    return on.length > 0 ? on : [clock];
}

// The back screen faces whoever sits at the bar: it says what is playing and
// what the controls do. Its ids start with "b.".
function backLine(id, string, font, y, color) {
    return {
        id: id, type: "text", text: string, font: font, x: 4, y: y, align: "top_left",
        color: color || "#FFFFFFFF", display: "back"
    };
}

function backScreen() {
    return [
        backLine("b.title", "Attract Mode", "bold", 2),
        backLine("b.scene", scene.title, "extra_large", 22),
        backLine("b.wheel", "Wheel: change scene", "normal", 46, GREY),
        backLine("b.back", "BACK: exit", "normal", 60, GREY)
    ];
}

function onFront(id) {
    return id.slice(0, 2) !== "b.";
}

// One frame: ask the scene what should be on screen, then send the difference.
async function paint() {
    const now = Date.now();
    const frame = scene.frame(new Date(now), now - sceneStart, settings).concat(backScreen());

    // Once a second the whole frame goes again, changed or not. If another
    // program takes the screen for a moment, the bar wipes this app's elements
    // and tells it nothing; the resend puts them back. The exception is text
    // the bar scrolls by itself: sent again, it starts its scroll over, so
    // that goes only when it changes.
    const whole = now - lastWhole >= REFRESH;
    const next = {};
    const send = [];
    for (const element of frame) {
        const asText = JSON.stringify(element);
        next[element.id] = asText;
        const movesItself = element.scroll_rate !== undefined;
        if (shown[element.id] !== asText || (whole && !movesItself)) {
            send.push(element);
        }
    }
    const before = Object.keys(shown);
    const gone = before.filter(id => !(id in next));

    // Remove first, so old and new are never seen together. The exception:
    // if that would leave the front screen empty, the bar would flash its own
    // "Loading" screen, so then the new elements go up first.
    const emptying = gone.length > 0 && gone.length === before.filter(onFront).length;
    if (gone.length > 0 && !emptying) {
        await remove(gone);
    }
    let status = 200;
    if (send.length > 0) {
        status = await draw(send);
    }
    if (emptying) {
        await remove(gone);
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

// Change scene by `step` places in the line-up: 1 is the next one, -1 the one before.
async function change(step) {
    try {
        settings = tidy(await readSettings()); // picks up anything changed in Setup or on the bar's web page
    } catch (error) {
        console.error(`${APP}: ${error.message}`);
    }
    const list = lineup();
    const at = list.indexOf(scene);
    const next = list[at < 0 ? 0 : ((at + step) % list.length + list.length) % list.length];

    dwellStart = Date.now();
    dwell = next.duration ? next.duration(settings) : settings.seconds * 1000;
    if (next === scene) {
        return; // a one-scene show: leave it up, with its animation running
    }

    // Cut to black, clear the old scene away behind the curtain, put the new
    // one up, then lift the curtain. Old and new are never seen together, and
    // the screen is never empty.
    const old = Object.keys(shown).filter(onFront);
    let curtain = false;
    if (old.length > 0 && await draw([CURTAIN]) === 200) {
        curtain = true;
        await remove(old);
    }
    shown = {};
    lastWhole = 0;
    scene = next;
    sceneStart = dwellStart;
    await paint();
    if (curtain) {
        await remove(["curtain"]);
    }
}

const unbind = listen("input", event => {
    if (event.key === "back" && event.action === "short") {
        running = false;
    } else if (event.key === "encoder") {
        turns += event.action === "clockwise" ? 1 : -1;
    } else {
        return;
    }
    if (wake) {
        wake();
    }
});

// Wait `ms`, or until a button or the wheel cuts the wait short.
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
    while (running) {
        const began = Date.now();
        let pause = 0;
        try {
            if (scene === null) {
                await change(1);
            } else if (turns !== 0) {
                const step = turns;
                turns = 0;
                await change(step);
            } else if (began - dwellStart >= dwell) {
                await change(1);
            } else if (await paint() === 409) {
                // The bar already held that draw for a second and a half
                // before refusing it, so there is no need to wait long.
                pause = 200;
            }
        } catch (error) {
            console.error(`${APP}: ${error.message}`);
            shown = {};
            pause = 1000;
        }
        if (running) {
            await sleep(pause || Math.max(10, (scene ? scene.interval : 100) - (Date.now() - began)));
        }
    }
    await clear();
    setTimeout(unbind, 10); // with no listener and no timer left, the app ends
}

run().catch(error => {
    console.error(`${APP}: ${error.message}`);
    setTimeout(unbind, 10);
});
