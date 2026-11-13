// Try a bar app on the PC before it goes onto the bar.
//
//   node soft-tools/bar-apps/check_app.mjs soft-tools/bar-apps/shop.attract-mode
//   node soft-tools/bar-apps/check_app.mjs <app folder> --seconds 300 --set time_format=12h --set "message=Back at 3"
//   node soft-tools/bar-apps/check_app.mjs <app folder> --trace        (print every request)
//   node soft-tools/bar-apps/check_app.mjs <app folder> --press 60:start --press 90:ok
//                 (press a control that many seconds in: start, ok or back, or
//                  turn the wheel with encoder:clockwise or encoder:counterclockwise)
//
// It runs the app's scripts against a stand-in for the bar:
//   - a fake clock, so minutes pass in a blink. It starts at 23:59:20 on New
//     Year's Eve, so the minute, hour, day, month and year all roll over;
//   - a fake API that checks every request against the bar's rules, the ones
//     in its spec and the ones this shop found by measuring;
//   - a few turns of the wheel, then a short BACK, after which the app should
//     clear the screen and end. An app that ends by itself first is checked
//     the same way, at the moment it ends;
//   - sounds: a file the app plays has to be in its folder, and the report
//     says when one sound would have cut off another.
//
// It cannot prove the app works on the real thing: the bar runs a different
// JavaScript engine. It catches the slips that would otherwise cost an
// install to find. Needs Node 22 or newer; nothing to install.

import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// ---- arguments ------------------------------------------------------------

const args = process.argv.slice(2);
const folder = args[0] && !args[0].startsWith("--") ? resolve(args[0]) : null;
if (!folder || !existsSync(folder)) {
    console.error("usage: node check_app.mjs <app folder> [--seconds N] [--set key=value] [--press N:key[:action]] [--trace]");
    process.exit(2);
}
let seconds = 150;
let trace = false;
const overrides = {};
const scripted = []; // extra presses: { at, key, action }
for (let i = 1; i < args.length; i++) {
    if (args[i] === "--seconds") seconds = Number(args[++i]);
    else if (args[i] === "--trace") trace = true;
    else if (args[i] === "--set") {
        const [key, ...rest] = args[++i].split("=");
        overrides[key] = rest.join("=");
    } else if (args[i] === "--press") {
        const [when, key, action] = args[++i].split(":");
        if (!(Number(when) >= 0) || !["start", "ok", "back", "encoder"].includes(key)) {
            console.error(`--press ${args[i]}: give the seconds, then start, ok, back or encoder, as in 60:start`);
            process.exit(2);
        }
        scripted.push({ at: Number(when) * 1000, key, action: action || (key === "encoder" ? "clockwise" : "short") });
    }
}

// ---- what went wrong ------------------------------------------------------

const problems = new Map(); // message -> how many times
function problem(message) {
    problems.set(message, (problems.get(message) || 0) + 1);
}

// ---- the package ----------------------------------------------------------

const ID = /^[a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,31}$/;
const SEMVER = /^[0-9]+\.[0-9]+\.[0-9]+$/;

const manifest = JSON.parse(readFileSync(join(folder, "appmeta", "manifest.json"), "utf8"));
for (const key of ["format_version", "id", "name", "version", "api_version"]) {
    if (manifest[key] === undefined) problem(`manifest.json has no "${key}"`);
}
if (!ID.test(manifest.id || "")) problem("manifest id: at most 32 letters, digits, _ - and ., not starting with a period");
if (manifest.id !== basename(folder)) problem(`the folder is "${basename(folder)}" but the manifest id is "${manifest.id}": they must match`);
if (!SEMVER.test(manifest.version || "")) problem("manifest version must look like 1.2.3");
if (!SEMVER.test(manifest.api_version || "")) problem("manifest api_version must look like 27.14.0");
if (!existsSync(join(folder, "scripts", "main.js"))) problem("scripts/main.js is missing");

