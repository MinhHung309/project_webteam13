/**
 * Module xử lý tương tác trên Trang Chi Tiết Sản Phẩm & Đánh Giá
 * Kết nối giữa giao diện HTML và module logic js/modules/reviews.js
 */

import { initNavigation } from "../modules/nav.js";
import { INITIAL_PRODUCTS } from "../data/products.js";
import { addToCart } from "../utils/cart.js";
import { 
  STORAGE_KEYS, 
  getStorageItem, 
  formatCurrency 
} from "../utils/storage.js";
import { 
  initReviewsStorage, 
  getProductReviews, 
  calculateReviewStats, 
  addProductReview,
  toggleHelpfulReview 
} from "../modules/reviews.js";

// Trạng thái cục bộ của trang
let currentProductId = "lhu_prod_001";
let currentFilter = "all";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Khởi tạo menu navigation chung
  initNavigation();

  // 2. Khởi tạo storage dữ liệu đánh giá và sản phẩm
  initReviewsStorage();

  // 3. Phân tích id sản phẩm từ tham số query string URL (?id=...)
  const urlParams = new URLSearchParams(window.location.search);
  const idFromUrl = urlParams.get("id");
  if (idFromUrl) {
    currentProductId = idFromUrl;
  }

  // 4. Tìm kiếm thông tin sản phẩm và render giao diện chi tiết
  loadProductDetails(currentProductId);

  // 5. Render toàn bộ hệ thống đánh giá của sản phẩm này
  refreshReviewsUI(currentProductId);

  // 6. Gắn các sự kiện tương tác biểu mẫu và bộ lọc
  setupStarRatingEvents();
  setupReviewForm();
  setupFilterPills();
});

/**
 * Tìm và nạp chi tiết sản phẩm từ LocalStorage hoặc danh sách mẫu
 * @param {string} productId 
 */
function loadProductDetails(productId) {
  const products = getStorageItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const product = products.find(p => p.id === productId) || products[0];

  if (!product) {
    console.error("Không tìm thấy sản phẩm:", productId);
    return;
  }

  // Cập nhật breadcrumb và title trang
  currentProductId = product.id;
  document.title = `${product.name} | LHU E-Commerce`;
  const breadcrumbCurrent = document.getElementById("breadcrumbCurrent");
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = product.name;

  // Render thông tin sản phẩm vào section
  const section = document.getElementById("productDetailSection");
  if (!section) return;

  section.innerHTML = `
    <div class="product-detail-gallery">
      <img 
        src="${product.imageUrl}" 
        alt="${product.name}" 
        class="product-detail-img"
        onerror="this.src='https://placehold.co/600x450/e2e8f0/334155?text=LHU+Product';"
      />
    </div>
    <div class="product-detail-content">
      ${product.badge ? `<span class="product-detail-badge">${product.badge}</span>` : ""}
      <h1 class="product-detail-title" id="productTitle">${product.name}</h1>
      
      <div class="product-detail-meta">
        <span style="color: var(--primary); font-weight: 600;">Danh mục: ${product.category}</span>
        <span>•</span>
        <div style="color: #f59e0b; display: inline-flex; align-items: center; gap: 4px;">
          <span>★</span>
          <strong id="productMetaRating">${product.rating || "4.8"}</strong>
          <span style="color: var(--gray-600);" id="productMetaCount">(${product.reviewCount || 0} đánh giá)</span>
        </div>
      </div>

      <div class="product-detail-price">
        <span class="detail-price-current">${formatCurrency(product.price)}</span>
        ${product.originalPrice ? `<span class="detail-price-original">${formatCurrency(product.originalPrice)}</span>` : ""}
      </div>

      <p class="product-detail-desc">${product.description || "Sản phẩm chính hãng dành cho sinh viên Đại học Lạc Hồng."}</p>

            <div class="product-detail-actions-wrap">
        <div class="detail-qty-row">
          <span class="detail-qty-label">Số lượng:</span>
          <div class="product-qty-control detail-qty-control" role="group" aria-label="Điều chỉnh số lượng cho ${product.name}">
            <button 
              type="button" 
              class="btn-qty btn-qty-minus" 
              id="detailQtyMinus" 
              aria-label="Giảm số lượng"
              ${product.inStock === false ? "disabled" : ""}
            >−</button>
            <input 
              type="number" 
              class="product-qty-input detail-qty-input" 
              id="detailQtyInput" 
              value="1" 
              min="1" 
              max="99" 
              aria-label="Số lượng sản phẩm"
              ${product.inStock === false ? "disabled" : ""}
            />
            <button 
              type="button" 
              class="btn-qty btn-qty-plus" 
              id="detailQtyPlus" 
              aria-label="Tăng số lượng"
              ${product.inStock === false ? "disabled" : ""}
            >+</button>
          </div>
          <span class="detail-stock-status">
            ${product.inStock === false ? '<span style="color: var(--danger); font-weight: 600;">Hết hàng</span>' : '<span style="color: var(--success); font-weight: 600;">✓ Còn hàng</span>'}
          </span>
        </div>

        <div class="detail-buttons-group">
          <button 
            type="button" 
            class="btn btn-primary" 
            id="btnDetailAddToCart"
            ${product.inStock === false ? "disabled" : ""}
            aria-label="Thêm ${product.name} vào giỏ hàng"
          >
            <span>🛒 Thêm vào giỏ hàng</span>
          </button>
          <a href="#reviewForm" class="btn btn-outline" aria-label="Viết đánh giá cho ${product.name}">
            <span>✍️ Viết đánh giá</span>
          </a>
        </div>
      </div>
    </div>
  `;

  // Gắn sự kiện cho bộ điều khiển số lượng và nút Thêm vào giỏ hàng
  setupDetailQuantityEvents(product.id);
}

