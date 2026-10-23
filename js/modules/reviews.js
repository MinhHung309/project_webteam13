/**
 * Module Xử Lý Đánh Giá & Phản Hồi Khách Hàng (Customer Reviews Module)
 * Thuộc Phân hệ 2 - Dự án LHU E-Commerce Hub
 * 
 * Chức năng:
 * - Khởi tạo và đồng bộ đánh giá trong LocalStorage
 * - Lọc đánh giá theo mã sản phẩm (productId)
 * - Tính toán điểm trung bình và biểu đồ tỷ lệ theo từng số sao (1-5★)
 * - Thêm đánh giá mới, kiểm tra tính hợp lệ và tự động cập nhật sản phẩm liên quan
 */

import { INITIAL_REVIEWS } from "../data/reviews.js";
import { INITIAL_PRODUCTS } from "../data/products.js";
import { 
  STORAGE_KEYS, 
  getStorageItem, 
  setStorageItem, 
  initializeStorageItem 
} from "../utils/storage.js";

/**
 * Đảm bảo dữ liệu đánh giá và sản phẩm đã tồn tại trong LocalStorage
 * Khởi tạo dữ liệu mẫu nếu đây là phiên làm việc đầu tiên
 */
export function initReviewsStorage() {
  initializeStorageItem(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  initializeStorageItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
}

/**
 * Lấy toàn bộ danh sách đánh giá từ LocalStorage (kèm fallback an toàn)
 * @returns {Array} Danh sách toàn bộ đánh giá
 */
export function getAllReviews() {
  initReviewsStorage();
  const reviews = getStorageItem(STORAGE_KEYS.REVIEWS, []);
  return Array.isArray(reviews) ? reviews : [];
}

/**
 * Lấy danh sách đánh giá theo mã sản phẩm cụ thể
 * @param {string} productId - Mã sản phẩm (ví dụ: 'lhu_prod_001')
 * @returns {Array} Danh sách đánh giá của sản phẩm đó, sắp xếp mới nhất lên đầu
 */
export function getProductReviews(productId) {
  if (!productId) return [];
  const allReviews = getAllReviews();
  return allReviews
    .filter(rev => rev.productId === productId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Tính toán thống kê điểm số và phân bố sao cho một sản phẩm
 * @param {string} productId - Mã sản phẩm
 * @returns {Object} { total, average, distribution: { 5: count, 4: count, ... }, percentages: { 5: pct, ... } }
 */
export function calculateReviewStats(productId) {
  const reviews = getProductReviews(productId);
  const total = reviews.length;

  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };

  if (total === 0) {
    return {
      total: 0,
      average: 0,
      distribution,
      percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  let sum = 0;
  reviews.forEach(item => {
    const star = Math.min(Math.max(Math.round(item.rating), 1), 5);
    distribution[star] = (distribution[star] || 0) + 1;
    sum += item.rating;
  });

  const average = parseFloat((sum / total).toFixed(1));

  const percentages = {
    5: Math.round((distribution[5] / total) * 100),
    4: Math.round((distribution[4] / total) * 100),
    3: Math.round((distribution[3] / total) * 100),
    2: Math.round((distribution[2] / total) * 100),
    1: Math.round((distribution[1] / total) * 100)
  };

  return {
    total,
    average,
    distribution,
    percentages
  };
}

/**
 * Thêm đánh giá mới cho sản phẩm
 * @param {Object} reviewData - Dữ liệu đánh giá: { productId, userName, userRole, rating, comment }
 * @returns {Object} { success: boolean, message: string, newReview?: Object, stats?: Object }
 */
export function addProductReview(reviewData) {
  try {
    const { productId, userName, userRole, rating, comment } = reviewData;

    // 1. Kiểm tra tính hợp lệ của dữ liệu đầu vào
    if (!productId || typeof productId !== "string") {
      return { success: false, message: "Mã sản phẩm không hợp lệ." };
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return { success: false, message: "Vui lòng chọn mức đánh giá từ 1 đến 5 sao." };
    }

    const cleanUserName = (userName || "").trim();
    if (cleanUserName.length < 2) {
      return { success: false, message: "Họ và tên người đánh giá phải có ít nhất 2 ký tự." };
    }

    const cleanComment = (comment || "").trim();
    if (cleanComment.length < 10) {
      return { success: false, message: "Nội dung nhận xét quá ngắn (tối thiểu 10 ký tự để mô tả chi tiết)." };
    }

    // 2. Tạo đối tượng đánh giá mới theo cấu trúc chuẩn dự án
    const allReviews = getAllReviews();
    const reviewId = `rev_${Date.now()}`;

    const newReview = {
      id: reviewId,
      productId: productId,
      userName: cleanUserName,
      userRole: (userRole || "Sinh viên LHU").trim(),
      rating: numericRating,
      comment: cleanComment,
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
      isUserCreated: true // Nhận xét do người dùng gửi trực tiếp
    };

    // 3. Lưu vào danh sách trong LocalStorage
    allReviews.unshift(newReview);
    const saveSuccess = setStorageItem(STORAGE_KEYS.REVIEWS, allReviews);

    if (!saveSuccess) {
      return { 
        success: false, 
        message: "Không thể lưu đánh giá do bộ nhớ trình duyệt (localStorage) đầy hoặc bị giới hạn." 
      };
    }

    // 4. Tính toán lại rating trung bình và cập nhật vào danh sách sản phẩm lhu_products
    const stats = calculateReviewStats(productId);
    updateProductRatingCache(productId, stats.average, stats.total);

    return {
      success: true,
      message: "Gửi đánh giá thành công! Cảm ơn ý kiến đóng góp của bạn.",
      newReview,
      stats
    };
  } catch (error) {
    console.error("[Reviews Module] Lỗi khi thêm đánh giá:", error);
    return {
      success: false,
      message: "Đã xảy ra lỗi không mong muốn khi xử lý đánh giá."
    };
  }
}

/**
 * Tăng lượt hữu ích (helpful) cho một bình luận
 * @param {string} reviewId 
 * @returns {boolean}
 */
export function toggleHelpfulReview(reviewId) {
  const allReviews = getAllReviews();
  const target = allReviews.find(r => r.id === reviewId);
  if (!target) return false;

  target.helpfulCount = (target.helpfulCount || 0) + 1;
  return setStorageItem(STORAGE_KEYS.REVIEWS, allReviews);
}

/**
 * Cập nhật điểm đánh giá trung bình và số lượng vào danh sách sản phẩm lưu trong localStorage
 * @param {string} productId 
 * @param {number} averageRating 
 * @param {number} reviewCount 
 */
function updateProductRatingCache(productId, averageRating, reviewCount) {
  const products = getStorageItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  if (!Array.isArray(products)) return;

  const targetProd = products.find(p => p.id === productId);
  if (targetProd) {
    targetProd.rating = averageRating;
    targetProd.reviewCount = reviewCount;
    setStorageItem(STORAGE_KEYS.PRODUCTS, products);
  }
}
