// The six weeks, and one sit laid out in time.
//
// Every time in this file is on the sit's own clock: milliseconds since the
// app opened, not counting any time spent paused.

const SETTLE_MS = 45000; // from opening the app to the first bell
const BELL_MS = 6000;    // how long the bell's file rings
const STRIKE_MS = 7500;  // from one strike to the next: the ring, then a second and a half of quiet
const FADE_MS = 2500;    // a fade between bright and dim
const CUE_MS = 30000;    // how long before a round the break starts to dim
const END_MS = 120000;   // how long the closing screen stays up before the app ends
const MINUTE = 60000;

// Minutes of counting, minutes of break, and rounds, for weeks 1 to 6. A
// break comes between two rounds, never after the last one.
const WEEKS = [
    { count: 5, rest: 2, rounds: 4 },
    { count: 8, rest: 2, rounds: 3 },
    { count: 9, rest: 1, rounds: 3 },
    { count: 13, rest: 2, rounds: 2 },
    { count: 15, rest: 1, rounds: 2 },
    { count: 30, rest: 0, rounds: 1 }
];

// How long a group of strikes takes to ring out.
function ringTime(strikes) {
    return (strikes - 1) * STRIKE_MS + BELL_MS;
}

// Lay out the sit for a week, 1 to 6. The answer holds:
//   phases   what happens when: { kind, n, start, end }, where kind is
//            "settle", "round", "break" or "end", and n counts rounds and breaks
//   strikes  when each strike of the bell is due. Three begin a round, two
//            begin a break, one ends the sit
//   moments  every time at which the picture starts to change, in order
//   end      when the app should close
function plan(week) {
    const shape = WEEKS[week - 1];
    const phases = [{ kind: "settle", n: 0, start: 0, end: SETTLE_MS }];
    const strikes = [];
    const moments = [0, SETTLE_MS - FADE_MS];
    let at = SETTLE_MS;

    function ring(count) {
        for (let k = 0; k < count; k++) {
            strikes.push(at + k * STRIKE_MS);
            moments.push(at + k * STRIKE_MS);
        }
        moments.push(at + ringTime(count));
    }

    for (let n = 1; n <= shape.rounds; n++) {
        ring(3);
        phases.push({ kind: "round", n: n, start: at, end: at + shape.count * MINUTE });
        at += shape.count * MINUTE;
        if (n < shape.rounds) {
            ring(2);
            phases.push({ kind: "break", n: n, start: at, end: at + shape.rest * MINUTE });
            at += shape.rest * MINUTE;
            moments.push(at - CUE_MS);
        }
    }
    ring(1);
    phases.push({ kind: "end", n: 0, start: at, end: at + END_MS });
    moments.push(at + FADE_MS);
    moments.push(at + END_MS - FADE_MS);
    moments.push(at + END_MS);
    moments.sort((a, b) => a - b);

    return {
        week: week,
        count: shape.count,
        rest: shape.rest,
        rounds: shape.rounds,
        minutes: shape.rounds * shape.count + (shape.rounds - 1) * shape.rest,
        phases: phases,
        strikes: strikes,
        moments: moments,
        end: at + END_MS
    };
}

// The phase the sit is in at time t.
function phaseAt(sit, t) {
    const phases = sit.phases;
    for (let i = phases.length - 1; i > 0; i--) {
        if (t >= phases[i].start) {
            return phases[i];
        }
    }
    return phases[0];
}

// How long from t until the picture next starts to change.
function untilNext(sit, t) {
    const moments = sit.moments;
    for (let i = 0; i < moments.length; i++) {
        if (moments[i] > t) {
            return moments[i] - t;
        }
    }
    return 0;
}

export { SETTLE_MS, BELL_MS, STRIKE_MS, FADE_MS, CUE_MS, END_MS, WEEKS, ringTime, plan, phaseAt, untilNext };
