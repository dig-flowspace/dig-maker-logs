// Scene four: pinball.
//
// The lesson: animation. The scene is a function of time: told how many
// milliseconds it has been up, it describes the whole frame. The runner asks
// about fifteen times a second and sends the bar only the elements that
// changed since the last frame. Most frames that is one small box, which is
// what keeps it quick.
//
// The show loops every ten seconds, in four beats:
//   hop      a ball hops along six lamps and lights each one it lands on
//   jackpot  everything flashes
//   roll     the score counts up
//   coin     GAME OVER, then INSERT COIN, blinking

import { AMBER, WHITE, text, box } from "./elements.js";

const LOOP = 10000;        // ms for all four beats
const HOP_ENDS = 2700;
const JACKPOT_ENDS = 4700;
const ROLL_ENDS = 8000;

const HOP = 450;           // ms the ball takes from one lamp to the next
const LAMPS = ["#FF3300", "#FF8800", "#FFDD00", "#33DD33", "#3388FF", "#BB44FF"];
const SCORES = [1250000, 880500, 2047300, 512900]; // where the score lands, a different one each loop
const HIDDEN = "#FFFFFF00"; // fully see-through: a way to blink text without removing it

// Six lamps along the bottom edge. `lit` says which are on; the rest glow faintly.
function lamps(lit) {
    const row = [];
    for (let k = 0; k < 6; k++) {
        row.push(box("p.lamp" + k, 2 + k * 12, 14, 8, 2, LAMPS[k] + (lit(k) ? "FF" : "30")));
    }
    return row;
}

// 1250000 -> "1,250,000"
function commas(number) {
    let digits = String(number);
    let out = "";
    while (digits.length > 3) {
        out = "," + digits.slice(-3) + out;
        digits = digits.slice(0, -3);
    }
    return digits + out;
}

function hop(t) {
    const lamp = Math.min(5, Math.floor(t / HOP));  // the lamp the ball is heading for
    const part = (t - lamp * HOP) / HOP;            // how far through the hop: 0 to 1
    const from = lamp === 0 ? -6 : 6 + (lamp - 1) * 12;
    const to = 6 + lamp * 12;
    const x = Math.round(from + (to - from) * part) - 2;
    const y = 10 - Math.round(28 * part * (1 - part)); // an arc, seven pixels high at the top
    const ball = box("p.ball", x, y, 4, 4, WHITE, 2);
    ball.z_index = 3; // in front of the score
    return lamps(k => k < lamp).concat([
        text("p.points", commas(lamp * 1000), "bold", 36, -1, "top_mid", AMBER),
        ball
    ]);
}

function jackpot(t) {
    const flash = Math.floor(t / 150) % 2 === 0;
    return lamps(() => flash).concat([
        text("p.jackpot", "JACKPOT", "extra_large", 36, 0, "top_mid", flash ? WHITE : AMBER)
    ]);
}

function roll(t, target) {
    const part = Math.min(1, t / 2600);
    const eased = 1 - (1 - part) * (1 - part) * (1 - part); // fast at first, slowing to a stop
    const score = Math.round((6000 + (target - 6000) * eased) / 10) * 10;
    const step = Math.floor(t / 100);
    // Pinned by its right edge, so the last digit stays put while the number grows.
    return lamps(k => (step + k) % 3 === 0).concat([
        text("p.score", commas(score), "extra_large", 68, 0, "top_right", AMBER)
    ]);
}

function coin(t) {
    if (t < 800) {
        return lamps(() => true).concat([
            text("p.over", "GAME OVER", "extra_large", 36, 0, "top_mid", AMBER)
        ]);
    }
    const on = Math.floor((t - 800) / 300) % 2 === 0;
    return lamps(k => (k % 2 === 0) === on).concat([
        text("p.coin", "INSERT COIN", "bold", 36, 1, "top_mid", on ? WHITE : HIDDEN)
    ]);
}

function frame(now, elapsed) {
    const t = elapsed % LOOP;
    if (t < HOP_ENDS) {
        return hop(t);
    }
    if (t < JACKPOT_ENDS) {
        return jackpot(t - HOP_ENDS);
    }
    if (t < ROLL_ENDS) {
        return roll(t - JACKPOT_ENDS, SCORES[Math.floor(elapsed / LOOP) % SCORES.length]);
    }
    return coin(t - ROLL_ENDS);
}

const pinball = { id: "pinball", title: "Pinball", interval: 66, frame: frame };

export { pinball };
