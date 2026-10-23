import { initNavigation } from "../modules/nav.js";
import {
  CART_UPDATED_EVENT,
  findProductById,
  getCart,
  removeFromCart,
  updateCartQuantity
} from "../utils/cart.js";
import { formatCurrency, getStorageItem, removeStorageItem, setStorageItem } from "../utils/storage.js";
import { VOUCHER_STORAGE_KEYS } from "../modules/vouchers.js";
import { calculateCartPricing } from "../utils/cart-pricing.js";

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  document.getElementById("cartItems")?.addEventListener("click", handleCartAction);
  document.getElementById("cartItems")?.addEventListener("change", handleQuantityChange);
  document.getElementById("voucherForm")?.addEventListener("submit", applyVoucher);
  document.getElementById("removeVoucher")?.addEventListener("click", clearVoucher);
  window.addEventListener(CART_UPDATED_EVENT, renderCart);
  window.addEventListener("storage", event => {
    if ([VOUCHER_STORAGE_KEYS.APPLIED_VOUCHER, "lhu_cart_items"].includes(event.key)) renderCart();
  });
  renderCart();
});

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const totals = document.getElementById("cartTotals");
  const feedback = document.getElementById("voucherFeedback");
  if (!cartItems || !totals) return;

  const cart = getCart();
  let voucherCode = getStoredVoucherCode();
  let pricing = calculateCartPricing(cart, voucherCode);
  if (voucherCode && pricing.voucherResult && !pricing.voucherResult.valid) {
      const message = pricing.voucherResult.message;
      removeStorageItem(VOUCHER_STORAGE_KEYS.APPLIED_VOUCHER);
      voucherCode = "";
      if (feedback) {
        feedback.textContent = `Voucher đã được gỡ: ${message}`;
        feedback.className = "field-feedback is-error";
      }
      document.getElementById("voucherCode").value = "";
      pricing = calculateCartPricing(cart);
  }

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  document.getElementById("cartItemCount").textContent = `${itemCount} sản phẩm`;
  cartItems.replaceChildren();
  if (pricing.items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "cart-empty-state";
    const title = document.createElement("h3");
    title.textContent = "Giỏ hàng đang trống";
    const message = document.createElement("p");
    message.textContent = "Hãy khám phá sản phẩm và thêm món đồ bạn yêu thích.";
    const link = document.createElement("a");
    link.className = "btn btn-primary";
    link.href = "./products.html";
    link.textContent = "Tiếp tục mua sắm";
    empty.append(title, message, link);
    cartItems.append(empty);
  } else {
    pricing.items.forEach(({ item, product }) => cartItems.append(createCartRow(item, product)));
  }

  totals.replaceChildren(
    createTotalRow("Tạm tính", pricing.subtotal),
    createTotalRow("Giảm giá sản phẩm", -pricing.discount, pricing.discount > 0 ? "is-discount" : ""),
    createTotalRow("Phí vận chuyển", pricing.shippingFee),
    ...(pricing.shippingDiscount > 0 ? [createTotalRow("Giảm phí vận chuyển", -pricing.shippingDiscount, "is-discount")] : []),
    createTotalRow("Thuế", pricing.taxAmount),
    createTotalRow("Tổng thanh toán", pricing.grandTotal, "cart-grand-total")
  );

  const checkoutButton = document.getElementById("checkoutButton");
  const checkoutDisabled = pricing.items.length === 0 ||
    pricing.unavailableItems.length > 0 ||
    pricing.invalidPriceItems.length > 0;
  checkoutButton.classList.toggle("is-disabled", checkoutDisabled);
  checkoutButton.setAttribute("aria-disabled", String(checkoutDisabled));
  checkoutButton.href = checkoutDisabled ? "./products.html" : "./checkout.html";
  document.getElementById("removeVoucher").hidden = !voucherCode;
  if (voucherCode) document.getElementById("voucherCode").value = voucherCode;
}

function createCartRow(item, product) {
  const row = document.createElement("article");
  row.className = "cart-item";
  row.dataset.productId = item.productId;

  const image = document.createElement("img");
  image.className = "cart-item-image";
  image.src = product.imageUrl;
  image.alt = product.name;
  image.loading = "lazy";
  image.addEventListener("error", () => {
    image.src = "https://placehold.co/160x160/e2e8f0/334155?text=LHU";
  }, { once: true });

  const details = document.createElement("div");
  details.className = "cart-item-details";
  const title = document.createElement("h3");
  title.textContent = product.name;
  const price = document.createElement("p");
  price.className = "cart-item-price";
  price.textContent = formatCurrency(product.price);
  details.append(title, price);
  if (Number(product.originalPrice) > Number(product.price)) {
    const original = document.createElement("p");
    original.className = "cart-item-original";
    original.textContent = `Giá gốc ${formatCurrency(product.originalPrice)} · Giảm ${Math.round((1 - product.price / product.originalPrice) * 100)}%`;
    details.append(original);
  }

  const controls = document.createElement("div");
  controls.className = "cart-item-controls";
  controls.setAttribute("aria-label", `Số lượng ${product.name}`);
  controls.append(
    quantityButton("Giảm số lượng", "decrease", item.productId, "−"),
    quantityInput(item, product),
    quantityButton("Tăng số lượng", "increase", item.productId, "+")
  );
  const lineTotal = document.createElement("strong");
  lineTotal.className = "cart-item-total";
  lineTotal.textContent = formatCurrency(product.price * item.quantity);
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "text-button cart-remove-button";
  remove.dataset.action = "remove";
  remove.dataset.productId = item.productId;
  remove.textContent = "Xóa";
  remove.setAttribute("aria-label", `Xóa ${product.name} khỏi giỏ hàng`);

  row.append(image, details, controls, lineTotal, remove);
  return row;
}

