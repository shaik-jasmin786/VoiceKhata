/* ==========================================================
   VoiceKhata - transactions.js
   One card per person. Click a person to see their details.
   Credit and Payment columns. Edit and delete buttons.
   ========================================================== */

let currentFilter = "ALL";
let allTransactions = [];
let allCustomers = [];
let groups = [];
let openKeys = new Set();       // people whose details are open
let editingTxId = null;
let deletingTxId = null;
let editModal = null;
let deleteModal = null;

function byId(id) { return document.getElementById(id); }

// ---------- Loading ----------

async function loadTransactions() {
  try {
    const results = await Promise.all([fetchTransactions(), fetchCustomers()]);
    allTransactions = results[0];
    allCustomers = results[1];
    renderPeople();
  } catch (e) {
    byId("personList").innerHTML =
      '<div class="section-card"><div class="empty-state text-danger">' + escapeHtml(e.message) + '</div></div>';
  }
}

// ---------- Filters and grouping ----------

function matchesFilter(t) {
  if (currentFilter === "CREDIT")  return t.type === "CREDIT";
  if (currentFilter === "PAYMENT") return t.type === "PAYMENT";
  if (currentFilter === "PENDING") return t.status === "PENDING";
  if (currentFilter === "PAID")    return t.status === "PAID";
  return true;
}

function buildGroups() {
  const map = {};
  allTransactions.forEach(function (t) {
    const key = t.customer.toLowerCase();
    if (!map[key]) map[key] = { key: key, name: t.customer, balance: 0, shown: [] };
    const amount = Number(t.amount);
    map[key].balance += (t.type === "CREDIT") ? amount : -amount;
    if (matchesFilter(t)) map[key].shown.push(t);
  });

  return Object.values(map)
    .filter(function (g) { return g.shown.length > 0; })
    .sort(function (a, b) { return (b.balance - a.balance) || a.name.localeCompare(b.name); });
}

// ---------- Drawing ----------

function buildEntryRow(t) {
  const isCredit = t.type === "CREDIT";
  return (
    "<tr>" +
      "<td>" + formatDate(t.date) + "</td>" +
      "<td>" + (t.item ? escapeHtml(t.item) : "—") + "</td>" +
      '<td class="text-center">' + (t.quantity > 0 ? t.quantity : "—") + "</td>" +
      '<td class="text-end tx-amount credit">' + (isCredit ? "+" + formatRupees(t.amount) : "—") + "</td>" +
      '<td class="text-end tx-amount payment">' + (!isCredit ? "−" + formatRupees(t.amount) : "—") + "</td>" +
      '<td class="text-end text-nowrap">' +
        '<button type="button" class="btn btn-outline-primary btn-sm me-1" data-action="edit" data-id="' + t.id + '" aria-label="Edit">' +
          '<i class="bi bi-pencil"></i></button>' +
        '<button type="button" class="btn btn-outline-danger btn-sm" data-action="delete" data-id="' + t.id + '" aria-label="Delete">' +
          '<i class="bi bi-trash"></i></button>' +
      "</td>" +
    "</tr>"
  );
}

function buildTotalRow(g) {
  let credit = 0, paid = 0;
  g.shown.forEach(function (t) {
    if (t.type === "CREDIT") credit += Number(t.amount);
    else paid += Number(t.amount);
  });
  return (
    '<tr class="fw-bold">' +
      '<td colspan="3">Total</td>' +
      '<td class="text-end tx-amount credit">' + formatRupees(credit) + "</td>" +
      '<td class="text-end tx-amount payment">' + formatRupees(paid) + "</td>" +
      "<td></td>" +
    "</tr>"
  );
}

