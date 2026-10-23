/**
 * Tiện ích quản lý giỏ hàng (Cart Utils)
 * Sử dụng thuần ES Modules và LocalStorage, tương thích hoàn toàn với kiến trúc LHU E-Commerce.
 */

import { getStorageItem, setStorageItem, STORAGE_KEYS } from "./storage.js";
import { INITIAL_PRODUCTS } from "../data/products.js";

/**
 * Tên sự kiện CustomEvent phát ra khi giỏ hàng thay đổi trong cùng tab
 */
export const CART_UPDATED_EVENT = "lhu:cart-updated";

/**
 * Lấy danh sách tất cả sản phẩm có trong hệ thống (LocalStorage hoặc STATIC fallback)
 * @returns {Array<object>}
 */
export function getAllProducts() {
  const products = getStorageItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  if (Array.isArray(products) && products.length > 0) {
    return products;
  }
  return INITIAL_PRODUCTS;
}

/**
 * Tìm sản phẩm theo id
 * @param {string} productId 
 * @returns {object|null}
 */
export function findProductById(productId) {
  if (!productId) return null;
  const products = getAllProducts();
  return products.find(p => String(p.id) === String(productId)) || null;
}

/**
 * Lấy dữ liệu giỏ hàng hiện tại từ LocalStorage
 * Luôn trả về một mảng hợp lệ, lọc bỏ các phần tử hỏng/không hợp lệ
 * @returns {Array<{productId: string, quantity: number, price?: number, name?: string, imageUrl?: string}>}
 */
export function getCart() {
  const rawCart = getStorageItem(STORAGE_KEYS.CART, []);
  if (!Array.isArray(rawCart)) {
    return [];
  }

  // Chuẩn hóa và làm sạch dữ liệu giỏ hàng
  return rawCart
    .filter(item => item && typeof item === "object" && item.productId)
    .map(item => ({
      ...item,
      productId: String(item.productId),
      quantity: Math.max(1, parseInt(item.quantity, 10) || 1)
    }));
}

/**
 * Lưu dữ liệu giỏ hàng vào LocalStorage và phát thông báo cập nhật
 * @param {Array} cart 
 * @returns {boolean}
 */
function saveCart(cart) {
  const success = setStorageItem(STORAGE_KEYS.CART, cart);
  if (success && typeof window !== "undefined") {
    // Phát custom event cho các module cùng tab (như nav.js) lắng nghe cập nhật badge
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: { cart } }));
  }
  return success;
}

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {string} productId - ID sản phẩm cần thêm
 * @param {number} [quantity=1] - Số lượng thêm (mặc định là 1)
 * @returns {{success: boolean, message: string, cart: Array}}
 */
export function addToCart(productId, quantity = 1) {
  const validQty = parseInt(quantity, 10);
  if (isNaN(validQty) || validQty <= 0) {
    return {
      success: false,
      message: "Số lượng thêm vào giỏ hàng không hợp lệ.",
      cart: getCart()
    };
  }

  const product = findProductById(productId);
  if (!product) {
    return {
      success: false,
      message: `Không tìm thấy sản phẩm có mã '${productId}'.`,
      cart: getCart()
    };
  }

  const cart = getCart();
  const existingIndex = cart.findIndex(item => item.productId === String(productId));

  if (existingIndex > -1) {
    cart[existingIndex].quantity += validQty;
    // Đồng bộ lại thông tin giá / tên nếu cần
    cart[existingIndex].price = product.price;
    cart[existingIndex].name = product.name;
    cart[existingIndex].imageUrl = product.imageUrl;
  } else {
    cart.push({
      productId: String(product.id),
      quantity: validQty,
      price: product.price,
      name: product.name,
      imageUrl: product.imageUrl
    });
  }

  const saved = saveCart(cart);
  return {
    success: saved,
    message: saved ? "Thêm vào giỏ hàng thành công!" : "Không thể lưu giỏ hàng do lỗi bộ nhớ.",
    cart
  };
}

/**
 * Cập nhật số lượng của một sản phẩm trong giỏ hàng
 * Nếu quantity <= 0, tự động xóa sản phẩm khỏi giỏ hàng
 * @param {string} productId 
 * @param {number} quantity 
 * @returns {{success: boolean, message: string, cart: Array}}
 */
export function updateCartQuantity(productId, quantity) {
  const validQty = parseInt(quantity, 10);
  if (isNaN(validQty)) {
    return {
      success: false,
      message: "Số lượng cập nhật không hợp lệ.",
      cart: getCart()
    };
  }

  if (validQty <= 0) {
    return removeFromCart(productId);
  }

  const cart = getCart();
  const itemIndex = cart.findIndex(item => item.productId === String(productId));

  if (itemIndex === -1) {
    return {
      success: false,
      message: "Sản phẩm không có trong giỏ hàng.",
      cart
    };
  }

  cart[itemIndex].quantity = validQty;
  const saved = saveCart(cart);

  return {
    success: saved,
    message: saved ? "Cập nhật số lượng thành công!" : "Lỗi khi lưu giỏ hàng.",
    cart
  };
}

/**
 * Xóa một sản phẩm khỏi giỏ hàng
 * @param {string} productId 
 * @returns {{success: boolean, message: string, cart: Array}}
 */
export function removeFromCart(productId) {
  if (!productId) {
    return {
      success: false,
      message: "Mã sản phẩm không hợp lệ.",
      cart: getCart()
    };
  }

  const cart = getCart();
  const initialLength = cart.length;
  const updatedCart = cart.filter(item => item.productId !== String(productId));

  if (updatedCart.length === initialLength) {
    return {
      success: false,
      message: "Sản phẩm không tồn tại trong giỏ hàng.",
      cart
    };
  }

  const saved = saveCart(updatedCart);
  return {
    success: saved,
    message: saved ? "Đã xóa sản phẩm khỏi giỏ hàng." : "Lỗi khi cập nhật giỏ hàng.",
    cart: updatedCart
  };
}

/**
 * Xóa toàn bộ giỏ hàng
 * @returns {boolean}
 */
export function clearCart() {
  return saveCart([]);
}

/**
 * Lấy tổng số lượng tất cả sản phẩm (tổng các quantity)
 * @returns {number}
 */
export function getCartTotalQuantity() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.quantity || 0), 0);
}

/**
 * Tính tổng tiền tạm tính của giỏ hàng (subtotal)
 * Lấy giá từ sản phẩm hoặc thông tin lưu trong item
 * @returns {number}
 */
export function getCartTotal() {
  const cart = getCart();
  const products = getAllProducts();
  const productPriceMap = new Map(products.map(p => [String(p.id), p.price]));

  return cart.reduce((sum, item) => {
    // Ưu tiên giá mới nhất từ danh sách sản phẩm, nếu không thì lấy giá lưu trong cart
    const price = productPriceMap.has(item.productId) 
      ? productPriceMap.get(item.productId) 
      : (typeof item.price === "number" ? item.price : 0);
    return sum + price * (item.quantity || 1);
  }, 0);
}
