/**
 * Module Xử Lý Voucher & Khuyến Mãi (Discount/Voucher Hub Module)
 * Phân hệ 3 - Dự án LHU E-Commerce Hub
 * 
 * Các chức năng:
 * - Khởi tạo & nạp danh sách voucher an toàn từ LocalStorage
 * - Quản lý ví cá nhân (lưu/bỏ lưu voucher vào lhu_saved_vouchers)
 * - Kiểm tra hạn sử dụng, tính hợp lệ và điều kiện áp dụng đơn hàng
 * - Tính toán chính xác số tiền giảm giá dựa trên subtotal (không âm, không nhân đôi)
 * - Hỗ trợ loại voucher freeship (trừ phí vận chuyển thực tế, tối đa mức quy định)
 */

import { INITIAL_VOUCHERS } from "../data/vouchers.js";
import { 
  STORAGE_KEYS, 
  getStorageItem, 
  setStorageItem, 
  initializeStorageItem,
  formatCurrency 
} from "../utils/storage.js";

// Khóa riêng cho module voucher trong localStorage để không xung đột với các module khác
export const VOUCHER_STORAGE_KEYS = {
  ALL_VOUCHERS: STORAGE_KEYS.VOUCHERS || "lhu_vouchers",
  SAVED_VOUCHERS: "lhu_saved_vouchers", // Mảng các code hoặc id voucher người dùng đã lưu
  APPLIED_VOUCHER: "lhu_applied_voucher" // Voucher đang được áp dụng trong phiên mua sắm
};

/**
 * Khởi tạo dữ liệu voucher ban đầu vào LocalStorage
 */
export function initVouchersStorage() {
  initializeStorageItem(VOUCHER_STORAGE_KEYS.ALL_VOUCHERS, INITIAL_VOUCHERS);
  
  // Khởi tạo ví voucher cá nhân nếu chưa có
  const saved = getStorageItem(VOUCHER_STORAGE_KEYS.SAVED_VOUCHERS, null);
  if (!Array.isArray(saved)) {
    // Mặc định lưu sẵn mã LHU2026 cho người dùng dễ trải nghiệm
    setStorageItem(VOUCHER_STORAGE_KEYS.SAVED_VOUCHERS, ["LHU2026"]);
  }
}

/**
 * Lấy toàn bộ voucher hiện có trong hệ thống
 * @returns {Array} Danh sách voucher
 */
export function getAllVouchers() {
  initVouchersStorage();
  const list = getStorageItem(VOUCHER_STORAGE_KEYS.ALL_VOUCHERS, INITIAL_VOUCHERS);
  return Array.isArray(list) ? list : INITIAL_VOUCHERS;
}

/**
 * Lấy danh sách các mã voucher người dùng đã lưu vào ví
 * @returns {Array<string>} Mảng các mã code (viết hoa)
 */
export function getSavedVoucherCodes() {
  initVouchersStorage();
  const saved = getStorageItem(VOUCHER_STORAGE_KEYS.SAVED_VOUCHERS, []);
  return Array.isArray(saved) ? saved : [];
}

/**
 * Kiểm tra xem một voucher có còn hạn sử dụng hay không
 * @param {Object} voucher 
 * @returns {boolean} true nếu còn hạn
 */
export function isVoucherValidDate(voucher) {
  if (!voucher || !voucher.validUntil) return false;
  if (voucher.isActive === false) return false;

  const now = new Date();
  const until = new Date(voucher.validUntil);
  return now <= until;
}

/**
 * Lấy trạng thái của voucher: 'saved' | 'valid' | 'expired'
 * @param {Object} voucher 
 * @returns {'saved' | 'valid' | 'expired'}
 */
export function getVoucherStatus(voucher) {
  const savedCodes = getSavedVoucherCodes();
  const isSaved = savedCodes.includes((voucher.code || "").toUpperCase());
  const isValid = isVoucherValidDate(voucher);

  if (!isValid) return "expired";
  if (isSaved) return "saved";
  return "valid";
}

/**
 * Lưu một voucher vào ví cá nhân (không lưu trùng)
 * @param {string} code Mã voucher
 * @returns {{ success: boolean, message: string }}
 */
