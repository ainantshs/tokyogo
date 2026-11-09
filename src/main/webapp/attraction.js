document.addEventListener("DOMContentLoaded", function () {
  var KEY = "tokyoGoPlaces"; // also read by itinerary.js and dashboard.js
  var TYPES = ["Temple", "Shrine", "Landmark", "Food", "Shopping", "Museum", "Park", "Entertainment"];

  var DEFAULTS = [
    { id: "shibuya", name: "Shibuya Crossing",     type: "Landmark",      area: "Shibuya",   price: 2200 },
    { id: "sensoji", name: "Senso-ji Temple",      type: "Temple",        area: "Asakusa",   price: 0 },
    { id: "meiji",   name: "Meiji Shrine",         type: "Shrine",        area: "Harajuku",  price: 0 },
    { id: "tower",   name: "Tokyo Tower",          type: "Landmark",      area: "Minato",    price: 1500 },
    { id: "teamlab", name: "teamLab Planets",      type: "Entertainment", area: "Toyosu",    price: 3800 },
    { id: "tsukiji", name: "Tsukiji Outer Market", type: "Food",          area: "Tsukiji",   price: 2000 },
    { id: "akiba",   name: "Akihabara",            type: "Shopping",      area: "Akihabara", price: 1000 },
    { id: "ueno",    name: "Ueno Park & Museums",  type: "Park",          area: "Ueno",      price: 1000 }
  ];

  var listEl = document.getElementById("place-list");
  var form = document.getElementById("place-form");
  var title = document.getElementById("form-title");
  var fName = document.getElementById("f-name");
  var fType = document.getElementById("f-type");
  var fArea = document.getElementById("f-area");
  var fPrice = document.getElementById("f-price");
  var msg = document.getElementById("form-msg");
  var cancelBtn = document.getElementById("cancel");
  var searchEl = document.getElementById("search");
  var drop = document.getElementById("drop");
  var addBtn = document.getElementById("add-new");
  var notice = document.getElementById("notice");

  var places = load();
  var editingId = null;

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(saved)) return saved;
    } catch (e) {}
    return DEFAULTS.slice();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(places)); } catch (e) {}
  }

  function yen(n) { return n ? "¥" + n.toLocaleString("en-US") : "Free"; }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // Type dropdown
  TYPES.forEach(function (t) {
    var o = document.createElement("option");
    o.value = t;
    o.textContent = t;
    fType.appendChild(o);
  });

  function showMsg(text, ok) {
    msg.textContent = text;
    msg.className = "form-msg" + (ok ? " ok" : "");
  }

  function clearInvalid() {
    form.querySelectorAll(".field").forEach(function (f) { f.classList.remove("invalid"); });
  }

  // Drop-down form: open and close
  function openForm() {
    notice.textContent = "";
    drop.removeAttribute("inert");
    drop.classList.add("open");
    addBtn.setAttribute("aria-expanded", "true");
    addBtn.textContent = "× close";
  }

  function closeForm() {
    drop.classList.remove("open");
    drop.setAttribute("inert", "");
    addBtn.setAttribute("aria-expanded", "false");
    addBtn.textContent = "+ add";
  }

  function resetForm() {
    editingId = null;
    form.reset();
    fType.selectedIndex = 0;
    title.textContent = "add attraction";
    cancelBtn.hidden = true;
    clearInvalid();
    render();
  }

  function startEdit(p) {
    editingId = p.id;
    fName.value = p.name;
    fType.value = p.type;
    fArea.value = p.area;
    fPrice.value = p.price;
    title.textContent = "edit attraction";
    cancelBtn.hidden = false;
    showMsg("", false);
    clearInvalid();
    render();
    openForm();
    drop.scrollIntoView({ behavior: "smooth", block: "nearest" });
    fName.focus({ preventScroll: true });
  }

  function render() {
    var q = searchEl.value.trim().toLowerCase();
    var shown = places.filter(function (p) {
      return !q || (p.name + " " + p.type + " " + p.area).toLowerCase().indexOf(q) !== -1;
    });

    listEl.innerHTML = "";

    if (!shown.length) {
      listEl.appendChild(el("li", "empty", q ? "No attractions match your search." : "No attractions yet. Use + add to create the first one."));
      return;
    }

    shown.forEach(function (p) {
      var li = el("li", "place" + (p.id === editingId ? " editing" : ""));

      var info = el("div", "info");
      info.appendChild(el("h3", "", p.name));
      var meta = el("div", "meta");
      meta.appendChild(el("span", "tag", p.type));
      meta.appendChild(el("span", "", p.area));
      meta.appendChild(el("span", "", yen(p.price)));
      info.appendChild(meta);
      li.appendChild(info);

      var edit = el("button", "row-btn edit", "edit");
      edit.type = "button";
      edit.setAttribute("aria-label", "Edit " + p.name);
      edit.addEventListener("click", function () { startEdit(p); });
      li.appendChild(edit);

      var del = el("button", "row-btn delete", "delete");
      del.type = "button";
      del.setAttribute("aria-label", "Delete " + p.name);
      del.addEventListener("click", function () {
        if (!window.confirm("Delete " + p.name + "?")) return;
        places = places.filter(function (x) { return x.id !== p.id; });
        save();
        if (editingId === p.id) { resetForm(); closeForm(); } else render();
      });
      li.appendChild(del);

      listEl.appendChild(li);
    });
  }

  // + add: clear the form and focus it
  addBtn.addEventListener("click", function () {
    var isOpen = drop.classList.contains("open");
    if (isOpen && !editingId) { closeForm(); return; }   // click again to close
    resetForm();
    showMsg("", false);
    openForm();
    drop.scrollIntoView({ behavior: "smooth", block: "nearest" });
    fName.focus({ preventScroll: true });
  });

  cancelBtn.addEventListener("click", function () { resetForm(); showMsg("", false); closeForm(); });

  // Escape closes the form
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drop.classList.contains("open")) { resetForm(); showMsg("", false); closeForm(); addBtn.focus(); }
  });
  searchEl.addEventListener("input", render);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearInvalid();

    var name = fName.value.trim();
    var area = fArea.value.trim();
    var price = fPrice.value === "" ? NaN : Number(fPrice.value);

    var bad = null;
    if (!name) bad = fName;
    else if (!fType.value) bad = fType;
    else if (!area) bad = fArea;
    else if (isNaN(price) || price < 0) bad = fPrice;

    if (bad) {
      bad.closest(".field").classList.add("invalid");
      showMsg(bad === fPrice ? "Enter a price of 0 or more." : "Please fill in the " + bad.closest(".field").querySelector("label").textContent.toLowerCase() + ".", false);
      bad.focus();
      return;
    }

    var dupe = places.some(function (p) { return p.id !== editingId && p.name.toLowerCase() === name.toLowerCase(); });
    if (dupe) {
      fName.closest(".field").classList.add("invalid");
      showMsg("An attraction with this name already exists.", false);
      fName.focus();
      return;
    }

    if (editingId) {
      var p = places.filter(function (x) { return x.id === editingId; })[0];
      p.name = name; p.type = fType.value; p.area = area; p.price = price;
      showMsg(name + " updated.", true);
    } else {
      places.push({ id: "p" + Date.now(), name: name, type: fType.value, area: area, price: price });
      showMsg(name + " added.", true);
    }

    save();
    var done = msg.textContent;
    resetForm();
    showMsg("", false);
    closeForm();
    notice.textContent = done;
  });

  save();
  render();
});