let schedule = {
  day1: [
    { time: "07:30", activity: "Arrive Chiang Mai (train)" },
    { time: "08:30", activity: "Drop luggage at hotel" },
    { time: "10:00", activity: "Breakfast / café" }
  ],
  day2: [
    { time: "09:30", activity: "Travel to Mae Kampong" },
    { time: "11:00", activity: "Check-in homestay" }
  ],
  day3: [
    { time: "14:00", activity: "Leave Mae Kampong" }
  ]
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
      container.appendChild(div);
    });
  });
}

function addActivity() {
  const day = document.getElementById("day").value;
  const time = document.getElementById("time").value;
  const activity = document.getElementById("activity").value;

  if (time && activity) {
    schedule[day].push({ time, activity });
    displaySchedule();
  }
}

displaySchedule();