export function saveVoucherToWallet(code) {
  if (!code || typeof code !== "string") {
    return { success: false, message: "Mã voucher không hợp lệ." };
  }

  const cleanCode = code.trim().toUpperCase();
  const allVouchers = getAllVouchers();
  const target = allVouchers.find(v => v.code.toUpperCase() === cleanCode);

  if (!target) {
    return { success: false, message: `Mã voucher "${cleanCode}" không tồn tại trong hệ thống.` };
  }

  const savedCodes = getSavedVoucherCodes();
  if (savedCodes.includes(cleanCode)) {
    return { success: false, message: `Voucher "${cleanCode}" đã có sẵn trong Ví của bạn rồi!` };
  }

  savedCodes.push(cleanCode);
  const ok = setStorageItem(VOUCHER_STORAGE_KEYS.SAVED_VOUCHERS, savedCodes);

  if (!ok) {
    return { success: false, message: "Không thể lưu vào bộ nhớ trình duyệt do dung lượng đầy." };
  }

  return { success: true, message: `Đã lưu thành công mã "${cleanCode}" vào Ví Voucher của bạn!` };
}

/**
 * Bỏ lưu một voucher khỏi ví cá nhân
 * @param {string} code 
 * @returns {{ success: boolean, message: string }}
 */
export function removeVoucherFromWallet(code) {
  const cleanCode = (code || "").trim().toUpperCase();
  const savedCodes = getSavedVoucherCodes();
  const newSaved = savedCodes.filter(c => c !== cleanCode);

  setStorageItem(VOUCHER_STORAGE_KEYS.SAVED_VOUCHERS, newSaved);
  return { success: true, message: `Đã xóa mã "${cleanCode}" khỏi Ví của bạn.` };
}

/**
 * Tra cứu voucher theo mã code (không phân biệt hoa thường)
 * @param {string} code 
 * @returns {Object|null}
 */
export function findVoucherByCode(code) {
  if (!code) return null;
  const cleanCode = code.trim().toUpperCase();
  const vouchers = getAllVouchers();
  return vouchers.find(v => v.code.toUpperCase() === cleanCode) || null;
}

/**
 * BƯỚC 5: HÀM TÍNH TOÁN GIẢM GIÁ CHUẨN ĐỘC LẬP
 * 
 * Quy tắc bắt buộc:
 * 1. Tính toán giảm giá dựa trên subtotal (tổng tiền hàng tạm tính), KHÔNG tính trên phí vận chuyển
 * 2. Mã LHU2026: giảm đúng 10% subtotal
 *    Ví dụ: subtotal = 1.000.000đ -> giảm 100.000đ
 * 3. Mã WELCOME50: giảm 50.000đ cho đơn từ 500.000đ
 * 4. Mã FREESHIP: giảm trực tiếp vào phí vận chuyển thực tế, tối đa 30.000đ (shippingFee - discount)
 * 5. Mã SALE20: giảm 20% subtotal, chặn tối đa 100.000đ, áp dụng cho đơn từ 300.000đ
 * 6. Tổng thanh toán cuối cùng không bao giờ được âm (Math.max(0, ...))
 * 7. Mỗi đơn chỉ áp dụng 1 voucher, không áp dụng kép
 * 
 * @param {Object|string} voucherOrCode Đối tượng voucher hoặc chuỗi mã code
 * @param {number} subtotal Giá trị tạm tính các sản phẩm trong giỏ (VNĐ)
 * @param {number} shippingFee Phí vận chuyển hiện hành (mặc định 30.000đ nếu không truyền)
 * @returns {{
 *   valid: boolean,
 *   message: string,
 *   voucher: Object|null,
 *   subtotal: number,
 *   shippingFee: number,
 *   discountAmount: number,
 *   shippingDiscount: number,
 *   finalShippingFee: number,
 *   finalTotal: number
 * }}
 */
