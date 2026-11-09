document.addEventListener("DOMContentLoaded", function () {
  var KEY = "tokyoGoUsers"; // also read by dashboard.js

  var DEFAULTS = [
    { id: "u1", name: "Aiko Tanaka", email: "aiko.tanaka@example.com" },
    { id: "u2", name: "Daniel Lee",  email: "daniel.lee@example.com" },
    { id: "u3", name: "Sara Ahmad",  email: "sara.ahmad@example.com" }
  ];

  var listEl = document.getElementById("user-list");
  var searchEl = document.getElementById("search");
  var countEl = document.getElementById("count");

  var users = load();

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(saved)) return saved;
    } catch (e) {}
    return DEFAULTS.slice();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(users)); } catch (e) {}
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function render() {
    var q = searchEl.value.trim().toLowerCase();
    var shown = users.filter(function (u) {
      return !q || (u.name + " " + u.email).toLowerCase().indexOf(q) !== -1;
    });

    countEl.textContent = q
      ? shown.length + " of " + users.length + " users"
      : users.length + (users.length === 1 ? " user" : " users");

    listEl.innerHTML = "";

    if (!shown.length) {
      listEl.appendChild(el("li", "empty", q ? "No users match your search." : "No users yet. Accounts will show here once people sign up."));
      return;
    }

    shown.forEach(function (u) {
      var li = el("li", "user");
      li.appendChild(el("div", "name", u.name));
      li.appendChild(el("div", "email", u.email));

      var del = el("button", "del", "delete");
      del.type = "button";
      del.setAttribute("aria-label", "Delete " + u.name);
      del.addEventListener("click", function () {
        if (!window.confirm("Delete " + u.name + " (" + u.email + ")?")) return;
        users = users.filter(function (x) { return x.id !== u.id; });
        save();
        render();
      });
      li.appendChild(del);

      listEl.appendChild(li);
    });
  }

  searchEl.addEventListener("input", render);

  save();
  render();
});