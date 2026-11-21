/* ==========================================================
   VoiceKhata - customers.js (owner's Customers page)
   Each customer is one row: name, amount and a WhatsApp button.
   Click a customer to see the phone number and edit it.
   ========================================================== */

let editingId = null;        // null = adding a new customer
let customerModal = null;
let allCustomers = [];
let balances = {};           // customer name (lowercase) -> balance
let shown = [];              // customers currently on the screen
let openIds = new Set();     // customers whose details are open

function byId(id) { return document.getElementById(id); }

// ---------- Loading data ----------

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

// ---------- Drawing the list ----------

function buildCustomerRow(c, index) {
  const balance = balanceOf(c);
  const isOpen = openIds.has(c.id);

  // Amount (no Pending badge: the amount itself is the pending amount)
  let amountClass = "payment";
  let amountText = formatRupees(Math.abs(balance));
  let note = "";
  if (balance > 0) amountClass = "credit";
  else if (balance < 0) note = '<div class="small text-secondary">advance</div>';

  // WhatsApp button only when the customer owes money
  const remindBtn = balance > 0
    ? '<button type="button" class="btn btn-vk-teal btn-sm" data-action="remind" data-id="' + c.id + '" aria-label="Send WhatsApp reminder">' +
        '<i class="bi bi-whatsapp"></i> <span class="d-none d-sm-inline ms-1">Send Reminder</span></button>'
    : "";

  const phoneText = c.phone
    ? '<i class="bi bi-telephone me-1"></i>' + escapeHtml(c.phone)
    : '<span class="text-danger">No phone number</span>';

  return (
    '<div class="border-bottom py-3">' +
      '<div class="d-flex align-items-center gap-3" style="cursor:pointer" data-cust="' + index + '">' +
        '<div class="tx-avatar">' + escapeHtml(c.name.charAt(0).toUpperCase()) + "</div>" +
        '<div class="tx-info">' +
          '<div class="tx-name">' + escapeHtml(c.name) + "</div>" +
          '<div class="tx-detail">tap to ' + (isOpen ? "hide" : "see") + " details</div>" +
        "</div>" +
        '<div class="text-end">' +
          '<div class="tx-amount ' + amountClass + '">' + amountText + "</div>" + note +
        "</div>" +
        remindBtn +
      "</div>" +
      '<div class="mt-2 ms-5 ps-4 ' + (isOpen ? "" : "d-none") + '">' +
        '<span class="me-3">' + phoneText + "</span>" +
        '<a href="#" class="auth-link" data-action="edit" data-id="' + c.id + '">' +
          '<i class="bi bi-pencil me-1"></i>' + (c.phone ? "Edit phone" : "Add phone") + "</a>" +
      "</div>" +
    "</div>"
  );
}

function renderCustomers() {
  const search = byId("searchBox").value.trim().toLowerCase();

  shown = allCustomers
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

  // One listener: WhatsApp and Edit buttons first, then open/close a customer
  byId("customerList").addEventListener("click", function (event) {
    const actionBtn = event.target.closest("[data-action]");
    if (actionBtn) {
      event.preventDefault();
      const customer = allCustomers.find(function (c) { return String(c.id) === actionBtn.getAttribute("data-id"); });
      if (!customer) return;
      if (actionBtn.getAttribute("data-action") === "remind") sendReminder(customer);
      else openCustomerModal(customer);
      return;
    }

    const head = event.target.closest("[data-cust]");
    if (!head) return;
    const c = shown[Number(head.getAttribute("data-cust"))];
    if (!c) return;
    if (openIds.has(c.id)) openIds.delete(c.id); else openIds.add(c.id);
    renderCustomers();
  });
});