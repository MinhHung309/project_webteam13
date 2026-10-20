/**
 * Entry point chính của ứng dụng LHU E-Commerce
 */

import { initNavigation } from "./modules/nav.js";
import { renderCategories, renderFeaturedProducts } from "./pages/home.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Khởi tạo điều hướng và menu chung
  initNavigation();

  // 2. Kiểm tra và render nội dung nếu đang ở trang chủ
  const categoryContainer = document.getElementById("categoryList");
  if (categoryContainer) {
    renderCategories(categoryContainer);
  }

  const featuredContainer = document.getElementById("featuredProducts");
  if (featuredContainer) {
    renderFeaturedProducts(featuredContainer);
  }

  console.info("LHU E-Commerce App đã khởi tạo thành công trên kiến trúc ES Modules thuần.");
});
