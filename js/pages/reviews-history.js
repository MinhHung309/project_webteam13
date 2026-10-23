/**
 * Module hiển thị trang Lịch sử Đánh giá
 */

import { initNavigation } from "../modules/nav.js";
import { INITIAL_REVIEWS } from "../data/reviews.js";
import { INITIAL_PRODUCTS } from "../data/products.js";
import { 
  STORAGE_KEYS, 
  getStorageItem, 
  setStorageItem 
} from "../utils/storage.js";
import { getAllReviews, initReviewsStorage } from "../modules/reviews.js";

let historyFilter = "all";

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initReviewsStorage();
  renderHistoryStats();
  renderHistoryList();
  setupFilterEvents();
  setupResetButton();
});

function renderHistoryStats() {
  const reviews = getAllReviews();
  const total = reviews.length;
  const userReviewsCount = reviews.filter(r => r.isUserCreated).length;

  let sum = 0;
  reviews.forEach(r => sum += (r.rating || 0));
  const avg = total > 0 ? (sum / total).toFixed(1) : "0.0";

  const statTotal = document.getElementById("statTotalReviews");
  const statAvg = document.getElementById("statAvgRating");
  const statUser = document.getElementById("statUserReviews");

  if (statTotal) statTotal.textContent = total;
  if (statAvg) statAvg.textContent = avg;
  if (statUser) statUser.textContent = userReviewsCount;
}

function renderHistoryList() {
  const container = document.getElementById("historyReviewsList");
  if (!container) return;

  let reviews = getAllReviews();
  const products = getStorageItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);

  if (historyFilter === "user_only") {
    reviews = reviews.filter(r => r.isUserCreated);
  } else if (historyFilter === "community_only") {
    reviews = reviews.filter(r => !r.isUserCreated);
  }

  if (reviews.length === 0) {
    container.innerHTML = `
      <div class="reviews-empty-state">
        <div class="empty-state-icon">📋</div>
        <h4 style="font-size: var(--font-size-base); color: var(--dark); margin-bottom: 4px;">Chưa có dữ liệu đánh giá phù hợp</h4>
        <p style="font-size: var(--font-size-xs); color: var(--gray-600);">Hãy ghé thăm trang chi tiết sản phẩm để gửi đánh giá trải nghiệm đầu tiên của bạn!</p>
      </div>
    `;
    return;
  }

  const html = reviews.map(rev => {
    const matchedProd = products.find(p => p.id === rev.productId);
    const prodName = matchedProd ? matchedProd.name : "Sản phẩm LHU";
    const prodLink = `./product-detail.html?id=${rev.productId}`;
    const dateFormatted = formatReviewDate(rev.createdAt);
    const starIcons = "★".repeat(rev.rating) + "☆".repeat(5 - rev.rating);
    const avatarLetter = (rev.userName || "U").charAt(0).toUpperCase();

    const badgeHtml = rev.isUserCreated 
      ? `<span class="review-badge-user">Đánh giá của bạn</span>` 
      : "";

    return `
      <article class="review-item-card">
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

        <div style="margin-bottom: var(--spacing-xs); font-size: var(--font-size-xs); color: var(--gray-600);">
          Đánh giá cho sản phẩm: <a href="${prodLink}" style="color: var(--primary); font-weight: 600; text-decoration: none;">${escapeHtml(prodName)}</a>
        </div>

        <div class="review-rating-stars" aria-label="Đánh giá ${rev.rating} trên 5 sao">
          ${starIcons}
        </div>

        <div class="review-body-text">${escapeHtml(rev.comment)}</div>
      </article>
    `;
  }).join("");

  container.innerHTML = html;
}

function setupFilterEvents() {
  const pills = document.querySelectorAll("#historyFilterPills .filter-pill");
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      historyFilter = pill.getAttribute("data-filter");
      renderHistoryList();
    });
  });
}

function setupResetButton() {
  const btn = document.getElementById("btnResetReviews");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (confirm("Bạn có chắc muốn đặt lại toàn bộ đánh giá về dữ liệu mẫu ban đầu? Các đánh giá do bạn nhập trong LocalStorage sẽ được xóa.")) {
      setStorageItem(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
      renderHistoryStats();
      renderHistoryList();
      alert("Đã khôi phục dữ liệu đánh giá mẫu thành công!");
    }
  });
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
