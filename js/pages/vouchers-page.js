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
  isVoucherValidDate,
  formatExpiryDate 
} from "../modules/vouchers.js";

// Trạng thái cục bộ của trang
let activeTab = "all";          // 'all': Kho voucher chung | 'wallet': Ví của tôi
let activeStatusFilter = "all"; // 'all' | 'valid' | 'saved' | 'expired'
let searchQuery = "";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Khởi tạo điều hướng chung
  initNavigation();

  // 2. Khởi tạo dữ liệu voucher trong LocalStorage
  initVouchersStorage();

  // 3. Đọc query params từ URL (?tab=wallet hoặc ?filter=saved)
  parseVoucherQueryParams();

  // 4. Render số liệu thống kê & danh sách voucher
  updateVoucherStats();
  renderVouchers();

  // 5. Đăng ký các sự kiện tương tác
  setupTabEvents();
  setupFilterEvents();
  setupSearchEvents();
  setupBannerStatsEvents();
  window.addEventListener("lhu:auth-updated", () => {
    updateVoucherStats();
    renderVouchers();
  });
});

/**
 * Đọc tham số từ URL nếu người dùng truy cập trực tiếp bằng liên kết ví voucher
 */
function parseVoucherQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get("tab");
  const filterParam = params.get("filter");

  if (tabParam === "wallet") {
    activeTab = "wallet";
  } else if (tabParam === "all") {
    activeTab = "all";
  }

  if (filterParam && ["all", "valid", "saved", "expired"].includes(filterParam)) {
    activeStatusFilter = filterParam;
  }
}

/**
 * Cập nhật các con số thống kê trên banner và badge tab
 */
function updateVoucherStats() {
  const allVouchers = getAllVouchers();
  const savedCodes = getSavedVoucherCodes();

  const validVouchers = allVouchers.filter(v => isVoucherValidDate(v));
  const savedVouchers = allVouchers.filter(v => savedCodes.includes(v.code.toUpperCase()));

  const totalValidEl = document.getElementById("statValidCount");
  const totalSavedEl = document.getElementById("statSavedCount");
  const tabWalletCountEl = document.getElementById("badgeWalletCount");
  const tabAllCountEl = document.getElementById("badgeAllCount");

  if (totalValidEl) totalValidEl.textContent = validVouchers.length;
  if (totalSavedEl) totalSavedEl.textContent = savedVouchers.length;
  if (tabWalletCountEl) tabWalletCountEl.textContent = savedVouchers.length;
  if (tabAllCountEl) tabAllCountEl.textContent = allVouchers.length;

  // Cập nhật trạng thái active trực quan của 2 Tab
  const tabAll = document.getElementById("tabAllVouchers");
  const tabWallet = document.getElementById("tabMyWallet");
  if (tabAll) {
    tabAll.classList.toggle("active", activeTab === "all");
    tabAll.setAttribute("aria-selected", activeTab === "all" ? "true" : "false");
  }
  if (tabWallet) {
    tabWallet.classList.toggle("active", activeTab === "wallet");
    tabWallet.setAttribute("aria-selected", activeTab === "wallet" ? "true" : "false");
  }

  // Ẩn/hiện bộ lọc trạng thái (Pills) tùy theo tab
  const filterPillsContainer = document.getElementById("voucherFilterPills");
  if (filterPillsContainer) {
    filterPillsContainer.style.display = activeTab === "wallet" ? "none" : "flex";
  }
}

/**
 * Lọc danh sách voucher theo tab, filter pill và search keyword
 * @returns {Array<object>}
 */
