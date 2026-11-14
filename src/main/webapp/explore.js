/* Explore page */
// Sample data - replace with your own (or load from your backend)
const items = [
  { type:"place", name:"Senso-ji Temple", area:"Asakusa", price:0, rating:4.7,
    desc:"Tokyo's oldest temple, with the famous Kaminarimon gate and Nakamise shopping street.",
    hours:"6:00 AM – 5:00 PM", grad:"#c8352f,#1e2150" },
  { type:"place", name:"Shibuya Crossing", area:"Shibuya", price:0, rating:4.6,
    desc:"The world's busiest scramble crossing. Best seen from the Shibuya Sky deck at dusk.",
    hours:"Open 24 hours", grad:"#1e2150,#4a3f9f" },
  { type:"place", name:"Meiji Jingu", area:"Harajuku", price:0, rating:4.8,
    desc:"A calm forest shrine in the middle of the city, dedicated to Emperor Meiji.",
    hours:"5:00 AM – 6:00 PM", grad:"#2f6b4f,#1e2150" },
  { type:"place", name:"Tokyo Tower", area:"Minato", price:1500, rating:4.4,
    desc:"The iconic red-and-white tower with observation decks and night illumination.",
    hours:"9:00 AM – 11:00 PM", grad:"#e0533d,#151740" },
  { type:"place", name:"teamLab Planets", area:"Minato", price:3800, rating:4.7,
    desc:"A walk-through digital art museum. Expect to get barefoot and wet up to your knees.",
    hours:"9:00 AM – 10:00 PM", grad:"#2ab7ca,#4a3f9f" },
  { type:"place", name:"Akihabara Electric Town", area:"Akihabara", price:0, rating:4.3,
    desc:"Anime, retro games, arcades and electronics stores packed into a few neon blocks.",
    hours:"10:00 AM – 9:00 PM", grad:"#f4a6b8,#1e2150" },
  { type:"place", name:"Shinjuku Gyoen", area:"Shinjuku", price:500, rating:4.6,
    desc:"A large garden with Japanese, French and English landscapes. Great for cherry blossoms.",
    hours:"9:00 AM – 4:30 PM", grad:"#6bb36b,#1e2150" },

  { type:"food", name:"Ichiran Ramen", area:"Shibuya", price:1100, rating:4.5,
    desc:"Tonkotsu ramen eaten in a private booth. Customise spice, noodles and richness.",
    hours:"10:00 AM – 12:00 AM", grad:"#d9822b,#151740" },
  { type:"food", name:"Sushi Dai Style Counter", area:"Minato", price:8000, rating:4.8,
    desc:"Omakase sushi with fish fresh from the market, served piece by piece.",
    hours:"11:00 AM – 9:00 PM", grad:"#c8352f,#f4a6b8" },
  { type:"food", name:"Nakamise Street Snacks", area:"Asakusa", price:500, rating:4.2,
    desc:"Melon pan, ningyo-yaki and senbei crackers to eat while walking to the temple.",
    hours:"10:00 AM – 6:00 PM", grad:"#e0a63d,#1e2150" },
  { type:"food", name:"Omoide Yokocho Yakitori", area:"Shinjuku", price:2500, rating:4.4,
    desc:"Smoky alleyway of tiny grill bars. Squeeze in, order skewers and a cold beer.",
    hours:"5:00 PM – 12:00 AM", grad:"#7a2e1f,#151740" },
  { type:"food", name:"Harajuku Crepes", area:"Harajuku", price:700, rating:4.1,
    desc:"Colourful sweet crepes on Takeshita Street, stuffed with cream, fruit and cake.",
    hours:"10:00 AM – 8:00 PM", grad:"#f4a6b8,#4a3f9f" }
];

const formatYen = p => p === 0 ? "Free" : "¥" + p.toLocaleString("en-US");

let currentType = "place";
const grid = document.getElementById("grid");
const areaEl = document.getElementById("area");
const ratingEl = document.getElementById("rating");

function render() {
  const area = areaEl.value;
  const minRating = parseFloat(ratingEl.value);
  const priceEl = document.querySelector('input[name="price"]:checked');
  const minPrice = parseInt(priceEl.dataset.min, 10);
  const maxPrice = parseInt(priceEl.dataset.max, 10);

  const list = items.filter(i =>
    i.type === currentType &&
    (area === "all" || i.area === area) &&
    i.rating >= minRating &&
    i.price >= minPrice && i.price <= maxPrice
  );

  document.getElementById("heading").textContent =
    currentType === "place" ? "Places in Tokyo" : "Food in Tokyo";
  document.getElementById("count").textContent = list.length + " result" + (list.length === 1 ? "" : "s");

  if (!list.length) {
    grid.innerHTML = '<div class="empty">No results match your filters.</div>';
    return;
  }

  grid.innerHTML = list.map(i => `
    <article class="card" title="Log in to save this">
      <div class="photo" style="background-image:linear-gradient(160deg, ${i.grad.split(',')[0]}, ${i.grad.split(',')[1]})">
        <span class="badge">TOKYO</span>
      </div>
      <div class="body">
        <h3>${i.name}</h3>
        <div class="meta">
          <span>📍 ${i.area}</span>
          <span>${formatYen(i.price)}</span>
          <span class="rating">★ ${i.rating.toFixed(1)}</span>
        </div>
        <p class="desc">${i.desc}</p>
        <div class="foot">
          <span>🕒 ${i.hours}</span>
          <span class="login-hint">Log in to save →</span>
        </div>
      </div>
    </article>
  `).join("");
}

document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentType = btn.dataset.type;
    render();
  });
});

areaEl.addEventListener("change", render);
ratingEl.addEventListener("change", render);
document.querySelectorAll('input[name="price"]').forEach(r => r.addEventListener("change", render));
document.getElementById("reset").addEventListener("click", () => {
  areaEl.value = "all";
  ratingEl.value = "0";
  document.querySelector('input[name="price"]').checked = true;
  render();
});

render();

// Clicking a card sends the visitor to the login page
grid.addEventListener("click", function (e) {
  if (e.target.closest(".card")) location.href = "login.html";
});
