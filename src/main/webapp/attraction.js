/* Manage places page */
const KEY = "tokyogo_places";
const seed = [
  { id: 1, name: "Senso-ji Temple", category: "place", area: "Asakusa", price: 0, rating: 4.7,
    open: "06:00", close: "17:00", desc: "Tokyo's oldest temple, with the famous Kaminarimon gate.", image: "" },
  { id: 2, name: "Ichiran Ramen", category: "food", area: "Shibuya", price: 1100, rating: 4.5,
    open: "10:00", close: "00:00", desc: "Tonkotsu ramen eaten in a private booth.", image: "" }
];

let places = JSON.parse(localStorage.getItem(KEY) || "null") || seed;
let editingId = null;
let imageData = "";

const $ = id => document.getElementById(id);
const list = $("list"), overlay = $("overlay"), form = $("form"), msg = $("msg"), preview = $("preview");

const save = () => localStorage.setItem(KEY, JSON.stringify(places));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

function render() {
  if (!places.length) {
    list.innerHTML = '<div class="empty">No places yet. Click "+ Add place".</div>';
    return;
  }
  list.innerHTML = places.map(p => `
    <article class="place">
      <div class="row">
        <button class="edit-btn" type="button" data-edit="${p.id}" aria-label="Edit ${esc(p.name)}">+</button>
        <span class="edit-label">edit</span>
        <span class="tag">${p.category === "food" ? "Food" : "Place"}</span>
      </div>
      <div class="pic" ${p.image ? `style="background-image:url('${p.image}')"` : ""}>${p.image ? "" : "image"}</div>
      <h3>${esc(p.name)}</h3>
      <p class="sub">${esc(p.area)} · ${p.price === 0 ? "Free" : "¥" + Number(p.price).toLocaleString("en-US")} · ★ ${Number(p.rating).toFixed(1)}</p>
    </article>
  `).join("");
}

function setPreview(src) {
  imageData = src || "";
  preview.style.backgroundImage = src ? `url('${src}')` : "";
  preview.classList.toggle("show", !!src);
}

function openPopup(id) {
  editingId = id;
  form.reset();
  setPreview("");
  msg.textContent = "";
  $("del").hidden = id === null;
  $("popupTitle").textContent = id === null ? "Add place" : "Edit place";

  if (id !== null) {
    const p = places.find(x => x.id === id);
    $("f-name").value = p.name;
    $("f-category").value = p.category;
    $("f-area").value = p.area;
    $("f-desc").value = p.desc;
    $("f-price").value = p.price;
    $("f-rating").value = p.rating;
    $("f-open").value = p.open;
    $("f-close").value = p.close;
    setPreview(p.image);
  }
  overlay.classList.add("show");
  $("f-name").focus();
}

const closePopup = () => overlay.classList.remove("show");

$("addBtn").addEventListener("click", () => openPopup(null));
list.addEventListener("click", e => {
  const b = e.target.closest("[data-edit]");
  if (b) openPopup(Number(b.dataset.edit));
});
$("cancel").addEventListener("click", closePopup);
overlay.addEventListener("click", e => { if (e.target === overlay) closePopup(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closePopup(); });

$("f-image").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => setPreview(reader.result);
  reader.readAsDataURL(file);
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const data = {
    name: $("f-name").value.trim(),
    category: $("f-category").value,
    area: $("f-area").value.trim(),
    desc: $("f-desc").value.trim(),
    price: parseInt($("f-price").value, 10),
    rating: parseFloat($("f-rating").value),
    open: $("f-open").value,
    close: $("f-close").value,
    image: imageData
  };

  if (!data.name || !data.category || !data.area || !data.desc || !data.open || !data.close ||
      isNaN(data.price) || isNaN(data.rating)) {
    msg.textContent = "Please fill in all fields.";
    return;
  }
  if (data.rating < 0 || data.rating > 5) { msg.textContent = "Rating must be between 0 and 5."; return; }
  if (data.price < 0) { msg.textContent = "Price can't be negative."; return; }

  if (editingId === null) {
    places.push({ id: Date.now(), ...data });
  } else {
    places = places.map(p => p.id === editingId ? { id: p.id, ...data } : p);
  }
  save(); render(); closePopup();
});

$("del").addEventListener("click", () => {
  if (editingId === null) return;
  if (confirm("Delete this place?")) {
    places = places.filter(p => p.id !== editingId);
    save(); render(); closePopup();
  }
});

render();
