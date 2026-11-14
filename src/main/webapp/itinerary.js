/* Itinerary page */
/* Prices are rough estimates in yen (0 = free). */
const PLACES = [
  { id: 'meiji',   cat: 'place', name: 'Meiji Shrine',          area: 'Shrine in Harajuku',        price: 0 },
  { id: 'sensoji', cat: 'place', name: 'Senso-ji Temple',       area: 'Temple in Asakusa',         price: 0 },
  { id: 'takeshita', cat: 'place', name: 'Takeshita Street',    area: 'Shopping street, Harajuku', price: 0 },
  { id: 'akiba',   cat: 'place', name: 'Akihabara',             area: 'Electric Town',             price: 0 },
  { id: 'gyoen',   cat: 'place', name: 'Shinjuku Gyoen',        area: 'Garden in Shinjuku',        price: 500 },
  { id: 'ueno',    cat: 'place', name: 'Ueno Zoo',              area: 'Zoo in Ueno Park',          price: 600 },
  { id: 'tower',   cat: 'place', name: 'Tokyo Tower',           area: 'Main deck, Minato',         price: 1200 },
  { id: 'skytree', cat: 'place', name: 'Tokyo Skytree',         area: 'Observation deck, Sumida',  price: 2100 },
  { id: 'sky',     cat: 'place', name: 'Shibuya Sky',           area: 'Rooftop, Shibuya',          price: 2200 },
  { id: 'teamlab', cat: 'place', name: 'teamLab Planets',       area: 'Digital art, Toyosu',       price: 3800 },
  { id: 'ichiran', cat: 'food',  name: 'Ichiran Ramen',         area: 'Ramen in Shibuya',          price: 1300 },
  { id: 'tsukiji', cat: 'food',  name: 'Tsukiji Outer Market',  area: 'Street food in Chuo',       price: 2000 },
  { id: 'sushi',   cat: 'food',  name: 'Conveyor Belt Sushi',   area: 'Sushi in Shinjuku',         price: 2500 },
  { id: 'tonkatsu',cat: 'food',  name: 'Tonkatsu Lunch',        area: 'Set meal in Ginza',         price: 1800 },
  { id: 'izakaya', cat: 'food',  name: 'Izakaya Dinner',        area: 'Yakitori in Yurakucho',     price: 4000 },
];
const byId = Object.fromEntries(PLACES.map(p => [p.id, p]));

const yen = n => n === 0 ? 'Free' : '¥' + n.toLocaleString();
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = id => document.getElementById(id);
const trash = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5"/></svg>';

/* ---------- load the trip chosen on the manage page ---------- */
const TRIPS_KEY = 'tokyogo_trips';
let trips = [];
try { trips = JSON.parse(localStorage.getItem(TRIPS_KEY)) || []; } catch (e) {}
if (!trips.length) trips = [{ id: 't1', name: 'Tokyo', start: '2026-05-13', end: '2026-05-15' }];

const tripId = new URLSearchParams(location.search).get('trip');
const trip = trips.find(t => t.id === tripId) || trips[0];

const ACT_KEY = 'tokyogo_activities_' + trip.id;
let acts = [];
try { acts = JSON.parse(localStorage.getItem(ACT_KEY)) || []; } catch (e) {}
if (!acts.length && trip.id === 't1' && !localStorage.getItem(ACT_KEY)) {
  acts = [{ id: 'a1', day: 0, place: 'meiji', time: '09:00' }];
}
/* activities saved earlier had a start/end time: keep the start as the visit time */
acts = acts
  .map(a => ({ id: a.id, day: a.day, place: a.place, time: a.time || a.start }))
  .filter(a => a.time);

let currentDay = 0;
let category = 'place';

const saveTrips = () => { try { localStorage.setItem(TRIPS_KEY, JSON.stringify(trips)); } catch (e) {} };
const saveActs  = () => { try { localStorage.setItem(ACT_KEY, JSON.stringify(acts)); } catch (e) {} };

/* ---------- dates & days ---------- */
const MAX_DAYS = 14;
const parse = d => new Date(d + 'T00:00:00');
const dayCount = () => Math.min(MAX_DAYS, Math.max(1, Math.round((parse(trip.end) - parse(trip.start)) / 864e5) + 1));
const dayDate = i => { const d = parse(trip.start); d.setDate(d.getDate() + i); return d; };

