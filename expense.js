let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

document.getElementById("addExpense").onclick = () => {
  const name = document.getElementById("expenseName").value;
  const amountValue = parseFloat(document.getElementById("amount").value);
  const note = document.getElementById("expenseNote").value;

  if (!name || !amountValue) return alert("Fill all fields");

  expenses.push({ name, amount: amountValue, note });

  saveExpenses();
  renderExpenses();
};

function renderExpenses() {
  const list = document.getElementById("expenseList");
  list.innerHTML = "";

  let total = 0;

  expenses.forEach((item,index)=>{
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

    div.querySelector(".delete-btn").onclick = ()=>{
      expenses.splice(index,1);
      saveExpenses();
      renderExpenses();
    };

    list.appendChild(div);
  });

  document.getElementById("total").innerText = "Total: " + total + " THB";
}

renderExpenses();
