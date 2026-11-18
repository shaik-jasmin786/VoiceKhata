/* ==========================================================
   VoiceKhata - dashboard.js (backend version)
   ========================================================== */

function buildTransactionRow(t) {
  const isCredit = t.type === "CREDIT";

  let detail;
  if (isCredit) {
    detail = t.item ? (t.quantity + " × " + t.item) : "Credit given";
  } else {
    detail = "Payment received";
  }

  const sign = isCredit ? "+" : "−";
  const amountClass = isCredit ? "credit" : "payment";
  const badgeClass = t.status === "PAID" ? "badge-paid" : "badge-pending";
  const badgeText = t.status === "PAID" ? "Paid" : "Pending";
  const initial = t.customer.charAt(0).toUpperCase();

  return (
    '<div class="tx-item">' +
      '<div class="tx-avatar">' + escapeHtml(initial) + '</div>' +
      '<div class="tx-info">' +
        '<div class="tx-name">' + escapeHtml(t.customer) + '</div>' +
        '<div class="tx-detail">' + escapeHtml(detail) + ' • ' + formatDate(t.date) + '</div>' +
      '</div>' +
      '<div class="tx-right">' +
        '<div class="tx-amount ' + amountClass + '">' + sign + formatRupees(t.amount) + '</div>' +
        '<span class="' + badgeClass + '">' + badgeText + '</span>' +
      '</div>' +
    '</div>'
  );
}

// Gets the numbers from the backend and fills the page
async function loadDashboard() {
  const vendor = getCurrentVendor();
  document.getElementById("welcomeTitle").textContent = "Welcome, " + vendor.name + "!";

  try {
    const d = await fetchDashboard();

    document.getElementById("pendingDues").textContent = formatRupees(d.pendingDues);
    document.getElementById("totalCustomers").textContent = d.totalCustomers;
    document.getElementById("monthCount").textContent = d.monthCount;
    document.getElementById("monthNote").textContent =
      formatRupees(d.monthCredit) + " credit • " + formatRupees(d.monthPayment) + " received";

    const list = document.getElementById("recentList");
    if (d.recent.length === 0) {
      list.innerHTML = '<div class="empty-state">No transactions yet. Tap the mic to add one!</div>';
    } else {
      list.innerHTML = d.recent.map(buildTransactionRow).join("");
    }
  } catch (e) {
    document.getElementById("recentList").innerHTML =
      '<div class="empty-state text-danger">' + escapeHtml(e.message) + '</div>';
  }
}

document.addEventListener("DOMContentLoaded", function () {
  requireLogin("../login.html");
  if (!getCurrentVendor()) return;
  loadDashboard();
});