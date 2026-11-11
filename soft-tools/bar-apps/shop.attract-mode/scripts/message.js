// Scene three: a message.
//
// The lesson: let the bar do the moving. A line too long for the screen is
// drawn once, with a width and a scroll speed, and the bar's own firmware
// slides it round and round like a marquee. The app sends nothing more until
// the scene ends. A line that fits is simply centred.

import { AMBER, text, box } from "./elements.js";
import { textWidth } from "./font.js";

const SPEED = 1800;        // pixels a minute, which is 30 a second
const START_DELAY = 800;   // ms the line rests before it starts to move
const REPEAT_DELAY = 1500; // ms it rests each time it comes back round
const GAP = 12;            // pixels the bar leaves between the line's end and its start
const RULE = "#FFAA0050";  // the thin lines above and below

// Text for the bar must be printable ASCII. Anything else becomes "?".
function clean(message) {
    return String(message || "").replace(/[^\x20-\x7E]/g, "?").trim();
}

function fits(line) {
    return textWidth(line) <= 70;
}

function frame(now, elapsed, settings) {
    const line = clean(settings.message);
    const elements = [box("m.top", 0, 0, 72, 1, RULE), box("m.bottom", 0, 15, 72, 1, RULE)];
    if (fits(line)) {
        elements.push(text("m.still", line, "extra_large", 36, 1, "top_mid", AMBER));
    } else {
        // `width` makes the text a 72-pixel window; the scroll fields move the line through it.
        const moving = text("m.moving", line, "extra_large", 0, 1, "top_left", AMBER);
        moving.width = 72;
        moving.scroll_rate = SPEED;
        moving.scroll_start_delay = START_DELAY;
        moving.scroll_repeat_delay = REPEAT_DELAY;
        elements.push(moving);
    }
    return elements;
}

// A long line stays up for a whole number of trips round, so it is never cut
// off part way: as many trips as come closest to the "seconds per scene"
// setting, and at least one. The scene ends half-way through a rest.
function duration(settings) {
    const line = clean(settings.message);
    const asked = settings.seconds * 1000;
    if (fits(line)) {
        return asked;
    }
    const lap = (textWidth(line) + GAP) * 60000 / SPEED + REPEAT_DELAY; // one trip round, and the rest after it
    const laps = Math.max(1, Math.round((asked - START_DELAY) / lap));
    return START_DELAY + laps * lap - REPEAT_DELAY / 2;
}

// With no message set, the scene is left out of the show.
function wanted(settings) {
    return clean(settings.message).length > 0;
}

const message = { id: "message", title: "Message", interval: 1000, frame: frame, duration: duration, wanted: wanted };

export { message };
