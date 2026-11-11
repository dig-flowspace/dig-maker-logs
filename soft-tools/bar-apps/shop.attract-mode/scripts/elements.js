// The things a scene is made of. Each function returns one element, in the
// shape the bar's draw call takes.
//
// Two rules the bar enforces: an id names one element for the whole app, and
// an id can never change its type. So every scene starts its ids with its own
// letter: "c." for the clock, "d." for the date, and so on.

const WHITE = "#FFFFFFFF";
const AMBER = "#FFAA00FF";

// A line of text. `align` says which point of the text sits at (x, y):
// "top_left", "top_mid", "top_right" or "center".
function text(id, string, font, x, y, align, color) {
    return {
        id: id, type: "text", text: string, font: font, x: x, y: y, align: align,
        color: color || WHITE, display: "front"
    };
}

// A filled box. Give it a radius and the corners round off: a 4 x 4 box with
// radius 2 is a ball.
function box(id, x, y, width, height, color, radius) {
    return {
        id: id, type: "rectangle", x: x, y: y, width: width, height: height, align: "top_left",
        fill: "solid", fill_colors: [color], border_width: 0, radius: radius || 0, display: "front"
    };
}

// A picture from the app's own folder, named by its path inside it.
function picture(id, path, x, y) {
    return { id: id, type: "image", path: path, x: x, y: y, align: "top_left", display: "front" };
}

export { WHITE, AMBER, text, box, picture };