function renderDays() {
  const n = dayCount();
  if (currentDay >= n) currentDay = 0;
  $('days').innerHTML = '';
  for (let i = 0; i < n; i++) {
    const b = document.createElement('button');
    b.className = 'day' + (i === currentDay ? ' active' : '');
    b.innerHTML = `day ${i + 1}<small>${dayDate(i).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</small>`;
    b.onclick = () => { currentDay = i; render(); };
    $('days').appendChild(b);
  }
  $('addBtn').textContent = `add to day ${currentDay + 1}`;
}

/* ---------- activities ---------- */
const t12 = t => { const [h, m] = t.split(':').map(Number); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; };

function renderActs() {
  const n = dayCount();
  const todays = acts.filter(a => a.day === currentDay).sort((a, b) => a.time.localeCompare(b.time));
  const list = $('activities');
  list.innerHTML = '';

  const dayTotal = todays.reduce((s, a) => s + (byId[a.place]?.price || 0), 0);
  $('dayHead').innerHTML = `<strong>${dayDate(currentDay).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</strong><span>Day total: ${dayTotal ? '¥' + dayTotal.toLocaleString() : 'Free'}</span>`;

  if (!todays.length) {
    list.innerHTML = '<div class="empty">Nothing planned for this day yet. Add an activity on the right.</div>';
  }
  todays.forEach(a => {
    const p = byId[a.place]; if (!p) return;
    const el = document.createElement('div');
    el.className = 'act';
    el.innerHTML = `
      <div class="time">${t12(a.time)}</div>
      <div class="info"><h3>${esc(p.name)}</h3><p>${esc(p.area)}</p></div>
      <span class="price">${yen(p.price)}</span>
      <button class="icon-btn" title="Remove" aria-label="Remove ${esc(p.name)}">${trash}</button>`;
    el.querySelector('button').onclick = () => { acts = acts.filter(x => x.id !== a.id); saveActs(); render(); };
    list.appendChild(el);
  });

  const total = acts.filter(a => a.day < n).reduce((s, a) => s + (byId[a.place]?.price || 0), 0);
  $('total').textContent = '¥' + total.toLocaleString();
}

/* ---------- add-activity panel ---------- */
function fillPlaces() {
  $('placeSelect').innerHTML = PLACES.filter(p => p.cat === category)
    .map(p => `<option value="${p.id}">${esc(p.name)} (${yen(p.price)})</option>`).join('');
}
document.querySelectorAll('#seg button').forEach(b => b.onclick = () => {
  category = b.dataset.cat;
  document.querySelectorAll('#seg button').forEach(x => x.classList.toggle('on', x === b));
  fillPlaces();
});

$('addBtn').onclick = () => {
  const place = $('placeSelect').value, time = $('visitTime').value;
  const err = $('formErr');
  if (!place || !time) { err.textContent = 'Pick a place and a visit time.'; return; }
  const clash = acts.find(a => a.day === currentDay && a.time === time);
  if (clash) { err.textContent = `You already have ${byId[clash.place].name} at ${clash.time}.`; return; }
  err.textContent = '';
  acts.push({ id: 'a' + Date.now(), day: currentDay, place, time });
  saveActs(); render();
};

/* ---------- date inputs ---------- */
function setDates() {
  const s = $('startDate').value, e = $('endDate').value, hint = $('dateHint');
  if (!s || !e) return;
  if (e < s) { hint.textContent = 'End date must be on or after the start date.'; hint.className = 'hint err'; return; }
  const span = Math.round((parse(e) - parse(s)) / 864e5) + 1;
  hint.className = 'hint';
  hint.textContent = span > MAX_DAYS ? `Showing the first ${MAX_DAYS} days of ${span}.` : `${span} day${span > 1 ? 's' : ''} planned.`;
  trip.start = s; trip.end = e;
  const i = trips.findIndex(t => t.id === trip.id); if (i >= 0) trips[i] = trip;
  saveTrips(); render();
}
$('startDate').onchange = setDates;
$('endDate').onchange = setDates;

function render() { renderDays(); renderActs(); }

/* ---------- init ---------- */
$('title').textContent = `My ${trip.name} trip`;
document.title = `${trip.name} | Tokyo Go!`;
$('startDate').value = trip.start;
$('endDate').value = trip.end;
fillPlaces();
render();
setDates();