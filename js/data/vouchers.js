/**
 * Dữ liệu mẫu danh sách Voucher giảm giá (Vouchers Data)
 * Hỗ trợ 2 hình thức: giảm tiền cố định (fixed) và giảm theo phần trăm (percent)
 */

export const INITIAL_VOUCHERS = [
  {
    id: "vouch_001",
    code: "LHUTANTHUDIEU",
    title: "Chào đón Tân sinh viên LHU 2026",
    description: "Giảm 30.000 ₫ cho mọi đơn hàng từ 150.000 ₫",
    discountType: "fixed",       // 'percent' | 'fixed'
    discountValue: 30000,        // Số tiền giảm hoặc phần trăm
    minOrderAmount: 150000,      // Giá trị đơn hàng tối thiểu
    maxDiscountAmount: 30000,    // Mức giảm tối đa áp dụng
    validFrom: "2026-10-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    usageLimit: 100,
    usedCount: 24,
    isActive: true
  },
  {
    id: "vouch_002",
    code: "LHUSALE10",
    title: "Ưu đãi Đồ dùng học tập",
    description: "Giảm 10% cho đơn hàng phụ kiện & sách vở từ 100.000 ₫ (Tối đa 50.000 ₫)",
    discountType: "percent",
    discountValue: 10,
    minOrderAmount: 100000,
    maxDiscountAmount: 50000,
    validFrom: "2026-10-10T00:00:00Z",
    validUntil: "2026-11-30T23:59:59Z",
    usageLimit: 50,
    usedCount: 15,
    isActive: true
  },
  {
    id: "vouch_003",
    code: "FREESHIPLHU",
    title: "Miễn phí giao hàng nội bộ LHU",
    description: "Miễn phí vận chuyển tận tay tại tất cả cơ sở thuộc ĐH Lạc Hồng",
    discountType: "fixed",
    discountValue: 15000,
    minOrderAmount: 50000,
    maxDiscountAmount: 15000,
    validFrom: "2026-10-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    usageLimit: 200,
    usedCount: 88,
    isActive: true
  }
];
