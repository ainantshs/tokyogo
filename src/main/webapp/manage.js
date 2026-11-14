/* My trips page */
const KEY = 'tokyogo_trips';
const trash = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5"/></svg>';

let trips = [];
try { trips = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}
if (!trips.length) trips = [{ id: 't1', name: 'Tokyo', start: '2026-05-13', end: '2026-05-15' }];
let selected = trips[0].id;

const save = () => { try { localStorage.setItem(KEY, JSON.stringify(trips)); } catch (e) {} };
const esc = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = d => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

function render() {
  const list = document.getElementById('tripList');
  list.innerHTML = trips.length ? '' : '<li class="empty">No trips yet</li>';
  trips.forEach(t => {
    const li = document.createElement('li');
    li.className = 'trip-item' + (t.id === selected ? ' active' : '');
    li.innerHTML = `<span class="name">${esc(t.name)}</span><button class="icon-btn" title="Delete trip" aria-label="Delete ${esc(t.name)}">${trash}</button>`;
    li.addEventListener('click', () => { selected = t.id; render(); });
    li.querySelector('button').addEventListener('click', e => {
      e.stopPropagation();
      if (!confirm(`Delete "${t.name}"?`)) return;
      trips = trips.filter(x => x.id !== t.id);
      if (selected === t.id) selected = trips[0]?.id;
      save(); render();
    });
    list.appendChild(li);
  });

  const t = trips.find(x => x.id === selected);
  const detail = document.getElementById('detail');
  detail.innerHTML = t ? `
    <div class="card">
      <h3>${esc(t.name)}</h3>
      <div class="row"><span class="label">Trip name</span><span class="value">${esc(t.name)}</span></div>
      <div class="row"><span class="label">Start date</span><span class="value">${fmt(t.start)}</span></div>
      <div class="row"><span class="label">End date</span><span class="value">${fmt(t.end)}</span></div>
      <div class="actions"><a class="btn-open" href="itinerary.html?trip=${encodeURIComponent(t.id)}">Open itinerary →</a></div>
    </div>` : '<div class="placeholder">Create your first trip to get started.</div>';
}

const overlay = document.getElementById('overlay');
const form = document.getElementById('tripForm');
const err = document.getElementById('formError');
const close = () => { overlay.classList.remove('show'); form.reset(); err.textContent = ''; };

document.getElementById('openCreate').onclick = () => { overlay.classList.add('show'); document.getElementById('tName').focus(); };
document.getElementById('cancelBtn').onclick = close;
overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

form.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('tName').value.trim();
  const start = document.getElementById('tStart').value;
  const end = document.getElementById('tEnd').value;
  if (end < start) { err.textContent = 'End date must be on or after the start date.'; return; }
  const trip = { id: 't' + Date.now(), name, start, end };
  trips.push(trip); selected = trip.id;
  save(); close(); render();
});

render();
