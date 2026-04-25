let schedule = {
  day1: [
    {
      time: "10:00",
      activity: "Cafe in Nimman",
      map: "https://maps.google.com?q=nimmanhaemin"
    }
  ],
  day2: [],
  day3: []
};

function displaySchedule() {
  ["day1", "day2", "day3"].forEach(day => {
    const container = document.getElementById(day);
    container.innerHTML = "";

    schedule[day].sort((a, b) => a.time.localeCompare(b.time));

    schedule[day].forEach(item => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `<strong>${item.time}</strong> - ${item.activity}`;

      // 👇 click to update map
      div.onclick = () => {
        updateMap(item.map);
      };

      container.appendChild(div);
    });
  });
}

function addActivity() {
  const day = document.getElementById("day").value;
  const time = document.getElementById("time").value;
  const activity = document.getElementById("activity").value;
  const map = document.getElementById("mapLink").value;

  if (time && activity && map) {
    schedule[day].push({ time, activity, map });
    displaySchedule();
  }
}

function updateMap(link) {
  const iframe = document.getElementById("mapFrame");

  // convert normal link → embed
  const embed = link.replace("https://www.google.com/maps", "https://maps.google.com/maps") + "&output=embed";

  iframe.src = embed;
}

displaySchedule();
