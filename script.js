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
let polyline;

// ADD
document.getElementById("addBtn").addEventListener("click", () => {
  const day = document.getElementById("day").value;
  const time = document.getElementById("time").value;
  const activity = document.getElementById("activity").value;

  if (!time || !activity) {
    alert("Please fill all fields");
    return;
  }

  schedule[day].push({ time, activity });

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

// MAP UPDATE
async function updateMap() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  let names = [];

  for (let day of ["day1", "day2", "day3"]) {
    for (let item of schedule[day]) {

      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${item.activity}`);
      const data = await res.json();

      if (data.length > 0) {
        const lat = data[0].lat;
        const lon = data[0].lon;

        const marker = L.marker([lat, lon]).addTo(map)
          .bindPopup(item.activity);

        markers.push(marker);
        names.push(item.activity);
      }
    }
  }

  // GOOGLE ROUTE
  if (names.length > 1) {
    const url = `https://www.google.com/maps/dir/${names.join("/")}`;
    const btn = document.getElementById("routeBtn");

    btn.href = url;
    btn.style.display = "block";
  }
}

// START
render();