/**
 * Gắn các sự kiện điều khiển số lượng và thêm vào giỏ hàng cho trang chi tiết
 * @param {string} productId 
 */
function setupDetailQuantityEvents(productId) {
  const minusBtn = document.getElementById("detailQtyMinus");
  const plusBtn = document.getElementById("detailQtyPlus");
  const input = document.getElementById("detailQtyInput");
  const addBtn = document.getElementById("btnDetailAddToCart");

  if (minusBtn && input) {
    minusBtn.addEventListener("click", () => {
      const currentVal = parseInt(input.value, 10) || 1;
      if (currentVal > 1) {
        input.value = currentVal - 1;
      }
    });
  }

  if (plusBtn && input) {
    plusBtn.addEventListener("click", () => {
      const currentVal = parseInt(input.value, 10) || 1;
      if (currentVal < 99) {
        input.value = currentVal + 1;
      }
    });
  }

  if (input) {
    input.addEventListener("change", () => {
      let val = parseInt(input.value, 10);
      if (isNaN(val) || val < 1) {
        input.value = 1;
      } else if (val > 99) {
        input.value = 99;
      } else {
        input.value = val;
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
        e.preventDefault();
      }
    });
  }

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const quantity = input ? Math.max(1, parseInt(input.value, 10) || 1) : 1;
      handleDetailAddToCart(productId, quantity, addBtn, input);
    });
  }
}

/**
 * Xử lý thêm sản phẩm vào giỏ hàng từ trang chi tiết
 * @param {string} productId 
 * @param {number} quantity 
 * @param {HTMLButtonElement} buttonEl 
 * @param {HTMLInputElement|null} inputEl 
 */
function handleDetailAddToCart(productId, quantity = 1, buttonEl, inputEl = null) {
  const result = addToCart(productId, quantity);

  if (result.success) {
    const successMsg = quantity > 1 
      ? `✓ Đã thêm ${quantity} sản phẩm vào giỏ hàng thành công!` 
      : "✓ Đã thêm sản phẩm vào giỏ hàng thành công!";
    showDetailToast("success", successMsg);

    // Đặt lại ô số lượng về 1 sau khi thêm thành công
    if (inputEl) {
      inputEl.value = 1;
    }

    // Hiệu ứng phản hồi trên nút
    const originalText = buttonEl.innerHTML;
    buttonEl.innerHTML = "<span>✓ Đã thêm vào giỏ!</span>";
    buttonEl.classList.remove("btn-primary");
    buttonEl.classList.add("btn-secondary");
    buttonEl.disabled = true;

    setTimeout(() => {
      buttonEl.innerHTML = originalText;
      buttonEl.classList.remove("btn-secondary");
      buttonEl.classList.add("btn-primary");
      buttonEl.disabled = false;
    }, 1200);
  } else {
    showDetailToast("error", result.message || "Không thể thêm sản phẩm vào giỏ hàng.");
  }
}

