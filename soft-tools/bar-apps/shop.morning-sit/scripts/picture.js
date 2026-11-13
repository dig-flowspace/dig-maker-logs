// What the front screen shows at any moment of the sit.
//
// picture(scene) answers the whole frame: every element that belongs on
// screen now, and how soon to ask again. It keeps nothing between calls. The
// runner in main.js compares each frame with the last and sends the
// difference.
//
// The screen is 72 x 16, and one layout serves every moment:
//
//   rows  1 to 5    a line of text, when there is one
//   rows  7 and 8   the dot, in the middle, and whatever grows out of it
//   rows 10 to 14   a second line of text
//
// The bar's own brightness is never touched. Everything is made dimmer or
// brighter through the alpha in its colour, which dims a colour toward
// black. The eye is not even-handed about brightness, so fades run from 0 to
// 1 as the eye sees it and are squared before they are drawn.

import { FADE_MS, CUE_MS, ringTime, phaseAt } from "./programme.js";

const EMBER = [255, 160, 48];  // the dot, and the light that comes out of it
const WARM = [255, 214, 170];  // text, and the bar in a break

// How bright things are drawn while the screen is awake, 0 to 1.
const DOT_AWAKE = 0.9;
const BAR_AWAKE = 0.55;
const TEXT_AWAKE = 0.8;
const TEXT_FLOOR = 0.15; // text is never drawn dimmer than this: lower, and it can't be read

// The bell's light: the whole face, brighter in the middle.
const BLOOM = 0.16;      // the whole face, at the top of the swell
const BLOOM_CORE = 0.3;  // the middle of it
const RISE_MS = 350;     // the swell comes up this fast
const FALL_MS = 1500;    // and falls to about a third in this long

// The breath, as the eye sees it: each layer's brightness at the top of an
// in-breath is GLOW_BASE times the dot's own, plus GLOW_SWING.
const GLOW_BASE = 0.45;
const GLOW_SWING = 0.26;
const DOT_SWING = 0.3;   // how much the dot itself brightens with the breath
const IN_SHARE = 0.4;    // the in-breath's share of a breath: 4 seconds in 10
const TAPER_MS = 10000;  // the breath shrinks to nothing over the round's last seconds

// The layers of the breath, widest and thinnest first. `from` is how full
// the breath is when the layer first shows; `reach` is how many pixels wider
// than the dot it gets.
const LAYERS = [
    { id: "tide", from: 0, reach: 48, height: 2, z: 4 },
    { id: "swell", from: 0.15, reach: 30, height: 4, z: 6 },
    { id: "crest", from: 0.4, reach: 16, height: 6, z: 8 }
];

const OPEN_MS = 1000;    // the screen comes up over this long when the app opens
const TURN_MS = 3000;    // the break's bar takes this long to turn to the dot's colour
const HALO = 0.3;        // the glow round the bar as it turns

function clamp(x) {
    return x < 0 ? 0 : (x > 1 ? 1 : x);
}

function hex(n) {
    const s = Math.max(0, Math.min(255, Math.round(n))).toString(16).toUpperCase();
    return s.length < 2 ? "0" + s : s;
}

// A colour at a brightness of 0 to 1, in the form the bar takes: #RRGGBBAA.
function tint(colour, alpha) {
    return "#" + hex(colour[0]) + hex(colour[1]) + hex(colour[2]) + hex(alpha * 255);
}

// Whether a brightness is too low to draw at all.
function dark(alpha) {
    return Math.round(alpha * 255) < 1;
}

// A colour part of the way from one to another.
function blend(from, to, share) {
    return [
        from[0] + (to[0] - from[0]) * share,
        from[1] + (to[1] - from[1]) * share,
        from[2] + (to[2] - from[2]) * share
    ];
}

// A brightness part of the way from `low` to `high`, stepping evenly as the
// eye sees it.
function between(low, high, share) {
    const a = Math.sqrt(low);
    const b = Math.sqrt(high);
    const seen = a + (b - a) * share;
    return seen * seen;
}

// A box of light centred on the screen. With a radius its ends are round.
function box(id, width, height, radius, colour, alpha, z) {
    return {
        id: id, type: "rectangle", x: 36, y: 8, align: "center", width: width, height: height,
        radius: radius, fill: "solid", fill_colors: [tint(colour, alpha)], border_width: 0,
        z_index: z, display: "front"
    };
}