// The settings the bar would hand the app: the defaults, with any --set on top.
const values = {};
const settingsPath = join(folder, "appmeta", "settings.json");
if (existsSync(settingsPath)) {
    const schema = JSON.parse(readFileSync(settingsPath, "utf8"));
    for (const [key, field] of Object.entries(schema.fields || {})) {
        if (!/^[a-z][a-z0-9_]*$/.test(key)) problem(`settings: "${key}" must be small letters, digits and _`);
        if (!field.label) problem(`settings: "${key}" has no label`);
        if (field.type === "integer") {
            const { min = -2147483648, max = 2147483647, step = 1 } = field;
            if (field.default < min || field.default > max) problem(`settings: "${key}" default is outside min..max`);
            if ((max - min) % step !== 0) problem(`settings: "${key}": max - min must divide evenly by step`);
        }
        if (field.type === "enum" && !field.options.some((o) => o.value === field.default)) {
            problem(`settings: "${key}" default is not one of its options`);
        }
        values[key] = field.default;
    }
    for (const [key, raw] of Object.entries(overrides)) {
        if (!(key in values)) {
            problem(`--set ${key}: the app has no such setting`);
        } else if (typeof values[key] === "boolean") {
            values[key] = raw === "true";
        } else if (typeof values[key] === "number") {
            values[key] = Number(raw);
        } else {
            values[key] = raw;
        }
    }
}

// ---- a fake clock ---------------------------------------------------------

const RealDate = Date;
const realImmediate = setImmediate;
let now = new RealDate(2026, 11, 31, 23, 59, 20).getTime();
const startedAt = now;
const timers = new Map();
let nextTimer = 1;

class FakeDate extends RealDate {
    constructor(...parts) {
        if (parts.length === 0) super(now);
        else super(...parts);
    }
    static now() {
        return now;
    }
}
globalThis.Date = FakeDate;
globalThis.setTimeout = (fn, ms = 0) => {
    timers.set(nextTimer, { at: now + Math.max(0, ms), fn, own: false });
    return nextTimer++;
};
globalThis.setInterval = (fn, ms = 0) => {
    timers.set(nextTimer, { at: now + Math.max(1, ms), fn, every: Math.max(1, ms), own: false });
    return nextTimer++;
};
globalThis.clearTimeout = globalThis.clearInterval = (id) => {
    timers.delete(id);
};
// The checker's own timers (a slow answer, a scripted button) don't count as the app being busy.
function later(ms, fn) {
    timers.set(nextTimer, { at: now + ms, fn, own: true });
    return nextTimer++;
}
const at = () => ((now - startedAt) / 1000).toFixed(2).padStart(7);

// ---- a fake bar -----------------------------------------------------------

const FONTS = ["tiny", "small", "normal", "condensed", "bold", "large", "extra_large", "global", "superscript"];
const ALIGNS = ["top_left", "top_mid", "top_right", "mid_left", "center", "mid_right", "bottom_left", "bottom_mid", "bottom_right"];
const COLOUR = /^#[0-9a-fA-F]{8}$/;
const COMMON = ["id", "type", "x", "y", "display", "align", "z_index", "timeout", "display_until"];
const FIELDS = {
    text: ["text", "font", "color", "width", "scroll_rate", "scroll_start_delay", "scroll_repeat_delay"],
    rectangle: ["width", "height", "radius", "fill", "fill_colors", "border_width", "border_color"],
    image: ["path", "stock_path", "opacity"],
    animation: ["path", "stock_path", "loop", "await_previous_end", "section", "opacity"],
    countdown: ["timestamp", "color", "direction", "show_hours"],
    xpmbitmap: ["data", "opacity"],
};
// What Flipper's doc says an app on the bar may call.
const OPEN = [
    ["apps/settings", ["GET"]], ["display/brightness", ["GET", "POST"]], ["display/draw", ["POST", "DELETE"]],
    ["audio/play", ["POST", "DELETE"]], ["busy", ["GET", "PUT"]], ["name", ["GET"]], ["audio/volume", ["GET", "POST"]],
    ["time", ["GET"]], ["wifi/status", ["GET"]], ["version", ["GET"]], ["access", ["GET"]], ["transport", ["GET"]],
    ["status", ["GET"]],
];