/**
 * Hiển thị thông báo Toast góc màn hình cho trang chi tiết
 * @param {'success'|'error'|'info'} type 
 * @param {string} message 
 */
function showDetailToast(type, message) {
  let container = document.getElementById("detailToastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "detailToastContainer";
    container.className = "voucher-toast-container";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `voucher-toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2500);
}


/**
 * Cập nhật toàn bộ giao diện Thống kê, Thanh tỷ lệ sao và Danh sách nhận xét
 * @param {string} productId 
 */
function refreshReviewsUI(productId) {
  const stats = calculateReviewStats(productId);

  // 1. Cập nhật khối thống kê tổng quan
  const avgDisplay = document.getElementById("avgRatingDisplay");
  const totalDisplay = document.getElementById("totalReviewsDisplay");
  const starsVisual = document.getElementById("avgStarsVisual");
  const metaRating = document.getElementById("productMetaRating");
  const metaCount = document.getElementById("productMetaCount");

  if (avgDisplay) avgDisplay.textContent = stats.total > 0 ? stats.average.toFixed(1) : "0.0";
  if (totalDisplay) totalDisplay.textContent = `Dựa trên ${stats.total} đánh giá`;
  if (starsVisual) starsVisual.textContent = generateStarString(stats.average);
  if (metaRating) metaRating.textContent = stats.total > 0 ? stats.average.toFixed(1) : "Chưa có";
  if (metaCount) metaCount.textContent = `(${stats.total} đánh giá)`;

  // 2. Cập nhật biểu đồ thanh tỷ lệ (5★ đến 1★)
  for (let s = 1; s <= 5; s++) {
    const barEl = document.getElementById(`bar${s}`);
    const pctEl = document.getElementById(`pct${s}`);
    const pct = stats.percentages[s] || 0;
    if (barEl) barEl.style.width = `${pct}%`;
    if (pctEl) pctEl.textContent = `${pct}%`;
  }

  // 3. Render danh sách nhận xét
  renderReviewsList(productId);
}

/**
 * Render danh sách thẻ nhận xét dựa theo bộ lọc số sao hiện hành
 * @param {string} productId 
 */
function renderReviewsList(productId) {
  const container = document.getElementById("reviewsList");
  if (!container) return;

  let reviews = getProductReviews(productId);

  // Áp dụng bộ lọc
  if (currentFilter !== "all") {
    const filterStar = parseInt(currentFilter, 10);
    reviews = reviews.filter(r => r.rating === filterStar);
  }

  if (reviews.length === 0) {
    container.innerHTML = `
      <div class="reviews-empty-state">
        <div class="empty-state-icon">💬</div>
        <h4 style="font-size: var(--font-size-base); color: var(--dark); margin-bottom: 4px;">Chưa có đánh giá nào ${currentFilter !== 'all' ? `cho mức ${currentFilter} sao` : ''}</h4>
        <p style="font-size: var(--font-size-xs); color: var(--gray-600);">Hãy là người đầu tiên trải nghiệm và gửi đánh giá cho sản phẩm này nhé!</p>
      </div>
    `;
    return;
  }

  const html = reviews.map(rev => {
    const dateFormatted = formatReviewDate(rev.createdAt);
    const starIcons = "★".repeat(rev.rating) + "☆".repeat(5 - rev.rating);
    const avatarLetter = (rev.userName || "U").charAt(0).toUpperCase();

    // Huy hiệu minh bạch: phân biệt rõ dữ liệu demo mẫu và nhận xét của người dùng
    const badgeHtml = rev.isUserCreated 
      ? `<span class="review-badge-user">Đánh giá của bạn</span>` 
      : `<span class="review-badge-demo">Đánh giá mẫu (Demo)</span>`;

    return `
      <article class="review-item-card" id="review-${rev.id}">
        <div class="review-item-header">
          <div class="reviewer-profile">
            <div class="reviewer-avatar" aria-hidden="true">${avatarLetter}</div>
            <div>
              <div class="reviewer-name">
                <span>${escapeHtml(rev.userName)}</span>
                ${badgeHtml}
              </div>
              <div class="reviewer-role">${escapeHtml(rev.userRole || "Sinh viên LHU")}</div>
            </div>
          </div>
          <time class="review-date" datetime="${rev.createdAt}">${dateFormatted}</time>
        </div>

        <div class="review-rating-stars" aria-label="Đánh giá ${rev.rating} trên 5 sao">
          ${starIcons}
        </div>

        <div class="review-body-text">${escapeHtml(rev.comment)}</div>

        <div class="review-footer-action">
          <button 
            type="button" 
            class="btn-helpful" 
            data-review-id="${rev.id}"
            aria-label="Đánh dấu đánh giá này hữu ích"
          >
            <span>👍 Hữu ích</span>
            <span class="helpful-counter">(${rev.helpfulCount || 0})</span>
          </button>
        </div>
      </article>
    `;
  }).join("");

  container.innerHTML = html;

  // Gắn sự kiện nút "Hữu ích"
  container.querySelectorAll(".btn-helpful").forEach(btn => {
    btn.addEventListener("click", handleHelpfulClick);
  });
}

/**
 * Xử lý khi người dùng nhấn "Hữu ích"
 */
function handleHelpfulClick(e) {
  const btn = e.currentTarget;
  const reviewId = btn.getAttribute("data-review-id");
  if (!reviewId) return;

  if (btn.classList.contains("active")) {
    return; // Mỗi phiên chỉ bấm 1 lần để trực quan
  }

  const success = toggleHelpfulReview(reviewId);
  if (success) {
    btn.classList.add("active");
    const countSpan = btn.querySelector(".helpful-counter");
    if (countSpan) {
      const current = parseInt(countSpan.textContent.replace(/\D/g, ""), 10) || 0;
      countSpan.textContent = `(${current + 1})`;
    }
  }
}

/**
 * Cài đặt tương tác cho cụm radio button chọn sao (1-5 sao)
 */
function setupStarRatingEvents() {
  const radios = document.querySelectorAll('input[name="rating"]');
  const descDisplay = document.getElementById("ratingDescDisplay");

  const ratingDescriptions = {
    1: "1 sao - Rất tệ, không đúng như mô tả",
    2: "2 sao - Chưa hài lòng, cần cải thiện",
    3: "3 sao - Bình thường, tạm ổn",
    4: "4 sao - Hài lòng, chất lượng tốt",
    5: "5 sao - Rất tuyệt vời, khuyên dùng!"
  };

  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      const val = radio.value;
      if (descDisplay) {
        descDisplay.textContent = ratingDescriptions[val] || "";
        descDisplay.style.color = "var(--primary)";
        descDisplay.style.fontWeight = "600";
      }
      hideError("ratingError");
    });
  });
}

/**
 * Xử lý sự kiện gửi biểu mẫu đánh giá (Form Submit)
 */
function setupReviewForm() {
  const form = document.getElementById("reviewForm");
  const nameInput = document.getElementById("reviewerName");
  const roleInput = document.getElementById("reviewerRole");
  const commentInput = document.getElementById("reviewComment");
  const commentCounter = document.getElementById("commentCounter");

  if (!form) return;

  // Đếm số ký tự khi nhập nhận xét
  if (commentInput && commentCounter) {
    commentInput.addEventListener("input", () => {
      const length = commentInput.value.length;
      commentCounter.textContent = `${length}/800`;
      if (length >= 10) {
        hideError("commentError");
        commentInput.classList.remove("is-invalid");
      }
    });
  }

  // Tắt lỗi khi nhập họ tên
  if (nameInput) {
    nameInput.addEventListener("input", () => {
      if (nameInput.value.trim().length >= 2) {
        hideError("nameError");
        nameInput.classList.remove("is-invalid");
      }
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // 1. Kiểm tra dữ liệu hợp lệ (Validation)
    let isValid = true;

    // Kiểm tra đã chọn sao chưa
    const selectedRating = form.querySelector('input[name="rating"]:checked');
    if (!selectedRating) {
      showError("ratingError");
      isValid = false;
    } else {
      hideError("ratingError");
    }

    // Kiểm tra họ tên
    const nameVal = nameInput ? nameInput.value.trim() : "";
    if (nameVal.length < 2) {
      showError("nameError");
      nameInput.classList.add("is-invalid");
      isValid = false;
    } else {
      hideError("nameError");
      nameInput.classList.remove("is-invalid");
    }

    // Kiểm tra nhận xét
    const commentVal = commentInput ? commentInput.value.trim() : "";
    if (commentVal.length < 10) {
      showError("commentError");
      commentInput.classList.add("is-invalid");
      isValid = false;
    } else {
      hideError("commentError");
      commentInput.classList.remove("is-invalid");
    }

    if (!isValid) return;

    // 2. Thu thập dữ liệu và gọi module thêm đánh giá
    const reviewData = {
      productId: currentProductId,
      userName: nameVal,
      userRole: (roleInput && roleInput.value.trim()) || "Sinh viên LHU (Khách)",
      rating: parseInt(selectedRating.value, 10),
      comment: commentVal
    };

    const result = addProductReview(reviewData);

    // 3. Hiển thị thông báo phản hồi (Toast)
    if (result.success) {
      showToast(result.message, "success");

      // Reset form
      form.reset();
      const descDisplay = document.getElementById("ratingDescDisplay");
      if (descDisplay) {
        descDisplay.textContent = "Bấm vào ngôi sao để chọn mức đánh giá";
        descDisplay.style.color = "var(--gray-600)";
        descDisplay.style.fontWeight = "500";
      }
      if (commentCounter) commentCounter.textContent = "0/800";

      // Đặt lại bộ lọc về "all" để thấy ngay bình luận vừa gửi
      currentFilter = "all";
      updateFilterPillsActiveUI("all");

      // Cập nhật lại giao diện ngay lập tức mà KHÔNG cần tải lại trang
      refreshReviewsUI(currentProductId);

      // Cuộn êm đến nhận xét mới
      const newReviewEl = document.getElementById(`review-${result.newReview.id}`);
      if (newReviewEl) {
        newReviewEl.scrollIntoView({ behavior: "smooth", block: "center" });
        newReviewEl.style.boxShadow = "0 0 0 2px var(--primary)";
        setTimeout(() => {
          newReviewEl.style.boxShadow = "";
        }, 2000);
      }
    } else {
      showToast(result.message, "error");
    }
  });
}

/**
 * Cài đặt bộ lọc xem theo số sao
 */
function setupFilterPills() {
  const pills = document.querySelectorAll(".filter-pill");
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      const filter = pill.getAttribute("data-filter");
      currentFilter = filter;
      updateFilterPillsActiveUI(filter);
      renderReviewsList(currentProductId);
    });
  });
}

function updateFilterPillsActiveUI(activeFilter) {
  const pills = document.querySelectorAll(".filter-pill");
  pills.forEach(p => {
    if (p.getAttribute("data-filter") === activeFilter) {
      p.classList.add("active");
    } else {
      p.classList.remove("active");
    }
  });
}

// Helpers giao diện
function showError(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.classList.add("show");
}

function hideError(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.classList.remove("show");
}

function showToast(message, type = "success") {
  const toast = document.getElementById("reviewToast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `review-toast ${type}`;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 4000);
}

function generateStarString(score) {
  const rounded = Math.round(score);
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

function formatReviewDate(isoString) {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Gần đây";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${mins} - ${day}/${month}/${year}`;
  } catch {
    return "Gần đây";
  }
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
