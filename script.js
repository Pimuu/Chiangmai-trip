// LOAD DATA
let schedule = JSON.parse(localStorage.getItem("trip")) || {
  day1: [],
  day2: [],
  day3: []
};

function saveData() {
  localStorage.setItem("trip", JSON.stringify(schedule));
}

// MAP INIT
const map = L.map('map').setView([18.7883, 98.9853], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let markers = [];

// INPUT REFERENCES
const daySelect = document.getElementById("day");
const timeInput = document.getElementById("time");
const activityInput = document.getElementById("activity");
const mapLinkInput = document.getElementById("mapLink");
const noteInput = document.getElementById("note");

// EXTRACT COORDS FROM GOOGLE MAP LINK
function extractCoords(link) {
  if (!link) return null;

  let match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) };

  match = link.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) };

  return null;
}

// ADD ACTIVITY
document.getElementById("addBtn").onclick = () => {
  const day = daySelect.value;
  const time = timeInput.value;
  const activity = activityInput.value;
  const mapLink = mapLinkInput.value;

  if (!time || !activity) {
    alert("Fill all fields");
    return;
  }

  schedule[day].push({
    type: "activity",
    time,
    activity,
    mapLink
  });

  saveData();
  render();
};

// ADD TRAVEL NOTE
document.getElementById("addNoteBtn").onclick = () => {
  const day = daySelect.value;
  const time = timeInput.value;
  const note = noteInput.value;

  if (!time || !note) {
    alert("Fill note");
    return;
  }

  schedule[day].push({
    type: "note",
    time,
    note
  });

  saveData();
  render();
};

// RENDER TIMELINE
function render() {
  ["day1", "day2", "day3"].forEach(day => {
    const container = document.getElementById(day);
    container.innerHTML = "";

    schedule[day]
      .sort((a, b) => a.time.localeCompare(b.time))
      .forEach((item, index) => {

        const div = document.createElement("div");

        // ACTIVITY CARD
        if (item.type === "activity") {
          div.className = "card";
          div.innerHTML = `
            <div>
              <strong>${item.time}</strong> - ${item.activity}
            </div>
            <button class="delete-btn">X</button>
          `;
        }

        // NOTE CARD
        if (item.type === "note") {
          div.className = "note-card";
          div.innerHTML = `
            <div>🚌 ${item.time} - ${item.note}</div>
            <button class="delete-btn">X</button>
          `;
        }

        // DELETE
        div.querySelector(".delete-btn").onclick = () => {
          schedule[day].splice(index, 1);
          saveData();
          render();
        };

        container.appendChild(div);
      });
  });

  updateMap();
}

// UPDATE MAP
async function updateMap() {
  // remove old markers
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  let bounds = [];
  let names = [];

  for (let day of ["day1", "day2", "day3"]) {
    for (let item of schedule[day]) {

      // ❌ skip notes
      if (item.type !== "activity") continue;

      let lat, lon;

      // try extract from link
      let coords = extractCoords(item.mapLink);

      if (coords) {
        lat = coords.lat;
        lon = coords.lon;
      } else {
        // ✅ fallback search (IMPORTANT FIX)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(item.activity)}`
          );
          const data = await res.json();

          if (data.length > 0) {
            lat = parseFloat(data[0].lat);
            lon = parseFloat(data[0].lon);
          } else {
            continue;
          }
        } catch {
          continue;
        }
      }

      // add marker
      if (lat && lon) {
        const marker = L.marker([lat, lon])
          .addTo(map)
          .bindPopup(`<b>${item.activity}</b><br>${item.time}`);

        markers.push(marker);
        bounds.push([lat, lon]);
        names.push(item.activity);
      }
    }
  }

  // auto zoom
  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50] });
  }

  // route button
  if (names.length > 1) {
    const url = `https://www.google.com/maps/dir/${names.join("/")}`;
    const btn = document.getElementById("routeBtn");

    btn.href = url;
    btn.style.display = "block";
  }
}

// START
render();
