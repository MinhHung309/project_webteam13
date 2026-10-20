/**
 * Module quản lý Header, Mobile Navigation và trạng thái giỏ hàng ban đầu
 */

import { getStorageItem, STORAGE_KEYS } from "../utils/storage.js";

export function initNavigation() {
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const cartCountEl = document.getElementById("cartCount");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      mainNav.classList.toggle("is-open");
      const isExpanded = mainNav.classList.contains("is-open");
      menuToggle.setAttribute("aria-expanded", isExpanded.toString());
    });
  }

  // Cập nhật số lượng giỏ hàng hiển thị từ localStorage (mặc định 0)
  if (cartCountEl) {
    const cart = getStorageItem(STORAGE_KEYS.CART, []);
    const totalQty = Array.isArray(cart) 
      ? cart.reduce((acc, item) => acc + (item.quantity || 1), 0)
      : 0;
    cartCountEl.textContent = totalQty;
  }
}
