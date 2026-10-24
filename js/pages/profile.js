import { initNavigation } from "../modules/nav.js";
import { getCurrentUser, logout, updateCurrentUser } from "../modules/auth.js";

let originalValues = null;

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  const user = getCurrentUser();
  if (!user) {
    const next = encodeURIComponent("./profile.html");
    window.location.replace(`./login.html?next=${next}`);
    return;
  }

  fillProfile(user);
  document.getElementById("editProfileButton").addEventListener("click", enableEditing);
  document.getElementById("cancelProfileButton").addEventListener("click", cancelEditing);
  document.getElementById("profileForm").addEventListener("submit", saveProfile);
  document.getElementById("profileLogoutButton").addEventListener("click", handleLogout);
});

function fillProfile(user) {
  document.getElementById("profileFullName").value = user.fullName;
  document.getElementById("profileEmail").value = user.email;
  document.getElementById("profilePhone").value = user.phone || "";
  document.getElementById("profileAddress").value = user.address || "";
  document.getElementById("profileCreatedAt").dateTime = user.createdAt;
  document.getElementById("profileCreatedAt").textContent = formatDate(user.createdAt);
  document.getElementById("profileAvatar").textContent = user.fullName.trim().charAt(0).toLocaleUpperCase("vi");
}

function enableEditing() {
  originalValues = readFormValues();
  ["profileFullName", "profileEmail", "profilePhone", "profileAddress"].forEach(id => {
    document.getElementById(id).disabled = false;
  });
  document.getElementById("editProfileButton").hidden = true;
  document.getElementById("saveProfileButton").hidden = false;
  document.getElementById("cancelProfileButton").hidden = false;
  document.getElementById("profileFullName").focus();
  setFeedback("", "");
}

function cancelEditing() {
  if (originalValues) writeFormValues(originalValues);
  setEditing(false);
  clearErrors();
}

function saveProfile(event) {
  event.preventDefault();
  clearErrors();
  const values = readFormValues();
  if (!values.fullName.trim()) {
    showFieldError("fullName", "Vui lòng nhập họ và tên.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    showFieldError("email", "Email chưa đúng định dạng.");
    return;
  }
  const phoneDigits = values.phone.replace(/\D/g, "");
  if (values.phone && (!/^[+\d()\s.-]{8,20}$/.test(values.phone.trim()) || phoneDigits.length < 8 || phoneDigits.length > 15)) {
    showFieldError("phone", "Số điện thoại chưa đúng định dạng.");
    return;
  }
  if (values.address.length > 240) {
    setFeedback("Địa chỉ không được dài quá 240 ký tự.", "error");
    document.getElementById("profileAddress").focus();
    return;
  }

  const button = document.getElementById("saveProfileButton");
  button.disabled = true;
  const result = updateCurrentUser(values);
  button.disabled = false;
  if (!result.success) {
    if (result.field) showFieldError(result.field, result.message);
    else setFeedback(result.message, "error");
    return;
  }
  fillProfile(result.user);
  setEditing(false);
  setFeedback("Cập nhật thông tin tài khoản thành công!", "success");
}

function handleLogout() {
  if (!logout()) {
    setFeedback("Không thể đăng xuất vào lúc này. Vui lòng thử lại.", "error");
    return;
  }
  window.location.assign("../index.html");
}

function setEditing(editing) {
  ["profileFullName", "profileEmail", "profilePhone", "profileAddress"].forEach(id => {
    document.getElementById(id).disabled = !editing;
  });
  document.getElementById("editProfileButton").hidden = editing;
  document.getElementById("saveProfileButton").hidden = !editing;
  document.getElementById("cancelProfileButton").hidden = !editing;
}

function readFormValues() {
  return {
    fullName: document.getElementById("profileFullName").value,
    email: document.getElementById("profileEmail").value,
    phone: document.getElementById("profilePhone").value,
    address: document.getElementById("profileAddress").value
  };
}

function writeFormValues(values) {
  document.getElementById("profileFullName").value = values.fullName;
  document.getElementById("profileEmail").value = values.email;
  document.getElementById("profilePhone").value = values.phone;
  document.getElementById("profileAddress").value = values.address;
}

function clearErrors() {
  ["fullName", "email", "phone", "address"].forEach(field => {
    document.getElementById(`profile${capitalize(field)}Error`).textContent = "";
  });
}

function showFieldError(field, message) {
  const id = `profile${capitalize(field)}`;
  document.getElementById(`${id}Error`).textContent = message;
  document.getElementById(id).focus();
}

function setFeedback(message, type) {
  const feedback = document.getElementById("profileFeedback");
  feedback.textContent = message;
  feedback.className = type ? `account-feedback is-${type}` : "account-feedback";
  feedback.hidden = !message;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
