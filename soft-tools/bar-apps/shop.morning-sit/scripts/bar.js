// Talking to the bar. An app that runs on the bar reaches the bar's own API
// at "localhost", with the same calls a program on a PC would make.

const APP = "shop.morning-sit";
const API = "http://localhost/api";
const PRIORITY = 50; // what Flipper's own Clock draws at

// Put elements on screen, or change ones already there: an element sent
// again under the same id changes in place. Answers the HTTP status: 200 is
// drawn, 409 means something more important holds the screen.
async function draw(elements) {
    const res = await fetch(`${API}/display/draw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_name: APP, priority: PRIORITY, elements: elements })
    });
    return res.status;
}

// Take some elements off the screen and leave the rest. The app's name goes
// in the body here and must not also be in the address.
async function remove(ids) {
    const res = await fetch(`${API}/display/draw`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_name: APP, element_ids: ids })
    });
    return res.status;
}

// Take everything off both screens.
async function clear() {
    const res = await fetch(`${API}/display/draw?application_name=${APP}`, { method: "DELETE" });
    return res.status;
}

// The settings as the bar holds them: { week: 1, bell: true, ... }. An app
// may read its own settings and nobody else's, and may not change them.
async function settings() {
    const res = await fetch(`${API}/apps/settings?app_id=${APP}`);
    if (!res.ok) {
        throw Error(`settings: HTTP ${res.status}`);
    }
    return (await res.json()).values;
}

// Play a sound from this app's own folder, named by its path inside it.
// Answers the HTTP status: 200 is playing, 404 means the bar could not play
// it. The bar has no queue: a new sound cuts off one that is still playing.
async function play(path) {
    const res = await fetch(`${API}/audio/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_name: APP, path: path })
    });
    return res.status;
}

// Stop whatever is sounding. 410 means nothing was.
async function hush() {
    const res = await fetch(`${API}/audio/play`, { method: "DELETE" });
    return res.status;
}

export { APP, draw, remove, clear, settings, play, hush };