export function calculateVoucherDiscount(voucherOrCode, subtotal = 0, shippingFee = 30000) {
  const numSubtotal = Math.max(0, Number(subtotal) || 0);
  const numShipping = Math.max(0, Number(shippingFee) || 0);

  // Tìm voucher nếu truyền vào là string code
  const voucher = typeof voucherOrCode === "string" 
    ? findVoucherByCode(voucherOrCode) 
    : voucherOrCode;

  if (!voucher) {
    return {
      valid: false,
      message: "Mã giảm giá không tồn tại hoặc đã bị xóa.",
      voucher: null,
      subtotal: numSubtotal,
      shippingFee: numShipping,
      discountAmount: 0,
      shippingDiscount: 0,
      finalShippingFee: numShipping,
      finalTotal: numSubtotal + numShipping
    };
  }

  // 1. Kiểm tra trạng thái kích hoạt & hạn sử dụng
  if (!isVoucherValidDate(voucher)) {
    return {
      valid: false,
      message: `Voucher "${voucher.code}" đã hết hạn sử dụng (${formatExpiryDate(voucher.validUntil)}).`,
      voucher,
      subtotal: numSubtotal,
      shippingFee: numShipping,
      discountAmount: 0,
      shippingDiscount: 0,
      finalShippingFee: numShipping,
      finalTotal: numSubtotal + numShipping
    };
  }

  const validFrom = voucher.validFrom ? new Date(voucher.validFrom).getTime() : NaN;
  if (voucher.validFrom && !Number.isFinite(validFrom)) {
    return {
      valid: false,
      message: `Thời gian áp dụng của voucher "${voucher.code}" không hợp lệ.`,
      voucher,
      subtotal: numSubtotal,
      shippingFee: numShipping,
      discountAmount: 0,
      shippingDiscount: 0,
      finalShippingFee: numShipping,
      finalTotal: numSubtotal + numShipping
    };
  }
  if (Number.isFinite(validFrom) && Date.now() < validFrom) {
    return {
      valid: false,
      message: `Voucher "${voucher.code}" chưa đến thời gian áp dụng.`,
      voucher,
      subtotal: numSubtotal,
      shippingFee: numShipping,
      discountAmount: 0,
      shippingDiscount: 0,
      finalShippingFee: numShipping,
      finalTotal: numSubtotal + numShipping
    };
  }

  // 2. Kiểm tra điều kiện giá trị đơn tối thiểu (minOrderAmount)
  const minRequired = voucher.minOrderAmount || 0;
  if (numSubtotal < minRequired) {
    return {
      valid: false,
      message: `Đơn hàng chưa đạt giá trị tối thiểu ${formatCurrency(minRequired)} để áp dụng mã "${voucher.code}".`,
      voucher,
      subtotal: numSubtotal,
      shippingFee: numShipping,
      discountAmount: 0,
      shippingDiscount: 0,
      finalShippingFee: numShipping,
      finalTotal: numSubtotal + numShipping
    };
  }

  // 3. Tiến hành tính toán giảm giá theo từng loại hình
  let discountAmount = 0;
  let shippingDiscount = 0;

  if (voucher.discountType === "percent") {
    // Giảm theo % trên tổng tiền hàng (subtotal)
    const rawDiscount = (numSubtotal * voucher.discountValue) / 100;
    
    // Nếu có mức giảm tối đa (maxDiscountAmount > 0) thì chặn trần
    if (voucher.maxDiscountAmount && voucher.maxDiscountAmount > 0) {
      discountAmount = Math.min(rawDiscount, voucher.maxDiscountAmount);
    } else {
      discountAmount = rawDiscount;
    }
    // Giảm giá tiền hàng không thể vượt quá subtotal
    discountAmount = Math.min(discountAmount, numSubtotal);

  } else if (voucher.discountType === "fixed") {
    // Giảm số tiền cố định trên subtotal
    discountAmount = Math.min(voucher.discountValue, numSubtotal);

  } else if (voucher.discountType === "shipping") {
    // Giảm phí vận chuyển (FREESHIP): Giảm tối đa mức quy định (ví dụ 30.000đ) hoặc bằng phí ship thực tế
    const maxShipDiscount = voucher.maxDiscountAmount || voucher.discountValue || 30000;
    shippingDiscount = Math.min(numShipping, maxShipDiscount);
  }

  // Đảm bảo số làm tròn nguyên VNĐ
  discountAmount = Math.round(discountAmount);
  shippingDiscount = Math.round(shippingDiscount);

  const finalShippingFee = Math.max(0, numShipping - shippingDiscount);
  const finalTotal = Math.max(0, (numSubtotal - discountAmount) + finalShippingFee);

  return {
    valid: true,
    message: `Áp dụng thành công mã "${voucher.code}"! Giảm ${formatCurrency(discountAmount + shippingDiscount)}.`,
    voucher,
    subtotal: numSubtotal,
    shippingFee: numShipping,
    discountAmount,
    shippingDiscount,
    finalShippingFee,
    finalTotal
  };
}

/**
 * Định dạng ngày ISO thành ngày tháng dễ đọc cho sinh viên
 * @param {string} isoString 
 * @returns {string} Ví dụ: 31/12/2026
 */
export function formatExpiryDate(isoString) {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Không thời hạn";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "Không thời hạn";
  }
}
