// Store schedule per day
let schedule = {
  day1: [],
  day2: [],
  day3: []
};

// Display all days
function displaySchedule() {
  ["day1", "day2", "day3"].forEach(day => {
    const container = document.getElementById(day);
    container.innerHTML = "";

    schedule[day]
      .sort((a, b) => a.time.localeCompare(b.time))
      .forEach(item => {

        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `<strong>${item.time}</strong> - ${item.activity}`;

        // Click → update map
        div.addEventListener("click", () => {
          updateMap(item.map);
        });

        container.appendChild(div);
      });
  });
}

// Add activity
function addActivity() {
  const day = document.getElementById("day").value;
  const time = document.getElementById("time").value;
  const activity = document.getElementById("activity").value;
  const map = document.getElementById("mapLink").value;

  // Validation
  if (!time || !activity || !map) {
    alert("Please fill all fields");
    return;
  }

  schedule[day].push({ time, activity, map });

  displaySchedule();

  // Clear input
  document.getElementById("time").value = "";
  document.getElementById("activity").value = "";
  document.getElementById("mapLink").value = "";
}

// Update map iframe
function updateMap(link) {
  const iframe = document.getElementById("mapFrame");

  if (!link) return;

  let embedLink;

  if (link.includes("embed")) {
    embedLink = link;
  } else {
    embedLink =
      link.replace("https://www.google.com/maps", "https://maps.google.com/maps") +
      "&output=embed";
  }

  iframe.src = embedLink;
}

// Attach button event AFTER page loads
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addBtn").addEventListener("click", addActivity);

  // Initial sample (so you see something)
  schedule.day1.push({
    time: "10:00",
    activity: "Cafe in Nimman",
    map: "https://www.google.com/maps?q=nimmanhaemin"
  });

  displaySchedule();
});