function getFilteredVouchers() {
  const allVouchers = getAllVouchers();
  const savedCodes = getSavedVoucherCodes();

  return allVouchers.filter(voucher => {
    const isSaved = savedCodes.includes(voucher.code.toUpperCase());
    const isValid = isVoucherValidDate(voucher);

    // 1. Lọc theo Tab chính
    if (activeTab === "wallet" && !isSaved) {
      return false;
    }

    // 2. Lọc theo Pills trạng thái (chỉ áp dụng khi ở Tab "all")
    if (activeTab === "all") {
      if (activeStatusFilter === "valid" && !isValid) return false;
      if (activeStatusFilter === "saved" && !isSaved) return false;
      if (activeStatusFilter === "expired" && isValid) return false;
    }

    // 3. Lọc theo từ khóa tìm kiếm (mã voucher hoặc tiêu đề/mô tả)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.trim().toLowerCase();
      const codeMatch = voucher.code.toLowerCase().includes(q);
      const titleMatch = voucher.title.toLowerCase().includes(q);
      const descMatch = voucher.description.toLowerCase().includes(q);
      if (!codeMatch && !titleMatch && !descMatch) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Render danh sách voucher ra grid HTML dạng thẻ Ticket
 */
function renderVouchers() {
  const gridContainer = document.getElementById("vouchersGrid");
  if (!gridContainer) return;

  const vouchers = getFilteredVouchers();
  const savedCodes = getSavedVoucherCodes();

  if (vouchers.length === 0) {
    gridContainer.innerHTML = `
      <div class="vouchers-empty-state">
        <span class="empty-icon">🎟️</span>
        <h3>Không tìm thấy voucher phù hợp</h3>
        <p>${
          activeTab === "wallet" 
            ? "Ví của bạn chưa có mã nào. Hãy khám phá và bấm 'Lưu voucher' từ Kho Voucher Chung nhé!" 
            : "Không có mã ưu đãi nào khớp với bộ lọc hoặc từ khóa tìm kiếm của bạn."
        }</p>
        ${
          activeTab === "wallet" 
            ? `<button type="button" class="btn btn-primary btn-sm" id="btnEmptyGoExplore">Khám Phá Voucher Ngay</button>`
            : `<button type="button" class="btn btn-outline btn-sm" id="btnEmptyResetFilter">Xóa Bộ Lọc</button>`
        }
      </div>
    `;

    const btnGoExplore = document.getElementById("btnEmptyGoExplore");
    if (btnGoExplore) {
      btnGoExplore.addEventListener("click", () => switchTab("all"));
    }

    const btnReset = document.getElementById("btnEmptyResetFilter");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        activeStatusFilter = "all";
        searchQuery = "";
        const searchInput = document.getElementById("voucherSearchInput");
        if (searchInput) searchInput.value = "";
        document.querySelectorAll(".filter-pill").forEach(p => p.classList.toggle("active", p.dataset.filter === "all"));
        renderVouchers();
      });
    }

    return;
  }

  const html = vouchers.map(voucher => {
    const isSaved = savedCodes.includes(voucher.code.toUpperCase());
    const isValid = isVoucherValidDate(voucher);

    // Cấu hình loại voucher và icon
    let typeClass = "";
    let stubIcon = "";
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

    // Nút lưu / xóa ví / hết hạn
    let walletButtonHtml = "";
    if (!isValid) {
      walletButtonHtml = `
        <button 
          type="button" 
          class="btn-voucher-action btn-disabled" 
          disabled 
          title="Voucher này đã hết thời gian hiệu lực"
        >
          <span>Đã hết hạn</span>
        </button>
      `;
    } else if (activeTab === "wallet") {
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
          <div class="voucher-main-info">
            <div class="voucher-card-top">
              <h3 class="voucher-title">${escapeHtml(voucher.title)}</h3>
              ${statusBadgeHtml}
            </div>

            <p class="voucher-desc">${escapeHtml(voucher.description)}</p>

            <div class="voucher-condition-box">
              <div class="voucher-condition-item">
                <span class="cond-icon">📋</span>
                <span class="cond-text">${conditionText}</span>
              </div>
              <div class="voucher-condition-item">
                <span class="cond-icon">⏰</span>
                <span class="cond-text">HSD: <strong>${formatExpiryDate(voucher.validUntil)}</strong></span>
              </div>
            </div>
          </div>

          <!-- Chân thẻ: Mã và Nút hành động -->
          <div class="voucher-action-footer">
            <span 
              class="voucher-code-chip ${!isValid ? 'is-disabled' : ''}" 
              data-action="copy-code" 
              data-code="${voucher.code}" 
              title="${isValid ? 'Bấm để sao chép mã' : 'Mã voucher đã hết hạn'}"
              role="button"
              tabindex="0"
            >
              <span>${voucher.code}</span>
              <span class="chip-copy-icon">📋</span>
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
      if (code) {
        copyToClipboard(code);
      }
    });
  });

  // 2. Lưu voucher vào ví
  container.querySelectorAll('[data-action="save-wallet"]').forEach(el => {
    el.addEventListener("click", () => {
      const code = el.getAttribute("data-code");
      if (code) {
        const success = saveVoucherToWallet(code);
        if (success) {
          showVoucherToast(`Đã lưu mã "${code}" vào ví của bạn!`, "success");
          updateVoucherStats();
          renderVouchers();
        } else {
          showVoucherToast(`Mã "${code}" đã có trong ví hoặc không hợp lệ.`, "info");
        }
      }
    });
  });

  // 3. Xóa voucher khỏi ví
  container.querySelectorAll('[data-action="remove-wallet"]').forEach(el => {
    el.addEventListener("click", () => {
      const code = el.getAttribute("data-code");
      if (code) {
        removeVoucherFromWallet(code);
        showVoucherToast(`Đã bỏ lưu mã "${code}" khỏi ví!`, "info");
        updateVoucherStats();
        renderVouchers();
      }
    });
  });
}

