/**
 * Module xử lý hiển thị danh sách sản phẩm, tìm kiếm, lọc và sắp xếp
 * Trang: pages/products.html
 */

import { initNavigation } from "../modules/nav.js";
import { formatCurrency, getStorageItem, STORAGE_KEYS } from "../utils/storage.js";
import { addToCart } from "../utils/cart.js";
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from "../data/products.js";

// Trạng thái bộ lọc hiện tại của trang
const filterState = {
  search: "",
  category: "all",
  priceRange: "all",
  inStockOnly: false,
  sort: "default"
};

// Khởi tạo trang khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  // 1. Khởi tạo Navigation chung và badge giỏ hàng
  initNavigation();

  // 2. Đọc Query Parameters từ URL (?category=... &search=...)
  parseQueryParams();

  // 3. Render danh mục vào bộ lọc sidebar
  renderCategoryFilterOptions();

  // 4. Đồng bộ giao diện bộ lọc với trạng thái ban đầu
  syncFilterControlsFromState();

  // 5. Đăng ký các sự kiện tương tác bộ lọc
  setupFilterEventListeners();

  // 6. Render danh sách sản phẩm
  applyFiltersAndRender();
});

/**
 * Lấy danh sách sản phẩm từ localStorage hoặc dữ liệu mẫu tĩnh
 * @returns {Array<object>}
 */
function getProductsData() {
  const stored = getStorageItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  if (Array.isArray(stored) && stored.length > 0) {
    return stored;
  }
  return INITIAL_PRODUCTS;
}

/**
 * Đọc query parameter từ URL (category, search)
 */
function parseQueryParams() {
  const params = new URLSearchParams(window.location.search);
  
  const searchParam = params.get("search");
  if (searchParam) {
    filterState.search = searchParam.trim();
  }

  const categoryParam = params.get("category");
  if (categoryParam) {
    filterState.category = categoryParam.trim();
  }
}

/**
 * Render danh sách radio options danh mục trong sidebar
 */
function renderCategoryFilterOptions() {
  const container = document.getElementById("categoryFilterOptions");
  if (!container) return;

  const products = getProductsData();

  // Đếm số lượng sản phẩm mỗi danh mục
  const counts = {};
  products.forEach(p => {
    const key = p.categoryId || p.category;
    counts[key] = (counts[key] || 0) + 1;
  });

  const categories = INITIAL_CATEGORIES || [];
  
  let html = `
    <li>
      <label class="filter-option-label ${filterState.category === "all" ? "is-active" : ""}">
        <span class="filter-option-left">
          <input type="radio" name="categoryFilter" value="all" ${filterState.category === "all" ? "checked" : ""}>
          <span class="filter-option-text">Tất cả danh mục</span>
        </span>
        <span class="filter-option-count">${products.length}</span>
      </label>
    </li>
  `;

  categories.forEach(cat => {
    const isChecked = filterState.category === cat.id || filterState.category === cat.name;
    const count = counts[cat.id] || counts[cat.name] || 0;
    html += `
      <li>
        <label class="filter-option-label ${isChecked ? "is-active" : ""}">
          <span class="filter-option-left">
            <input type="radio" name="categoryFilter" value="${cat.id}" ${isChecked ? "checked" : ""}>
            <span class="filter-option-text">${cat.icon ? `${cat.icon} ` : ""}${cat.name}</span>
          </span>
          <span class="filter-option-count">${count}</span>
        </label>
      </li>
    `;
  });

  container.innerHTML = html;
}

/**
 * Đồng bộ giá trị của các control HTML theo filterState
 */