function quantityButton(label, action, productId, text) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "cart-quantity-button";
  button.dataset.action = action;
  button.dataset.productId = productId;
  button.textContent = text;
  button.setAttribute("aria-label", label);
  return button;
}

function quantityInput(item, product) {
  const input = document.createElement("input");
  input.type = "number";
  input.className = "cart-quantity-input";
  input.min = "1";
  input.step = "1";
  input.value = String(item.quantity);
  input.dataset.productId = item.productId;
  input.setAttribute("aria-label", `Số lượng ${product.name}`);
  const stock = product.stock ?? product.stockQuantity ?? product.inventoryQuantity;
  if (Number.isFinite(Number(stock)) && stock !== "" && stock !== null) input.max = String(stock);
  return input;
}

function handleCartAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, productId } = button.dataset;
  const item = getCart().find(entry => entry.productId === productId);
  if (!item) return;

  if (action === "remove") {
    const result = removeFromCart(productId);
    showCartFeedback(result.message, result.success ? "success" : "error");
  } else {
    const quantity = item.quantity + (action === "increase" ? 1 : -1);
    const result = updateCartQuantity(productId, quantity);
    if (!result.success) showCartFeedback(result.message, "error");
  }
}

function handleQuantityChange(event) {
  const input = event.target.closest(".cart-quantity-input");
  if (!input) return;
  if (!input.value.trim()) {
    showCartFeedback("Số lượng phải là số nguyên lớn hơn 0.", "error");
    renderCart();
    return;
  }
  const quantity = Number(input.value);
  if (!Number.isInteger(quantity) || quantity < 1) {
    showCartFeedback("Số lượng phải là số nguyên lớn hơn 0.", "error");
    renderCart();
    return;
  }
  const result = updateCartQuantity(input.dataset.productId, quantity);
  if (!result.success) {
    showCartFeedback(result.message, "error");
    renderCart();
  }
}

function applyVoucher(event) {
  event.preventDefault();
  const input = document.getElementById("voucherCode");
  const code = input.value.trim().toUpperCase();
  if (!code) {
    setVoucherFeedback("Vui lòng nhập mã voucher.", "error");
    return;
  }
  const result = calculateCartPricing(getCart(), code).voucherResult;
  if (!result) {
    setVoucherFeedback("Giỏ hàng đang trống nên chưa thể áp dụng voucher.", "error");
    return;
  }
  if (!result.valid) {
    setVoucherFeedback(result.message, "error");
    return;
  }
  if (!setStorageItem(VOUCHER_STORAGE_KEYS.APPLIED_VOUCHER, result.voucher.code)) {
    setVoucherFeedback("Không thể lưu voucher. Vui lòng kiểm tra bộ nhớ trình duyệt.", "error");
    return;
  }
  setVoucherFeedback(result.message, "success");
  renderCart();
}

function clearVoucher() {
  removeStorageItem(VOUCHER_STORAGE_KEYS.APPLIED_VOUCHER);
  document.getElementById("voucherCode").value = "";
  setVoucherFeedback("Đã hủy voucher.", "success");
  renderCart();
}

function getStoredVoucherCode() {
  const value = getStorageItem(VOUCHER_STORAGE_KEYS.APPLIED_VOUCHER, "");
  return typeof value === "string" ? value : "";
}

function createTotalRow(label, amount, className = "") {
  const row = document.createElement("div");
  if (className) row.className = className;
  const term = document.createElement("dt");
  term.textContent = label;
  const value = document.createElement("dd");
  value.textContent = `${amount < 0 ? "− " : ""}${formatCurrency(Math.abs(amount))}`;
  row.append(term, value);
  return row;
}

function showCartFeedback(message, type) {
  const output = document.getElementById("cartFeedback");
  output.textContent = message;
  output.className = `commerce-feedback is-${type}`;
  output.hidden = false;
}

function setVoucherFeedback(message, type) {
  const output = document.getElementById("voucherFeedback");
  output.textContent = message;
  output.className = `field-feedback is-${type}`;
}
