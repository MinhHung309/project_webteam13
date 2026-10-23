import { INITIAL_ORDERS } from "../data/orders.js";
import { initNavigation } from "../modules/nav.js";
import { getStorageItem, setStorageItem, STORAGE_KEYS, formatCurrency } from "../utils/storage.js";

const DELIVERY_STEPS = [
  { id: "placed", title: "Đặt hàng thành công", icon: "✓" },
  { id: "confirmed", title: "Đã xác nhận", icon: "✓" },
  { id: "preparing", title: "Đang chuẩn bị hàng", icon: "▣" },
  { id: "shipping", title: "Đang vận chuyển", icon: "➤" },
  { id: "delivered", title: "Giao hàng thành công", icon: "✓" }
];

const STATUS_LABELS = {
  placed: "Đặt hàng thành công",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị hàng",
  shipping: "Đang vận chuyển",
  delivered: "Đã giao hàng",
  cancelled: "Đã hủy"
};

const STATUS_ALIASES = {
  pending: "placed",
  processing: "preparing",
  completed: "delivered"
};

let countdownInterval = null;
let orders = [];

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  orders = loadOrders();
  renderOrderHistory();
  setupSearch();
  setupHistoryFilters();

  const requestedOrder = new URLSearchParams(window.location.search).get("order");
  if (requestedOrder) {
    const input = document.getElementById("orderIdInput");
    if (input) input.value = requestedOrder;
    lookupOrder(requestedOrder);
  }
});

function loadOrders() {
  const stored = getStorageItem(STORAGE_KEYS.ORDERS, null);
  if (stored === null || stored === undefined) {
    setStorageItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    return normalizeOrders(INITIAL_ORDERS);
  }

  if (!Array.isArray(stored)) {
    console.error(`[OrderTracking] Dữ liệu '${STORAGE_KEYS.ORDERS}' phải là một mảng. Dùng dữ liệu demo trong phiên này; không ghi đè dữ liệu hiện có.`);
    return normalizeOrders(INITIAL_ORDERS);
  }

  const codes = new Set(stored.map(getOrderCode).filter(Boolean).map(code => code.toLowerCase()));
  const missingDemoOrders = INITIAL_ORDERS.filter(order => !codes.has(getOrderCode(order).toLowerCase()));
  const merged = stored.concat(missingDemoOrders);
  if (missingDemoOrders.length > 0 && !setStorageItem(STORAGE_KEYS.ORDERS, merged)) {
    console.error("[OrderTracking] Không thể lưu các đơn demo bổ sung; tiếp tục dùng chúng trong phiên hiện tại.");
  }
  return normalizeOrders(merged);
}

function normalizeOrders(rawOrders) {
  const seenIds = new Set();
  return rawOrders.reduce((validOrders, rawOrder) => {
    const order = normalizeOrder(rawOrder);
    if (order && !seenIds.has(order.id.toLowerCase())) {
      seenIds.add(order.id.toLowerCase());
      validOrders.push(order);
    } else if (order) {
      console.warn(`[OrderTracking] Bỏ qua mã đơn bị trùng '${order.id}'.`);
    } else {
      console.warn("[OrderTracking] Bỏ qua bản ghi đơn hàng thiếu hoặc sai định dạng.", rawOrder);
    }
    return validOrders;
  }, []);
}

