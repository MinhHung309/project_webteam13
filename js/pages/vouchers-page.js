/**
 * Module điều khiển giao diện trang Kho Voucher & Ưu Đãi (Voucher Hub Page)
 * Kết nối logic từ js/modules/vouchers.js với giao diện vouchers.html
 */

import { initNavigation } from "../modules/nav.js";
import { formatCurrency } from "../utils/storage.js";
import { 
  initVouchersStorage, 
  getAllVouchers, 
  getSavedVoucherCodes, 
  saveVoucherToWallet, 
  removeVoucherFromWallet,
  calculateVoucherDiscount,
  isVoucherValidDate,
  formatExpiryDate 
} from "../modules/vouchers.js";

// Trạng thái cục bộ của trang
let activeTab = "all";       // 'all': Kho voucher chung | 'wallet': Ví của tôi
let activeStatusFilter = "all"; // 'all' | 'valid' | 'saved' | 'expired'
let searchQuery = "";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Khởi tạo điều hướng chung
  initNavigation();

  // 2. Khởi tạo dữ liệu voucher trong LocalStorage
  initVouchersStorage();

  // 3. Render số liệu thống kê & danh sách voucher
  updateVoucherStats();
  renderVouchers();

  // 4. Đăng ký các sự kiện tương tác
  setupTabEvents();
  setupFilterEvents();
  setupSearchEvents();
  setupSimulatorEvents();
});

/**
 * Cập nhật các con số thống kê trên banner và badge tab
 */
function updateVoucherStats() {
  const allVouchers = getAllVouchers();
  const savedCodes = getSavedVoucherCodes();

  const validVouchers = allVouchers.filter(v => isVoucherValidDate(v));
  const savedVouchers = allVouchers.filter(v => savedCodes.includes(v.code.toUpperCase()));

  const statValidEl = document.getElementById("statValidCount");
  const statSavedEl = document.getElementById("statSavedCount");
  const badgeAllEl = document.getElementById("badgeAllCount");
  const badgeWalletEl = document.getElementById("badgeWalletCount");

  if (statValidEl) statValidEl.textContent = validVouchers.length;
  if (statSavedEl) statSavedEl.textContent = savedVouchers.length;
  if (badgeAllEl) badgeAllEl.textContent = allVouchers.length;
  if (badgeWalletEl) badgeWalletEl.textContent = savedVouchers.length;
}

/**
 * Render danh sách voucher ra giao diện dựa theo tab, bộ lọc và từ khóa tìm kiếm
 */
