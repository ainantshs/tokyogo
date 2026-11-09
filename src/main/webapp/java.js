document.addEventListener("DOMContentLoaded", function () {
  var KEY = "tokyoGoPlaces"; // managed on attractions.html

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

  // Photos and short descriptions for the starter places.
  // Places you add later get a plain navy tile with their first letter.
  var EXTRA = {
    shibuya: { img: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=70", text: "Thousands cross at once. Watch from above at Shibuya Sky." },
    sensoji: { img: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=600&q=70", text: "Tokyo's oldest temple, best before 8 am." },
    meiji:   { img: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=600&q=70", text: "A quiet forest path in the middle of the city." },
    tower:   { img: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=600&q=70", text: "The red-and-white icon, glowing after sunset." },
    teamlab: { text: "Walk barefoot through immersive digital art." },
    tsukiji: { text: "Street food breakfast, from tamagoyaki to fresh sushi." },
    akiba:   { text: "Arcades, anime shops and retro game stores." },
    ueno:    { text: "Parks, a zoo and some of the city's best museums." }
  };

  var cardsEl = document.getElementById("cards");
  var typeSel = document.getElementById("f-type");
  var areaSel = document.getElementById("f-area");
  var countEl = document.getElementById("count");

  var places = load();

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(saved)) return saved;
    } catch (e) {}
    return DEFAULTS;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function yen(n) { return n ? "¥" + n.toLocaleString("en-US") : "Free"; }

  function unique(key) {
    var seen = {};
    places.forEach(function (p) { if (p[key]) seen[p[key]] = true; });
    return Object.keys(seen).sort();
  }

  function fillSelect(sel, values) {
    values.forEach(function (v) {
      var o = document.createElement("option");
      o.value = v;
      o.textContent = v;
      sel.appendChild(o);
    });
  }

  function render() {
    var t = typeSel.value, a = areaSel.value;
    var shown = places.filter(function (p) {
      return (!t || p.type === t) && (!a || p.area === a);
    });

    countEl.textContent = shown.length + (shown.length === 1 ? " place" : " places");
    cardsEl.innerHTML = "";

    if (!shown.length) {
      cardsEl.appendChild(el("li", "empty", "No places match these filters. Try another type or area."));
      return;
    }

    shown.forEach(function (p) {
      var extra = EXTRA[p.id] || {};
      var li = el("li", "card");

      var photo = el("div", "photo");
      photo.appendChild(el("span", "initial", p.name.charAt(0)));
      if (extra.img) {
        var img = document.createElement("img");
        img.src = extra.img;
        img.alt = p.name;
        img.loading = "lazy";
        img.addEventListener("error", function () { img.remove(); });
        photo.appendChild(img);
      }
      li.appendChild(photo);

      var d = el("div", "details");
      d.appendChild(el("span", "tag", p.type));
      d.appendChild(el("h2", "", p.name));
      d.appendChild(el("p", "area", p.area));
      d.appendChild(el("p", "blurb", extra.text || p.type + " in " + p.area + "."));

      var foot = el("div", "foot");
      foot.appendChild(el("span", "price", yen(p.price)));
      var plan = el("a", "plan", "Plan a visit");
      plan.href = "itinerary.html";
      foot.appendChild(plan);
      d.appendChild(foot);

      li.appendChild(d);
      cardsEl.appendChild(li);
    });
  }

  fillSelect(typeSel, unique("type"));
  fillSelect(areaSel, unique("area"));
  typeSel.addEventListener("change", render);
  areaSel.addEventListener("change", render);
  render();
});