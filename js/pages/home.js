/**
 * Module hiển thị danh mục và sản phẩm nổi bật trên trang chủ
 */

import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "../data/products.js";
import { formatCurrency } from "../utils/storage.js";

/**
 * Render danh sách danh mục sản phẩm
 * @param {HTMLElement} container 
 */
export function renderCategories(container) {
  if (!container) return;

  const html = INITIAL_CATEGORIES.map(cat => `
    <a href="./pages/products.html?category=${encodeURIComponent(cat.id)}" class="category-card" aria-label="Danh mục ${cat.name}">
      <span class="category-icon" aria-hidden="true">${cat.icon}</span>
      <h3 class="category-name">${cat.name}</h3>
      <span class="category-count">${cat.itemCount} sản phẩm</span>
    </a>
  `).join("");

  container.innerHTML = html;
}

/**
 * Render danh sách sản phẩm nổi bật
 * @param {HTMLElement} container 
 */
export function renderFeaturedProducts(container) {
  if (!container) return;

  const html = INITIAL_PRODUCTS.map(product => `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-image-wrap">
        <img 
          src="${product.imageUrl}" 
          alt="${product.name}" 
          class="product-image" 
          loading="lazy"
          onerror="this.src='https://placehold.co/600x450/e2e8f0/334155?text=LHU+Product';"
        />
        ${product.badge ? `<span class="product-tag">${product.badge}</span>` : ""}
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-rating" aria-label="Đánh giá ${product.rating} trên 5 sao">
          <span>★</span>
          <strong>${product.rating}</strong>
          <span class="rating-count">(${product.reviewCount} đánh giá)</span>
        </div>
        <div class="product-bottom">
          <div class="product-price">
            <span class="price-current">${formatCurrency(product.price)}</span>
            ${product.originalPrice ? `<span class="price-original">${formatCurrency(product.originalPrice)}</span>` : ""}
          </div>
          <a 
            href="./pages/product-detail.html?id=${product.id}" 
            class="btn btn-outline btn-sm" 
            data-action="view-details"
            aria-label="Xem chi tiết và đánh giá ${product.name}"
          >
            Chi tiết
          </a>
        </div>
      </div>
    </article>
  `).join("");

  container.innerHTML = html;
}
