import { initNavigation } from "../modules/nav.js";
import { INITIAL_ORDERS } from "../data/orders.js";
import { CART_UPDATED_EVENT, clearCart, getCart } from "../utils/cart.js";
import { calculateCartPricing } from "../utils/cart-pricing.js";
import {
  formatCurrency,
  getStorageItem,
  removeStorageItem,
  setStorageItem,
  STORAGE_KEYS
} from "../utils/storage.js";
import { VOUCHER_STORAGE_KEYS } from "../modules/vouchers.js";

let submitting = false;

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  document.getElementById("checkoutForm")?.addEventListener("submit", submitOrder);
  document.getElementById("checkoutForm")?.addEventListener("input", clearFieldError);
  window.addEventListener(CART_UPDATED_EVENT, renderCheckoutSummary);
  window.addEventListener("storage", event => {
    if ([STORAGE_KEYS.CART, VOUCHER_STORAGE_KEYS.APPLIED_VOUCHER].includes(event.key)) renderCheckoutSummary();
  });
  renderCheckoutSummary();
});

function renderCheckoutSummary() {
  const cart = getCart();
  const code = getStorageItem(VOUCHER_STORAGE_KEYS.APPLIED_VOUCHER, "");
  const pricing = calculateCartPricing(cart, typeof code === "string" ? code : "");
  let voucherError = "";
  if (code && pricing.voucherResult && !pricing.voucherResult.valid) {
    voucherError = `Voucher đã được gỡ: ${pricing.voucherResult.message}`;
    removeStorageItem(VOUCHER_STORAGE_KEYS.APPLIED_VOUCHER);
  }
  const itemsContainer = document.getElementById("checkoutItems");
  const totalsContainer = document.getElementById("checkoutTotals");
  const button = document.getElementById("placeOrderButton");
  itemsContainer.replaceChildren();

  pricing.items.forEach(({ item, product }) => {
    const row = document.createElement("div");
    row.className = "checkout-item";
    const name = document.createElement("span");
    name.textContent = `${product.name} × ${item.quantity}`;
    const amount = document.createElement("strong");
    amount.textContent = formatCurrency(product.price * item.quantity);
    row.append(name, amount);
    itemsContainer.append(row);
  });

  const isVoucherValid = pricing.voucher !== null;
  const voucher = document.getElementById("checkoutVoucher");
  voucher.textContent = isVoucherValid ? `Voucher đang áp dụng: ${pricing.voucher.code}` : "";
  totalsContainer.replaceChildren(
    totalRow("Tạm tính", pricing.subtotal),
    totalRow("Giảm giá sản phẩm", -pricing.discount, pricing.discount > 0 ? "is-discount" : ""),
    totalRow("Phí vận chuyển", pricing.shippingFee),
    ...(pricing.shippingDiscount > 0 ? [totalRow("Giảm phí vận chuyển", -pricing.shippingDiscount, "is-discount")] : []),
    totalRow("Thuế", pricing.taxAmount),
    totalRow("Tổng thanh toán", pricing.grandTotal, "cart-grand-total")
  );

  const unavailable = pricing.unavailableItems.length > 0;
  const invalidPrice = pricing.invalidPriceItems.length > 0;
  const blocked = pricing.items.length === 0 || unavailable || invalidPrice;
  button.disabled = blocked || submitting;
  if (unavailable) showCheckoutFeedback("Có sản phẩm đã hết hàng. Vui lòng quay lại giỏ hàng để cập nhật.");
  else if (invalidPrice) showCheckoutFeedback("Có sản phẩm chưa có giá hợp lệ. Vui lòng kiểm tra danh mục sản phẩm.");
  else if (pricing.items.length === 0) showCheckoutFeedback("Giỏ hàng đang trống. Hãy thêm sản phẩm trước khi đặt hàng.");
  else if (voucherError) showCheckoutFeedback(voucherError);
  else clearCheckoutFeedback();
}

