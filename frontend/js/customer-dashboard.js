/* ==========================================================
   VoiceKhata - customer-dashboard.js
   Shows a customer how much they owe at each shop.
   Shop cards start closed; click a shop to see the details.
   Data comes from GET /api/my/dues (read-only).
   ========================================================== */

let shops = [];
let openShops = new Set();      // shops whose details are open

// One row inside a shop's details
function buildEntryRow(t) {
  const isCredit = t.type === "CREDIT";
  return (
    "<tr>" +
      "<td>" + formatDate(t.date) + "</td>" +
      "<td>" + (t.item ? escapeHtml(t.item) : "—") + "</td>" +
      '<td class="text-center">' + (t.quantity > 0 ? t.quantity : "—") + "</td>" +
      '<td class="text-end tx-amount credit">' + (isCredit ? "+" + formatRupees(t.amount) : "—") + "</td>" +
      '<td class="text-end tx-amount payment">' + (!isCredit ? "−" + formatRupees(t.amount) : "—") + "</td>" +
    "</tr>"
  );
}

function buildTotalRow(shop) {
  let credit = 0, paid = 0;
  shop.transactions.forEach(function (t) {
    if (t.type === "CREDIT") credit += Number(t.amount);
    else paid += Number(t.amount);
  });
  return (
    '<tr class="fw-bold">' +
      '<td colspan="3">Total</td>' +
      '<td class="text-end tx-amount credit">' + formatRupees(credit) + "</td>" +
      '<td class="text-end tx-amount payment">' + formatRupees(paid) + "</td>" +
    "</tr>"
  );
}

// One card for a shop
function buildShopCard(shop, index) {
  const isOpen = openShops.has(index);
  const balance = Number(shop.balance);

  let badge, amountClass = "payment";
  if (balance > 0) {
    badge = '<span class="badge-pending">Pending</span>';
    amountClass = "credit";
  } else if (balance === 0) {
    badge = '<span class="badge-paid">All paid</span>';
  } else {
    badge = '<span class="badge-paid">Advance paid</span>';
  }

  const count = shop.transactions.length;

  const details = count > 0
    ? '<div class="table-responsive">' +
        '<table class="table align-middle mb-0">' +
          "<thead><tr><th>Date</th><th>Item</th>" +
            '<th class="text-center">Qty</th>' +
            '<th class="text-end">Credit (took)</th>' +
            '<th class="text-end">Payment (paid)</th></tr></thead>' +
          "<tbody>" + shop.transactions.map(buildEntryRow).join("") + buildTotalRow(shop) + "</tbody>" +
        "</table>" +
      "</div>"
    : '<div class="empty-state">No entries yet.</div>';

  return (
    '<section class="section-card mb-3">' +
      '<div class="d-flex align-items-center gap-3" style="cursor:pointer" data-shop="' + index + '">' +
        '<div class="tx-avatar">' + escapeHtml(shop.shopName.charAt(0).toUpperCase()) + "</div>" +
        '<div class="tx-info">' +
          '<div class="tx-name">' + escapeHtml(shop.shopName) + "</div>" +
          '<div class="tx-detail">' + count + (count === 1 ? " entry" : " entries") +
            " • tap to " + (isOpen ? "hide" : "see") + " details</div>" +
        "</div>" +
        '<div class="text-end">' +
          '<div class="tx-amount ' + amountClass + '">' + formatRupees(Math.abs(balance)) + "</div>" + badge +
        "</div>" +
        '<i class="bi ' + (isOpen ? "bi-chevron-up" : "bi-chevron-down") + ' fs-5 text-secondary"></i>' +
      "</div>" +
      '<div class="mt-3 ' + (isOpen ? "" : "d-none") + '">' +
        '<div class="mb-2"><a class="auth-link" href="tel:' + escapeHtml(shop.shopPhone) + '">' +
          '<i class="bi bi-telephone me-1"></i>Call shop: ' + escapeHtml(shop.shopPhone) + "</a></div>" +
        details +
      "</div>" +
    "</section>"
  );
}

function renderShops() {
  const list = document.getElementById("shopList");
  if (shops.length === 0) {
    const user = getCurrentVendor();
    list.innerHTML =
      '<div class="section-card"><div class="empty-state">' +
      'No shop has added you yet. Ask the shop owner to add your phone number (' +
      escapeHtml(user.phone) + ') to their customer list.</div></div>';
  } else {
    list.innerHTML = shops.map(buildShopCard).join("");
  }
}

async function loadMyDues() {
  const user = getCurrentVendor();
  document.getElementById("welcomeTitle").textContent = "Welcome, " + user.name + "!";

  try {
    const data = await apiRequest("GET", "/my/dues");
    shops = data.shops;

    document.getElementById("totalOwed").textContent = formatRupees(data.totalOwed);
    document.getElementById("shopCount").textContent = shops.length;
    renderShops();
  } catch (e) {
    document.getElementById("shopList").innerHTML =
      '<div class="section-card"><div class="empty-state text-danger">' + escapeHtml(e.message) + "</div></div>";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  requireLogin("../login.html");
  if (!getCurrentVendor()) return;

  loadMyDues();

  // Click a shop to open or close its details
  document.getElementById("shopList").addEventListener("click", function (event) {
    const head = event.target.closest("[data-shop]");
    if (!head) return;
    const index = Number(head.getAttribute("data-shop"));
    if (openShops.has(index)) openShops.delete(index); else openShops.add(index);
    renderShops();
  });
});