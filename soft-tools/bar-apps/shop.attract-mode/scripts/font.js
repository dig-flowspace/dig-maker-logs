// How wide text comes out in "extra_large", the big font the clock and the
// message use. The bar gives an app no way to ask, so these were measured on
// the bar itself (firmware 1.3.1): each number is how far the characters after
// it move the pen, in pixels, with the one-pixel gap between letters included.
// The font has capitals only; small letters draw as capitals.

const ADVANCE = {
    3: "!',.:;|",
    4: " -[]",
    5: "()1<>I_i",
    6: "\"/\\{}",
    7: "*+=?EFJLTZefjltz",
    8: "023456789ABCDGHKNOPQRSUXY^abcdghknopqrsuxy~",
    9: "$MVW`mvw",
    10: "#&",
    11: "%",
    12: "@"
};

const WIDTHS = {};
for (const pixels in ADVANCE) {
    for (const ch of ADVANCE[pixels]) {
        WIDTHS[ch] = Number(pixels);
    }
}

// Width of a line in pixels, from its first lit column to its last.
function textWidth(string) {
    let total = 0;
    for (const ch of string) {
        total += WIDTHS[ch] || 8;
    }
    return total > 0 ? total - 1 : 0;
}

export { textWidth };
