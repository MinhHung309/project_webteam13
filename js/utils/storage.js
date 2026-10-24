/**
 * Tiện ích định dạng tiền tệ và thao tác LocalStorage an toàn
 */

const STORAGE_KEYS = {
  CART: "lhu_cart_items",
  PRODUCTS: "lhu_products",
  CATEGORIES: "lhu_categories",
  REVIEWS: "lhu_reviews",
  VOUCHERS: "lhu_vouchers",
  ORDERS: "lhu_orders",
  AUCTIONS: "lhu_auctions",
  USER_PREFS: "lhu_user_prefs",
  DEMO_USERS: "lhu_demo_users",
  DEMO_SESSION: "lhu_demo_session",
  DEMO_REMEMBERED_SESSION: "lhu_demo_remembered_session",
  DEMO_VOUCHERS_BY_USER: "lhu_demo_vouchers_by_user"
};

/**
 * Định dạng số thành chuỗi tiền tệ VND (ví dụ: 250.000 ₫)
 * @param {number} amount 
 * @returns {string}
 */
export function formatCurrency(amount) {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "0 ₫";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(amount);
}

/**
 * Đọc dữ liệu từ localStorage kèm validate JSON an toàn và fallback
 * @param {string} key 
 * @param {any} defaultValue 
 * @returns {any}
 */
export function getStorageItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[Storage] Dữ liệu tại khóa '${key}' không hợp lệ hoặc bị lỗi cú pháp. Đặt lại giá trị mặc định:`, error);
    return defaultValue;
  }
}

/**
 * Lưu dữ liệu vào localStorage có bắt lỗi hạn mức (QuotaExceededError)
 * @param {string} key 
 * @param {any} value 
 * @returns {boolean} true nếu lưu thành công, false nếu thất bại
 */
export function setStorageItem(key, value) {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    if (error.name === "QuotaExceededError" || error.code === 22) {
      console.error(`[Storage] Vượt quá dung lượng localStorage khi lưu '${key}'. Cần dọn dẹp bộ nhớ tạm!`);
    } else {
      console.error(`[Storage] Lỗi khi ghi vào localStorage [${key}]:`, error);
    }
    return false;
  }
}

/**
 * Xóa một mục cụ thể trong localStorage
 * @param {string} key 
 */
export function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[Storage] Không thể xóa khóa '${key}':`, error);
  }
}

/**
 * Khởi tạo dữ liệu mặc định vào localStorage nếu chưa tồn tại
 * Đảm bảo ứng dụng luôn có dữ liệu tĩnh sẵn sàng hoạt động ở lần đầu mở web
 * @param {string} key 
 * @param {any} initialData 
 * @returns {any} Dữ liệu hiện hành trong storage
 */
export function initializeStorageItem(key, initialData) {
  const existing = getStorageItem(key, null);
  if (existing === null || existing === undefined) {
    setStorageItem(key, initialData);
    return initialData;
  }
  return existing;
}

export { STORAGE_KEYS };
