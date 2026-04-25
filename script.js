// 🔥 Firebase (CDN version for GitHub Pages)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ✅ YOUR CONFIG (unchanged)
const firebaseConfig = {
  apiKey: "AIzaSyC1s3VXyzF4JUsXEXVa8X_ShpgpW6bx0A8",
  authDomain: "trip-planner-5460d.firebaseapp.com",
  projectId: "trip-planner-5460d",
  storageBucket: "trip-planner-5460d.firebasestorage.app",
  messagingSenderId: "45878724538",
  appId: "1:45878724538:web:b35a8ccecc9cc17311bf83"
};

// init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔥 database location
const tripRef = doc(db, "trips", "chiang-mai");

let schedule = { day1: [], day2: [], day3: [] };

// SAVE
async function saveData() {
  await setDoc(tripRef, schedule);
}

// REALTIME LOAD
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

  if (!time || !activity) return alert("Fill required fields");

  schedule[day].push({ time, activity });
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

// RENDER
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
