import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔴 PUT YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tripRef = doc(db, "trips", "chiang-mai");

let schedule = { day1: [], day2: [], day3: [] };

// SAVE
async function saveData() {
  await setDoc(tripRef, schedule);
}

// LOAD (REALTIME SYNC)
onSnapshot(tripRef, (snap) => {
  if (snap.exists()) {
    schedule = snap.data();
  }
  render();
});

// ADD ACTIVITY
document.getElementById("addBtn").onclick = () => {
  const day = document.getElementById("day").value;
  const time = document.getElementById("time").value;
  const activity = document.getElementById("activity").value;
  const mapLink = document.getElementById("mapLink").value;

  if (!time || !activity) return alert("Fill required fields");

  schedule[day].push({ time, activity, mapLink });
  saveData();
};

// ADD NOTE
document.getElementById("addNoteBtn").onclick = () => {
  const day = document.getElementById("day").value;
  const note = document.getElementById("note").value;

  if (!note) return;

  schedule[day].push({ note });
  saveData();
};

// RENDER UI
function render() {
  ["day1", "day2", "day3"].forEach(day => {
    const container = document.getElementById(day);
    container.innerHTML = "";

    schedule[day].forEach((item, index) => {
      const div = document.createElement("div");

      if (item.note) {
        div.className = "note-card";
        div.innerHTML = `
          <div>${item.note}</div>
          <button class="delete-btn">X</button>
        `;
      } else {
        div.className = "card";
        div.innerHTML = `
          <div>
            <strong>${item.time}</strong> - ${item.activity}
          </div>
          <button class="delete-btn">X</button>
        `;
      }

      div.querySelector(".delete-btn").onclick = () => {
        schedule[day].splice(index, 1);
        saveData();
      };

      container.appendChild(div);
    });
  });
}
