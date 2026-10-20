# Kiến Trúc Dự Án LHU E-Commerce

## 1. Giới thiệu tổng quan
Dự án LHU E-Commerce được xây dựng bởi nhóm 2 sinh viên trường Đại học Lạc Hồng, định hướng là một nền tảng thương mại điện tử phục vụ sinh viên trao đổi, mua sắm đồ dùng học tập, phụ kiện công nghệ, săn voucher và đấu giá đồ cũ.

## 2. Tiêu chuẩn kỹ thuật
- **Ngôn ngữ**: HTML5 Semantic, CSS3 Hiện đại, JavaScript thuần (Vanilla JS).
- **Mô hình Module**: JavaScript ES Modules (`import` / `export`), không sử dụng bundler hay framework nặng.
- **Styling**: CSS Custom Properties (CSS Variables), CSS Grid, Flexbox, hỗ trợ đa màn hình (Mobile, Tablet, Desktop) không cần thư viện bên ngoài (Bootstrap hay Tailwind).
- **Lưu trữ dữ liệu**: Dữ liệu tĩnh ban đầu (`js/data/products.js`) kết hợp Client-side Storage (`localStorage`), chưa tích hợp backend hoặc API ngoài.
- **Tương thích hosting**: GitHub Pages với đường dẫn tương đối (`./` và `../`), sẵn sàng hoạt động ở cả root domain hoặc subpath repository (`/project_webteam13/`).

## 3. Cấu trúc thư mục
```text
project_webteam13/
├── index.html                  # Trang chủ khung của dự án
├── .gitignore                  # Cấu hình bỏ qua tệp tạm/IDE
├── README.md                   # Mô tả dự án và hướng dẫn chạy
├── prompt_log.md               # Nhật ký prompt, thay đổi và kiểm thử
├── assets/                     # Tài nguyên hình ảnh, biểu tượng (sẽ bổ sung)
├── css/
│   ├── style.css               # Entry file CSS import các module css
│   ├── variables.css           # Design tokens: màu sắc, typography, spacing
│   ├── layout.css              # Header, responsive nav, container, footer
│   └── components.css          # Cards, buttons, badges, banners, placeholders
├── js/
│   ├── main.js                 # Entry point JavaScript
│   ├── data/
│   │   └── products.js         # Dữ liệu tĩnh danh mục và sản phẩm mẫu
│   ├── utils/
│   │   └── storage.js          # Helper format tiền tệ & LocalStorage an toàn
│   ├── modules/
│   │   └── nav.js              # Module điều hướng & mobile menu toggle
│   └── pages/
│       └── home.js             # Render giao diện trang chủ động
├── pages/                      # Khung các trang tương ứng 5 phân hệ
│   ├── products.html           # Phân hệ mua sắm & đánh giá
│   ├── cart.html               # Phân hệ giỏ hàng
│   ├── vouchers.html           # Phân hệ voucher
│   ├── order-tracking.html     # Phân hệ theo dõi đơn hàng
│   └── auction.html            # Phân hệ đấu giá
└── docs/
    └── architecture.md         # Tài liệu kiến trúc dự án
```

## 4. Định hướng 5 Phân hệ cốt lõi
1. **Mua sắm & Giỏ hàng**: Hiển thị sản phẩm, thêm/bớt/xóa trong giỏ hàng, tính tổng tiền và lưu trữ giỏ hàng liên tục qua `localStorage`.
2. **Đánh giá sản phẩm**: Cho phép người dùng để lại bình luận và đánh giá số sao cho từng mã sản phẩm.
3. **Hệ thống Voucher**: Nhập mã giảm giá, kiểm tra điều kiện áp dụng và giảm trừ trực tiếp trên tổng đơn giỏ hàng.
4. **Theo dõi đơn hàng**: Nhập mã đơn (Order Code) để hiển thị lịch trình trạng thái: Chờ xử lý -> Đang đóng gói -> Đang giao -> Đã hoàn thành.
5. **Sàn đấu giá**: Mô phỏng phiên đấu giá trực tiếp, đặt bước giá tối thiểu và đếm ngược thời gian kết thúc.
