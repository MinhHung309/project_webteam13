/**
 * Dữ liệu mẫu đơn hàng (Orders Data)
 * Liên kết item với productId và lưu trữ thông tin voucher đã áp dụng
 */

export const INITIAL_ORDERS = [
  {
    id: "ord_20261019_001",
    orderCode: "LHU-ORD-8821",
    customer: {
      fullName: "Đặng Minh Quân",
      studentId: "122001452",
      phone: "0912345678",
      email: "quan.dm@lhu.edu.vn",
      campusAddress: "Phòng A203, Ký túc xá Cơ sở 2, ĐH Lạc Hồng"
    },
    items: [
      {
        productId: "lhu_prod_001",
        name: "Balo Sinh Viên LHU Chống Nước - Phiên Bản 2026",
        price: 249000,
        quantity: 1,
        subtotal: 249000
      }
    ],
    voucherApplied: {
      code: "LHUTANTHUDIEU",
      discountAmount: 30000
    },
    pricing: {
      subtotal: 249000,
      discount: 30000,
      shippingFee: 0,
      totalAmount: 219000
    },
    paymentMethod: "cod_campus", // 'cod_campus' | 'bank_transfer'
    status: "processing",        // 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled'
    timeline: [
      {
        status: "pending",
        title: "Đơn hàng đã được đặt",
        description: "Hệ thống đã tiếp nhận yêu cầu đặt hàng của bạn.",
        timestamp: "2026-10-19T08:15:00Z"
      },
      {
        status: "processing",
        title: "Đang đóng gói hàng",
        description: "Sinh viên điều phối đang chuẩn bị balo tại kho CLB.",
        timestamp: "2026-10-19T09:30:00Z"
      }
    ],
    createdAt: "2026-10-19T08:15:00Z",
    updatedAt: "2026-10-19T09:30:00Z"
  },
  {
    id: "ord_20261018_002",
    orderCode: "LHU-ORD-7714",
    customer: {
      fullName: "Nguyễn Lê Quỳnh Anh",
      studentId: "123002118",
      phone: "0987654321",
      email: "anh.nlq@lhu.edu.vn",
      campusAddress: "Bàn bảo vệ, Cơ sở 1 - ĐH Lạc Hồng (Số 10 Huỳnh Văn Nghệ)"
    },
    items: [
      {
        productId: "lhu_prod_002",
        name: "Chuột Không Dây Silent Click Ergonomic",
        price: 189000,
        quantity: 1,
        subtotal: 189000
      },
      {
        productId: "lhu_prod_004",
        name: "Sổ Tay Kế Hoạch Học Tập Bullet Journal A5",
        price: 75000,
        quantity: 2,
        subtotal: 150000
      }
    ],
    voucherApplied: null,
    pricing: {
      subtotal: 339000,
      discount: 0,
      shippingFee: 0,
      totalAmount: 339000
    },
    paymentMethod: "bank_transfer",
    status: "completed",
    timeline: [
      {
        status: "pending",
        title: "Đơn hàng đã được đặt",
        description: "Tiếp nhận đơn hàng thành công.",
        timestamp: "2026-10-18T10:00:00Z"
      },
      {
        status: "shipping",
        title: "Đang giao nội bộ",
        description: "Sinh viên hỗ trợ đang di chuyển giao hàng.",
        timestamp: "2026-10-18T14:00:00Z"
      },
      {
        status: "completed",
        title: "Đã giao hàng thành công",
        description: "Khách hàng đã nhận đủ sản phẩm tại bàn bảo vệ CS1.",
        timestamp: "2026-10-18T15:10:00Z"
      }
    ],
    createdAt: "2026-10-18T10:00:00Z",
    updatedAt: "2026-10-18T15:10:00Z"
  }
];
