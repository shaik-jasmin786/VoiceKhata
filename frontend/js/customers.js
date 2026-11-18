/* ==========================================================
   VoiceKhata - customers.js (backend version)
   Customers and balances come from MySQL through the backend.
   ========================================================== */

let editingId = null;        // null = adding a new customer
let customerModal = null;
let allCustomers = [];       // customers from the backend
let balances = {};           // customer name (lowercase) -> balance

function byId(id) { return document.getElementById(id); }

// ---------- Loading data ----------

// Balance = credit - payments, worked out from the transactions
function calculateBalances(transactions) {
  const map = {};
  transactions.forEach(function (t) {
    const key = t.customer.toLowerCase();
    const amount = Number(t.amount);
    map[key] = (map[key] || 0) + (t.type === "CREDIT" ? amount : -amount);
  });
  return map;
}

function balanceOf(customer) {
  return balances[customer.name.toLowerCase()] || 0;
}

async function loadCustomers() {
  try {
    const results = await Promise.all([fetchCustomers(), fetchTransactions()]);
    allCustomers = results[0];
    balances = calculateBalances(results[1]);
    renderCustomers();
  } catch (e) {
    byId("customerList").innerHTML =
      '<div class="empty-state text-danger">' + escapeHtml(e.message) + '</div>';
  }
}

// ---------- Building the list ----------

function buildCustomerRow(c) {
  const balance = balanceOf(c);
  const owes = balance > 0;

  let statusBadge;
  let amountText;
  if (balance > 0) {
    statusBadge = '<span class="badge-pending">Pending</span>';
    amountText = formatRupees(balance);
  } else if (balance === 0) {
    statusBadge = '<span class="badge-paid">All paid</span>';
    amountText = formatRupees(0);
  } else {
    statusBadge = '<span class="badge-paid">Advance paid</span>';
    amountText = formatRupees(Math.abs(balance));
  }

  const phoneText = c.phone
    ? '<i class="bi bi-telephone me-1"></i>' + escapeHtml(c.phone)
    : '<span class="text-danger">No phone number</span>';

  const remindBtn = owes
    ? '<button type="button" class="btn btn-vk-teal btn-sm" data-action="remind" data-id="' + c.id + '">' +
        '<i class="bi bi-whatsapp me-1"></i> Send Reminder</button>'
    : '<button type="button" class="btn btn-outline-secondary btn-sm" disabled>Nothing pending</button>';

  return (
    '<div class="cust-row">' +
      '<div class="tx-avatar">' + escapeHtml(c.name.charAt(0).toUpperCase()) + '</div>' +
      '<div class="tx-info">' +
        '<div class="tx-name">' + escapeHtml(c.name) + '</div>' +
        '<div class="tx-detail">' + phoneText +
          ' <a href="#" class="auth-link ms-2" data-action="edit" data-id="' + c.id + '">' +
          (c.phone ? "Edit" : "Add phone") + '</a></div>' +
      '</div>' +
      '<div class="cust-right">' +
        '<div class="tx-amount ' + (owes ? "credit" : "payment") + '">' + amountText + '</div>' +
        statusBadge +
        '<div class="mt-2">' + remindBtn + '</div>' +
      '</div>' +
    '</div>'
  );
}

function renderCustomers() {
  const search = byId("searchBox").value.trim().toLowerCase();

  const shown = allCustomers
    .filter(function (c) { return c.name.toLowerCase().indexOf(search) !== -1; })
    .sort(function (a, b) { return balanceOf(b) - balanceOf(a); });

  let totalPending = 0;
  allCustomers.forEach(function (c) {
    if (balanceOf(c) > 0) totalPending += balanceOf(c);
  });
  byId("customerCount").textContent =
    allCustomers.length + " customers • " + formatRupees(totalPending) + " to collect";

  byId("customerList").innerHTML = shown.length > 0
    ? shown.map(buildCustomerRow).join("")
    : '<div class="empty-state">No customers found.</div>';
}

// ---------- WhatsApp reminder ----------

function toWhatsAppNumber(phone) {
  const digits = String(phone).replace(/\D/g, "");
  return digits.length === 10 ? "91" + digits : digits;
}

function sendReminder(customer) {
  if (!customer.phone) {
    openCustomerModal(customer);
    showModalMessage("Please add a phone number to send a reminder.", "error");
    return;
  }

  const shop = getCurrentVendor().name;
  const message =
    "Namaste " + customer.name + ", you have a pending balance of " + formatRupees(balanceOf(customer)) +
    " at " + shop + "'s shop. Please pay when convenient. Thank you!";

  const url = "https://wa.me/" + toWhatsAppNumber(customer.phone) + "?text=" + encodeURIComponent(message);
  window.open(url, "_blank");
}

// ---------- Add / edit pop-up ----------

function showModalMessage(text, type) {
  const box = byId("customerMessage");
  box.textContent = text;
  box.className = "vk-alert show " + type;
}

function openCustomerModal(customer) {
  editingId = customer ? customer.id : null;
  byId("customerModalTitle").textContent = customer ? "Edit Phone Number" : "Add Customer";
  byId("cName").value = customer ? customer.name : "";
  byId("cName").readOnly = !!customer;
  byId("cPhone").value = customer ? customer.phone : "";
  byId("customerMessage").className = "vk-alert";
  customerModal.show();
}

async function saveCustomerFromModal() {
  const name = byId("cName").value.trim();
  const phone = byId("cPhone").value.trim();

  if (name.length < 2) {
    showModalMessage("Please enter the customer name.", "error");
    return;
  }
  if (phone !== "" && !isValidPhone(phone)) {
    showModalMessage("Enter a valid 10-digit mobile number, or leave it empty.", "error");
    return;
  }

  try {
    if (editingId) {
      await apiRequest("PUT", "/customers/" + editingId, { name: name, phone: phone });
    } else {
      await apiRequest("POST", "/customers", { name: name, phone: phone });
    }
  } catch (e) {
    showModalMessage(e.message, "error");
    return;
  }

  customerModal.hide();
  loadCustomers();
}

// ---------- Page setup ----------

document.addEventListener("DOMContentLoaded", function () {
  requireLogin("../login.html");
  if (!getCurrentVendor()) return;

  customerModal = new bootstrap.Modal(byId("customerModal"));
  loadCustomers();

  byId("searchBox").addEventListener("input", renderCustomers);
  byId("addCustomerBtn").addEventListener("click", function () { openCustomerModal(null); });
  byId("saveCustomerBtn").addEventListener("click", saveCustomerFromModal);

  byId("cPhone").addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "");
  });

  byId("customerList").addEventListener("click", function (event) {
    const el = event.target.closest("[data-action]");
    if (!el) return;
    event.preventDefault();

    const customer = allCustomers.find(function (c) { return String(c.id) === el.getAttribute("data-id"); });
    if (!customer) return;

    if (el.getAttribute("data-action") === "remind") sendReminder(customer);
    else openCustomerModal(customer);
  });
});