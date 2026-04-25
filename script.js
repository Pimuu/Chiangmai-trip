let schedule = JSON.parse(localStorage.getItem("trip")) || {
  day1: [],
  day2: [],
  day3: []
};

function saveData() {
  localStorage.setItem("trip", JSON.stringify(schedule));
}

const map = L.map('map').setView([18.7883, 98.9853], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let markers = [];

const daySelect = document.getElementById("day");
const timeInput = document.getElementById("time");
const activityInput = document.getElementById("activity");
const mapLinkInput = document.getElementById("mapLink");
const noteInput = document.getElementById("note");

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

  if (!time || !activity) return alert("Fill all fields");

  schedule[day].push({
    type: "activity",
    time,
    activity,
    mapLink
  });

  saveData();
  render();
};

// ADD NOTE
document.getElementById("addNoteBtn").onclick = () => {
  const day = daySelect.value;
  const time = timeInput.value;
  const note = noteInput.value;

  if (!time || !note) return alert("Fill note");

  schedule[day].push({
    type: "note",
    time,
    note
  });

  saveData();
  render();
};

// RENDER
function render() {
  ["day1","day2","day3"].forEach(day => {
    const container = document.getElementById(day);
    container.innerHTML = "";

    schedule[day]
      .sort((a,b)=>a.time.localeCompare(b.time))
      .forEach((item,index)=>{

        const div = document.createElement("div");

        if (item.type === "activity") {
          div.className = "card";
          div.innerHTML = `
            <div><strong>${item.time}</strong> - ${item.activity}</div>
            <button class="delete-btn">X</button>
          `;
        }

        if (item.type === "note") {
          div.className = "note-card";
          div.innerHTML = `
            <div>🚌 ${item.time} - ${item.note}</div>
            <button class="delete-btn">X</button>
          `;
        }

        div.querySelector(".delete-btn").onclick = () => {
          schedule[day].splice(index,1);
          saveData();
          render();
        };

        container.appendChild(div);
      });
  });

  updateMap();
}

// MAP
async function updateMap() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  let bounds = [];
  let names = [];

  for (let day of ["day1","day2","day3"]) {
    for (let item of schedule[day]) {

      if (item.type !== "activity") continue;
      if (!item.mapLink) continue;

      let coords = extractCoords(item.mapLink);
      if (!coords) continue;

      const marker = L.marker([coords.lat, coords.lon])
        .addTo(map)
        .bindPopup(item.activity);

      markers.push(marker);
      bounds.push([coords.lat, coords.lon]);
      names.push(item.activity);
    }
  }

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [50,50] });
  }

  if (names.length > 1) {
    const url = `https://www.google.com/maps/dir/${names.join("/")}`;
    const btn = document.getElementById("routeBtn");

    btn.href = url;
    btn.style.display = "block";
  }
}

render();
