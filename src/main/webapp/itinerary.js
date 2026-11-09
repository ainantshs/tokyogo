document.addEventListener("DOMContentLoaded", function () {
  var STORE_KEY = "tokyoGoTrip";
  var MAX_DAYS = 14;

  var DEFAULT_PLACES = [
    { id: "shibuya",  name: "Shibuya Crossing",   type: "Landmark",      area: "Shibuya",   price: 2200 },
    { id: "sensoji",  name: "Senso-ji Temple",    type: "Temple",        area: "Asakusa",   price: 0 },
    { id: "meiji",    name: "Meiji Shrine",       type: "Shrine",        area: "Harajuku",  price: 0 },
    { id: "tower",    name: "Tokyo Tower",        type: "Landmark",      area: "Minato",    price: 1500 },
    { id: "teamlab",  name: "teamLab Planets",    type: "Entertainment", area: "Toyosu",    price: 3800 },
    { id: "tsukiji",  name: "Tsukiji Outer Market", type: "Food",        area: "Tsukiji",   price: 2000 },
    { id: "akiba",    name: "Akihabara",          type: "Shopping",      area: "Akihabara", price: 1000 },
    { id: "ueno",     name: "Ueno Park & Museums", type: "Park",         area: "Ueno",      price: 1000 }
  ];

  // Places are managed on attractions.html and shared through localStorage
  var PLACES = (function () {
    var list = DEFAULT_PLACES;
    try {
      var saved = JSON.parse(localStorage.getItem("tokyoGoPlaces"));
      if (Array.isArray(saved)) list = saved;
    } catch (e) {}
    return list.map(function (p) {
      return { id: p.id, name: p.name, note: p.type + " in " + p.area, price: p.price };
    });
  })();

  var nameInput = document.getElementById("trip-name");
  var startInput = document.getElementById("start");
  var endInput = document.getElementById("end");
  var tabsEl = document.getElementById("tabs");
  var listEl = document.getElementById("activities");
  var totalEl = document.getElementById("total");
  var form = document.getElementById("add-form");
  var placeSel = document.getElementById("place");
  var tStart = document.getElementById("t-start");
  var tEnd = document.getElementById("t-end");
  var msg = document.getElementById("form-msg");
  var addDayLabel = document.getElementById("add-day-label");

  var state = load();
  var params = new URLSearchParams(window.location.search);

  // Dates passed from the home page win over saved dates
  if (params.get("start")) state.start = params.get("start");
  if (params.get("end")) state.end = params.get("end");

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE_KEY));
      if (saved && saved.days) return saved;
    } catch (e) {}
    return { name: "My Tokyo trip", start: "", end: "", days: [[], [], []], active: 0 };
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function parseDate(str) {
    if (!str) return null;
    var p = str.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  function dayCount() {
    var s = parseDate(state.start), e = parseDate(state.end);
    if (!s || !e || e < s) return Math.max(state.days.length, 1);
    return Math.min(Math.round((e - s) / 86400000) + 1, MAX_DAYS);
  }

  // Keep the days array the same length as the date range
  function syncDays() {
    var n = dayCount();
    while (state.days.length < n) state.days.push([]);
    if (state.days.length > n) state.days.length = n;
    if (state.active >= n) state.active = n - 1;
    if (state.active < 0) state.active = 0;
  }

  function dayDate(i) {
    var s = parseDate(state.start);
    if (!s) return "";
    s.setDate(s.getDate() + i);
    return s.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  function yen(n) { return "¥" + n.toLocaleString("en-US"); }

  function toMinutes(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }

  function renderTabs() {
    tabsEl.innerHTML = "";
    state.days.forEach(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tab";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", String(i === state.active));
      var label = document.createElement("span");
      label.textContent = "day " + (i + 1);
      b.appendChild(label);
      var d = dayDate(i);
      if (d) {
        var small = document.createElement("small");
        small.textContent = d;
        b.appendChild(small);
      }
      b.addEventListener("click", function () {
        state.active = i;
        save();
        render();
      });
      tabsEl.appendChild(b);
    });
    addDayLabel.textContent = "day " + (state.active + 1);
  }

  var TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';

  function renderList() {
    listEl.innerHTML = "";
    var items = state.days[state.active];

    if (!items.length) {
      var li = document.createElement("li");
      li.className = "empty";
      li.textContent = "Nothing planned for day " + (state.active + 1) + " yet. Pick a place on the right to add it.";
      listEl.appendChild(li);
      return;
    }

    items.forEach(function (a, idx) {
      var li = document.createElement("li");
      li.className = "activity";

      var time = document.createElement("div");
      time.className = "time";
      time.textContent = a.start + " – " + a.end;

      var sep = document.createElement("div");
      sep.className = "sep";
      sep.setAttribute("aria-hidden", "true");

      var info = document.createElement("div");
      var h = document.createElement("h3");
      h.textContent = a.name;
      var p = document.createElement("p");
      p.textContent = a.note;
      info.appendChild(h);
      info.appendChild(p);

      var price = document.createElement("div");
      price.className = "price";
      price.textContent = a.price ? yen(a.price) : "Free";

      var del = document.createElement("button");
      del.type = "button";
      del.className = "trash";
      del.setAttribute("aria-label", "Remove " + a.name);
      del.innerHTML = TRASH;
      del.addEventListener("click", function () {
        items.splice(idx, 1);
        save();
        render();
      });

      li.appendChild(time);
      li.appendChild(sep);
      li.appendChild(info);
      li.appendChild(price);
      li.appendChild(del);
      listEl.appendChild(li);
    });
  }

  function renderTotal() {
    var sum = 0;
    state.days.forEach(function (d) { d.forEach(function (a) { sum += a.price; }); });
    totalEl.textContent = yen(sum);
  }

  function render() {
    renderTabs();
    renderList();
    renderTotal();
  }

  function showMsg(text, ok) {
    msg.textContent = text;
    msg.className = "form-msg" + (ok ? " ok" : "");
  }

  // Fill the place dropdown
  PLACES.forEach(function (p) {
    var o = document.createElement("option");
    o.value = p.id;
    o.textContent = p.name + (p.price ? " (" + yen(p.price) + ")" : " (free)");
    placeSel.appendChild(o);
  });

  // Trip name
  nameInput.value = state.name || "My Tokyo trip";
  nameInput.addEventListener("input", function () {
    state.name = nameInput.value;
    save();
  });

  // Dates
  startInput.value = state.start || "";
  endInput.value = state.end || "";

  function onDatesChange() {
    state.start = startInput.value;
    state.end = endInput.value;
    if (state.start && state.end && state.end < state.start) {
      endInput.value = state.end = state.start;
    }
    syncDays();
    save();
    render();
  }
  startInput.addEventListener("change", onDatesChange);
  endInput.addEventListener("change", onDatesChange);

  // Add activity
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var place = PLACES.filter(function (p) { return p.id === placeSel.value; })[0];

    if (!place) { showMsg("Choose a place first.", false); placeSel.focus(); return; }
    if (toMinutes(tEnd.value) <= toMinutes(tStart.value)) {
      showMsg("End time must be after the start time.", false);
      tEnd.focus();
      return;
    }

    var items = state.days[state.active];
    items.push({ name: place.name, note: place.note, price: place.price, start: tStart.value, end: tEnd.value });
    items.sort(function (a, b) { return toMinutes(a.start) - toMinutes(b.start); });

    save();
    render();
    showMsg(place.name + " added to day " + (state.active + 1) + ".", true);
    placeSel.selectedIndex = 0;
  });

  syncDays();
  save();
  render();
});