// A bar of light with round ends, centred on the dot. `width` may be a
// fraction. The bar draws whole pixels only, so the fraction goes into a
// second bar, two pixels wider and fainter, whose ends show past the first.
function capsule(id, width, height, colour, alpha, z) {
    if (dark(alpha)) {
        return [];
    }
    const wide = Math.max(2, Math.min(72, width));
    const whole = 2 * Math.floor(wide / 2);
    const radius = Math.floor(height / 2);
    if (whole >= 72) {
        return [box(id, 72, height, radius, colour, alpha, z + 1)];
    }
    const part = (wide - whole) / 2; // how far the next pair of pixels is lit, 0 to 1
    const outer = alpha * part;
    // Where the two overlap their light adds up, so the inner one is turned
    // down to keep the middle at `alpha`. Both are sent even when one of them
    // is too faint to see: taking an element off the screen is a call of its
    // own, and this way a moving bar needs none.
    const inner = (alpha - outer) / (1 - outer);
    return [
        box(id, whole, height, radius, colour, inner, z + 1),
        box(id + ".edge", whole + 2, height, radius, colour, outer, z)
    ];
}

function line(id, string, y, alpha) {
    return {
        id: id, type: "text", text: string, font: "small", x: 36, y: y, align: "top_mid",
        color: tint(WARM, alpha), z_index: 30, display: "front"
    };
}

// How full the breath is, 0 to 1: a slow rise for the in-breath and a slower
// fall for the out-breath, easing at both turns.
function level(ms, breathMs) {
    const p = (ms % breathMs) / breathMs;
    if (p < IN_SHARE) {
        return (1 - Math.cos(Math.PI * p / IN_SHARE)) / 2;
    }
    return (1 + Math.cos(Math.PI * (p - IN_SHARE) / (1 - IN_SHARE))) / 2;
}

// How bright the bell's light is, 0 to 1 as the eye sees it, `ms` after the
// strike: up quickly, then down the way a bell dies away.
function swell(ms) {
    if (ms < 0) {
        return 0;
    }
    if (ms < RISE_MS) {
        const s = ms / RISE_MS;
        return s * s * (3 - 2 * s);
    }
    const left = Math.exp(-(ms - RISE_MS) / FALL_MS);
    return left < 0.03 ? 0 : left;
}

