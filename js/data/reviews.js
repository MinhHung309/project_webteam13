/**
 * Dữ liệu đánh giá sản phẩm (Reviews Data)
 * Khóa ngoại: productId liên kết với id của INITIAL_PRODUCTS (lhu_prod_xxx)
 * Lưu ý: Dữ liệu khởi tạo mang tính minh họa giao diện mua sắm sinh viên,
 * không gắn nhãn chứng nhận mua hàng giả mạo.
 */

export const INITIAL_REVIEWS = [
  // Balo Sinh Viên LHU (lhu_prod_001)
  {
    id: "rev_001",
    productId: "lhu_prod_001",
    userName: "Nguyễn Văn Hùng",
    userRole: "Sinh viên CNTT - K22",
    rating: 5,
    comment: "Balo vải dày dặn và chống thấm nước tốt, mình đi mưa nhỏ từ cơ sở 1 sang cơ sở 2 tài liệu và laptop bên trong vẫn khô ráo. Ngăn chống sốc vừa khít con laptop 15.6 inch của mình, quai đeo êm.",
    createdAt: "2026-10-15T08:30:00Z",
    helpfulCount: 12
  },
  {
    id: "rev_002",
    productId: "lhu_prod_001",
    userName: "Trần Thị Mai",
    userRole: "Sinh viên Dược - K23",
    rating: 4,
    comment: "Kiểu dáng năng động, màu sắc phối đúng chuẩn nhận diện trường LHU. Form balo đứng dáng, đựng được nhiều sách giáo trình dày. Điểm trừ nhẹ là ngăn đựng bình nước hai bên hơi ôm sát bình giữ nhiệt to.",
    createdAt: "2026-10-16T14:20:00Z",
    helpfulCount: 5
  },
  {
    id: "rev_005",
    productId: "lhu_prod_001",
    userName: "Lê Minh Trí",
    userRole: "Sinh viên Ngôn ngữ Anh - K24",
    rating: 5,
    comment: "Khóa kéo mượt mà, đường chỉ may kỹ. Đợt tuần lễ sinh viên mua được giá ưu đãi 249k thấy rất đáng tiền.",
    createdAt: "2026-10-19T10:10:00Z",
    helpfulCount: 3
  },

  // Chuột Không Dây Silent Click (lhu_prod_002)
  {
    id: "rev_003",
    productId: "lhu_prod_002",
    userName: "Lê Hoàng Phúc",
    userRole: "Sinh viên Cơ điện - K21",
    rating: 5,
    comment: "Click hoàn toàn không phát ra tiếng động, cực kỳ thích hợp cho bạn nào hay ngồi tự học tại thư viện hoặc phòng tự học nhóm LHU. Form cầm ôm tay, kết nối ổn định không bị trễ chuột.",
    createdAt: "2026-10-17T09:15:00Z",
    helpfulCount: 8
  },
  {
    id: "rev_006",
    productId: "lhu_prod_002",
    userName: "Vũ Thùy Linh",
    userRole: "Sinh viên Quản trị Kinh doanh - K23",
    rating: 4,
    comment: "Chuột nhẹ, con lăn mượt. Mình dùng pin kèm theo được gần 3 tuần nay vẫn chưa báo yếu. Kích thước vừa vặn trong túi đựng phụ kiện laptop.",
    createdAt: "2026-10-20T11:40:00Z",
    helpfulCount: 4
  },

  // Tai Nghe Chống Ồn On-Ear (lhu_prod_003)
  {
    id: "rev_004",
    productId: "lhu_prod_003",
    userName: "Phạm Thu Thảo",
    userRole: "Sinh viên Quốc tế học - K24",
    rating: 5,
    comment: "Khả năng cách âm thụ động khá ấn tượng, bật chống ồn nghe giảng bài online hay luyện nghe tiếng Anh rất rõ và tập trung. Đệm tai êm ái, đeo liên tục 2-3 tiếng không bị đau vành tai.",
    createdAt: "2026-10-18T16:45:00Z",
    helpfulCount: 14
  },
  {
    id: "rev_007",
    productId: "lhu_prod_003",
    userName: "Đặng Hoàng Nam",
    userRole: "Sinh viên Kỹ thuật phần mềm - K22",
    rating: 4,
    comment: "Âm thanh cân bằng, bass vừa phải đủ dùng cho học tập và nghe podcast. Mic bắt giọng tương đối rõ khi họp nhóm qua Google Meet. Pin trâu đúng như mô tả.",
    createdAt: "2026-10-21T15:20:00Z",
    helpfulCount: 6
  },

  // Sổ Tay Kế Hoạch Bullet Journal A5 (lhu_prod_004)
  {
    id: "rev_008",
    productId: "lhu_prod_004",
    userName: "Bùi Ngọc Ánh",
    userRole: "Sinh viên Tài chính Ngân hàng - K23",
    rating: 5,
    comment: "Giấy 100gsm dày dặn, viết bút gel hay bút dạ quang highlight đều không bị thấm sang trang sau. Layout chia sẵn mục tiêu tuần và lịch thi cử rất tiện để theo dõi tiến độ môn học.",
    createdAt: "2026-10-22T08:05:00Z",
    helpfulCount: 9
  },
  {
    id: "rev_009",
    productId: "lhu_prod_004",
    userName: "Ngô Quốc Huy",
    userRole: "Sinh viên Logistics - K22",
    rating: 4,
    comment: "Bìa sổ cứng cáp, gáy sổ may chắc mở phẳng 180 độ dễ viết. Kích thước A5 vừa vặn bỏ balo mang lên giảng đường mỗi ngày.",
    createdAt: "2026-10-22T19:30:00Z",
    helpfulCount: 2
  }
];