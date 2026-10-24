import { initNavigation } from "../modules/nav.js";
import { getDemoUserByEmail, registerDemoUser } from "../modules/auth.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  setupPasswordToggles();
  document.getElementById("registerForm")?.addEventListener("submit", handleRegister);
});

function handleRegister(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const fullName = form.elements.fullName.value.trim();
  const email = form.elements.email.value.trim().toLowerCase();
  const password = form.elements.password.value;
  const confirmation = form.elements.confirmPassword.value;
  const terms = form.elements.terms.checked;
  const errors = {};

  if (!fullName) errors.registerFullName = "Vui lòng nhập họ và tên.";
  if (!email) errors.registerEmail = "Vui lòng nhập địa chỉ email.";
  else if (!emailPattern.test(email)) errors.registerEmail = "Email chưa đúng định dạng (ví dụ: sinhvien@lhu.edu.vn).";
  else if (getDemoUserByEmail(email)) errors.registerEmail = "Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.";
  if (!password.trim()) errors.registerPassword = "Vui lòng nhập mật khẩu.";
  else if (password.trim().length < 8) errors.registerPassword = "Mật khẩu cần có ít nhất 8 ký tự.";
  if (!confirmation) errors.registerConfirmPassword = "Vui lòng xác nhận mật khẩu.";
  else if (password !== confirmation) errors.registerConfirmPassword = "Mật khẩu xác nhận chưa trùng khớp.";
  if (!terms) errors.registerTerms = "Vui lòng đồng ý với điều khoản sử dụng và chính sách của LHU E-Shop.";

  clearErrors();
  const firstError = Object.keys(errors)[0];
  if (firstError) {
    Object.entries(errors).forEach(([id, message]) => setFieldError(id, message));
    document.getElementById(firstError.replace("Error", ""))?.focus();
    return;
  }

  const button = document.getElementById("registerSubmit");
  button.disabled = true;
  button.textContent = "Đang tạo tài khoản…";
  const result = registerDemoUser({ fullName, email });
  form.elements.password.value = "";
  form.elements.confirmPassword.value = "";
  button.disabled = false;
  button.textContent = "Đăng ký";

  if (!result.success) {
    setFeedback(result.message, "error");
    return;
  }
  setFeedback("Đăng ký tài khoản thành công! Đang chuyển đến trang đăng nhập…", "success");
  window.setTimeout(() => {
    window.location.assign(`./login.html?email=${encodeURIComponent(email)}`);
  }, 600);
}

function setupPasswordToggles() {
  document.querySelectorAll("[data-password-target]").forEach(button => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.passwordTarget);
      if (!input) return;
      const reveal = input.type === "password";
      input.type = reveal ? "text" : "password";
      button.textContent = reveal ? "Ẩn" : "Hiện";
      button.setAttribute("aria-label", `${reveal ? "Ẩn" : "Hiện"} ${input.id === "registerConfirmPassword" ? "mật khẩu xác nhận" : "mật khẩu"}`);
    });
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
  const feedback = document.getElementById("registerFeedback");
  feedback.textContent = message;
  feedback.className = `account-feedback is-${type}`;
  feedback.hidden = false;
}
