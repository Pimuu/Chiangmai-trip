import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Firebase config (Chiangmai-trip) ──────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyC1s3VXyzF4JUsXEXVa8X_ShpgpW6bx0A8",
  authDomain:        "trip-planner-5460d.firebaseapp.com",
  projectId:         "trip-planner-5460d",
  storageBucket:     "trip-planner-5460d.firebasestorage.app",
  messagingSenderId: "45878724538",
  appId:             "1:45878724538:web:b35a8ccecc9cc17311bf83"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const tripRef = doc(db, "trips", "chiang-mai");

// ── Local state ───────────────────────────────────────────
let schedule = { day1: [], day2: [], day3: [] };
let dataLoaded = false; // guard: don't save until first load is done

// ── Map init ──────────────────────────────────────────────
const map = L.map('map').setView([18.7883, 98.9853], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);
let markers = [];

// ── Show loading state ────────────────────────────────────
["day1","day2","day3"].forEach(day => {
  const container = document.getElementById(day);
  container.innerHTML = `<div class="empty-msg">⏳ Loading...</div>`;
});

// ── Initial load via getDoc (fast, one-time) ──────────────
// This is the key fix: getDoc fetches immediately on refresh
// instead of waiting for the slower onSnapshot connection
async function initialLoad() {
  try {
    const snap = await getDoc(tripRef);
    if (snap.exists()) {
      schedule = snap.data();
      ["day1","day2","day3"].forEach(d => {
        if (!schedule[d]) schedule[d] = [];
      });
    }
  } catch (e) {
    console.error("Initial load failed:", e);
    showToast("❌ Could not load data — check Firestore rules");
  }
  dataLoaded = true;
  render();
}

initialLoad();

// ── Real-time listener — keeps all devices in sync ────────
// Fires after the initial load; updates UI when another
// device makes a change
onSnapshot(tripRef, (snap) => {
  if (!dataLoaded) return; // wait for initialLoad to finish first
  if (snap.exists()) {
    schedule = snap.data();
    ["day1","day2","day3"].forEach(d => {
      if (!schedule[d]) schedule[d] = [];
    });
    render();
  }
});

// ── Save to Firestore ─────────────────────────────────────
async function saveData() {
  if (!dataLoaded) return; // safety guard
  try {
    await setDoc(tripRef, schedule);
    showToast("✅ Saved & synced");
  } catch (e) {
    console.error("Save failed:", e);
    showToast("❌ Save failed — check connection");
  }
}

// ── Extract coords from Google Maps link ──────────────────
function extractCoords(link) {
  if (!link) return null;
  let m;
  m = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  m = link.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  m = link.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  return null;
}

// ── Add Activity ──────────────────────────────────────────
document.getElementById("addBtn").addEventListener("click", () => {
  const day      = document.getElementById("day").value;
  const time     = document.getElementById("time").value;
  const activity = document.getElementById("activity").value.trim();
  const mapLink  = document.getElementById("mapLink").value.trim();

  if (!time || !activity) {
    showToast("⚠️ Please fill time and place name");
    return;
  }

  schedule[day].push({ type: "activity", time, activity, mapLink });
  clearInputs();
  saveData();
});

// ── Add Travel Note ───────────────────────────────────────
document.getElementById("addNoteBtn").addEventListener("click", () => {
  const day  = document.getElementById("day").value;
  const time = document.getElementById("time").value;
  const note = document.getElementById("note").value.trim();

  if (!time || !note) {
    showToast("⚠️ Please fill time and note");
    return;
  }

  schedule[day].push({ type: "note", time, note });
  clearInputs();
  saveData();
});

function clearInputs() {
  document.getElementById("time").value     = "";
  document.getElementById("activity").value = "";
  document.getElementById("mapLink").value  = "";
  document.getElementById("note").value     = "";
}

// ── Render schedule ───────────────────────────────────────
function render() {
  ["day1", "day2", "day3"].forEach(day => {
    const container = document.getElementById(day);
    container.innerHTML = "";

    const items = (schedule[day] || []).slice().sort((a, b) =>
      a.time.localeCompare(b.time)
    );

    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-msg";
      empty.textContent = "Nothing planned yet";
      container.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      const div = document.createElement("div");

      if (item.type === "note") {
        div.className = "note-card";
        div.innerHTML = `
          <span>🚌 <strong>${item.time}</strong> — ${item.note}</span>
          <button class="delete-btn" title="Delete">✕</button>
        `;
      } else {
        div.className = "card";
        div.innerHTML = `
          <span><span class="time-badge">${item.time}</span>${item.activity}</span>
          <button class="delete-btn" title="Delete">✕</button>
        `;
      }

      div.querySelector(".delete-btn").onclick = () => {
        const idx = schedule[day].findIndex(el =>
          el.time === item.time &&
          el.type === item.type &&
          (item.type === "note" ? el.note === item.note : el.activity === item.activity)
        );
        if (idx !== -1) {
          schedule[day].splice(idx, 1);
          saveData();
        }
      };

      container.appendChild(div);
    });
  });

  updateMap();
}

// ── Update map markers ────────────────────────────────────
async function updateMap() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  const bounds = [];
  const names  = [];

  for (const day of ["day1", "day2", "day3"]) {
    for (const item of (schedule[day] || [])) {
      if (item.type === "note") continue;

      let lat, lon;
      const coords = extractCoords(item.mapLink);

      if (coords) {
        lat = coords.lat;
        lon = coords.lon;
      } else if (!item.mapLink) {
        try {
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(item.activity + " Chiang Mai")}`
          );
          const data = await res.json();
          if (data.length > 0) {
            lat = parseFloat(data[0].lat);
            lon = parseFloat(data[0].lon);
          } else continue;
        } catch { continue; }
      } else {
        continue;
      }

      if (lat && lon) {
        const marker = L.marker([lat, lon])
          .addTo(map)
          .bindPopup(`<b>${item.activity}</b><br>⏰ ${item.time}`);
        markers.push(marker);
        bounds.push([lat, lon]);
        names.push(item.activity);
      }
    }
  }

  if (bounds.length > 0) map.fitBounds(bounds, { padding: [50, 50] });

  const routeBtn = document.getElementById("routeBtn");
  if (names.length > 1) {
    routeBtn.href = `https://www.google.com/maps/dir/${names.map(n => encodeURIComponent(n)).join("/")}`;
    routeBtn.style.display = "block";
  } else {
    routeBtn.style.display = "none";
  }
}

// ── Toast notification ────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}
