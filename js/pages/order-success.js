import { initNavigation } from "../modules/nav.js";
import { formatCurrency, getStorageItem, STORAGE_KEYS } from "../utils/storage.js";

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  const code = new URLSearchParams(window.location.search).get("order") || "";
  const orders = getStorageItem(STORAGE_KEYS.ORDERS, []);
  const order = Array.isArray(orders)
    ? orders.find(item => item && (item.orderCode === code || item.id === code))
    : null;
  if (!order) {
    document.getElementById("successHeading").textContent = "Không tìm thấy đơn hàng";
    document.getElementById("successMessage").textContent = "Vui lòng tra cứu trong trang Theo dõi đơn hàng.";
    return;
  }

  document.getElementById("successDetails").append(
    detailRow("Mã đơn hàng", code),
    detailRow("Tổng thanh toán", formatCurrency(Number(order.total ?? order.pricing?.totalAmount) || 0))
  );
  document.getElementById("trackOrderLink").href = `./order-tracking.html?order=${encodeURIComponent(code)}#tracking-result`;
  if (new URLSearchParams(window.location.search).get("cartCleanup") === "failed") {
    document.getElementById("successMessage").textContent = "Đơn hàng đã được lưu. Không thể xóa giỏ hàng trong trình duyệt; vui lòng không xác nhận lại đơn cũ.";
  }
});

function detailRow(label, value) {
  const row = document.createElement("div");
  const term = document.createElement("dt");
  term.textContent = label;
  const description = document.createElement("dd");
  description.textContent = value;
  row.append(term, description);
  return row;
}
