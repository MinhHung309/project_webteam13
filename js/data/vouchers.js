/**
 * Dữ liệu mẫu danh sách Voucher giảm giá (Vouchers Data)
 * Phân hệ 3 - Kho Voucher & Ưu Đãi (Discount/Voucher Hub)
 * 
 * Hỗ trợ 3 loại giảm giá:
 * - 'percent': Giảm theo % giá trị tạm tính (subtotal), có chặn mức tối đa maxDiscountAmount
 * - 'fixed': Giảm số tiền cố định trên tổng tiền hàng
 * - 'shipping': Giảm trực tiếp vào phí vận chuyển, có chặn mức tối đa maxDiscountAmount
 */

export const INITIAL_VOUCHERS = [
  {
    id: "vouch_001",
    code: "LHU2026",
    title: "Ưu Đãi Tân Sinh Viên LHU 2026",
    description: "Giảm ngay 10% tổng tiền hàng cho mọi đơn hàng đủ điều kiện sinh viên ĐH Lạc Hồng.",
    discountType: "percent",       // 'percent' | 'fixed' | 'shipping'
    discountValue: 10,            // 10%
    minOrderAmount: 0,            // Không giới hạn đơn tối thiểu
    maxDiscountAmount: 0,         // 0: Không giới hạn mức giảm tối đa
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z", // Còn hạn
    usageLimit: 500,
    usedCount: 142,
    isActive: true,
    categoryBadge: "Toàn sàn"
  },
  {
    id: "vouch_002",
    code: "WELCOME50",
    title: "Quà Tặng Thành Viên Mới",
    description: "Giảm 50.000 ₫ trực tiếp cho đơn hàng có giá trị tạm tính từ 500.000 ₫ trở lên.",
    discountType: "fixed",
    discountValue: 50000,
    minOrderAmount: 500000,       // Tối thiểu 500.000đ
    maxDiscountAmount: 50000,
    validFrom: "2026-02-01T00:00:00Z",
    validUntil: "2026-11-30T23:59:59Z", // Còn hạn
    usageLimit: 200,
    usedCount: 78,
    isActive: true,
    categoryBadge: "Thành viên mới"
  },
  {
    id: "vouch_003",
    code: "FREESHIP",
    title: "Miễn Phí Vận Chuyển Toàn Trường",
    description: "Giảm 100% phí vận chuyển, mức giảm tối đa 30.000 ₫ cho các đơn giao tại các cơ sở LHU.",
    discountType: "shipping",
    discountValue: 30000,
    minOrderAmount: 100000,       // Tối thiểu 100.000đ
    maxDiscountAmount: 30000,     // Tối đa 30.000đ phí ship
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z", // Còn hạn
    usageLimit: 1000,
    usedCount: 421,
    isActive: true,
    categoryBadge: "Vận chuyển"
  },
  {
    id: "vouch_004",
    code: "SALE20",
    title: "Đại Tiệc Mua Sắm Học Tập",
    description: "Giảm 20% tổng tiền hàng (tối đa 100.000 ₫) áp dụng cho đơn từ 300.000 ₫.",
    discountType: "percent",
    discountValue: 20,
    minOrderAmount: 300000,       // Tối thiểu 300.000đ
    maxDiscountAmount: 100000,    // Tối đa 100.000đ
    validFrom: "2026-03-01T00:00:00Z",
    validUntil: "2026-12-15T23:59:59Z", // Còn hạn
    usageLimit: 150,
    usedCount: 65,
    isActive: true,
    categoryBadge: "Flash Sale"
  },
  {
    id: "vouch_005",
    code: "LHUSTUDENT30",
    title: "Trợ Giá Mùa Thi Sinh Viên",
    description: "Giảm 30.000 ₫ cho đơn hàng sách giáo trình và dụng cụ học tập từ 150.000 ₫.",
    discountType: "fixed",
    discountValue: 30000,
    minOrderAmount: 150000,
    maxDiscountAmount: 30000,
    validFrom: "2026-04-01T00:00:00Z",
    validUntil: "2026-10-31T23:59:59Z", // Còn hạn
    usageLimit: 300,
    usedCount: 110,
    isActive: true,
    categoryBadge: "Sinh viên LHU"
  },
  {
    id: "vouch_006",
    code: "EXPIRED2025",
    title: "Ưu Đãi Tuần Lễ Chào K25 (Dữ liệu mẫu đã hết hạn)",
    description: "Mã giảm giá mẫu dùng để kiểm thử trạng thái hết hạn và thông báo từ chối áp dụng.",
    discountType: "percent",
    discountValue: 15,
    minOrderAmount: 100000,
    maxDiscountAmount: 40000,
    validFrom: "2025-09-01T00:00:00Z",
    validUntil: "2025-10-01T23:59:59Z", // ĐÃ HẾT HẠN (Demo)
    usageLimit: 100,
    usedCount: 100,
    isActive: false,
    categoryBadge: "Hết hạn (Demo)"
  }
];
