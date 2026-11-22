/* ==========================================================
   VoiceKhata - auth.js
   Register and login with two roles: OWNER and CUSTOMER.
   Also contains apiRequest(), which every page uses.
   ========================================================== */

const API_BASE = "https://voicekhata-sp06.onrender.com/api";

const VK_KEYS = {
  CURRENT: "vk_current_vendor",   // name, phone and role of the logged-in user
  TOKEN: "vk_token"               // the token the backend gave us
};

// ---------- Which folder is this page in? ----------
function pageFolder() {
  const p = window.location.pathname;
  if (p.indexOf("/customer/") !== -1) return "customer";
  if (p.indexOf("/dashboard/") !== -1 || p.indexOf("/customers/") !== -1 || p.indexOf("/transactions/") !== -1) return "owner";
  return "root";
}

function loginPagePath() {
  return pageFolder() === "root" ? "login.html" : "../login.html";
}

// Where should each role go after login?
function homePath(role) {
  const prefix = pageFolder() === "root" ? "" : "../";
  return role === "CUSTOMER"
    ? prefix + "customer/customer-dashboard.html"
    : prefix + "dashboard/dashboard.html";
}

// ---------- Talking to the backend ----------
function getToken() {
  return localStorage.getItem(VK_KEYS.TOKEN);
}

async function apiRequest(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = "Bearer " + token;

  let response;
  try {
    response = await fetch(API_BASE + path, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (e) {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  // Login expired (for example the backend was restarted)
  if (response.status === 401 && path.indexOf("/auth/") === -1) {
    localStorage.removeItem(VK_KEYS.TOKEN);
    localStorage.removeItem(VK_KEYS.CURRENT);
    window.location.href = loginPagePath();
    throw new Error("Session expired. Please login again.");
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error((data && data.message) || "Something went wrong.");
  }
  return data;
}

// ---------- Who is logged in? ----------
function getCurrentVendor() {
  if (!getToken()) return null;
  const data = localStorage.getItem(VK_KEYS.CURRENT);
  if (!data) return null;
  const user = JSON.parse(data);
  if (!user.role) user.role = "OWNER";       // older logins had no role
  return user;
}

// ---------- Validation rules ----------
function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone);
}

function isValidPin(pin) {
  return /^\d{4}$/.test(pin);
}

// ---------- Showing and clearing messages ----------
function showFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorBox = document.getElementById(inputId + "Error");
  input.classList.add("is-invalid");
  errorBox.textContent = message;
}

function clearFieldErrors(form) {
  form.querySelectorAll(".is-invalid").forEach(function (el) {
    el.classList.remove("is-invalid");
  });
  hideMessage();
}

function showMessage(text, type) {
  const box = document.getElementById("formMessage");
  box.textContent = text;
  box.className = "vk-alert show " + type;
}

function hideMessage() {
  const box = document.getElementById("formMessage");
  box.className = "vk-alert";
  box.textContent = "";
}

function allowOnlyDigits(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener("input", function () {
    input.value = input.value.replace(/\D/g, "");
  });
}

// ---------- Main actions ----------
async function registerVendor(name, phone, pin, role) {
  try {
    await apiRequest("POST", "/auth/register", { name: name, phone: phone, pin: pin, role: role });
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

async function loginVendor(phone, pin) {
  try {
    const data = await apiRequest("POST", "/auth/login", { phone: phone, pin: pin });
    localStorage.setItem(VK_KEYS.TOKEN, data.token);
    localStorage.setItem(VK_KEYS.CURRENT, JSON.stringify({ name: data.name, phone: data.phone, role: data.role }));
    return { success: true, role: data.role };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function logout() {
  apiRequest("POST", "/auth/logout").catch(function () {});
  localStorage.removeItem(VK_KEYS.TOKEN);
  localStorage.removeItem(VK_KEYS.CURRENT);
  window.location.href = loginPagePath();
}

// Called at the top of every protected page.
// Owners can open the owner pages, customers only the customer page.
function requireLogin(pathToLogin) {
  const user = getCurrentVendor();
  if (!user) {
    window.location.href = pathToLogin || loginPagePath();
    return;
  }
  const folder = pageFolder();
  if (folder === "customer" && user.role !== "CUSTOMER") window.location.href = homePath(user.role);
  if (folder === "owner" && user.role === "CUSTOMER") window.location.href = homePath(user.role);
}

// ---------- Page setup ----------
document.addEventListener("DOMContentLoaded", function () {

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  // Already logged in? Skip the login and register pages
  const user = getCurrentVendor();
  if ((loginForm || registerForm) && user) {
    window.location.href = homePath(user.role);
    return;
  }

  allowOnlyDigits("phone");
  allowOnlyDigits("pin");
  allowOnlyDigits("confirmPin");

  // ----- LOGIN PAGE -----
  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      clearFieldErrors(loginForm);

      const phone = document.getElementById("phone").value.trim();
      const pin = document.getElementById("pin").value.trim();
      let hasError = false;

      if (!isValidPhone(phone)) {
        showFieldError("phone", "Enter a valid 10-digit mobile number.");
        hasError = true;
      }
      if (!isValidPin(pin)) {
        showFieldError("pin", "PIN must be exactly 4 digits.");
        hasError = true;
      }
      if (hasError) return;

      const result = await loginVendor(phone, pin);
      if (result.success) {
        showMessage("Login successful! Opening your dashboard...", "success");
        setTimeout(function () {
          window.location.href = homePath(result.role);
        }, 800);
      } else {
        showMessage(result.message, "error");
      }
    });
  }

  // ----- REGISTER PAGE -----
  if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      clearFieldErrors(registerForm);

      const role = document.getElementById("role").value;     // OWNER or CUSTOMER
      const name = document.getElementById("vendorName").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const pin = document.getElementById("pin").value.trim();
      const confirmPin = document.getElementById("confirmPin").value.trim();
      let hasError = false;

      if (name.length < 2) {
        showFieldError("vendorName", "Please enter your name (at least 2 letters).");
        hasError = true;
      }
      if (!isValidPhone(phone)) {
        showFieldError("phone", "Enter a valid 10-digit mobile number.");
        hasError = true;
      }
      if (!isValidPin(pin)) {
        showFieldError("pin", "PIN must be exactly 4 digits.");
        hasError = true;
      }
      if (pin !== confirmPin) {
        showFieldError("confirmPin", "PINs do not match.");
        hasError = true;
      }
      if (hasError) return;

      const result = await registerVendor(name, phone, pin, role);
      if (result.success) {
        showMessage("Registration successful! Redirecting to login...", "success");
        setTimeout(function () {
          window.location.href = "login.html";
        }, 1200);
      } else {
        showMessage(result.message, "error");
      }
    });
  }
});
