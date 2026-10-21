/**
 * Dữ liệu mẫu đánh giá sản phẩm (Reviews Data)
 * Khóa ngoại: productId liên kết với id của INITIAL_PRODUCTS (lhu_prod_xxx)
 */

export const INITIAL_REVIEWS = [
  {
    id: "rev_001",
    productId: "lhu_prod_001",
    userName: "Nguyễn Văn Hùng",
    userRole: "Sinh viên CNTT - K22",
    rating: 5,
    comment: "Balo rất chắc chắn, nhiều ngăn để laptop và tài liệu rộng rãi. Đi mưa nhẹ không lo bị ướt sách vở.",
    createdAt: "2026-10-15T08:30:00Z",
    helpfulCount: 12
  },
  {
    id: "rev_002",
    productId: "lhu_prod_001",
    userName: "Trần Thị Mai",
    userRole: "Sinh viên Dược - K23",
    rating: 4,
    comment: "Màu sắc đẹp, quai đeo êm vai. Giao hàng tại sảnh cơ sở 1 LHU rất nhanh và đúng hẹn.",
    createdAt: "2026-10-16T14:20:00Z",
    helpfulCount: 5
  },
  {
    id: "rev_003",
    productId: "lhu_prod_002",
    userName: "Lê Hoàng Phúc",
    userRole: "Sinh viên Cơ điện - K21",
    rating: 5,
    comment: "Chuột click cực êm, ngồi trong thư viện học đêm không sợ làm phiền người xung quanh. Pin dùng rất trâu.",
    createdAt: "2026-10-17T09:15:00Z",
    helpfulCount: 8
  },
  {
    id: "rev_004",
    productId: "lhu_prod_003",
    userName: "Phạm Thu Thảo",
    userRole: "Sinh viên Ngôn ngữ Anh - K24",
    rating: 5,
    comment: "Tai nghe chống ồn tốt, học nghe IELTS rất rõ tiếng. Đệm tai êm đeo lâu không bị đau tai.",
    createdAt: "2026-10-18T16:45:00Z",
    helpfulCount: 14
  }
];
