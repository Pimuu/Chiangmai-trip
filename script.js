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

// Extract coordinates
function extractCoords(link) {
  if (!link) return null;

  let match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) };

  match = link.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) };

  return null;
}

// ADD
document.getElementById("addBtn").addEventListener("click", () => {
  const day = document.getElementById("day").value;
  const time = document.getElementById("time").value;
  const activity = document.getElementById("activity").value;
  const mapLink = document.getElementById("mapLink").value;
  const note = document.getElementById("note").value;

  if (!time || !activity) {
    alert("Fill all fields");
    return;
  }

  schedule[day].push({ time, activity, mapLink, note });

  saveData();
  render();
});

// RENDER
function render() {
  ["day1","day2","day3"].forEach(day => {
    const container = document.getElementById(day);
    container.innerHTML = "";

    schedule[day]
      .sort((a,b)=>a.time.localeCompare(b.time))
      .forEach((item,index)=>{

        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
          <div>
            <strong>${item.time}</strong> - ${item.activity}
            ${item.note ? `<br><small>📝 ${item.note}</small>` : ""}
          </div>
          <button class="delete-btn">X</button>
        `;

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

      if (!item.mapLink) continue; // skip notes-only

      let coords = extractCoords(item.mapLink);
      let lat, lon;

      if (coords) {
        lat = coords.lat;
        lon = coords.lon;
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
