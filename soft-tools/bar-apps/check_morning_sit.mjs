// Check Morning Sit's plan and its picture on the PC, without the bar.
//
//   node soft-tools/bar-apps/check_morning_sit.mjs
//   node soft-tools/bar-apps/check_morning_sit.mjs show <week> <seconds> [breathe] [dim=20] [bpm=6] [pause] [look]
//
// With no words after it, it does two things and exits 1 if either fails:
//   - facts: the six weeks, the bells and the wording of each screen, against
//     what was decided in hard-tools/busy-bar/apps/morning-sit/feature-review.md;
//   - smoothness: it walks weeks 1, 3 and 6 a frame at a time, draws each
//     frame, and looks for any pixel that jumps. Where something changes
//     quickly it slices the time finer: a fade or a moving edge changes less
//     in a shorter step, and a jump does not.
//
// "show" prints one moment of the picture as text, one character a pixel.
// The bar's fonts aren't here, so each line of text is printed beside its rows.
//
// check_app.mjs is the other half: it runs the whole app and checks every
// request. This one imports programme.js and picture.js and looks at what
// they answer. Needs Node 22 or newer; nothing to install.

import { cpSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const folder = join(dirname(fileURLToPath(import.meta.url)), "shop.morning-sit");
const work = mkdtempSync(join(tmpdir(), "morning-sit-check-"));
cpSync(join(folder, "scripts"), join(work, "scripts"), { recursive: true });
writeFileSync(join(work, "package.json"), '{"type": "module"}');
const programme = await import(pathToFileURL(join(work, "scripts", "programme.js")).href);
const { picture } = await import(pathToFileURL(join(work, "scripts", "picture.js")).href);
rmSync(work, { recursive: true, force: true });

const W = 72;
const H = 16;

// ---- drawing a frame the way the bar does ---------------------------------

// "#RRGGBBAA" as four numbers from 0 to 1.
function parse(colour) {
    return [1, 3, 5, 7].map((i) => parseInt(colour.slice(i, i + 2), 16) / 255);
}

// The boxes of a frame, from the back forward.
function boxesOf(elements) {
    return elements.filter((e) => e.type === "rectangle").sort((a, b) => (a.z_index || 0) - (b.z_index || 0));
}

// How much of pixel (x, y) a box covers, 0 to 1. Round corners are measured
// by sampling the pixel 16 times.
function cover(e, x, y) {
    const x0 = e.x - e.width / 2;
    const y0 = e.y - e.height / 2;
    if (x + 1 <= x0 || x >= x0 + e.width || y + 1 <= y0 || y >= y0 + e.height) return 0;
    const rad = Math.min(e.radius || 0, e.width / 2, e.height / 2);
    // Only a pixel in one of the four corners can be partly covered.
    const inX = x >= x0 + rad && x + 1 <= x0 + e.width - rad;
    const inY = y >= y0 + rad && y + 1 <= y0 + e.height - rad;
    if ((inX && y >= y0 && y + 1 <= y0 + e.height) || (inY && x >= x0 && x + 1 <= x0 + e.width)) return 1;
    let hits = 0;
    for (let sy = 0; sy < 4; sy++) {
        for (let sx = 0; sx < 4; sx++) {
            const px = x + (sx + 0.5) / 4;
            const py = y + (sy + 0.5) / 4;
            const cx = Math.max(x0 + rad, Math.min(x0 + e.width - rad, px));
            const cy = Math.max(y0 + rad, Math.min(y0 + e.height - rad, py));
            if ((px - cx) ** 2 + (py - cy) ** 2 <= rad * rad + 1e-9) hits++;
        }
    }
    return hits / 16;
}

// The light at each pixel: red, green, blue, 0 to 1. Boxes are laid down
// from the back forward, and where they overlap their light adds up the way
// the bar's does.
function raster(elements) {
    const grid = new Float64Array(W * H * 3);
    for (const e of boxesOf(elements)) {
        const [r, g, b, a] = parse(e.fill_colors[0]);
        const x0 = e.x - e.width / 2;
        const y0 = e.y - e.height / 2;
        for (let y = Math.max(0, Math.floor(y0)); y < Math.min(H, y0 + e.height); y++) {
            for (let x = Math.max(0, Math.floor(x0)); x < Math.min(W, x0 + e.width); x++) {
                const share = a * cover(e, x, y);
                const at = (y * W + x) * 3;
                grid[at] = grid[at] * (1 - share) + r * share;
                grid[at + 1] = grid[at + 1] * (1 - share) + g * share;
                grid[at + 2] = grid[at + 2] * (1 - share) + b * share;
            }
        }
    }
    return grid;
}

// Everything the eye could see change, as one row of numbers: the grid
// above, then the brightness of the two lines of text.
const VALUES = W * H * 3 + 2;
function valuesOf(elements) {
    const values = new Float64Array(VALUES);
    values.set(raster(elements));
    for (const e of elements) {
        if (e.type === "text") values[W * H * 3 + (e.id === "top" ? 0 : 1)] = parse(e.color)[3];
    }
    return values;
}

// A few of those numbers, worked out alone: `wanted` lists which, and the
// answers come back in the same order. Numbers for one pixel's three colours
// sit together in the list, so the pixel is worked out once.
function valuesAt(elements, wanted) {
    const boxes = boxesOf(elements).map((e) => ({ e, colour: parse(e.fill_colors[0]) }));
    const out = new Float64Array(wanted.length);
    let pixel = -1;
    let light = [0, 0, 0];
    for (let q = 0; q < wanted.length; q++) {
        const i = wanted[q];
        if (i >= W * H * 3) {
            const e = elements.find((x) => x.type === "text" && x.id === (i === W * H * 3 ? "top" : "low"));
            out[q] = e ? parse(e.color)[3] : 0;
            continue;
        }
        if (Math.floor(i / 3) !== pixel) {
            pixel = Math.floor(i / 3);
            light = [0, 0, 0];
            for (const { e, colour } of boxes) {
                const share = colour[3] * cover(e, pixel % W, Math.floor(pixel / W));
                if (share > 0) {
                    for (let c = 0; c < 3; c++) light[c] = light[c] * (1 - share) + colour[c] * share;
                }
            }
        }
        out[q] = light[i % 3];
    }
    return out;
}

function whereIs(i) {
    if (i >= W * H * 3) return "the text";
    const pixel = Math.floor(i / 3);
    return `pixel ${pixel % W}, ${Math.floor(pixel / W)}`;
}

// The scene at a moment of the sit, with the bell's light worked out from the plan.
function sceneAt(sit, t, more) {
    let rung = -1;
    for (const at of sit.strikes) {
        if (at <= t) rung = t - at;
    }
    return Object.assign({ sit, t, dim: 0.2, breathe: false, breathMs: 10000, pause: 0, peek: 0, rung, trouble: 0 }, more || {});
}

// ---- show -----------------------------------------------------------------

const SHADES = " .,:;-=+*#%@";

function show(week, seconds, more) {
    const sit = programme.plan(week);
    const phase = programme.phaseAt(sit, seconds * 1000);
    const frame = picture(sceneAt(sit, seconds * 1000, more));
    const grid = raster(frame.elements);
    const texts = frame.elements.filter((e) => e.type === "text");
    console.log(`week ${week}, ${seconds} s in: ${phase.kind}${phase.n ? " " + phase.n : ""}. Next frame wanted within ${frame.hurry} ms.`);
    for (let y = 0; y < H; y++) {
        let row = "";
        for (let x = 0; x < W; x++) {
            const at = (y * W + x) * 3;
            const v = Math.max(grid[at], grid[at + 1], grid[at + 2]);
            row += v <= 0 ? " " : SHADES[Math.min(SHADES.length - 1, 1 + Math.floor(v * (SHADES.length - 1)))];
        }
        // The small font's letters start two rows below the text's y and are five rows tall.
        const here = texts.find((e) => y === e.y + 4);
        console.log(String(y).padStart(2) + " |" + row + "|" + (here ? `  "${here.text}" at ${(parse(here.color)[3] * 100).toFixed(0)}%` : ""));
    }
    for (const e of frame.elements) {
        if (e.type === "rectangle") console.log(`     ${e.id.padEnd(11)} ${String(e.width).padStart(2)} x ${String(e.height).padStart(2)}  ${e.fill_colors[0]}`);
    }
}

// ---- facts ----------------------------------------------------------------

let failed = 0;
function check(what, ok, detail) {
    if (!ok) {
        failed++;
        console.log(`  FAIL  ${what}${detail !== undefined ? "  (got " + detail + ")" : ""}`);
    }
    return ok;
}

function facts() {
    let count = 0;
    const say = (what, ok, detail) => {
        count++;
        check(what, ok, detail);
    };

    // The six weeks as the review file has them: counting, break, rounds, whole sit, in minutes.
    const TABLE = [[5, 2, 4, 26], [8, 2, 3, 28], [9, 1, 3, 29], [13, 2, 2, 28], [15, 1, 2, 31], [30, 0, 1, 30]];
    for (let week = 1; week <= 6; week++) {
        const [counting, rest, rounds, whole] = TABLE[week - 1];
        const sit = programme.plan(week);
        const rnd = sit.phases.filter((p) => p.kind === "round");
        const brk = sit.phases.filter((p) => p.kind === "break");
        const end = sit.phases[sit.phases.length - 1];
        say(`week ${week}: ${rounds} rounds of ${counting} minutes`, rnd.length === rounds && rnd.every((p) => p.end - p.start === counting * 60000));
        say(`week ${week}: ${rounds - 1} breaks of ${rest} minutes, and none after the last round`,
            brk.length === rounds - 1 && brk.every((p) => p.end - p.start === rest * 60000) && sit.phases[sit.phases.length - 2].kind === "round");
        say(`week ${week}: the first bell comes 45 seconds after opening`, sit.strikes[0] === 45000, sit.strikes[0]);
        say(`week ${week}: the whole sit is ${whole} minutes, first bell to last`, end.start - 45000 === whole * 60000 && sit.minutes === whole, (end.start - 45000) / 60000);
        const want = [];
        for (const p of sit.phases) {
            const strikes = { round: 3, break: 2, end: 1 }[p.kind] || 0;
            for (let k = 0; k < strikes; k++) want.push(p.start + k * 7500);
        }
        say(`week ${week}: three strikes begin a round, two a break, one ends the sit, 7.5 seconds apart`, JSON.stringify(want) === JSON.stringify(sit.strikes));
        say(`week ${week}: each phase starts where the last one ended`, sit.phases.every((p, i) => i === 0 || p.start === sit.phases[i - 1].end));
        say(`week ${week}: the app closes two minutes after the last bell`, sit.end === end.start + 120000);
    }

    const sit = programme.plan(1);
    const at = (seconds, more) => sceneAt(sit, seconds * 1000, Object.assign({ rung: -1 }, more || {}));
    const texts = (scene) => picture(scene).elements.filter((e) => e.type === "text").map((e) => e.text).join(" / ");
    const alpha = (scene, id) => {
        const e = picture(scene).elements.find((x) => x.id === id);
        return e ? parse(e.color || e.fill_colors[0])[3] : 0;
    };
    const lit = (scene) => picture(scene).elements.filter((e) => e.fill_colors && parse(e.fill_colors[0])[3] > 0).length;

    say("settle-in names the week and its shape", texts(at(10)) === "WEEK 1 / 4 X 5 MIN", texts(at(10)));
    say("week 6's settle-in", texts(sceneAt(programme.plan(6), 10000)) === "WEEK 6 / 1 X 30 MIN");
    say("the first frame holds the dot, unlit, so the screen is never empty", alpha(at(0), "dot") === 0 && picture(at(0)).elements.some((e) => e.id === "dot"));
    say("a round shows the dot and nothing else", picture(at(120)).elements.length === 1 && texts(at(120)) === "");
    say("a round's dot is at Dim min", Math.abs(alpha(at(120), "dot") - 0.2) < 0.003, alpha(at(120), "dot"));
    say("with breathing off, nothing moves in a round", picture(at(120)).hurry === 1000, picture(at(120)).hurry);
    say("a look in a round", texts(at(120, { peek: 1 })) === "ROUND 1 OF 4 / 4 MIN LEFT", texts(at(120, { peek: 1 })));
    say("a look in a round is no brighter than Dim min", Math.abs(alpha(at(120, { peek: 1 }), "top") - 0.2) < 0.003, alpha(at(120, { peek: 1 }), "top"));
    say("with Dim min at 5%, a look is still drawn at 15%", Math.abs(alpha(at(120, { peek: 1, dim: 0.05 }), "top") - 0.15) < 0.003);
    say("a round's last minute reads 1 MIN LEFT", texts(at(344, { peek: 1 })) === "ROUND 1 OF 4 / 1 MIN LEFT", texts(at(344, { peek: 1 })));
    say("a look in a break", texts(at(400, { peek: 1 })) === "BREAK 1 OF 3 / 2 MIN LEFT", texts(at(400, { peek: 1 })));
    say("paused in a round", texts(at(120, { pause: 1 })) === "PAUSED / 4 MIN LEFT", texts(at(120, { pause: 1 })));
    say("paused during settle-in", texts(at(10, { pause: 1 })) === "PAUSED / 4 X 5 MIN", texts(at(10, { pause: 1 })));
    say("the closing screen", texts(at(1620)) === "WEEK 1 DONE / 26 MIN", texts(at(1620)));
    say("the closing screen says so if the bar refused the bell", texts(at(1620, { trouble: 404 })) === "WEEK 1 DONE / BELL ERR 404", texts(at(1620, { trouble: 404 })));
    say("with breathing on, the breath waits for the three bells to ring out (21 seconds)",
        lit(at(45 + 20, { breathe: true })) === 1 && lit(at(45 + 23, { breathe: true })) > 1);
    say("with breathing on, the dot is back at Dim min at the bottom of each breath",
        Math.abs(alpha(at(45 + 21 + 10, { breathe: true }), "dot") - 0.2) < 0.01, alpha(at(45 + 21 + 10, { breathe: true }), "dot"));
    say("with breathing on, only the dot is lit when the round ends", lit(at(344.99, { breathe: true })) === 1, lit(at(344.99, { breathe: true })));

    // Every line the app can show: printable, and short enough for 72 pixels at about 4 a letter.
    let longest = "";
    for (let week = 1; week <= 6; week++) {
        const s = programme.plan(week);
        for (let t = 0; t < s.end; t += 5000) {
            for (const more of [{}, { peek: 1 }, { pause: 1 }, { trouble: 404 }]) {
                for (const e of picture(sceneAt(s, t, more)).elements) {
                    if (e.type !== "text") continue;
                    if (!/^[\x20-\x7E]+$/.test(e.text)) say(`text is printable ASCII: ${JSON.stringify(e.text)}`, false);
                    if (e.text.length > longest.length) longest = e.text;
                }
            }
        }
    }
    say("the longest line of text fits the screen", longest.length <= 14, `"${longest}"`);
    console.log(`facts: ${count} checked${failed === 0 ? ", all as decided" : ""}`);
}

// ---- smoothness -----------------------------------------------------------

const STEP = 40;    // ms between frames, as during a fade on the bar
const SLICES = 16;  // a step that changes something quickly is cut into this many
const QUICK = 0.02; // "quickly": more than this much of full brightness in one step
const JUMP = 0.02;  // the most any value may change in one slice, 2.5 ms

// Walk the sit a step at a time. Where a value changes quickly, walk that
// step again in slices and see how much it changes in each. A fade or a
// moving edge changes a sixteenth as much in a sixteenth of the time. A jump
// changes just as much: something appeared, vanished or moved all at once.
// The jumps this check has caught were 14% and 16% of full brightness.
function smoothness() {
    let frames = 0;
    const lines = [];
    for (const breathe of [false, true]) {
        for (const dim of [0.05, 0.2, 1]) {
            const more = { breathe, dim };
            let fastest = { size: 0, told: "nothing moved" };
            let jump = { size: 0, told: "none" };
            const told = (size, week, sit, t, i) => {
                const phase = programme.phaseAt(sit, t);
                return `${(size * 100).toFixed(1)}%, in week ${week}, ${((t - phase.start) / 1000).toFixed(2)} s into a ${phase.kind}, at ${whereIs(i)}`;
            };
            // Weeks 1, 3 and 6 between them have two-minute breaks, one-minute breaks and none.
            for (const week of [1, 3, 6]) {
                const sit = programme.plan(week);
                let before = null;
                for (let t = 0; t < sit.end; t += STEP) {
                    const values = valuesOf(picture(sceneAt(sit, t, more)).elements);
                    frames++;
                    if (before) {
                        const quick = [];
                        for (let i = 0; i < VALUES; i++) {
                            const change = Math.abs(values[i] - before[i]);
                            if (change > fastest.size) fastest = { size: change, told: told(change, week, sit, t, i) };
                            if (change > QUICK) quick.push(i);
                        }
                        if (quick.length > 0) {
                            const last = quick.map((i) => before[i]);
                            for (let k = 1; k <= SLICES; k++) {
                                const tt = t - STEP + (k * STEP) / SLICES;
                                const now = valuesAt(picture(sceneAt(sit, tt, more)).elements, quick);
                                frames++;
                                for (let q = 0; q < quick.length; q++) {
                                    const change = Math.abs(now[q] - last[q]);
                                    if (change > jump.size) jump = { size: change, told: told(change, week, sit, tt, quick[q]) };
                                    last[q] = now[q];
                                }
                            }
                        }
                    }
                    before = values;
                }
            }
            const name = `breathing ${breathe ? "on" : "off"}, Dim min ${dim * 100}%`;
            check(`${name}: nothing changes by more than ${JUMP * 100}% of full brightness in ${STEP / SLICES} ms`, jump.size <= JUMP, jump.told);
            lines.push(`  ${name}`);
            lines.push(`      fastest change in ${STEP} ms:  ${fastest.told}`);
            lines.push(`      biggest change in ${STEP / SLICES} ms: ${jump.told}`);
        }
    }
    console.log(`smoothness: ${frames} frames drawn`);
    for (const line of lines) console.log(line);
}

// ---- which ----------------------------------------------------------------

// The exit code is set, not forced: process.exit() here can stall on Windows
// when the output is going down a pipe.
function usage() {
    console.error("usage: node check_morning_sit.mjs                 (facts and smoothness)");
    console.error("       node check_morning_sit.mjs show <week> <seconds> [breathe] [dim=20] [bpm=6] [pause] [look]");
    process.exitCode = 2;
}

const words = process.argv.slice(2);
if (words[0] === "show") {
    const week = Number(words[1]);
    const seconds = Number(words[2]);
    const more = {};
    let bpm = 6;
    let ok = week >= 1 && week <= 6 && Math.floor(week) === week && seconds >= 0;
    for (const word of words.slice(3)) {
        if (word === "breathe") more.breathe = true;
        else if (word === "pause") more.pause = 1;
        else if (word === "look") more.peek = 1;
        else if (/^dim=[0-9]+$/.test(word)) more.dim = Number(word.slice(4)) / 100;
        else if (/^bpm=[0-9]+$/.test(word) && Number(word.slice(4)) > 0) bpm = Number(word.slice(4));
        else ok = false;
    }
    if (ok) {
        more.breathMs = 60000 / bpm;
        show(week, seconds, more);
    } else {
        usage();
    }
} else if (words.length === 0) {
    facts();
    smoothness();
    console.log(failed === 0 ? "no problems found" : `${failed} problem(s)`);
    process.exitCode = failed === 0 ? 0 : 1;
} else {
    usage();
}