function normalizeOrder(rawOrder) {
  if (!rawOrder || typeof rawOrder !== "object" || Array.isArray(rawOrder)) return null;

  const id = getOrderCode(rawOrder);
  const status = normalizeStatus(rawOrder.status);
  if (!id || !status) return null;

  const rawItems = Array.isArray(rawOrder.items) ? rawOrder.items : [];
  const items = rawItems
    .filter(item => item && typeof item === "object" && !Array.isArray(item))
    .map(item => {
      const quantity = toPositiveNumber(item.quantity, 1);
      const price = toNonNegativeNumber(item.price, 0);
      return {
        name: typeof item.name === "string" && item.name.trim() ? item.name.trim() : "Sản phẩm",
        quantity,
        price,
        subtotal: toNonNegativeNumber(item.subtotal, price * quantity)
      };
    });
  const subtotal = toNonNegativeNumber(rawOrder.subtotal ?? rawOrder.pricing?.subtotal, sumItemSubtotals(items));
  const discount = toNonNegativeNumber(
    rawOrder.discount ?? rawOrder.pricing?.discount,
    toNonNegativeNumber(rawOrder.voucherApplied?.discountAmount, 0)
  );
  const shippingFee = toNonNegativeNumber(rawOrder.shippingFee ?? rawOrder.pricing?.shippingFee, 0);
  const total = toNonNegativeNumber(
    rawOrder.total ?? rawOrder.pricing?.totalAmount,
    Math.max(0, subtotal - discount + shippingFee)
  );
  const rawHistory = Array.isArray(rawOrder.statusHistory)
    ? rawOrder.statusHistory
    : Array.isArray(rawOrder.timeline)
      ? rawOrder.timeline
      : [];
  const statusHistory = rawHistory
    .filter(event => event && typeof event === "object" && !Array.isArray(event))
    .map(event => ({
      status: normalizeStatus(event.status),
      timestamp: typeof (event.timestamp || event.createdAt) === "string" ? (event.timestamp || event.createdAt) : ""
    }))
    .filter(event => event.status);

  if (statusHistory.length === 0 && typeof rawOrder.createdAt === "string") {
    statusHistory.push({ status: "placed", timestamp: rawOrder.createdAt });
  }

  return {
    id,
    createdAt: typeof rawOrder.createdAt === "string" ? rawOrder.createdAt : "",
    items,
    subtotal,
    discount,
    shippingFee,
    total,
    shippingAddress: typeof rawOrder.shippingAddress === "string"
      ? rawOrder.shippingAddress
      : typeof rawOrder.customer?.campusAddress === "string"
        ? rawOrder.customer.campusAddress
        : "Chưa có địa chỉ nhận hàng",
    shippingMethod: typeof rawOrder.shippingMethod === "string"
      ? rawOrder.shippingMethod
      : rawOrder.paymentMethod === "cod_campus"
        ? "Giao hàng nội bộ LHU"
        : "Giao hàng tiêu chuẩn",
    status,
    estimatedDelivery: typeof rawOrder.estimatedDelivery === "string" ? rawOrder.estimatedDelivery : "",
    statusHistory
  };
}

function getOrderCode(order) {
  if (!order || typeof order !== "object") return "";
  if (typeof order.orderCode === "string" && order.orderCode.trim()) return order.orderCode.trim();
  return typeof order.id === "string" ? order.id.trim() : "";
}

function normalizeStatus(status) {
  if (typeof status !== "string") return "";
  const normalized = STATUS_ALIASES[status] || status;
  return Object.prototype.hasOwnProperty.call(STATUS_LABELS, normalized) ? normalized : "";
}

function toNonNegativeNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function toPositiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function sumItemSubtotals(items) {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}

function setupSearch() {
  const form = document.getElementById("orderSearchForm");
  const input = document.getElementById("orderIdInput");
  if (!form || !input) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    lookupOrder(input.value);
  });
}

function lookupOrder(value) {
  clearCountdown();
  const input = document.getElementById("orderIdInput");
  const result = document.getElementById("orderResult");
  const emptyState = document.getElementById("orderEmptyState");
  const orderId = typeof value === "string" ? value.trim() : "";

  if (input) input.value = orderId;
  if (!orderId) {
    showLookupMessage("Vui lòng nhập mã đơn hàng để tra cứu.", "error");
    hideOrderResult(result, emptyState);
    return;
  }

  showLookupMessage("Đang tra cứu đơn hàng…", "loading");
  const order = orders.find(item => item.id.toLocaleLowerCase("vi") === orderId.toLocaleLowerCase("vi"));
  if (!order) {
    showLookupMessage("Không tìm thấy đơn hàng với mã này. Vui lòng kiểm tra lại mã đơn.", "error");
    hideOrderResult(result, emptyState);
    return;
  }

  if (!result || !emptyState) return;
  result.innerHTML = renderOrder(order);
  result.hidden = false;
  emptyState.hidden = true;
  showLookupMessage(`Đã tìm thấy đơn hàng ${order.id}.`, "success");
  startCountdown(order);
}

function showLookupMessage(message, type) {
  const feedback = document.getElementById("orderFeedback");
  if (!feedback) return;
  feedback.textContent = message;
  feedback.className = `order-feedback is-${type}`;
}

function hideOrderResult(result, emptyState) {
  if (result) {
    result.hidden = true;
    result.replaceChildren();
  }
  if (emptyState) emptyState.hidden = false;
}

