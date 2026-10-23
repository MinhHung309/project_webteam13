/**
 * Module quản lý Header, Mobile Navigation và đồng bộ trạng thái giỏ hàng (Cart Badge)
 */

import { STORAGE_KEYS } from "../utils/storage.js";
import { getCartTotalQuantity, CART_UPDATED_EVENT } from "../utils/cart.js";

/**
 * Cập nhật số lượng hiển thị trên icon giỏ hàng (cart badge)
 */
export function updateCartBadge() {
  const cartCountEl = document.getElementById("cartCount");
  if (!cartCountEl) return;

  const totalQty = getCartTotalQuantity();
  cartCountEl.textContent = totalQty;
}

/**
 * Khởi tạo navigation, sự kiện menu mobile và đồng bộ badge giỏ hàng thời gian thực
 */
export function initNavigation() {
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      mainNav.classList.toggle("is-open");
      const isExpanded = mainNav.classList.contains("is-open");
      menuToggle.setAttribute("aria-expanded", isExpanded.toString());
    });
  }

  // 1. Cập nhật số lượng giỏ hàng ban đầu khi tải trang
  updateCartBadge();

  // 2. Lắng nghe CustomEvent khi giỏ hàng được thêm/sửa/xóa trong cùng tab
  window.addEventListener(CART_UPDATED_EVENT, () => {
    updateCartBadge();
  });

  // 3. Lắng nghe storage event khi giỏ hàng được thay đổi từ một tab trình duyệt khác
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEYS.CART) {
      updateCartBadge();
    }
  });
}
