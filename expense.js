let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

function save() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

document.getElementById("addExpense").onclick = () => {
  const name = expenseName.value;
  const amount = parseFloat(amount.value);
  const note = expenseNote.value;

  if (!name || !amount) return alert("Fill all");

  expenses.push({ name, amount, note });
  save();
  render();
};

function render() {
  expenseList.innerHTML = "";
  let total = 0;

  expenses.forEach((e,i)=>{
    total += e.amount;

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <div>${e.name} - ${e.amount} THB<br>${e.note || ""}</div>
      <button>X</button>
    `;

    div.querySelector("button").onclick = ()=>{
      expenses.splice(i,1);
      save();
      render();
    };

    expenseList.appendChild(div);
  });

  document.getElementById("total").innerText = "Total: " + total + " THB";
}

render();
