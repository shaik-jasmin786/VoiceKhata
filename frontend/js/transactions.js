/* ==========================================================
   VoiceKhata - transactions.js (backend version)
   Shows, filters, edits and deletes transactions in MySQL
   through the Spring Boot backend.
   ========================================================== */

let currentFilter = "ALL";
let allTransactions = [];     // loaded from the backend
let allCustomers = [];        // for name suggestions in the edit pop-up
let editingTxId = null;
let deletingTxId = null;
let editModal = null;
let deleteModal = null;

function byId(id) { return document.getElementById(id); }

// ---------- Loading ----------

async function loadTransactions() {
  try {
    const results = await Promise.all([fetchTransactions(), fetchCustomers()]);
    allTransactions = results[0];     // newest first (backend sorts them)
    allCustomers = results[1];
    renderTransactions();
  } catch (e) {
    byId("resultCount").textContent = "";
    byId("txBody").innerHTML =
      '<tr><td colspan="8" class="text-center text-danger py-4">' + escapeHtml(e.message) + '</td></tr>';
  }
}

// ---------- Table ----------

function applyFilter(list, filter) {
  return list.filter(function (t) {
    if (filter === "CREDIT")  return t.type === "CREDIT";
    if (filter === "PAYMENT") return t.type === "PAYMENT";
    if (filter === "PENDING") return t.status === "PENDING";
    if (filter === "PAID")    return t.status === "PAID";
    return true;
  });
}

function buildTableRow(t) {
  const isCredit = t.type === "CREDIT";
  const item = t.item ? escapeHtml(t.item) : "—";
  const qty = t.quantity > 0 ? t.quantity : "—";
  const typeText = isCredit ? "Credit" : "Payment";
  const amountClass = isCredit ? "credit" : "payment";
  const sign = isCredit ? "+" : "−";
  const badgeClass = t.status === "PAID" ? "badge-paid" : "badge-pending";
  const badgeText = t.status === "PAID" ? "Paid" : "Pending";

  return (
    "<tr>" +
      '<td class="fw-bold">' + escapeHtml(t.customer) + "</td>" +
      "<td>" + item + "</td>" +
      '<td class="text-center">' + qty + "</td>" +
      '<td class="text-end tx-amount ' + amountClass + '">' + sign + formatRupees(t.amount) + "</td>" +
      "<td>" + typeText + "</td>" +
      "<td>" + formatDate(t.date) + "</td>" +
      '<td><span class="' + badgeClass + '">' + badgeText + "</span></td>" +
      '<td class="text-end text-nowrap">' +
        '<button type="button" class="btn btn-outline-primary btn-sm me-1" data-action="edit" data-id="' + t.id + '" aria-label="Edit">' +
          '<i class="bi bi-pencil"></i></button>' +
        '<button type="button" class="btn btn-outline-danger btn-sm" data-action="delete" data-id="' + t.id + '" aria-label="Delete">' +
          '<i class="bi bi-trash"></i></button>' +
      "</td>" +
    "</tr>"
  );
}

function renderTransactions() {
  const shown = applyFilter(allTransactions, currentFilter);

  byId("txBody").innerHTML = shown.map(buildTableRow).join("");
  byId("emptyMessage").classList.toggle("d-none", shown.length > 0);
  byId("resultCount").textContent =
    "Showing " + shown.length + " of " + allTransactions.length + " transactions";
}

function findTransaction(id) {
  return allTransactions.find(function (t) { return String(t.id) === String(id); });
}

// ---------- Edit pop-up ----------

function getEditType() {
  return document.querySelector('input[name="eType"]:checked').value;
}

function updateEditFields() {
  byId("eItemRow").classList.toggle("d-none", getEditType() === "PAYMENT");
}

function showEditMessage(text) {
  const box = byId("editMessage");
  box.textContent = text;
  box.className = "vk-alert show error";
}

function openEditModal(tx) {
  editingTxId = tx.id;

  byId("editCustomerList").innerHTML = allCustomers.map(function (c) {
    return '<option value="' + escapeHtml(c.name) + '"></option>';
  }).join("");

  byId("eCustomer").value = tx.customer;
  byId(tx.type === "PAYMENT" ? "eTypePayment" : "eTypeCredit").checked = true;
  byId("eItem").value = tx.item || "";
  byId("eQty").value = tx.quantity > 0 ? tx.quantity : "";
  byId("eAmount").value = tx.amount;
  byId("editMessage").className = "vk-alert";

  updateEditFields();
  editModal.show();
}

async function saveEdit() {
  const type = getEditType();
  const changes = {
    customer: byId("eCustomer").value.trim(),
    type: type,
    item: byId("eItem").value.trim(),
    quantity: Number(byId("eQty").value) || 0,
    amount: Number(byId("eAmount").value)
  };

  if (!changes.customer) {
    showEditMessage("Customer name is missing.");
    return;
  }
  if (!changes.amount || changes.amount <= 0) {
    showEditMessage("Enter an amount above 0.");
    return;
  }
  if (type === "CREDIT" && changes.item && changes.quantity < 1) {
    showEditMessage("Quantity must be at least 1.");
    return;
  }

  try {
    await updateTransaction(editingTxId, changes);     // from data.js -> backend
  } catch (e) {
    showEditMessage(e.message);
    return;
  }

  editModal.hide();
  loadTransactions();
}

// ---------- Delete pop-up ----------

function openDeleteModal(tx) {
  deletingTxId = tx.id;
  const what = tx.type === "PAYMENT" ? "payment" : "credit";
  byId("deleteText").textContent =
    "Delete the " + what + " of " + formatRupees(tx.amount) + " for " + tx.customer +
    "? The customer's balance will change.";
  deleteModal.show();
}

async function confirmDelete() {
  try {
    await deleteTransaction(deletingTxId);             // from data.js -> backend
  } catch (e) {
    byId("deleteText").textContent = e.message;
    return;
  }
  deleteModal.hide();
  loadTransactions();
}

// ---------- Page setup ----------

document.addEventListener("DOMContentLoaded", function () {
  requireLogin("../login.html");
  if (!getCurrentVendor()) return;

  editModal = new bootstrap.Modal(byId("editModal"));
  deleteModal = new bootstrap.Modal(byId("deleteModal"));

  loadTransactions();

  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      currentFilter = btn.getAttribute("data-filter");
      document.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      renderTransactions();
    });
  });

  byId("txBody").addEventListener("click", function (event) {
    const el = event.target.closest("[data-action]");
    if (!el) return;
    const tx = findTransaction(el.getAttribute("data-id"));
    if (!tx) return;

    if (el.getAttribute("data-action") === "edit") openEditModal(tx);
    else openDeleteModal(tx);
  });

  document.querySelectorAll('input[name="eType"]').forEach(function (r) {
    r.addEventListener("change", updateEditFields);
  });
  byId("saveEditBtn").addEventListener("click", saveEdit);
  byId("confirmDeleteBtn").addEventListener("click", confirmDelete);
});