function buildPersonCard(g, index) {
  const isOpen = openKeys.has(g.key);

  let amountClass = "payment", badge, amountText;
  if (g.balance > 0) {
    amountClass = "credit";
    badge = '<span class="badge-pending">Pending</span>';
    amountText = formatRupees(g.balance);
  } else if (g.balance === 0) {
    badge = '<span class="badge-paid">All paid</span>';
    amountText = formatRupees(0);
  } else {
    badge = '<span class="badge-paid">Advance paid</span>';
    amountText = formatRupees(Math.abs(g.balance));
  }

  const count = g.shown.length;

  return (
    '<section class="section-card mb-3">' +
      '<div class="d-flex align-items-center gap-3" style="cursor:pointer" data-person="' + index + '">' +
        '<div class="tx-avatar">' + escapeHtml(g.name.charAt(0).toUpperCase()) + "</div>" +
        '<div class="tx-info">' +
          '<div class="tx-name">' + escapeHtml(g.name) + "</div>" +
          '<div class="tx-detail">' + count + (count === 1 ? " entry" : " entries") +
            " • tap to " + (isOpen ? "hide" : "see") + " details</div>" +
        "</div>" +
        '<div class="text-end">' +
          '<div class="tx-amount ' + amountClass + '">' + amountText + "</div>" + badge +
        "</div>" +
        '<i class="bi ' + (isOpen ? "bi-chevron-up" : "bi-chevron-down") + ' fs-5 text-secondary"></i>' +
      "</div>" +
      '<div class="mt-3 ' + (isOpen ? "" : "d-none") + '">' +
        '<div class="table-responsive">' +
          '<table class="table align-middle mb-0">' +
            "<thead><tr><th>Date</th><th>Item</th>" +
              '<th class="text-center">Qty</th>' +
              '<th class="text-end">Credit (took)</th>' +
              '<th class="text-end">Payment (paid)</th>' +
              '<th class="text-end">Actions</th></tr></thead>' +
            "<tbody>" + g.shown.map(buildEntryRow).join("") + buildTotalRow(g) + "</tbody>" +
          "</table>" +
        "</div>" +
      "</div>" +
    "</section>"
  );
}

function renderPeople() {
  groups = buildGroups();
  byId("personList").innerHTML = groups.map(buildPersonCard).join("");
  byId("emptyMessage").classList.toggle("d-none", groups.length > 0);
  byId("resultCount").textContent =
    groups.length + (groups.length === 1 ? " person" : " people") + " • " + allTransactions.length + " transactions in total";
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

  if (!changes.customer) { showEditMessage("Customer name is missing."); return; }
  if (!changes.amount || changes.amount <= 0) { showEditMessage("Enter an amount above 0."); return; }
  if (type === "CREDIT" && changes.item && changes.quantity < 1) { showEditMessage("Quantity must be at least 1."); return; }

  try {
    await updateTransaction(editingTxId, changes);
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
    await deleteTransaction(deletingTxId);
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

  // Replace the old table with the list of people
  const oldCard = document.querySelector("main .section-card");
  if (oldCard) {
    oldCard.outerHTML =
      '<div id="personList"></div>' +
      '<div id="emptyMessage" class="empty-state d-none">No transactions found for this filter.</div>';
  }

  editModal = new bootstrap.Modal(byId("editModal"));
  deleteModal = new bootstrap.Modal(byId("deleteModal"));

  loadTransactions();

  // Filter buttons
  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      currentFilter = btn.getAttribute("data-filter");
      document.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      renderPeople();
    });
  });

  // One listener: edit/delete buttons first, then open/close a person
  byId("personList").addEventListener("click", function (event) {
    const actionBtn = event.target.closest("[data-action]");
    if (actionBtn) {
      const tx = findTransaction(actionBtn.getAttribute("data-id"));
      if (!tx) return;
      if (actionBtn.getAttribute("data-action") === "edit") openEditModal(tx);
      else openDeleteModal(tx);
      return;
    }

    const head = event.target.closest("[data-person]");
    if (!head) return;
    const g = groups[Number(head.getAttribute("data-person"))];
    if (!g) return;
    if (openKeys.has(g.key)) openKeys.delete(g.key); else openKeys.add(g.key);
    renderPeople();
  });

  document.querySelectorAll('input[name="eType"]').forEach(function (r) {
    r.addEventListener("change", updateEditFields);
  });
  byId("saveEditBtn").addEventListener("click", saveEdit);
  byId("confirmDeleteBtn").addEventListener("click", confirmDelete);
});