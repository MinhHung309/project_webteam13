/**
 * Dữ liệu mẫu phiên đấu giá sinh viên (Auctions Data)
 * Quản lý giá khởi điểm, bước giá tối thiểu, giá thầu hiện tại và danh sách lịch sử bids
 */

export const INITIAL_AUCTIONS = [
  {
    id: "auc_001",
    title: "Máy Tính Khoa Học Casio fx-580VN X (Đã qua sử dụng 1 kỳ)",
    category: "Dụng cụ học tập",
    seller: {
      name: "Trần Bảo Long",
      studentId: "121003412",
      faculty: "Khoa Điện - Điện tử"
    },
    imageUrl: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80",
    description: "Máy còn nguyên tem bảo hành, phím bấm nhạy, nắp trượt đầy đủ, hỗ trợ giải toán cao cấp và xác suất thống kê.",
    startingPrice: 200000,       // Giá khởi điểm: 200.000 ₫
    currentPrice: 320000,        // Giá hiện tại: 320.000 ₫
    stepPrice: 20000,            // Bước giá tối thiểu: 20.000 ₫
    buyNowPrice: 450000,         // Giá mua ngay: 450.000 ₫
    startTime: "2026-10-18T08:00:00Z",
    endTime: "2026-10-25T20:00:00Z",
    status: "active",            // 'upcoming' | 'active' | 'ended' | 'cancelled'
    bids: [
      {
        bidId: "bid_001_1",
        bidderName: "Nguyễn V. Nam",
        bidderMasked: "Nguyễn V. N***",
        amount: 240000,
        timestamp: "2026-10-18T10:30:00Z"
      },
      {
        bidId: "bid_001_2",
        bidderName: "Lê Thị Hoa",
        bidderMasked: "Lê Thị H***",
        amount: 280000,
        timestamp: "2026-10-19T14:15:00Z"
      },
      {
        bidId: "bid_001_3",
        bidderName: "Hoàng Minh Trí",
        bidderMasked: "Hoàng Minh T***",
        amount: 320000,
        timestamp: "2026-10-20T11:00:00Z"
      }
    ]
  },
  {
    id: "auc_002",
    title: "Bộ Giáo Trình Lập Trình Web & CSDL SQL Server Kèm Bài Tập Lớn",
    category: "Sách & Giáo trình",
    seller: {
      name: "Ngô Quốc Huy",
      studentId: "120001559",
      faculty: "Khoa CNTT"
    },
    imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    description: "Sách còn mới 95%, đã ghi chú sẵn các dạng câu hỏi thi cuối kỳ và đề cương ôn tập môn Web & CSDL.",
    startingPrice: 50000,
    currentPrice: 80000,
    stepPrice: 10000,
    buyNowPrice: 150000,
    startTime: "2026-10-19T07:00:00Z",
    endTime: "2026-10-26T18:00:00Z",
    status: "active",
    bids: [
      {
        bidId: "bid_002_1",
        bidderName: "Trương Văn Đạt",
        bidderMasked: "Trương Văn Đ***",
        amount: 60000,
        timestamp: "2026-10-19T09:00:00Z"
      },
      {
        bidId: "bid_002_2",
        bidderName: "Vũ Hải Yến",
        bidderMasked: "Vũ Hải Y***",
        amount: 80000,
        timestamp: "2026-10-20T08:20:00Z"
      }
    ]
  }
];
