let schedule = {
  day1: [],
  day2: [],
  day3: []
};

// MAP INIT
const map = L.map('map').setView([18.7883, 98.9853], 11); // Chiang Mai

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let markers = [];
let polyline;

// ADD ACTIVITY
document.getElementById("addBtn").addEventListener("click", function (e) {
  e.preventDefault(); // 🚨 prevent refresh

  const day = document.getElementById("day").value;
  const time = document.getElementById("time").value;
  const activity = document.getElementById("activity").value;

  if (!time || !activity) {
    alert("Fill all fields");
    return;
  }

  schedule[day].push({ time, activity });

  render();
});

// RENDER UI
function render() {
  ["day1", "day2", "day3"].forEach(day => {
    const container = document.getElementById(day);
    container.innerHTML = "";

    schedule[day].forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "card";
      div.draggable = true;

      div.innerHTML = `
        <span><strong>${item.time}</strong> - ${item.activity}</span>
        <button class="delete-btn">X</button>
      `;

      // DELETE
      div.querySelector(".delete-btn").onclick = () => {
        schedule[day].splice(index, 1);
        render();
      };

      // DRAG
      div.addEventListener("dragstart", () => {
        div.classList.add("dragging");
        dragged = { day, index };
      });

      div.addEventListener("dragend", () => {
        div.classList.remove("dragging");
      });

      container.appendChild(div);
    });

    // DROP
    container.ondragover = (e) => {
      e.preventDefault();
    };

    container.ondrop = () => {
      if (!dragged) return;

      const item = schedule[dragged.day].splice(dragged.index, 1)[0];
      schedule[day].push(item);

      dragged = null;
      render();
    };
  });

  updateMap();
}

let dragged = null;

// MAP UPDATE (with fake geocoding)
async function updateMap() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  let coords = [];

  for (let day of ["day1", "day2", "day3"]) {
    for (let item of schedule[day]) {

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${item.activity}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.length > 0) {
        const lat = data[0].lat;
        const lon = data[0].lon;

        const marker = L.marker([lat, lon]).addTo(map)
          .bindPopup(item.activity);

        markers.push(marker);
        coords.push([lat, lon]);
      }
    }
  }

  if (polyline) map.removeLayer(polyline);

  if (coords.length > 1) {
    polyline = L.polyline(coords, { color: 'blue' }).addTo(map);
    map.fitBounds(polyline.getBounds());
  }
}

render();
