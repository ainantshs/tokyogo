document.addEventListener("DOMContentLoaded", function () {
  var ALL_KEY = "tokyoGoAllTrips";   // list shown on this dashboard
  var MY_KEY = "tokyoGoTrip";        // trip saved by itinerary.js
  var PLACE_COUNT = 8;               // same number of places as itinerary.js

  var SAMPLE = [
    { id: "s1", user: "Aiko Tanaka",  plan: "Classic Tokyo",       activities: 9,  start: "2026-11-20", end: "2026-11-24", price: 18400 },
    { id: "s2", user: "Daniel Lee",   plan: "Neon and food tour",  activities: 6,  start: "2026-12-02", end: "2026-12-05", price: 12700 },
    { id: "s3", user: "Sara Ahmad",   plan: "Temples and parks",   activities: 7,  start: "2026-12-14", end: "2026-12-17", price: 6500 }
  ];

  var listEl = document.getElementById("trip-list");
  var TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';

  function loadTrips() {
    try {
      var saved = JSON.parse(localStorage.getItem(ALL_KEY));
      if (Array.isArray(saved)) return saved;
    } catch (e) {}
    return SAMPLE.slice();
  }

  function saveTrips(trips) {
    try { localStorage.setItem(ALL_KEY, JSON.stringify(trips)); } catch (e) {}
  }

  // Add the trip planned on the itinerary page, if there is one
  function addMyTrip(trips) {
    try {
      var mine = JSON.parse(localStorage.getItem(MY_KEY));
      if (!mine || !mine.days) return;
      var count = 0, sum = 0;
      mine.days.forEach(function (d) { d.forEach(function (a) { count++; sum += a.price; }); });
      if (!count) return;
      var entry = { id: "mine", user: "You", plan: mine.name || "My Tokyo trip", activities: count, start: mine.start, end: mine.end, price: sum };
      var i = trips.findIndex(function (t) { return t.id === "mine"; });
      if (i === -1) trips.unshift(entry); else trips[i] = entry;
    } catch (e) {}
  }

  function fmt(str) {
    if (!str) return "";
    var p = str.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function yen(n) { return "¥" + n.toLocaleString("en-US"); }

  var trips = loadTrips();
  addMyTrip(trips);
  saveTrips(trips);

  function renderStats() {
    var userCount;
    try {
      var ul = JSON.parse(localStorage.getItem("tokyoGoUsers"));
      if (Array.isArray(ul)) userCount = ul.length;
    } catch (e) {}
    if (userCount === undefined) {
      var users = {};
      trips.forEach(function (t) { users[t.user] = true; });
      userCount = Object.keys(users).length;
    }
    document.getElementById("n-users").textContent = userCount;
    document.getElementById("n-trips").textContent = trips.length;
    var placeCount = PLACE_COUNT;
    try {
      var pl = JSON.parse(localStorage.getItem("tokyoGoPlaces"));
      if (Array.isArray(pl)) placeCount = pl.length;
    } catch (e) {}
    document.getElementById("n-places").textContent = placeCount;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function renderList() {
    listEl.innerHTML = "";

    if (!trips.length) {
      listEl.appendChild(el("li", "empty", "No trips yet. Trips will show here once users save an itinerary."));
      return;
    }

    trips.forEach(function (t, idx) {
      var li = el("li", "trip");
      li.appendChild(el("div", "user", t.user));

      var plan = el("div", "plan", t.plan);
      plan.appendChild(el("small", "", t.activities + (t.activities === 1 ? " activity" : " activities")));
      li.appendChild(plan);

      var dates = t.start && t.end ? fmt(t.start) + " – " + fmt(t.end) : "Dates not set";
      li.appendChild(el("div", "dates", dates));
      li.appendChild(el("div", "price", yen(t.price)));

      var del = el("button", "trash");
      del.type = "button";
      del.setAttribute("aria-label", "Delete trip by " + t.user);
      del.innerHTML = TRASH;
      del.addEventListener("click", function () {
        if (!window.confirm("Delete this trip?")) return;
        trips.splice(idx, 1);
        saveTrips(trips);
        renderStats();
        renderList();
      });
      li.appendChild(del);

      listEl.appendChild(li);
    });
  }

  renderStats();
  renderList();
});