function submitOrder(event) {
  event.preventDefault();
  if (submitting) return;
  clearAllFieldErrors();

  const form = event.currentTarget;
  const customer = {
    fullName: form.elements.fullName.value.trim(),
    phone: form.elements.phone.value.trim(),
    email: form.elements.email.value.trim(),
    address: form.elements.address.value.trim(),
    city: form.elements.city.value.trim(),
    note: form.elements.orderNote.value.trim(),
    paymentMethod: form.elements.paymentMethod.value
  };
  const errors = validateCustomer(customer);
  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(([field, message]) => setFieldError(field, message));
    document.getElementById(Object.keys(errors)[0])?.focus();
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    showCheckoutFeedback("Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi đặt hàng.");
    return;
  }
  const voucherCode = getStorageItem(VOUCHER_STORAGE_KEYS.APPLIED_VOUCHER, "");
  const pricing = calculateCartPricing(cart, typeof voucherCode === "string" ? voucherCode : "");
  if (pricing.items.length !== cart.length) {
    showCheckoutFeedback("Giỏ hàng có sản phẩm không còn trong danh mục. Vui lòng kiểm tra lại.");
    return;
  }
  if (pricing.unavailableItems.length > 0) {
    showCheckoutFeedback("Có sản phẩm đã hết hàng. Vui lòng quay lại giỏ hàng để cập nhật.");
    return;
  }
  if (pricing.invalidPriceItems.length > 0) {
    showCheckoutFeedback("Có sản phẩm chưa có giá hợp lệ. Đơn hàng chưa được tạo.");
    return;
  }
  if (voucherCode && !pricing.voucher) {
    removeStorageItem(VOUCHER_STORAGE_KEYS.APPLIED_VOUCHER);
    showCheckoutFeedback("Voucher không còn đủ điều kiện. Đơn hàng chưa được tạo; vui lòng kiểm tra lại giỏ hàng.");
    renderCheckoutSummary();
    return;
  }

  const orderCode = generateOrderCode();
  if (!orderCode) {
    showCheckoutFeedback("Không thể tạo mã đơn hàng duy nhất. Vui lòng thử lại.");
    return;
  }
  const now = new Date().toISOString();
  const order = {
    id: orderCode,
    orderCode,
    customerName: customer.fullName,
    customer: {
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email,
      campusAddress: `${customer.address}, ${customer.city}`
    },
    items: pricing.items.map(({ item, product }) => ({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      quantity: item.quantity,
      subtotal: product.price * item.quantity
    })),
    voucherApplied: pricing.voucher ? {
      code: pricing.voucher.code,
      discountAmount: pricing.discount,
      shippingDiscount: pricing.shippingDiscount
    } : null,
    voucherCode: pricing.voucher?.code || null,
    subtotal: pricing.subtotal,
    discount: pricing.discount,
    shippingFee: pricing.shippingFee,
    shippingDiscount: pricing.shippingDiscount,
    taxAmount: pricing.taxAmount,
    total: pricing.grandTotal,
    shippingAddress: `${customer.address}, ${customer.city}`,
    shippingMethod: "Giao hàng tiêu chuẩn",
    paymentMethod: customer.paymentMethod,
    orderNote: customer.note,
    status: "placed",
    createdAt: now,
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    statusHistory: [{ status: "placed", timestamp: now }]
  };

  let hasStoredOrders;
  try {
    hasStoredOrders = localStorage.getItem(STORAGE_KEYS.ORDERS) !== null;
  } catch (error) {
    console.error("[Checkout] Không thể đọc kho đơn hàng.", error);
    showCheckoutFeedback("Không thể đọc dữ liệu đơn hàng từ bộ nhớ trình duyệt.");
    return;
  }
  const existingOrders = getStorageItem(STORAGE_KEYS.ORDERS, null);
  if (hasStoredOrders && !Array.isArray(existingOrders)) {
    showCheckoutFeedback("Dữ liệu đơn hàng hiện tại không hợp lệ; không thể lưu đơn mới để tránh ghi đè lịch sử.");
    return;
  }
  const orders = hasStoredOrders ? existingOrders.slice() : INITIAL_ORDERS.slice();
  if (orders.some(saved => getOrderCode(saved).toLowerCase() === orderCode.toLowerCase())) {
    showCheckoutFeedback("Mã đơn vừa tạo đã tồn tại. Vui lòng nhấn đặt hàng lại.");
    return;
  }

  submitting = true;
  const button = document.getElementById("placeOrderButton");
  button.disabled = true;
  button.textContent = "Đang lưu đơn hàng…";
  if (!setStorageItem(STORAGE_KEYS.ORDERS, [...orders, order])) {
    submitting = false;
    button.textContent = "Xác nhận đặt hàng";
    renderCheckoutSummary();
    showCheckoutFeedback("Không thể lưu đơn hàng vào bộ nhớ trình duyệt. Giỏ hàng vẫn được giữ nguyên.");
    return;
  }

  const cartCleared = clearCart();
  removeStorageItem(VOUCHER_STORAGE_KEYS.APPLIED_VOUCHER);
  const successUrl = new URL("./order-success.html", window.location.href);
  successUrl.searchParams.set("order", orderCode);
  if (!cartCleared) successUrl.searchParams.set("cartCleanup", "failed");
  window.location.assign(successUrl.href);
}