function renderOrder(order) {
  const currentStepIndex = DELIVERY_STEPS.findIndex(step => step.id === order.status);
  const isCancelled = order.status === "cancelled";
  const statusLabel = STATUS_LABELS[order.status] || "Chưa xác định";
  const history = order.statusHistory;
  const placedAt = history.find(event => event.status === "placed")?.timestamp || order.createdAt;
  const itemMarkup = order.items.length
    ? order.items.map(item => `
      <li class="order-product-row">
        <span class="order-product-icon" aria-hidden="true">▧</span>
        <span class="order-product-name">${escapeHtml(item.name)} <small>× ${item.quantity}</small></span>
        <strong>${formatCurrency(item.subtotal)}</strong>
      </li>
    `).join("")
    : '<li class="order-no-items">Chưa có thông tin sản phẩm trong đơn này.</li>';

  return `
    <article class="order-detail-card" id="tracking-result">
      <header class="order-detail-header">
        <div>
          <span class="order-eyebrow">CHI TIẾT ĐƠN HÀNG</span>
          <h2>${escapeHtml(order.id)}</h2>
          <p>Ngày đặt: ${formatDate(placedAt)}</p>
        </div>
        <span class="order-status-badge status-${order.status}">
          <span aria-hidden="true">${isCancelled ? "×" : order.status === "delivered" ? "✓" : "●"}</span>
          ${statusLabel}
        </span>
      </header>

      ${isCancelled ? renderCancelledTimeline(history) : renderDeliveryTimeline(order, currentStepIndex)}

      <div class="order-detail-grid">
        <section class="order-info-panel" aria-labelledby="order-items-title">
          <h3 id="order-items-title">Sản phẩm trong đơn</h3>
          <ul class="order-product-list">${itemMarkup}</ul>
          <dl class="order-price-summary">
            <div><dt>Tạm tính</dt><dd>${formatCurrency(order.subtotal)}</dd></div>
            <div><dt>Giảm giá</dt><dd>− ${formatCurrency(order.discount)}</dd></div>
            <div><dt>Phí vận chuyển</dt><dd>${formatCurrency(order.shippingFee)}</dd></div>
            <div class="order-total"><dt>Tổng tiền</dt><dd>${formatCurrency(order.total)}</dd></div>
          </dl>
        </section>

        <section class="order-info-panel order-shipping-panel" aria-labelledby="shipping-info-title">
          <h3 id="shipping-info-title">Thông tin giao hàng</h3>
          <dl class="order-shipping-details">
            <div><dt>Địa chỉ nhận hàng</dt><dd>${escapeHtml(order.shippingAddress)}</dd></div>
            <div><dt>Phương thức vận chuyển</dt><dd>${escapeHtml(order.shippingMethod)}</dd></div>
          </dl>
          <div class="order-delivery-estimate" id="deliveryEstimate">
            <span class="order-delivery-icon" aria-hidden="true">◷</span>
            <div>
              <strong>Thời gian giao hàng dự kiến</strong>
              <p>${formatDate(order.estimatedDelivery)}</p>
              <p class="order-countdown" id="orderCountdown" aria-live="off"></p>
            </div>
          </div>
        </section>
      </div>
      <p class="order-demo-disclaimer">Thông tin người nhận, địa chỉ và đơn hàng trên trang là dữ liệu giả lập phục vụ đồ án.</p>
    </article>
  `;
}

function renderDeliveryTimeline(order, currentStepIndex) {
  const eventByStatus = new Map(order.statusHistory.map(event => [event.status, event.timestamp]));
  const steps = DELIVERY_STEPS.map((step, index) => {
    const isComplete = index < currentStepIndex;
    const isCurrent = index === currentStepIndex;
    const stateClass = isComplete ? "is-complete" : isCurrent ? "is-current" : "is-upcoming";
    const timestamp = eventByStatus.get(step.id);
    return `
      <li class="order-timeline-step ${stateClass}">
        <span class="order-timeline-marker" aria-hidden="true">${step.icon}</span>
        <div class="order-timeline-copy">
          <h4>${step.title}</h4>
          <p>${isComplete || isCurrent ? formatDate(timestamp) : "Đang chờ cập nhật"}</p>
          ${isCurrent ? '<span class="order-current-label">Trạng thái hiện tại</span>' : ""}
        </div>
      </li>
    `;
  }).join("");
  return `
    <section class="order-timeline-panel" aria-labelledby="order-timeline-title">
      <div class="order-timeline-heading">
        <div>
          <h3 id="order-timeline-title">Hành trình đơn hàng</h3>
          <p>Cập nhật tiến độ xử lý và vận chuyển</p>
        </div>
      </div>
      <ol class="order-timeline">${steps}</ol>
    </section>
  `;
}

function renderCancelledTimeline(history) {
  const cancellationEvent = history.find(event => event.status === "cancelled");
  const cancellationIndex = history.findIndex(event => event.status === "cancelled");
  const completedEvents = (cancellationIndex < 0 ? history : history.slice(0, cancellationIndex))
    .filter(event => event.status !== "cancelled");
  const eventMarkup = completedEvents.map(event => `
    <li class="order-cancel-event">
      <span class="order-cancel-check" aria-hidden="true">✓</span>
      <span>${STATUS_LABELS[event.status] || "Đã cập nhật"}<small>${formatDate(event.timestamp)}</small></span>
    </li>
  `).join("");
  return `
    <section class="order-timeline-panel order-cancelled-panel" aria-labelledby="order-timeline-title">
      <div class="order-timeline-heading">
        <div>
          <h3 id="order-timeline-title">Đơn hàng đã hủy</h3>
          <p>Tiến trình giao hàng đã dừng và sẽ không tiếp tục.</p>
        </div>
      </div>
      <ol class="order-cancel-history">
        ${eventMarkup}
        <li class="order-cancel-event is-cancelled">
          <span class="order-cancel-check" aria-hidden="true">×</span>
          <span>Đơn hàng đã hủy<small>${cancellationEvent ? formatDate(cancellationEvent.timestamp) : "Thời gian chưa được cập nhật"}</small></span>
        </li>
      </ol>
    </section>
  `;
}