function syncFilterControlsFromState() {
  // Input search
  const searchInput = document.getElementById("catalogSearchInput");
  const searchClear = document.getElementById("catalogSearchClear");
  if (searchInput) {
    searchInput.value = filterState.search;
    if (searchClear) {
      searchClear.style.display = filterState.search ? "block" : "none";
    }
  }

  // Radio categories
  const categoryRadios = document.querySelectorAll("input[name='categoryFilter']");
  categoryRadios.forEach(radio => {
    radio.checked = (radio.value === filterState.category);
    const label = radio.closest(".filter-option-label");
    if (label) {
      label.classList.toggle("is-active", radio.checked);
    }
  });

  // Radio price range
  const priceRadios = document.querySelectorAll("input[name='priceFilter']");
  priceRadios.forEach(radio => {
    radio.checked = (radio.value === filterState.priceRange);
    const label = radio.closest(".filter-option-label");
    if (label) {
      label.classList.toggle("is-active", radio.checked);
    }
  });

  // Checkbox inStock
  const inStockCheckbox = document.getElementById("filterInStock");
  if (inStockCheckbox) {
    inStockCheckbox.checked = filterState.inStockOnly;
    const label = inStockCheckbox.closest(".filter-option-label");
    if (label) {
      label.classList.toggle("is-active", inStockCheckbox.checked);
    }
  }

  // Select Sort
  const sortSelect = document.getElementById("catalogSortSelect");
  if (sortSelect) {
    sortSelect.value = filterState.sort;
  }
}

/**
 * Đăng ký các sự kiện input / change của bộ lọc
 */
function setupFilterEventListeners() {
  // Tìm kiếm
  const searchInput = document.getElementById("catalogSearchInput");
  const searchClear = document.getElementById("catalogSearchClear");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      filterState.search = e.target.value.trim();
      if (searchClear) {
        searchClear.style.display = filterState.search ? "block" : "none";
      }
      applyFiltersAndRender();
    });
  }

  if (searchClear && searchInput) {
    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      filterState.search = "";
      searchClear.style.display = "none";
      searchInput.focus();
      applyFiltersAndRender();
    });
  }

  // Lọc theo danh mục
  const catOptionsContainer = document.getElementById("categoryFilterOptions");
  if (catOptionsContainer) {
    catOptionsContainer.addEventListener("change", (e) => {
      if (e.target.name === "categoryFilter") {
        filterState.category = e.target.value;
        syncFilterControlsFromState();
        applyFiltersAndRender();
      }
    });
  }

  // Lọc theo khoảng giá
  const priceOptions = document.querySelectorAll("input[name='priceFilter']");
  priceOptions.forEach(radio => {
    radio.addEventListener("change", (e) => {
      filterState.priceRange = e.target.value;
      syncFilterControlsFromState();
      applyFiltersAndRender();
    });
  });

  // Lọc còn hàng
  const inStockCheckbox = document.getElementById("filterInStock");
  if (inStockCheckbox) {
    inStockCheckbox.addEventListener("change", (e) => {
      filterState.inStockOnly = e.target.checked;
      syncFilterControlsFromState();
      applyFiltersAndRender();
    });
  }

  // Sắp xếp
  const sortSelect = document.getElementById("catalogSortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      filterState.sort = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Nút xóa tất cả bộ lọc
  const resetBtn = document.getElementById("btnResetFilters");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetAllFilters);
  }

  // Toggle filter trên mobile
  const mobileToggle = document.getElementById("mobileFilterToggle");
  const sidebar = document.getElementById("catalogSidebar");
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener("click", () => {
      sidebar.classList.toggle("is-visible-mobile");
      const isVisible = sidebar.classList.contains("is-visible-mobile");
      mobileToggle.textContent = isVisible ? "✕ Đóng bộ lọc" : "🔍 Bộ lọc sản phẩm";
    });
  }
}

/**
 * Đặt lại toàn bộ bộ lọc về mặc định
 */
function resetAllFilters() {
  filterState.search = "";
  filterState.category = "all";
  filterState.priceRange = "all";
  filterState.inStockOnly = false;
  filterState.sort = "default";

  // Xóa query param trên thanh URL mà không reload trang
  const cleanUrl = window.location.pathname;
  window.history.replaceState({}, document.title, cleanUrl);

  syncFilterControlsFromState();
  applyFiltersAndRender();
}

