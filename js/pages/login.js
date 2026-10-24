import { initNavigation } from "../modules/nav.js";
import { getDemoUserByEmail, startDemoSession } from "../modules/auth.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  setupPasswordToggle();
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("loginEmail");
  emailInput.value = new URLSearchParams(window.location.search).get("email") || "";
  form?.addEventListener("submit", handleLogin);
});

function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const emailInput = form.elements.email;
  const passwordInput = form.elements.password;
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const errors = {};

  if (!email) errors.loginEmail = "Vui lòng nhập email.";
  else if (!emailPattern.test(email)) errors.loginEmail = "Email chưa đúng định dạng.";
  else if (!getDemoUserByEmail(email)) errors.loginEmail = "Không tìm thấy hồ sơ demo với email này.";
  if (!password.trim()) errors.loginPassword = "Vui lòng nhập mật khẩu demo.";

  clearErrors();
  const firstError = Object.keys(errors)[0];
  if (firstError) {
    Object.entries(errors).forEach(([id, message]) => setFieldError(id, message));
    document.getElementById(firstError.replace("Error", ""))?.focus();
    return;
  }

  const user = getDemoUserByEmail(email);
  const button = document.getElementById("loginSubmit");
  button.disabled = true;
  button.textContent = "Đang đăng nhập…";
  passwordInput.value = "";
  const success = startDemoSession(user.id, form.elements.remember.checked);
  button.disabled = false;
  button.textContent = "Đăng nhập";

  if (!success) {
    setFeedback("Không thể bắt đầu phiên demo. Hãy kiểm tra quyền lưu trữ của trình duyệt rồi thử lại.", "error");
    return;
  }

  const next = new URLSearchParams(window.location.search).get("next");
  const destination = next ? new URL(next, window.location.href) : new URL("../index.html", window.location.href);
  if (destination.origin !== window.location.origin) {
    window.location.assign("../index.html");
    return;
  }
  window.location.assign(destination.href);
}

function setupPasswordToggle() {
  const button = document.querySelector("[data-password-target]");
  button?.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.passwordTarget);
    if (!input) return;
    const reveal = input.type === "password";
    input.type = reveal ? "text" : "password";
    button.textContent = reveal ? "Ẩn" : "Hiện";
    button.setAttribute("aria-label", `${reveal ? "Ẩn" : "Hiện"} mật khẩu`);
  });
}

function clearErrors() {
  document.querySelectorAll(".account-field-error").forEach(error => {
    error.textContent = "";
  });
}

function setFieldError(id, message) {
  const error = document.getElementById(`${id}Error`);
  if (error) error.textContent = message;
}

function setFeedback(message, type) {
  const feedback = document.getElementById("loginFeedback");
  feedback.textContent = message;
  feedback.className = `account-feedback is-${type}`;
  feedback.hidden = false;
}