function startCountdown(order) {
  const estimate = document.getElementById("deliveryEstimate");
  const output = document.getElementById("orderCountdown");
  if (!estimate || !output) return;

  if (order.status === "delivered") {
    output.textContent = "Đã giao hàng thành công";
    return;
  }
  if (order.status === "cancelled") {
    output.hidden = true;
    return;
  }

  const deadline = Date.parse(order.estimatedDelivery);
  if (!Number.isFinite(deadline)) {
    output.textContent = "Chưa có thời gian giao hàng dự kiến.";
    return;
  }

  const updateCountdown = () => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      output.textContent = "Đã quá thời gian giao hàng dự kiến";
      clearCountdown();
      return;
    }

    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    output.textContent = `Còn ${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;
  };

  updateCountdown();
  if (deadline > Date.now()) countdownInterval = window.setInterval(updateCountdown, 1000);
}

function clearCountdown() {
  if (countdownInterval !== null) {
    window.clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

function setupHistoryFilters() {
  const search = document.getElementById("historySearchInput");
  const filter = document.getElementById("historyStatusFilter");
  search?.addEventListener("input", renderOrderHistory);
  filter?.addEventListener("change", renderOrderHistory);
  document.getElementById("orderHistoryList")?.addEventListener("click", event => {
    const button = event.target.closest("[data-track-order]");
    if (!button) return;
    const order = orders.find(item => item.id === button.dataset.trackOrder);
    if (!order) return;
    const input = document.getElementById("orderIdInput");
    if (input) input.value = order.id;
    lookupOrder(order.id);
    document.getElementById("tracking-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function renderOrderHistory() {
  const container = document.getElementById("orderHistoryList");
  if (!container) return;
  const search = (document.getElementById("historySearchInput")?.value || "").trim().toLocaleLowerCase("vi");
  const selectedStatus = document.getElementById("historyStatusFilter")?.value || "all";
  const filteredOrders = orders
    .filter(order => order.id.toLocaleLowerCase("vi").includes(search))
    .filter(order => matchesStatusFilter(order.status, selectedStatus))
    .slice()
    .sort((a, b) => Date.parse(b.createdAt || "") - Date.parse(a.createdAt || ""));

  if (filteredOrders.length === 0) {
    container.innerHTML = '<div class="order-history-empty">Không có đơn hàng nào phù hợp với bộ lọc.</div>';
    return;
  }

  container.innerHTML = filteredOrders.map(order => `
    <article class="order-history-card">
      <div class="order-history-main">
        <div class="order-history-id">
          <span class="order-history-icon" aria-hidden="true">▤</span>
          <div>
            <strong>${escapeHtml(order.id)}</strong>
            <span>Đặt ngày ${formatDate(order.createdAt, false)}</span>
          </div>
        </div>
        <span class="order-status-badge status-${order.status}">${STATUS_LABELS[order.status]}</span>
        <span class="order-history-quantity">${order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm</span>
        <strong class="order-history-total">${formatCurrency(order.total)}</strong>
        <div class="order-history-actions">
          <button type="button" class="btn btn-outline btn-sm" data-track-order="${escapeHtml(order.id)}">Xem chi tiết</button>
          <a class="btn btn-primary btn-sm" href="./order-tracking.html?order=${encodeURIComponent(order.id)}#tracking-result">Theo dõi đơn hàng</a>
        </div>
      </div>
    </article>
  `).join("");
}

function matchesStatusFilter(status, filter) {
  if (filter === "all") return true;
  if (filter === "processing") return ["placed", "confirmed", "preparing"].includes(status);
  if (filter === "shipping") return status === "shipping";
  if (filter === "delivered") return status === "delivered";
  if (filter === "cancelled") return status === "cancelled";
  return true;
}

function formatDate(value, includeTime = true) {
  if (typeof value !== "string" || !value) return "Chưa cập nhật";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN", includeTime
    ? { dateStyle: "medium", timeStyle: "short" }
    : { dateStyle: "medium" }
  ).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.addEventListener("pagehide", clearCountdown);