/**
 * Áp dụng logic lọc và sắp xếp lên danh sách sản phẩm
 */
function applyFiltersAndRender() {
  const allProducts = getProductsData();
  
  let filtered = allProducts.filter(product => {
    // 1. Tìm kiếm theo tên (không phân biệt hoa thường và hỗ trợ tiếng Việt)
    if (filterState.search) {
      const searchNormalized = filterState.search.toLowerCase();
      const nameNormalized = (product.name || "").toLowerCase();
      const descNormalized = (product.description || "").toLowerCase();
      if (!nameNormalized.includes(searchNormalized) && !descNormalized.includes(searchNormalized)) {
        return false;
      }
    }

    // 2. Lọc danh mục
    if (filterState.category !== "all") {
      const catMatch = 
        product.categoryId === filterState.category || 
        product.category === filterState.category;
      if (!catMatch) {
        return false;
      }
    }

    // 3. Lọc khoảng giá
    const price = product.price || 0;
    if (filterState.priceRange === "under-100k" && price >= 100000) return false;
    if (filterState.priceRange === "100k-300k" && (price < 100000 || price > 300000)) return false;
    if (filterState.priceRange === "300k-500k" && (price < 300000 || price > 500000)) return false;
    if (filterState.priceRange === "over-500k" && price <= 500000) return false;

    // 4. Lọc tình trạng hàng
    if (filterState.inStockOnly) {
      if (product.inStock === false) return false;
    }

    return true;
  });

  // 5. Sắp xếp kết quả
  filtered.sort((a, b) => {
    if (filterState.sort === "price-asc") {
      return (a.price || 0) - (b.price || 0);
    }
    if (filterState.sort === "price-desc") {
      return (b.price || 0) - (a.price || 0);
    }
    if (filterState.sort === "rating-desc") {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (filterState.sort === "name-asc") {
      return (a.name || "").localeCompare(b.name || "", "vi");
    }
    // "default": giữ thứ tự mặc định
    return 0;
  });

  // Cập nhật số lượng sản phẩm hiển thị
  const countEl = document.getElementById("resultsCount");
  if (countEl) {
    countEl.textContent = filtered.length;
  }

  // Render thanh active filters
  renderActiveFilterBadges();

  // Render lưới sản phẩm hoặc empty state
  const gridContainer = document.getElementById("catalogProductGrid");
  const emptyContainer = document.getElementById("catalogEmptyState");

  if (!gridContainer) return;

  if (filtered.length === 0) {
    gridContainer.style.display = "none";
    if (emptyContainer) emptyContainer.style.display = "flex";
  } else {
    gridContainer.style.display = "grid";
    if (emptyContainer) emptyContainer.style.display = "none";
    renderProductCards(filtered, gridContainer);
  }
}

/**
 * Hiển thị các tag bộ lọc đang áp dụng
 */
function renderActiveFilterBadges() {
  const bar = document.getElementById("activeFiltersBar");
  if (!bar) return;

  const tags = [];

  if (filterState.search) {
    tags.push({
      label: `Tìm kiếm: "${filterState.search}"`,
      onRemove: () => {
        filterState.search = "";
        const searchInput = document.getElementById("catalogSearchInput");
        if (searchInput) searchInput.value = "";
        const clearBtn = document.getElementById("catalogSearchClear");
        if (clearBtn) clearBtn.style.display = "none";
        applyFiltersAndRender();
      }
    });
  }

  if (filterState.category !== "all") {
    const cat = (INITIAL_CATEGORIES || []).find(c => c.id === filterState.category || c.name === filterState.category);
    const catName = cat ? cat.name : filterState.category;
    tags.push({
      label: `Danh mục: ${catName}`,
      onRemove: () => {
        filterState.category = "all";
        const allRadio = document.querySelector("input[name='categoryFilter'][value='all']");
        if (allRadio) allRadio.checked = true;
        applyFiltersAndRender();
      }
    });
  }

  if (filterState.priceRange !== "all") {
    const priceLabels = {
      "under-100k": "Dưới 100.000 ₫",
      "100k-300k": "100.000 ₫ - 300.000 ₫",
      "300k-500k": "300.000 ₫ - 500.000 ₫",
      "over-500k": "Trên 500.000 ₫"
    };
    tags.push({
      label: `Giá: ${priceLabels[filterState.priceRange] || filterState.priceRange}`,
      onRemove: () => {
        filterState.priceRange = "all";
        const allPrice = document.querySelector("input[name='priceFilter'][value='all']");
        if (allPrice) allPrice.checked = true;
        applyFiltersAndRender();
      }
    });
  }

  if (filterState.inStockOnly) {
    tags.push({
      label: "Chỉ còn hàng",
      onRemove: () => {
        filterState.inStockOnly = false;
        const inStockBox = document.getElementById("filterInStock");
        if (inStockBox) inStockBox.checked = false;
        applyFiltersAndRender();
      }
    });
  }

  if (tags.length === 0) {
    bar.innerHTML = "";
    bar.style.display = "none";
    return;
  }

  bar.style.display = "flex";
  bar.innerHTML = tags.map((t, index) => `
    <span class="active-filter-tag">
      <span>${t.label}</span>
      <button type="button" data-tag-index="${index}" aria-label="Xóa bộ lọc ${t.label}">✕</button>
    </span>
  `).join("");

  // Gắn sự kiện click xóa từng tag
  bar.querySelectorAll("button[data-tag-index]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.tagIndex, 10);
      if (tags[idx] && typeof tags[idx].onRemove === "function") {
        tags[idx].onRemove();
      }
    });
  });
}

