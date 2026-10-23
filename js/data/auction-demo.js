const createdAt = Date.now();
const hours = value => value * 60 * 60 * 1000;

function createBid(bidderId, bidderName, amount, ageInHours) {
  return {
    id: `${bidderId}-${amount}-${ageInHours}`,
    bidderId,
    bidderName,
    amount,
    timestamp: new Date(createdAt - hours(ageInHours)).toISOString()
  };
}

function createAuction(id, productId, title, description, image, startingPrice, minimumIncrement, startAgoHours, endInHours, bids) {
  return {
    id,
    productId,
    title,
    description,
    image,
    startingPrice,
    currentPrice: bids.length ? Math.max(...bids.map(bid => bid.amount)) : startingPrice,
    minimumIncrement,
    startTime: new Date(createdAt - hours(startAgoHours)).toISOString(),
    endTime: new Date(createdAt + hours(endInHours)).toISOString(),
    highestBidder: bids.length ? bids.reduce((top, bid) => bid.amount >= top.amount ? bid : top).bidderName : null,
    bidHistory: bids
  };
}

export const DEMO_AUCTIONS = [
  createAuction("AUC001", "lhu_prod_001", "Balo sinh viên LHU chống nước", "Balo Oxford bền đẹp, ngăn laptop 15 inch, đã sử dụng một học kỳ và còn trong tình trạng tốt.", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85", 180000, 20000, 48, 8, [
    createBid("demo-minh", "Minh Anh (Demo)", 200000, 30),
    createBid("demo-huy", "Quốc Huy", 240000, 18)
  ]),
  createAuction("AUC002", "lhu_prod_002", "Chuột không dây Silent Click", "Chuột công thái học, click êm, kèm đầu thu USB và pin mới.", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=85", 90000, 10000, 72, 30, [
    createBid("demo-lan", "Ngọc Lan", 100000, 42),
    createBid("demo-minh", "Minh Anh (Demo)", 120000, 22)
  ]),
  createAuction("AUC003", "lhu_prod_003", "Tai nghe Bluetooth chụp tai", "Tai nghe Bluetooth pin lâu, đệm tai êm, âm thanh rõ; ngoại hình còn đẹp.", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85", 250000, 25000, 12, 72, [
    createBid("demo-thao", "Phương Thảo", 275000, 6),
    createBid("demo-nam", "Hoàng Nam", 300000, 2)
  ]),
  createAuction("AUC004", "lhu_prod_004", "Bộ giáo trình lập trình Web", "Giáo trình HTML, CSS, JavaScript có ghi chú ôn tập; phù hợp sinh viên năm nhất.", "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=85", 50000, 10000, -5, 31, []),
  createAuction("AUC005", "lhu_prod_005", "Máy tính khoa học Casio fx-580VN X", "Máy tính còn hoạt động tốt, đủ nắp trượt, thích hợp học toán cao cấp và thống kê.", "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=900&q=85", 350000, 25000, 120, -36, [
    createBid("demo-linh", "Bảo Linh", 375000, 80),
    createBid("demo-minh", "Minh Anh (Demo)", 400000, 60),
    createBid("demo-tuan", "Minh Tuấn", 425000, 48)
  ]),
  createAuction("AUC006", "lhu_prod_006", "Đèn bàn LED học tập chống cận", "Đèn LED ba mức sáng, cổ xoay linh hoạt, dây nguồn và chân đế còn nguyên vẹn.", "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85", 80000, 10000, 20, 0.6, [
    createBid("demo-hanh", "Thu Hạnh", 90000, 12)
  ])
];