// The scene:
//   sit       the plan, from programme.js
//   t         the sit's clock, in ms
//   dim       the lowest brightness in a round, 0 to 1 (the Dim min setting)
//   breathe   whether the dot breathes during a round
//   breathMs  how long one breath lasts
//   pause     how far the paused screen has come up, 0 to 1
//   peek      how far the look at the round and the minutes has come up, 0 to 1
//   rung      ms since the last strike of the bell, or -1 if there has been none
//   trouble   the bar's answer if it ever refused to play the bell, else 0
//
// The answer is { elements, hurry }: the frame, and the longest the runner
// should wait before asking for the next one if nothing else changes.
function picture(scene) {
    const sit = scene.sit;
    const t = scene.t;
    const dim = scene.dim;
    const pause = scene.pause;
    const phase = phaseAt(sit, t);
    const into = t - phase.start;
    const left = Math.max(0, phase.end - t);

    // How awake the screen is: 0 in a round, 1 in a break. `all` scales
    // everything: the screen comes up when the app opens and goes down before
    // it closes.
    let awake = 0;
    let all = 1;
    let fading = false; // a quick fade is under way
    if (phase.kind === "settle") {
        awake = clamp(left / FADE_MS);
        all = clamp(t / OPEN_MS);
        fading = left < FADE_MS || t < OPEN_MS;
    } else if (phase.kind === "break") {
        awake = Math.min(clamp(into / FADE_MS), clamp(left / CUE_MS));
        fading = into < FADE_MS;
    } else if (phase.kind === "end") {
        awake = clamp(into / FADE_MS);
        all = clamp(left / FADE_MS);
        fading = into < FADE_MS || left < FADE_MS;
    }
    const lit = awake + (1 - awake) * pause; // a paused sit is awake, whatever the phase
    const seen = all * all;
    const quiet = 1 - pause;                 // a pause hides the bell's light and the breath

    const out = [];
    let hurry = 1000;

    // The bell's light.
    const ring = swell(scene.rung) * quiet;
    if (ring > 0) {
        const glow = ring * ring * seen;
        if (!dark(BLOOM * glow)) {
            out.push(box("bloom", 72, 16, 8, EMBER, BLOOM * glow, 0));
        }
        if (!dark(BLOOM_CORE * glow)) {
            out.push(box("bloom.core", 36, 8, 4, EMBER, BLOOM_CORE * glow, 1));
            fading = true;
        }
    }

    // The bar: the time left before the first bell, or left in a break. It
    // draws in toward the dot as the time runs out.
    if (phase.kind === "settle" || phase.kind === "break") {
        const width = 2 + 70 * left / (phase.end - phase.start);
        let colour = WARM;
        if (phase.kind === "break" && left < CUE_MS) {
            // The cue: half a minute before the next round the bar turns to
            // the dot's colour, with a glow round it as it turns, and from
            // there the screen dims.
            const turn = clamp((CUE_MS - left) / TURN_MS);
            colour = blend(WARM, EMBER, turn);
            if (turn < 1) {
                const bump = Math.sin(Math.PI * turn);
                const halo = capsule("halo", width + 4, 6, EMBER, HALO * bump * bump * quiet * seen, 2);
                for (let i = 0; i < halo.length; i++) {
                    out.push(halo[i]);
                }
                fading = true;
            }
        }
        // In a break the bar comes up from nothing, so it never pops in. And
        // its last few pixels fade as they go, so it is gone by the time it
        // reaches the dot and never adds to the dot's own light.
        const rise = phase.kind === "break" ? clamp(into / FADE_MS) : 1;
        const going = clamp((width - 2) / 4);
        const bar = capsule("bar", width, 2, colour, between(dim, Math.max(dim, BAR_AWAKE), lit) * rise * rise * going * seen, 10);
        for (let i = 0; i < bar.length; i++) {
            out.push(bar[i]);
        }
        hurry = 125;
    }

    // The breath: light that flows out of the dot and back, once the bells
    // that open the round have rung out.
    let breath = 0;
    if (phase.kind === "round" && scene.breathe && into > ringTime(3)) {
        breath = level(into - ringTime(3), scene.breathMs) * clamp(left / TAPER_MS) * quiet;
        hurry = 80;
    }
    if (breath > 0) {
        const peak = GLOW_BASE * Math.sqrt(dim) + GLOW_SWING;
        for (let i = 0; i < LAYERS.length; i++) {
            const layer = LAYERS[i];
            const part = clamp((breath - layer.from) / (1 - layer.from));
            if (part > 0) {
                const glow = peak * clamp(part / 0.1) * (0.55 + 0.45 * part);
                const shape = capsule(layer.id, 2 + layer.reach * part, layer.height, EMBER, glow * glow * seen, layer.z);
                for (let j = 0; j < shape.length; j++) {
                    out.push(shape[j]);
                }
            }
        }
    }

    // The dot. It is always there, so the screen is never empty: an empty
    // screen makes the bar put up its own "Loading".
    const dot = Math.min(1, Math.sqrt(between(dim, Math.max(dim, DOT_AWAKE), lit)) + DOT_SWING * breath);
    out.push(box("dot", 2, 2, 0, EMBER, dot * dot * seen, 20));

    // The two lines of text.
    let top = "";
    let low = "";
    let shown = 0;
    if (phase.kind === "settle") {
        top = pause > 0 ? "PAUSED" : "WEEK " + sit.week;
        low = sit.rounds + " X " + sit.count + " MIN";
        shown = Math.max(awake, pause);
    } else if (phase.kind === "end") {
        top = "WEEK " + sit.week + " DONE";
        low = scene.trouble ? "BELL ERR " + scene.trouble : sit.minutes + " MIN";
        shown = awake;
    } else {
        if (pause > 0) {
            top = "PAUSED";
        } else if (phase.kind === "round") {
            top = "ROUND " + phase.n + " OF " + sit.rounds;
        } else {
            top = "BREAK " + phase.n + " OF " + (sit.rounds - 1);
        }
        low = Math.max(1, Math.ceil(left / 60000)) + " MIN LEFT";
        shown = Math.max(scene.peek, pause);
    }
    const faint = Math.max(dim, TEXT_FLOOR);
    const ink = between(faint, Math.max(faint, TEXT_AWAKE), lit) * shown * shown * seen;
    if (!dark(ink)) {
        out.push(line("top", top, -1, ink));
        out.push(line("low", low, 8, ink));
    }

    if (fading) {
        hurry = 40;
    }
    return { elements: out, hurry: hurry };
}

export { picture, level, swell, between };