/**
 * Render danh sách thẻ sản phẩm dạng Grid
 * @param {Array<object>} products 
 * @param {HTMLElement} container 
 */
function renderProductCards(products, container) {
  const cardsHtml = products.map(product => {
    const isOutOfStock = product.inStock === false;
    const badgeHtml = product.badge 
      ? `<span class="product-tag">${product.badge}</span>` 
      : "";
    const outOfStockBadge = isOutOfStock
      ? `<span class="badge-out-of-stock">Hết hàng</span>`
      : "";

    return `
      <article class="product-card ${isOutOfStock ? "product-out-of-stock" : ""}" data-product-id="${product.id}">
        <div class="product-image-wrap">
          <img 
            src="${product.imageUrl}" 
            alt="${product.name}" 
            class="product-image" 
            loading="lazy"
            onerror="this.src='https://placehold.co/600x450/e2e8f0/334155?text=LHU+Product';"
          />
          ${badgeHtml}
          ${outOfStockBadge}
        </div>
        <div class="product-info">
          <span class="product-category">${product.category || "Sản phẩm LHU"}</span>
          <h3 class="product-title" title="${product.name}">${product.name}</h3>
          
          <div class="product-rating" aria-label="Đánh giá ${product.rating || '5.0'} trên 5 sao">
            <span>★</span>
            <strong>${product.rating || "5.0"}</strong>
            <span class="rating-count">(${product.reviewCount || 0} đánh giá)</span>
          </div>

          <div class="product-bottom">
            <div class="product-price">
              <span class="price-current">${formatCurrency(product.price)}</span>
              ${product.originalPrice ? `<span class="price-original">${formatCurrency(product.originalPrice)}</span>` : ""}
            </div>

            <div class="product-qty-row">
              <span class="qty-label">Số lượng:</span>
              <div class="product-qty-control" role="group" aria-label="Điều chỉnh số lượng cho ${product.name}">
                <button 
                  type="button" 
                  class="btn-qty btn-qty-minus" 
                  data-action="decrease-qty" 
                  data-product-id="${product.id}"
                  aria-label="Giảm số lượng ${product.name}"
                  ${isOutOfStock ? "disabled" : ""}
                >−</button>
                <input 
                  type="number" 
                  class="product-qty-input" 
                  data-product-id="${product.id}"
                  value="1" 
                  min="1" 
                  max="99" 
                  aria-label="Số lượng ${product.name}"
                  ${isOutOfStock ? "disabled" : ""}
                />
                <button 
                  type="button" 
                  class="btn-qty btn-qty-plus" 
                  data-action="increase-qty" 
                  data-product-id="${product.id}"
                  aria-label="Tăng số lượng ${product.name}"
                  ${isOutOfStock ? "disabled" : ""}
                >+</button>
              </div>
            </div>

            <div class="product-card-actions">
              <a 
                href="./product-detail.html?id=${product.id}" 
                class="btn btn-outline btn-sm btn-view-detail" 
                aria-label="Xem chi tiết ${product.name}"
              >
                Chi tiết
              </a>
              <button 
                type="button" 
                class="btn btn-primary btn-sm btn-add-cart" 
                data-action="add-to-cart"
                data-product-id="${product.id}"
                ${isOutOfStock ? "disabled" : ""}
                aria-label="Thêm ${product.name} vào giỏ hàng"
              >
                <span>🛒</span>
                <span>Thêm</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");

  container.innerHTML = cardsHtml;

  // Gắn sự kiện giảm số lượng (−)
  container.querySelectorAll("button[data-action='decrease-qty']").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      if (!card) return;
      const input = card.querySelector(".product-qty-input");
      if (!input) return;
      const currentVal = parseInt(input.value, 10) || 1;
      if (currentVal > 1) {
        input.value = currentVal - 1;
      }
    });
  });

  // Gắn sự kiện tăng số lượng (+)
  container.querySelectorAll("button[data-action='increase-qty']").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      if (!card) return;
      const input = card.querySelector(".product-qty-input");
      if (!input) return;
      const currentVal = parseInt(input.value, 10) || 1;
      if (currentVal < 99) {
        input.value = currentVal + 1;
      }
    });
  });

  // Gắn sự kiện thay đổi số lượng trực tiếp trong ô input
  container.querySelectorAll(".product-qty-input").forEach(input => {
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
  });

  // Gắn sự kiện Thêm vào giỏ hàng cho từng button
  container.querySelectorAll("button[data-action='add-to-cart']").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const productId = btn.dataset.productId;
      const card = btn.closest(".product-card");
      const input = card ? card.querySelector(".product-qty-input") : null;
      const quantity = input ? Math.max(1, parseInt(input.value, 10) || 1) : 1;
      handleAddToCart(productId, quantity, btn, input);
    });
  });
}

/**
 * Xử lý khi click "Thêm vào giỏ hàng" bằng utils dùng chung
 * @param {string} productId 
 * @param {number} quantity
 * @param {HTMLButtonElement} buttonEl 
 * @param {HTMLInputElement|null} inputEl
 */
function handleAddToCart(productId, quantity = 1, buttonEl, inputEl = null) {
  const result = addToCart(productId, quantity);

  if (result.success) {
    const successMsg = quantity > 1 
      ? `✓ Đã thêm ${quantity} sản phẩm vào giỏ hàng thành công!` 
      : "✓ Đã thêm sản phẩm vào giỏ hàng thành công!";
    showToast("success", successMsg);

    // Đặt lại ô số lượng về 1 sau khi thêm thành công
    if (inputEl) {
      inputEl.value = 1;
    }
    
    // Hiệu ứng phản hồi trên nút
    const originalText = buttonEl.innerHTML;
    buttonEl.innerHTML = "<span>✓ Đã thêm</span>";
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
    showToast("error", result.message || "Không thể thêm sản phẩm vào giỏ hàng.");
  }
}

/**
 * Hiển thị thông báo Toast góc màn hình
 * @param {'success'|'error'|'info'} type 
 * @param {string} message 
 */
function showToast(type, message) {
  const container = document.getElementById("catalogToastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `voucher-toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

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