const canvas = new Map(); // id -> { type, display }
const stats = { draws: 0, removals: 0, clears: 0, elements: 0, largest: 0, perSecond: new Map(), ids: new Set(), loading: 0, sounds: new Map(), cutOff: 0 };
// The sounds every bar carries, and how long each lasts, in ms (firmware 1.3.1).
const STOCK_SOUNDS = {
    "shared/sounds/calendar_event_starts.snd": 1500,
    "shared/sounds/calendar_reminder_ends.snd": 1500,
    "shared/sounds/volume_change.snd": 500,
};
let soundEnds = 0; // on the fake clock: when the sound now playing runs out
let everDrewFront = false;
let lastCall = "";
let emptiedBy = ""; // the call that last left the front screen empty

const whole = (v) => Number.isInteger(v);

function checkElement(el) {
    const where = `element "${el.id}"`;
    if (typeof el.id !== "string" || !/^[a-zA-Z0-9._-]+$/.test(el.id)) problem(`an element id must be letters, digits, . _ or -: ${JSON.stringify(el.id)}`);
    if (!FIELDS[el.type]) return problem(`${where}: unknown type "${el.type}"`);
    for (const key of Object.keys(el)) {
        if (!COMMON.includes(key) && !FIELDS[el.type].includes(key)) problem(`${where}: "${key}" is not a field of a ${el.type}`);
    }
    for (const key of ["x", "y"]) {
        if (el[key] !== undefined && (!whole(el[key]) || el[key] < -4096 || el[key] > 4095)) problem(`${where}: ${key} must be a whole number from -4096 to 4095, got ${el[key]}`);
    }
    if (el.display !== undefined && !["front", "back"].includes(el.display)) problem(`${where}: display must be front or back`);
    if (el.align !== undefined && !ALIGNS.includes(el.align)) problem(`${where}: unknown align "${el.align}"`);
    if (el.z_index !== undefined && (!whole(el.z_index) || el.z_index < 0)) problem(`${where}: z_index must be a whole number, 0 or more`);
    const known = canvas.get(el.id);
    if (known && known.type !== el.type) problem(`${where} was a ${known.type} and is now a ${el.type}: the bar refuses an id that changes type`);

    if (el.type === "text") {
        if (typeof el.text !== "string" || !/^[\x20-\x7E]+$/.test(el.text)) problem(`${where}: text must be one or more printable ASCII characters, got ${JSON.stringify(el.text)}`);
        if (!FONTS.includes(el.font)) problem(`${where}: unknown font "${el.font}"`);
        if (el.color !== undefined && !COLOUR.test(el.color)) problem(`${where}: color must look like #RRGGBBAA, got ${el.color}`);
        for (const key of ["width", "scroll_rate", "scroll_start_delay", "scroll_repeat_delay"]) {
            if (el[key] !== undefined && (!whole(el[key]) || el[key] < (key === "width" ? 1 : 0))) problem(`${where}: ${key} must be a whole number`);
        }
    } else if (el.type === "rectangle") {
        for (const key of ["width", "height"]) {
            if (!whole(el[key]) || el[key] < 1) problem(`${where}: ${key} must be a whole number, 1 or more, got ${el[key]}`);
        }
        for (const key of ["radius", "border_width"]) {
            if (el[key] !== undefined && (!whole(el[key]) || el[key] < 0)) problem(`${where}: ${key} must be a whole number, 0 or more`);
        }
        if (el.fill !== undefined && !["none", "solid", "gradient_h", "gradient_v"].includes(el.fill)) problem(`${where}: unknown fill "${el.fill}"`);
        if (el.fill_colors !== undefined && (!Array.isArray(el.fill_colors) || el.fill_colors.length < 1 || el.fill_colors.length > 2 || !el.fill_colors.every((c) => COLOUR.test(c)))) {
            problem(`${where}: fill_colors must be one or two #RRGGBBAA colours, got ${JSON.stringify(el.fill_colors)}`);
        }
        if (el.border_color !== undefined && !COLOUR.test(el.border_color)) problem(`${where}: border_color must look like #RRGGBBAA`);
    } else if (el.type === "image" || el.type === "animation") {
        if (el.path !== undefined) {
            if (!/^[a-zA-Z0-9._/-]+$/.test(el.path)) problem(`${where}: path has characters the bar does not take`);
            else if (!existsSync(join(folder, el.path))) problem(`${where}: ${el.path} is not in the app's folder, so it would not ship with the app`);
        } else if (el.stock_path === undefined) {
            problem(`${where}: needs a path or a stock_path`);
        }
    } else if (el.type === "xpmbitmap") {
        if (typeof el.data !== "string" || !el.data.startsWith("! XPM2")) problem(`${where}: data must start with "! XPM2"`);
    }
}

