import { findProductById, getCart } from "./cart.js";
import { calculateVoucherDiscount } from "../modules/vouchers.js";

export const DEFAULT_SHIPPING_FEE = 30000;
export const DEFAULT_TAX_AMOUNT = 0;

export function calculateCartPricing(
  cart = getCart(),
  voucherCode = "",
  shippingFee = DEFAULT_SHIPPING_FEE,
  taxAmount = DEFAULT_TAX_AMOUNT
) {
  const items = cart.map(item => ({
    item,
    product: findProductById(item.productId)
  })).filter(line => line.product);
  const subtotal = items.reduce((sum, { item, product }) => {
    const price = Number(product.price);
    return Number.isFinite(price) && price >= 0 ? sum + price * item.quantity : sum;
  }, 0);
  const safeShippingFee = Math.max(0, Number(shippingFee) || 0);
  const safeTaxAmount = Math.max(0, Number(taxAmount) || 0);
  const voucherResult = voucherCode
    ? calculateVoucherDiscount(voucherCode, subtotal, safeShippingFee)
    : null;
  const validVoucher = voucherResult?.valid ? voucherResult : null;
  const discount = validVoucher?.discountAmount || 0;
  const shippingDiscount = validVoucher?.shippingDiscount || 0;
  const finalShippingFee = validVoucher?.finalShippingFee ?? safeShippingFee;
  const grandTotal = Math.max(0, subtotal - discount + safeTaxAmount + finalShippingFee);
  const unavailableItems = items.filter(({ product }) => product.inStock === false);
  const invalidPriceItems = items.filter(({ product }) =>
    !Number.isFinite(Number(product.price)) || Number(product.price) < 0
  );

  return {
    items,
    subtotal,
    discount,
    shippingFee: safeShippingFee,
    shippingDiscount,
    finalShippingFee,
    taxAmount: safeTaxAmount,
    grandTotal,
    voucher: validVoucher?.voucher || null,
    voucherResult,
    unavailableItems,
    invalidPriceItems
  };
}