function validateCustomer(customer) {
  const errors = {};
  if (!customer.fullName) errors.fullName = "Vui lòng nhập họ tên người nhận.";
  const normalizedPhone = customer.phone.replace(/[\s().-]/g, "");
  if (!normalizedPhone) errors.phone = "Vui lòng nhập số điện thoại.";
  else if (!/^(?:0[35789]\d{8}|\+84[35789]\d{8})$/.test(normalizedPhone)) {
    errors.phone = "Số điện thoại chưa đúng định dạng Việt Nam.";
  }
  if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    errors.email = "Email chưa đúng định dạng.";
  }
  if (!customer.address) errors.address = "Vui lòng nhập địa chỉ nhận hàng.";
  if (!customer.city) errors.city = "Vui lòng nhập tỉnh/thành phố.";
  if (!["cod_campus", "bank_transfer"].includes(customer.paymentMethod)) {
    errors.paymentMethod = "Vui lòng chọn phương thức thanh toán demo.";
  }
  return errors;
}

function generateOrderCode() {
  const orders = getStorageItem(STORAGE_KEYS.ORDERS, []);
  const existingCodes = new Set((Array.isArray(orders) ? orders : []).map(getOrderCode).map(code => code.toLowerCase()));
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
    const code = `LHU-${new Date().getFullYear()}-${random}`;
    if (!existingCodes.has(code.toLowerCase())) return code;
  }
  return "";
}

function getOrderCode(order) {
  if (!order || typeof order !== "object") return "";
  return typeof order.orderCode === "string" ? order.orderCode : typeof order.id === "string" ? order.id : "";
}

function totalRow(label, amount, className = "") {
  const row = document.createElement("div");
  if (className) row.className = className;
  const term = document.createElement("dt");
  term.textContent = label;
  const value = document.createElement("dd");
  value.textContent = `${amount < 0 ? "− " : ""}${formatCurrency(Math.abs(amount))}`;
  row.append(term, value);
  return row;
}

function clearFieldError(event) {
  const input = event.target;
  if (!input.name) return;
  const error = document.getElementById(`${input.name}Error`);
  if (error) error.textContent = "";
  input.removeAttribute("aria-invalid");
}

function clearAllFieldErrors() {
  document.querySelectorAll(".field-error").forEach(error => { error.textContent = ""; });
  document.querySelectorAll("#checkoutForm [aria-invalid='true']").forEach(input => input.removeAttribute("aria-invalid"));
}

function setFieldError(field, message) {
  const input = document.getElementById(field);
  const error = document.getElementById(`${field}Error`);
  if (input) input.setAttribute("aria-invalid", "true");
  if (error) error.textContent = message;
}

function showCheckoutFeedback(message) {
  const output = document.getElementById("checkoutFeedback");
  output.textContent = message;
  output.hidden = false;
}

function clearCheckoutFeedback() {
  const output = document.getElementById("checkoutFeedback");
  output.textContent = "";
  output.hidden = true;
}
