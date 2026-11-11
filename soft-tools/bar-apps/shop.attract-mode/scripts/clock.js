// Scene one: the time.
//
// The lesson: let anchor points do the layout. The hours are pinned by their
// right edge and the minutes by their left, both to the colon. Digits differ
// in width ("1" is narrow), but the colon never moves.

import { AMBER, WHITE, text, box } from "./elements.js";
import { textWidth } from "./font.js";

const COLON_OFF = "#FFAA0040"; // the same amber, a quarter as bright

function frame(now, elapsed, settings) {
    const twelve = settings.time_format === "12h";
    const hour = now.getHours();
    const hours = twelve ? String(hour % 12 === 0 ? 12 : hour % 12) : String(hour).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = now.getSeconds();
    const colon = twelve ? 30 : 36; // the colon's column; 12-hour leaves room for AM or PM

    const elements = [
        text("c.hours", hours, "extra_large", colon - 2, 1, "top_right", WHITE),
        text("c.colon", ":", "extra_large", colon, 1, "top_mid", seconds % 2 === 0 ? AMBER : COLON_OFF),
        text("c.minutes", minutes, "extra_large", colon + 2, 1, "top_left", WHITE),
        // A line along the bottom edge that fills up as the minute goes by.
        box("c.seconds", 0, 15, Math.round((seconds + 1) * 72 / 60), 1, "#FFAA00B0")
    ];
    if (twelve) {
        const after = colon + 2 + textWidth(minutes) + 3;
        elements.push(text("c.suffix", hour < 12 ? "AM" : "PM", "small", after, 5, "top_left", AMBER));
    }
    return elements;
}

// The runner asks for a frame every `interval` ms and sends only what changed,
// so asking four times a second costs one small draw a second.
const clock = { id: "clock", title: "Clock", interval: 250, frame: frame };

export { clock };
