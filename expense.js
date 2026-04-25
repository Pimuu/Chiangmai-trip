import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Firebase config (Chiangmai-trip) ──────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyC1s3VXyzF4JUsXEXVa8X_ShpgpW6bx0A8",
  authDomain:        "trip-planner-5460d.firebaseapp.com",
  projectId:         "trip-planner-5460d",
  storageBucket:     "trip-planner-5460d.firebasestorage.app",
  messagingSenderId: "45878724538",
  appId:             "1:45878724538:web:b35a8ccecc9cc17311bf83"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const expenseRef = doc(db, "trips", "expenses");

let expenses = [];

// ── Save to Firestore ─────────────────────────────────────
async function saveExpenses() {
  try {
    await setDoc(expenseRef, { list: expenses });
    showToast("✅ Saved & synced");
  } catch (e) {
    console.error("Save failed:", e);
    showToast("❌ Save failed — check connection");
  }
}

// ── Real-time listener ─────────────────────────────────────
onSnapshot(expenseRef, (snap) => {
  if (snap.exists()) {
    expenses = snap.data().list || [];
  }
  renderExpenses();
});

// ── Add Expense ───────────────────────────────────────────
document.getElementById("addExpense").onclick = () => {
  const name   = document.getElementById("expenseName").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const note   = document.getElementById("expenseNote").value.trim();

  if (!name || !amount || isNaN(amount)) {
    showToast("⚠️ Please fill item name and amount");
    return;
  }

  expenses.push({ name, amount, note, id: Date.now() });
  document.getElementById("expenseName").value = "";
  document.getElementById("amount").value      = "";
  document.getElementById("expenseNote").value = "";
  saveExpenses();
};

// ── Render expenses ───────────────────────────────────────
function renderExpenses() {
  const list = document.getElementById("expenseList");
  list.innerHTML = "";

  if (expenses.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-msg";
    empty.textContent = "No expenses yet";
    list.appendChild(empty);
    document.getElementById("totalBadge").textContent = "Total: 0 THB";
    return;
  }

  let total = 0;

  expenses.forEach((item, index) => {
    total += item.amount;
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div>
        <strong>${item.name}</strong> — <span style="color:var(--primary);font-weight:500">${item.amount.toLocaleString()} THB</span>
        ${item.note ? `<br><small style="color:var(--text-muted)">${item.note}</small>` : ""}
      </div>
      <button class="delete-btn" title="Delete">✕</button>
    `;
    div.querySelector(".delete-btn").onclick = () => {
      expenses.splice(index, 1);
      saveExpenses();
    };
    list.appendChild(div);
  });

  document.getElementById("totalBadge").textContent =
    `Total: ${total.toLocaleString()} THB`;
}

// ── Toast notification ────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}
