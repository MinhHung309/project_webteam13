import {
  getStorageItem,
  setStorageItem,
  STORAGE_KEYS
} from "../utils/storage.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const AUTH_UPDATED_EVENT = "lhu:auth-updated";

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function readUsers() {
  const users = getStorageItem(STORAGE_KEYS.DEMO_USERS, []);
  return Array.isArray(users) ? users.filter(isValidUser) : [];
}

function isValidUser(user) {
  return Boolean(
    user &&
    typeof user === "object" &&
    typeof user.id === "string" &&
    user.id.trim() &&
    typeof user.fullName === "string" &&
    typeof user.email === "string" &&
    normalizeEmail(user.email) === user.email &&
    typeof user.createdAt === "string"
  );
}

function makeUserId() {
  const randomId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `lhu-user-${randomId}`;
}

function dispatchAuthUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_UPDATED_EVENT));
  }
}

function getSession(storage, key) {
  let raw;
  try {
    raw = storage.getItem(key);
  } catch (error) {
    console.error("[Auth] Không thể đọc phiên đăng nhập.", error);
    return null;
  }
  if (raw === null) return null;

  try {
    const session = JSON.parse(raw);
    if (
      !session ||
      typeof session !== "object" ||
      session.version !== 1 ||
      typeof session.userId !== "string" ||
      !session.userId.trim()
    ) {
      storage.removeItem(key);
      return null;
    }
    return session;
  } catch (error) {
    console.warn("[Auth] Dữ liệu phiên đăng nhập không hợp lệ; đã dọn dẹp phiên lỗi.", error);
    try {
      storage.removeItem(key);
    } catch (removeError) {
      console.error("[Auth] Không thể xóa phiên đăng nhập bị lỗi.", removeError);
    }
    return null;
  }
}

function findSessionUser(storage, key) {
  const session = getSession(storage, key);
  if (!session) return null;
  const user = readUsers().find(profile => profile.id === session.userId);
  if (!user) {
    try {
      storage.removeItem(key);
    } catch (error) {
      console.error("[Auth] Không thể xóa phiên không còn tài khoản tương ứng.", error);
    }
  }
  return user || null;
}

export function getDemoUsers() {
  return readUsers().map(user => ({ ...user }));
}

export function getDemoUserByEmail(email) {
  const cleanEmail = normalizeEmail(email);
  return readUsers().find(user => user.email === cleanEmail) || null;
}

export function registerDemoUser(profile) {
  const fullName = typeof profile?.fullName === "string" ? profile.fullName.trim() : "";
  const email = normalizeEmail(profile?.email);
  if (!fullName || fullName.length > 80 || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { success: false, message: "Họ tên hoặc email không hợp lệ." };
  }
  const users = readUsers();
  if (users.some(user => user.email === email)) {
    return { success: false, message: "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác." };
  }
  const user = {
    id: makeUserId(),
    fullName,
    email,
    phone: "",
    address: "",
    createdAt: new Date().toISOString()
  };
  if (!setStorageItem(STORAGE_KEYS.DEMO_USERS, [...users, user])) {
    return { success: false, message: "Không thể lưu thông tin tài khoản vào bộ nhớ trình duyệt." };
  }
  return { success: true, user: { ...user } };
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  try {
    if (window.sessionStorage.getItem(STORAGE_KEYS.DEMO_SESSION) !== null) {
      return findSessionUser(window.sessionStorage, STORAGE_KEYS.DEMO_SESSION);
    }
  } catch (error) {
    console.error("[Auth] Không thể truy cập phiên đăng nhập tạm thời.", error);
    return null;
  }
  try {
    return findSessionUser(window.localStorage, STORAGE_KEYS.DEMO_REMEMBERED_SESSION);
  } catch (error) {
    console.error("[Auth] Không thể truy cập phiên đăng nhập được ghi nhớ.", error);
    return null;
  }
}

export function startDemoSession(userId, remember = false) {
  if (typeof userId !== "string" || !readUsers().some(user => user.id === userId)) {
    return false;
  }

  if (!logout(false)) return false;
  let storage;
  let key;
  try {
    storage = remember ? window.localStorage : window.sessionStorage;
    key = remember ? STORAGE_KEYS.DEMO_REMEMBERED_SESSION : STORAGE_KEYS.DEMO_SESSION;
    storage.setItem(key, JSON.stringify({ version: 1, userId }));
  } catch (error) {
    console.error("[Auth] Không thể lưu trạng thái phiên đăng nhập.", error);
    return false;
  }
  dispatchAuthUpdated();
  return true;
}

export function logout(notify = true) {
  let success = true;
  try {
    window.sessionStorage.removeItem(STORAGE_KEYS.DEMO_SESSION);
  } catch (error) {
    console.error("[Auth] Không thể xóa phiên đăng nhập tạm thời.", error);
    success = false;
  }
  try {
    window.localStorage.removeItem(STORAGE_KEYS.DEMO_REMEMBERED_SESSION);
  } catch (error) {
    console.error("[Auth] Không thể xóa phiên đăng nhập được ghi nhớ.", error);
    success = false;
  }
  if (notify) dispatchAuthUpdated();
  return success;
}

export function isLoggedIn() {
  return getCurrentUser() !== null;
}

export function updateCurrentUser(changes) {
  const currentUser = getCurrentUser();
  if (!currentUser || !changes || typeof changes !== "object") {
    return { success: false, message: "Vui lòng đăng nhập để tiếp tục." };
  }
  const users = readUsers();
  const index = users.findIndex(user => user.id === currentUser.id);
  if (index < 0) {
    return { success: false, message: "Tài khoản không tồn tại trên hệ thống." };
  }

  const fullName = typeof changes.fullName === "string" ? changes.fullName.trim() : "";
  const email = normalizeEmail(changes.email);
  const phone = typeof changes.phone === "string" ? changes.phone.trim() : "";
  const address = typeof changes.address === "string" ? changes.address.trim() : "";
  if (!fullName || fullName.length > 80) {
    return { success: false, field: "fullName", message: "Họ tên phải có từ 1 đến 80 ký tự." };
  }
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { success: false, field: "email", message: "Email chưa đúng định dạng." };
  }
  if (users.some(user => user.id !== currentUser.id && user.email === email)) {
    return { success: false, field: "email", message: "Email này đã được tài khoản khác sử dụng." };
  }
  const phoneDigits = phone.replace(/\D/g, "");
  if (phone && (!/^[+\d()\s.-]{8,20}$/.test(phone) || phoneDigits.length < 8 || phoneDigits.length > 15)) {
    return { success: false, field: "phone", message: "Số điện thoại chưa đúng định dạng." };
  }
  if (address.length > 240) {
    return { success: false, field: "address", message: "Địa chỉ không được dài quá 240 ký tự." };
  }

  const updatedUser = { ...currentUser, fullName, email, phone, address };
  users[index] = updatedUser;
  if (!setStorageItem(STORAGE_KEYS.DEMO_USERS, users)) {
    return { success: false, message: "Không thể lưu thông tin thay đổi vào bộ nhớ trình duyệt." };
  }
  dispatchAuthUpdated();
  return { success: true, user: { ...updatedUser } };
}