/**
 * Sao chép mã voucher vào Clipboard
 * @param {string} text 
 */
function copyToClipboard(text) {
  if (!text) return;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showVoucherToast(`Đã sao chép mã "${text}" vào bộ nhớ tạm!`, "success");
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
    } else {
      showVoucherToast(`Không thể sao chép tự động. Hãy ghi nhớ mã: ${text}`, "info");
    }
  } catch (err) {
    showVoucherToast(`Mã của bạn: ${text}`, "info");
  }
}

/**
 * Chuyển tab giữa Kho Voucher Chung và Ví Voucher Của Tôi
 */
function switchTab(tabName) {
  activeTab = tabName;

  // Cập nhật trạng thái class và aria-selected của 2 tab button
  const tabAll = document.getElementById("tabAllVouchers");
  const tabWallet = document.getElementById("tabMyWallet");

  if (tabAll) {
    tabAll.classList.toggle("active", tabName === "all");
    tabAll.setAttribute("aria-selected", tabName === "all" ? "true" : "false");
  }

  if (tabWallet) {
    tabWallet.classList.toggle("active", tabName === "wallet");
    tabWallet.setAttribute("aria-selected", tabName === "wallet" ? "true" : "false");
  }

  // Khi chuyển sang tab "Ví của tôi", ẩn bộ lọc pills; khi ở kho chung thì hiện lại
  const filterPillsContainer = document.getElementById("voucherFilterPills");
  if (filterPillsContainer) {
    filterPillsContainer.style.display = tabName === "wallet" ? "none" : "flex";
  }

  renderVouchers();
}

/**
 * Đăng ký sự kiện chuyển Tab (Kho Voucher Chung vs Ví Voucher Của Tôi)
 */
function setupTabEvents() {
  const tabAll = document.getElementById("tabAllVouchers");
  const tabWallet = document.getElementById("tabMyWallet");

  if (tabAll) {
    tabAll.addEventListener("click", () => {
      if (activeTab !== "all") {
        switchTab("all");
      }
    });
  }

  if (tabWallet) {
    tabWallet.addEventListener("click", () => {
      if (activeTab !== "wallet") {
        switchTab("wallet");
      }
    });
  }
}

/**
 * Đăng ký sự kiện click cho ô thống kê "Đã lưu trong Ví của bạn" trên banner
 */
function setupBannerStatsEvents() {
  const statSavedBox = document.getElementById("statSavedItem");
  if (statSavedBox) {
    statSavedBox.addEventListener("click", () => {
      switchTab("wallet");
      // Cuộn êm đến thanh công cụ voucher
      const toolbar = document.querySelector(".voucher-toolbar");
      if (toolbar) {
        toolbar.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
}

/**
 * Đăng ký sự kiện lọc trạng thái (Pills)
 */
function setupFilterEvents() {
  const pills = document.querySelectorAll(".filter-pill");
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      activeStatusFilter = pill.dataset.filter || "all";
      renderVouchers();
    });
  });
}

/**
 * Đăng ký sự kiện tìm kiếm voucher realtime
 */
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