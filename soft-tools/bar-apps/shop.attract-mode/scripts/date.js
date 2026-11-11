// Scene two: the date.
//
// The lesson: pictures. The calendar leaf is a PNG that ships inside the
// app's folder (images/leaf.png). The app names it by that path and the bar
// draws it. An app on the bar cannot upload pictures while it runs, so
// anything it shows has to be packed with it, or drawn from boxes and text.
// The day number is ordinary text, laid over the picture with z_index.

import { AMBER, WHITE, text, picture } from "./elements.js";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function frame(now) {
    const leaf = picture("d.leaf", "images/leaf.png", 2, 1);
    leaf.z_index = 1;
    const day = text("d.day", String(now.getDate()), "normal", 10, 10, "center", "#202020FF");
    day.z_index = 2; // above the leaf
    return [
        leaf,
        day,
        text("d.weekday", DAYS[now.getDay()], "small", 21, -1, "top_left", WHITE),
        text("d.month", `${MONTHS[now.getMonth()]} ${now.getFullYear()}`, "small", 21, 7, "top_left", AMBER)
    ];
}

const date = { id: "date", title: "Date", interval: 1000, frame: frame };

export { date };