function renderVouchers() {
  const gridContainer = document.getElementById("vouchersGrid");
  if (!gridContainer) return;

  const allVouchers = getAllVouchers();
  const savedCodes = getSavedVoucherCodes();

  // 1. Lọc theo tab hiện hành
  let filtered = allVouchers;
  if (activeTab === "wallet") {
    filtered = filtered.filter(v => savedCodes.includes(v.code.toUpperCase()));
  }

  // 2. Lọc theo bộ lọc trạng thái (status filter)
  if (activeStatusFilter === "valid") {
    filtered = filtered.filter(v => isVoucherValidDate(v));
  } else if (activeStatusFilter === "saved") {
    filtered = filtered.filter(v => savedCodes.includes(v.code.toUpperCase()));
  } else if (activeStatusFilter === "expired") {
    filtered = filtered.filter(v => !isVoucherValidDate(v));
  }

  // 3. Lọc theo từ khóa tìm kiếm (searchQuery)
  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(v => 
      (v.code && v.code.toLowerCase().includes(q)) ||
      (v.title && v.title.toLowerCase().includes(q)) ||
      (v.description && v.description.toLowerCase().includes(q))
    );
  }

  // 4. Nếu danh sách rỗng, hiển thị empty state thân thiện
  if (filtered.length === 0) {
    gridContainer.innerHTML = `
      <div class="voucher-empty-state">
        <div class="voucher-empty-icon">${activeTab === 'wallet' ? '💼' : '🎟️'}</div>
        <h3 style="color: var(--dark); margin-bottom: 4px; font-size: var(--font-size-lg);">
          ${activeTab === 'wallet' ? 'Ví Voucher của bạn đang trống' : 'Không tìm thấy mã giảm giá phù hợp'}
        </h3>
        <p style="color: var(--gray-600); font-size: var(--font-size-sm); max-width: 450px; margin: 0 auto 1rem;">
          ${activeTab === 'wallet' 
            ? 'Hãy chuyển sang tab "Kho Voucher Chung" và bấm "Lưu vào ví" các mã bạn yêu thích nhé!' 
            : 'Hãy thử tìm kiếm với từ khóa khác hoặc chuyển sang chế độ lọc tất cả.'}
        </p>
        ${activeTab === 'wallet' ? `
          <button type="button" class="btn btn-primary btn-sm" id="btnGoToAllTab">
            Xem Kho Voucher Chung
          </button>
        ` : ''}
      </div>
    `;

    const btnGo = document.getElementById("btnGoToAllTab");
    if (btnGo) {
      btnGo.addEventListener("click", () => {
        switchTab("all");
      });
    }
    return;
  }

  // 5. Render danh sách thẻ voucher (Torn-edge Ticket Card)
  const html = filtered.map(voucher => {
    const isSaved = savedCodes.includes(voucher.code.toUpperCase());
    const isValid = isVoucherValidDate(voucher);

    // Xác định class loại voucher
    let typeClass = "";
    let stubIcon = "🏷️";
    let stubValue = "";
    let stubLabel = "";

    if (voucher.discountType === "percent") {
      typeClass = "type-percent";
      stubIcon = "⚡";
      stubValue = `-${voucher.discountValue}%`;
      stubLabel = "Giảm phần trăm";
    } else if (voucher.discountType === "fixed") {
      typeClass = "type-fixed";
      stubIcon = "🎁";
      stubValue = `-${formatCurrency(voucher.discountValue)}`;
      stubLabel = "Giảm tiền mặt";
    } else if (voucher.discountType === "shipping") {
      typeClass = "type-shipping";
      stubIcon = "🚚";
      stubValue = "FREESHIP";
      stubLabel = "Phí vận chuyển";
    }

    if (!isValid) {
      typeClass += " is-expired";
    }

    // Badge trạng thái
    let statusBadgeHtml = "";
    if (!isValid) {
      statusBadgeHtml = `<span class="voucher-badge-status badge-status-expired">Đã hết hạn</span>`;
    } else if (isSaved) {
      statusBadgeHtml = `<span class="voucher-badge-status badge-status-saved">Đã lưu trong ví</span>`;
    } else {
      statusBadgeHtml = `<span class="voucher-badge-status badge-status-valid">Còn hạn</span>`;
    }

    // Điều kiện áp dụng
    let conditionText = voucher.minOrderAmount > 0 
      ? `Đơn tối thiểu ${formatCurrency(voucher.minOrderAmount)}` 
      : "Áp dụng cho mọi giá trị đơn";

    if (voucher.maxDiscountAmount && voucher.maxDiscountAmount > 0 && voucher.discountType === "percent") {
      conditionText += ` • Tối đa ${formatCurrency(voucher.maxDiscountAmount)}`;
    }

    // Nút lưu / xóa ví
    let walletButtonHtml = "";
    if (activeTab === "wallet") {
      walletButtonHtml = `
        <button 
          type="button" 
          class="btn-voucher-action btn-remove-wallet" 
          data-action="remove-wallet" 
          data-code="${voucher.code}"
          title="Xóa khỏi ví cá nhân"
        >
          <span>✕ Bỏ lưu</span>
        </button>
      `;
    } else {
      if (isSaved) {
        walletButtonHtml = `
          <button 
            type="button" 
            class="btn-voucher-action btn-save-wallet is-saved" 
            disabled 
            title="Voucher này đã có trong ví của bạn"
          >
            <span>✓ Đã lưu</span>
          </button>
        `;
      } else {
        walletButtonHtml = `
          <button 
            type="button" 
            class="btn-voucher-action btn-save-wallet" 
            data-action="save-wallet" 
            data-code="${voucher.code}"
            ${!isValid ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}
            title="Lưu voucher vào ví cá nhân"
          >
            <span>💾 Lưu voucher</span>
          </button>
        `;
      }
    }

    return `
      <article class="voucher-ticket-card ${typeClass}" id="voucher-card-${voucher.code}">
        <!-- Cột trái: Cuống vé -->
        <div class="voucher-left-stub" aria-hidden="true">
          <div class="stub-icon">${stubIcon}</div>
          <div class="stub-value">${stubValue}</div>
          <div class="stub-type-label">${stubLabel}</div>
        </div>

        <!-- Đường cắt răng cưa vé -->
        <div class="voucher-divider-line" aria-hidden="true"></div>

        <!-- Cột phải: Thân vé -->
        <div class="voucher-right-body">
          <div>
            <div class="voucher-card-top">
              <h3 class="voucher-title">${escapeHtml(voucher.title)}</h3>
              ${statusBadgeHtml}
            </div>

            <p class="voucher-desc">${escapeHtml(voucher.description)}</p>

            <div class="voucher-condition-box">
              <div class="voucher-condition-item">
                <span>📋</span>
                <span>${conditionText}</span>
              </div>
              <div class="voucher-condition-item">
                <span>⏰</span>
                <span>HSD: <strong>${formatExpiryDate(voucher.validUntil)}</strong></span>
              </div>
            </div>
          </div>

          <!-- Chân thẻ: Mã và Nút hành động -->
          <div class="voucher-action-footer">
            <span 
              class="voucher-code-chip" 
              data-action="copy-code" 
              data-code="${voucher.code}" 
              title="Bấm để sao chép mã"
              role="button"
              tabindex="0"
            >
              <span>${voucher.code}</span>
              <span style="font-size: 0.75rem;">📋</span>
            </span>

            <div class="voucher-buttons-group">
              <button 
                type="button" 
                class="btn-voucher-action btn-copy-code" 
                data-action="copy-code" 
                data-code="${voucher.code}"
                aria-label="Sao chép mã ${voucher.code}"
              >
                <span>Sao chép</span>
              </button>
              ${walletButtonHtml}
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");

  gridContainer.innerHTML = html;

  // Gắn sự kiện cho các nút trong thẻ voucher
  attachVoucherCardActions(gridContainer);
}

/**
 * Gắn sự kiện Sao chép mã & Lưu ví cho các phần tử DOM động
 * @param {HTMLElement} container 
 */
function attachVoucherCardActions(container) {
  // 1. Sao chép mã vào clipboard
  container.querySelectorAll('[data-action="copy-code"]').forEach(el => {
    el.addEventListener("click", () => {
      const code = el.getAttribute("data-code");
      if (code) copyToClipboard(code);
    });

    // Hỗ trợ bàn phím Enter/Space khi focus vào chip
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const code = el.getAttribute("data-code");
        if (code) copyToClipboard(code);
      }
    });
  });

  // 2. Lưu vào ví cá nhân
  container.querySelectorAll('[data-action="save-wallet"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const code = btn.getAttribute("data-code");
      if (!code) return;

      const result = saveVoucherToWallet(code);
      if (result.success) {
        showVoucherToast(result.message, "success");
        updateVoucherStats();
        renderVouchers();
      } else {
        showVoucherToast(result.message, "error");
      }
    });
  });

  // 3. Xóa khỏi ví cá nhân (trong tab My Wallet)
  container.querySelectorAll('[data-action="remove-wallet"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const code = btn.getAttribute("data-code");
      if (!code) return;

      const result = removeVoucherFromWallet(code);
      showVoucherToast(result.message, "info");
      updateVoucherStats();
      renderVouchers();
    });
  });
}

/**
 * Sao chép mã vào clipboard kèm fallback an toàn
 * @param {string} text 
 */
function copyToClipboard(text) {
  if (!text) return;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showVoucherToast(`Đã sao chép mã "${text}" vào bộ nhớ tạm!`, "success");
      // Tự động điền vào bộ mô phỏng để người dùng trải nghiệm ngay
      autofillSimulator(text);
    }).catch(() => {
      fallbackCopyText(text);
    });
  } else {
    fallbackCopyText(text);
  }
}

function fallbackCopyText(text) {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (successful) {
      showVoucherToast(`Đã sao chép mã "${text}"!`, "success");
      autofillSimulator(text);
    } else {
      showVoucherToast(`Không thể sao chép tự động. Hãy ghi nhớ mã: ${text}`, "info");
    }
  } catch (err) {
    showVoucherToast(`Mã của bạn: ${text}`, "info");
  }
}

/**
 * Tự động điền mã vừa copy vào khung mô phỏng để test nhanh
 */
function autofillSimulator(code) {
  const simInput = document.getElementById("simVoucherCode");
  if (simInput) {
    simInput.value = code;
    // Tự động kích hoạt tính toán thử
    calculateSimulator();
  }
}

/**
 * Chuyển tab giữa Kho Voucher Chung và Ví Voucher Của Tôi
 */
function switchTab(tabName) {
  activeTab = tabName;
  const tabAll = document.getElementById("tabAllVouchers");
  const tabWallet = document.getElementById("tabMyWallet");

  if (tabName === "all") {
    if (tabAll) {
      tabAll.classList.add("active");
      tabAll.setAttribute("aria-selected", "true");
    }
    if (tabWallet) {
      tabWallet.classList.remove("active");
      tabWallet.setAttribute("aria-selected", "false");
    }
  } else {
    if (tabWallet) {
      tabWallet.classList.add("active");
      tabWallet.setAttribute("aria-selected", "true");
    }
    if (tabAll) {
      tabAll.classList.remove("active");
      tabAll.setAttribute("aria-selected", "false");
    }
  }

  renderVouchers();
}

function setupTabEvents() {
  const tabAll = document.getElementById("tabAllVouchers");
  const tabWallet = document.getElementById("tabMyWallet");

  if (tabAll) {
    tabAll.addEventListener("click", () => switchTab("all"));
  }
  if (tabWallet) {
    tabWallet.addEventListener("click", () => switchTab("wallet"));
  }
}

function setupFilterEvents() {
  const pills = document.querySelectorAll("#voucherFilterPills .filter-pill");
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeStatusFilter = pill.getAttribute("data-filter") || "all";
      renderVouchers();
    });
  });
}

function setupSearchEvents() {
  const searchInput = document.getElementById("voucherSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderVouchers();
    });
  }
}

/**
 * BƯỚC 5: XỬ LÝ KHU VỰC MÔ PHỎNG GIỎ HÀNG (Cart Voucher Simulator)
 * Đảm bảo tính toán chính xác tuyệt đối các test case
 */
function setupSimulatorEvents() {
  const subtotalInput = document.getElementById("simSubtotal");
  const shippingInput = document.getElementById("simShipping");
  const codeInput = document.getElementById("simVoucherCode");
  const btnApply = document.getElementById("btnApplySimVoucher");

  const btn1M = document.getElementById("btnPreset1M");
  const btn500k = document.getElementById("btnPreset500k");
  const btn200k = document.getElementById("btnPreset200k");

  if (btn1M && subtotalInput) {
    btn1M.addEventListener("click", () => {
      subtotalInput.value = 1000000;
      calculateSimulator();
    });
  }

  if (btn500k && subtotalInput) {
    btn500k.addEventListener("click", () => {
      subtotalInput.value = 500000;
      calculateSimulator();
    });
  }

  if (btn200k && subtotalInput) {
    btn200k.addEventListener("click", () => {
      subtotalInput.value = 200000;
      calculateSimulator();
    });
  }

  if (subtotalInput) subtotalInput.addEventListener("input", calculateSimulator);
  if (shippingInput) shippingInput.addEventListener("input", calculateSimulator);
  if (btnApply) btnApply.addEventListener("click", calculateSimulator);

  if (codeInput) {
    codeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        calculateSimulator();
      }
    });
  }

  // Tính toán lần đầu khi mở trang (với preset 1.000.000đ và mã LHU2026)
  calculateSimulator();
}

function calculateSimulator() {
  const subtotalEl = document.getElementById("simSubtotal");
  const shippingEl = document.getElementById("simShipping");
  const codeEl = document.getElementById("simVoucherCode");
  const alertEl = document.getElementById("simMessageAlert");

  const resSubtotal = document.getElementById("resSubtotal");
  const resShipping = document.getElementById("resShipping");
  const resDiscount = document.getElementById("resDiscountAmount");
  const resShipDiscount = document.getElementById("resShippingDiscount");
  const resFinalShipping = document.getElementById("resFinalShipping");
  const resFinalTotal = document.getElementById("resFinalTotal");

  const subtotal = subtotalEl ? parseFloat(subtotalEl.value) || 0 : 0;
  const shipping = shippingEl ? parseFloat(shippingEl.value) || 0 : 0;
  const code = codeEl ? codeEl.value.trim() : "";

  // Gọi trực tiếp hàm tính toán độc lập chuẩn
  const result = calculateVoucherDiscount(code, subtotal, shipping);

  // Hiển thị kết quả ra bảng
  if (resSubtotal) resSubtotal.textContent = formatCurrency(result.subtotal);
  if (resShipping) resShipping.textContent = formatCurrency(result.shippingFee);
  if (resDiscount) resDiscount.textContent = `- ${formatCurrency(result.discountAmount)}`;
  if (resShipDiscount) resShipDiscount.textContent = `- ${formatCurrency(result.shippingDiscount)}`;
  if (resFinalShipping) resFinalShipping.textContent = formatCurrency(result.finalShippingFee);
  if (resFinalTotal) resFinalTotal.textContent = formatCurrency(result.finalTotal);

  // Hiển thị thông báo trạng thái
  if (alertEl) {
    alertEl.style.display = "block";
    if (result.valid) {
      alertEl.style.background = "#dcfce7";
      alertEl.style.color = "#166534";
      alertEl.style.border = "1px solid #86efac";
      alertEl.textContent = `✓ ${result.message}`;
    } else {
      alertEl.style.background = "#fee2e2";
      alertEl.style.color = "#991b1b";
      alertEl.style.border = "1px solid #fca5a5";
      alertEl.textContent = `✕ ${result.message}`;
    }
  }
}

/**
 * Hiển thị Toast thông báo nổi góc màn hình
 * @param {string} message 
 * @param {'success'|'error'|'info'} type 
 */
function showVoucherToast(message, type = "success") {
  const container = document.getElementById("voucherToastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `voucher-toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
