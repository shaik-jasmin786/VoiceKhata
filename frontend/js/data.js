/* ==========================================================
   VoiceKhata - data.js (backend version)
   Gets and saves data through the Spring Boot API.
   Uses apiRequest() from auth.js.
   ========================================================== */

// ---------- Reading data ----------

async function fetchCustomers() {
  return await apiRequest("GET", "/customers");
}

async function fetchTransactions() {
  return await apiRequest("GET", "/transactions");
}

async function fetchDashboard() {
  return await apiRequest("GET", "/dashboard");
}

// ---------- Saving data ----------

// tx needs: customer, item, quantity, amount, type ("CREDIT" or "PAYMENT")
async function addTransaction(tx) {
  return await apiRequest("POST", "/transactions", {
    customer: tx.customer,
    type: tx.type,
    item: tx.item || "",
    quantity: Number(tx.quantity) || 0,
    amount: Number(tx.amount)
  });
}

async function updateTransaction(id, changes) {
  return await apiRequest("PUT", "/transactions/" + id, {
    customer: changes.customer,
    type: changes.type,
    item: changes.item || "",
    quantity: Number(changes.quantity) || 0,
    amount: Number(changes.amount)
  });
}

async function deleteTransaction(id) {
  return await apiRequest("DELETE", "/transactions/" + id);
}

// ---------- Formatting helpers (same as before) ----------

function formatRupees(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}