function frontCount() {
    let n = 0;
    for (const el of canvas.values()) if (el.display === "front") n++;
    return n;
}

function answer(status, body) {
    const text = JSON.stringify(body);
    return { status, ok: status >= 200 && status < 300, text: async () => text, json: async () => body };
}

function handle(url, options) {
    const method = (options.method || "GET").toUpperCase();
    const parsed = new URL(typeof url === "string" ? url : url.url);
    if (!["localhost", "127.0.0.1"].includes(parsed.hostname)) {
        problem(`fetch to ${parsed.hostname}: that only works while the bar is on Wi-Fi, and this checker has no internet`);
        return answer(503, { error: "no network in the checker" });
    }
    const path = parsed.pathname.replace(/^\/api\//, "");
    const open = OPEN.find(([prefix]) => path === prefix || path.startsWith(prefix + "/"));
    if (!open || !open[1].includes(method)) {
        problem(`${method} /api/${path} is not open to an app on the bar`);
        return answer(403, { error: "Forbidden" });
    }
    lastCall = `${method} ${path}${parsed.search ? "?" + [...parsed.searchParams.keys()].join("&") : ""}`;
    let body;
    if (options.body !== undefined) {
        try {
            body = JSON.parse(options.body);
        } catch {
            problem(`${method} /api/${path}: the body is not JSON`);
            return answer(400, { error: "Bad Request" });
        }
    }

    if (path === "apps/settings") {
        if (parsed.searchParams.get("app_id") !== manifest.id) {
            problem("an app may only read its own settings: app_id must be its own id");
            return answer(403, { error: "Forbidden" });
        }
        if (!existsSync(settingsPath)) return answer(404, { error: "no settings" });
        return answer(200, { version: 1, values: { ...values } });
    }

    if (path === "display/draw" && method === "POST") {
        if (!body || body.application_name !== manifest.id) problem(`draw: application_name should be the app's id, got ${JSON.stringify(body && body.application_name)}`);
        if (body.priority !== undefined && (!whole(body.priority) || body.priority < 1 || body.priority > 100)) problem(`draw: priority must be 1 to 100, got ${body.priority}`);
        if (!Array.isArray(body.elements) || body.elements.length === 0) {
            problem("draw: needs at least one element");
            return answer(400, { error: "Bad Request" });
        }
        const second = Math.floor((now - startedAt) / 1000);
        stats.perSecond.set(second, (stats.perSecond.get(second) || 0) + 1);
        stats.draws++;
        stats.elements += body.elements.length;
        stats.largest = Math.max(stats.largest, body.elements.length);
        for (const el of body.elements) {
            checkElement(el);
            const asText = JSON.stringify(el);
            const known = canvas.get(el.id);
            if (el.scroll_rate !== undefined && known && known.asText === asText) {
                problem(`element "${el.id}" scrolls and was sent again unchanged: the bar starts its scroll over each time`);
            }
            canvas.set(el.id, { type: el.type, display: el.display || "front", asText });
            stats.ids.add(el.id);
            if ((el.display || "front") === "front") everDrewFront = true;
        }
        if (trace) console.log(`${at()}  draw    ${body.elements.map((e) => e.id).join(" ")}`);
        return answer(200, { result: "OK" });
    }

    if (path === "display/draw" && method === "DELETE") {
        const inQuery = parsed.searchParams.has("application_name");
        const inBody = body !== undefined && body.application_name !== undefined;
        if (inQuery && inBody) {
            problem("clear: application_name is in both the address and the body; the bar answers 400 to that");
            return answer(400, { error: "application_name present in both the body and query parameters" });
        }
        const ids = body && body.element_ids;
        if (ids) {
            stats.removals++;
            for (const id of ids) canvas.delete(id);
        } else {
            stats.clears++;
            canvas.clear();
        }
        if (trace) console.log(`${at()}  ${ids ? "remove  " + ids.join(" ") : "clear"}`);
        if (everDrewFront && frontCount() === 0 && running) {
            stats.loading++;
            emptiedBy = lastCall;
            if (trace) console.log(`${at()}  (front screen empty: the bar would show "Loading")`);
        }
        return answer(200, { result: "OK" });
    }

    if (path === "audio/play" && method === "POST") {
        if (!body || body.application_name !== manifest.id) problem(`play: application_name should be the app's id, got ${JSON.stringify(body && body.application_name)}`);
        const own = body && body.path;
        const stock = body && body.stock_path;
        if ((own === undefined) === (stock === undefined)) {
            problem("play: needs a path or a stock_path, and not both");
            return answer(400, { error: "Bad Request" });
        }
        let lasts = 0;
        if (own !== undefined) {
            if (typeof own !== "string" || !/^[a-zA-Z0-9._/-]+$/.test(own)) {
                problem(`play: the path has characters the bar does not take: ${JSON.stringify(own)}`);
                return answer(400, { error: "Bad Request" });
            }
            if (!existsSync(join(folder, own))) {
                problem(`play: ${own} is not in the app's folder, so it would not ship with the app`);
                return answer(404, { error: "Not Found" });
            }
            // The bar plays raw samples and nothing else: 16 bits each, 44,100 a second, one channel.
            const bytes = statSync(join(folder, own)).size;
            if (!own.endsWith(".snd")) problem(`play: ${own}: the bar plays .snd files only`);
            if (bytes % 2 !== 0) problem(`play: ${own} has an odd number of bytes; a .snd file is 16-bit samples`);
            lasts = (bytes / 2 / 44100) * 1000;
        } else {
            lasts = STOCK_SOUNDS[stock] || 0;
        }
        if (now < soundEnds) stats.cutOff++;
        soundEnds = now + lasts;
        const name = own !== undefined ? own : stock;
        stats.sounds.set(name, (stats.sounds.get(name) || 0) + 1);
        if (trace) console.log(`${at()}  play    ${name}`);
        return answer(200, { result: "OK" });
    }

    if (path === "audio/play" && method === "DELETE") {
        const playing = now < soundEnds;
        soundEnds = 0;
        if (trace) console.log(`${at()}  hush`);
        return playing ? answer(200, { result: "OK" }) : answer(410, { error: "No audio is playing" });
    }

    if (trace) console.log(`${at()}  ${lastCall}`);
    return answer(200, {});
}

let pending = 0;
globalThis.fetch = (url, options = {}) =>
    new Promise((done) => {
        pending++;
        later(25, () => {
            pending--;
            done(handle(url, options));
        });
    });

const listeners = new Set();
let everListened = false;
globalThis.listen = (kind, handler) => {
    if (kind !== "input") problem(`listen("${kind}"): only "input" is known`);
    listeners.add(handler);
    everListened = true;
    return () => listeners.delete(handler);
};

const errors = [];
const realError = console.error;
console.error = (...parts) => errors.push(parts.join(" "));

function press(event) {
    if (trace) console.log(`${at()}  input   ${event.key} ${event.action}`);
    for (const handler of [...listeners]) handler(event);
}

// ---- run it ---------------------------------------------------------------

const work = mkdtempSync(join(tmpdir(), "bar-app-check-"));
cpSync(join(folder, "scripts"), join(work, "scripts"), { recursive: true });
writeFileSync(join(work, "package.json"), '{"type": "module"}');

const settle = () => new Promise((done) => realImmediate(done));
const appBusy = () => pending > 0 || [...timers.values()].some((t) => !t.own);
let running = true; // false once BACK has been pressed

const span = seconds * 1000;
later(span * 0.45, () => press({ key: "encoder", action: "clockwise", delta: 1 }));
later(span * 0.5, () => {
    press({ key: "encoder", action: "counterclockwise", delta: -1 });
    press({ key: "encoder", action: "counterclockwise", delta: -1 });
});
for (const { at: when, key, action } of scripted) {
    later(when, () => press(key === "encoder" ? { key, action, delta: action === "clockwise" ? 1 : -1 } : { key, action }));
}
later(span, () => {
    running = false;
    press({ key: "back", action: "short" });
});
let endedAt = null; // on the fake clock: when the app ended by itself, if it did

let crashed = null;
try {
    await import(pathToFileURL(join(work, "scripts", "main.js")).href);
} catch (error) {
    crashed = error;
}
process.on("unhandledRejection", (error) => {
    crashed = crashed || error;
});

const giveUp = now + span + 10000; // ten seconds for the app to finish after BACK
while (!crashed) {
    await settle();
    if (timers.size === 0) break;
    if (!running && !appBusy()) break;
    if (running && everListened && listeners.size === 0 && !appBusy()) {
        // Nothing listening and nothing waiting: on the bar, the app has ended.
        endedAt = now;
        running = false;
        // Its last act was to clear the screen, as it should. That is not a "Loading" mid-show.
        if (stats.loading > 0 && emptiedBy === lastCall && lastCall.startsWith("DELETE display/draw?application_name")) stats.loading--;
        break;
    }
    const [id, timer] = [...timers.entries()].reduce((a, b) => (b[1].at < a[1].at ? b : a));
    if (timer.at > giveUp) break;
    now = Math.max(now, timer.at);
    if (timer.every) timer.at = now + timer.every;
    else timers.delete(id);
    timer.fn();
}
await settle();
rmSync(work, { recursive: true, force: true });
console.error = realError;

// ---- report ---------------------------------------------------------------

const ran = (now - startedAt) / 1000;
const busiest = Math.max(0, ...stats.perSecond.values());
console.log(`${manifest.name} (${manifest.id}) ${manifest.version}: ${ran.toFixed(0)} s of show`);
console.log(`  settings: ${JSON.stringify(values)}`);
console.log(`  ${stats.draws} draws carrying ${stats.elements} elements; largest ${stats.largest}; busiest second ${busiest} draws`);
console.log(`  ${stats.removals} removals, ${stats.clears} full clears`);
console.log(`  ${stats.ids.size} element ids: ${[...stats.ids].sort().join(" ")}`);
if (stats.sounds.size > 0) console.log(`  sounds played: ${[...stats.sounds].map(([name, n]) => `${name} x${n}`).join(", ")}`);
if (stats.cutOff > 0) console.log(`  a sound was cut off by the next one ${stats.cutOff} time(s): the bar has no queue`);
if (endedAt !== null) console.log(`  the app ended by itself, ${((endedAt - startedAt) / 1000).toFixed(0)} s in`);
if (stats.loading > 0) console.log(`  the front screen was left empty ${stats.loading} time(s) mid-show: the bar shows "Loading" then`);
for (const line of errors) console.log(`  the app logged an error: ${line}`);

if (crashed) problem(`the app threw: ${crashed && crashed.stack ? crashed.stack.split("\n").slice(0, 3).join(" | ") : crashed}`);
if (running) problem("the checker stopped before BACK was pressed: the app went idle by itself");
else {
    const after = endedAt !== null ? "when it ended" : "after BACK";
    if (listeners.size > 0) problem(`${after} the app is still listening for input, so on the bar it would not end`);
    if (appBusy()) problem(`${after} the app still has timers running, so on the bar it would not end`);
    if (!lastCall.startsWith("DELETE display/draw?application_name")) problem(`${after} the last call should clear the screen; it was "${lastCall}"`);
}

if (problems.size === 0) {
    console.log("  no problems found");
} else {
    console.log(`  ${problems.size} problem(s):`);
    for (const [message, count] of problems) console.log(`    - ${message}${count > 1 ? `  (x${count})` : ""}`);
    process.exitCode = 1;
}
