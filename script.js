let schedule = {
  day1: [],
  day2: [],
  day3: []
};

const map = L.map('map').setView([18.7883, 98.9853], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let markers = [];
let polyline;

// ADD BUTTON FIX
document.getElementById("addBtn").addEventListener("click", () => {
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

function render() {
  ["day1", "day2", "day3"].forEach(day => {
    const container = document.getElementById(day);
    container.innerHTML = "";

    schedule[day].forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <span>${item.time} - ${item.activity}</span>
        <button class="delete-btn">X</button>
      `;

      div.querySelector(".delete-btn").onclick = () => {
        schedule[day].splice(index, 1);
        render();
      };

      container.appendChild(div);
    });
  });

  updateMap();
}

async function updateMap() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  let coords = [];

  for (let day of ["day1", "day2", "day3"]) {
    for (let item of schedule[day]) {

      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${item.activity}`);
      const data = await res.json();

      if (data.length > 0) {
        const lat = data[0].lat;
        const lon = data[0].lon;

        const marker = L.marker([lat, lon]).addTo(map);
        markers.push(marker);

        coords.push([lat, lon]);
      }
    }
  }

  if (polyline) map.removeLayer(polyline);

  if (coords.length > 1) {
    polyline = L.polyline(coords).addTo(map);
    map.fitBounds(polyline.getBounds());
  }
}

render();
