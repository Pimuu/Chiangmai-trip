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

// EXTRACT COORDS FROM GOOGLE MAPS LINK
function extractCoords(link) {
  if (!link) return null;

  let match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) {
    return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) };
  }

  match = link.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) {
    return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) };
  }

  return null;
}

// ADD
document.getElementById("addBtn").addEventListener("click", () => {
  const day = document.getElementById("day").value;
  const time = document.getElementById("time").value;
  const activity = document.getElementById("activity").value;
  const mapLink = document.getElementById("mapLink").value;

  if (!time || !activity) {
    alert("Please fill all fields");
    return;
  }

  schedule[day].push({ time, activity, mapLink });

  saveData();
  render();
});

// RENDER
function render() {
  ["day1", "day2", "day3"].forEach(day => {
    const container = document.getElementById(day);
    container.innerHTML = "";

    schedule[day]
      .sort((a, b) => a.time.localeCompare(b.time))
      .forEach((item, index) => {

        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
          <span>${item.time} - ${item.activity}</span>
          <button class="delete-btn">X</button>
        `;

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
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  let bounds = [];
  let names = [];

  for (let day of ["day1", "day2", "day3"]) {
    for (let item of schedule[day]) {

      let coords = extractCoords(item.mapLink);

      let lat, lon;

      if (coords) {
        lat = coords.lat;
        lon = coords.lon;
      } else {
        // fallback search
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(item.activity)}`
        );
        const data = await res.json();

        if (data.length > 0) {
          lat = parseFloat(data[0].lat);
          lon = parseFloat(data[0].lon);
        }
      }

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

  // Zoom map
  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50] });
  }

  // Google route button
  if (names.length > 1) {
    const url = `https://www.google.com/maps/dir/${names.join("/")}`;
    const btn = document.getElementById("routeBtn");

    btn.href = url;
    btn.style.display = "block";
  }
}

// START
render();
