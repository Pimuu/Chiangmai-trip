// 🔥 Firebase (same CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ✅ SAME CONFIG (do NOT change)
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

// 🔥 separate document for expenses
const expenseRef = doc(db, "trips", "expenses");

let expenses = [];

// SAVE
async function saveExpenses() {
  await setDoc(expenseRef, { expenses });
}

// REALTIME LOAD
onSnapshot(expenseRef, (snap) => {
  if (snap.exists()) {
    expenses = snap.data().expenses || [];
  }
  renderExpenses();
});

// ADD
document.getElementById("addExpense").onclick = () => {
  const name = document.getElementById("expenseName").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const note = document.getElementById("expenseNote").value;

  if (!name || !amount) return alert("Fill all fields");

  expenses.push({ name, amount, note });
  saveExpenses();
};

// RENDER
function renderExpenses() {
  const list = document.getElementById("expenseList");
  list.innerHTML = "";

  let total = 0;

  expenses.forEach((item, index) => {
    total += item.amount;

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <div>
        <strong>${item.name}</strong> - ${item.amount} THB
        ${item.note ? `<br><small>${item.note}</small>` : ""}
      </div>
      <button class="delete-btn">X</button>
    `;

    div.querySelector(".delete-btn").onclick = () => {
      expenses.splice(index, 1);
      saveExpenses();
    };

    list.appendChild(div);
  });

  document.getElementById("total").innerText =
    "Total: " + total + " THB";
}
