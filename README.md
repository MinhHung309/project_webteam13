# LHU E-Commerce Platform

Dự án website thương mại điện tử sinh viên Đại học Lạc Hồng, được phát triển bởi nhóm 2 sinh viên với định hướng module hóa, giao diện hiện đại và hoạt động độc lập trên môi trường Web tĩnh (Static Web).

## 🚀 Công Nghệ Sử Dụng

- **Ngôn ngữ cốt lõi**: HTML5 Semantic & CSS3 Hiện đại.
- **JavaScript**: Vanilla JavaScript theo chuẩn **ES Modules** (`import` / `export`), không dùng thư viện hay framework (không React, Vue, Angular, jQuery).
- **Layout & Responsive**: CSS Grid, Flexbox, CSS Custom Properties (CSS Variables), Mobile-first.
- **Quản lý dữ liệu**: Dữ liệu JavaScript/JSON tĩnh kết hợp Client-side `localStorage`. Không dùng backend hoặc external API key trong giai đoạn này.
- **Triển khai**: Tương thích hoàn toàn với **GitHub Pages** (sử dụng 100% đường dẫn tương đối).

## 🎯 5 Phân Hệ Định Hướng Phát Triển

1. **Mua sắm & Giỏ hàng**: Xem sản phẩm, tìm kiếm/bộ lọc, thêm vào giỏ, cập nhật số lượng và tính tiền.
2. **Đánh giá sản phẩm**: Xếp hạng sao (Rating) và nhận xét của sinh viên cho từng vật phẩm.
3. **Kho Voucher**: Quản lý mã giảm giá sinh viên, áp dụng trừ phần trăm hoặc số tiền cố định.
4. **Theo dõi đơn hàng**: Kiểm tra hành trình đơn hàng theo mã vận đơn từ trạng thái đóng gói đến giao nhận.
5. **Sàn đấu giá**: Không gian đấu giá đồ dùng học tập cũ, tự động cập nhật giá thầu cao nhất và đếm ngược.

*Lưu ý: Ở phiên bản bộ khung hiện tại, các chức năng phức tạp được gắn nhãn "Đang phát triển" minh bạch và chưa đưa vào hoạt động logic đầy đủ.*

## 📁 Cấu Trúc Thư Mục

```text
project_webteam13/
├── index.html                  # Trang chủ khung
├── .gitignore                  # Bỏ qua file rác, IDE
├── README.md                   # Giới thiệu & hướng dẫn
├── prompt_log.md               # Nhật ký phát triển & kiểm thử
├── assets/                     # Tài nguyên tĩnh
├── css/                        # CSS nền tảng & layout
│   ├── style.css               # Điểm nhập CSS
│   ├── variables.css           # Biến màu, font, spacing
│   ├── layout.css              # Header, footer, navbar
│   └── components.css          # Cards, buttons, hero
├── js/                         # JavaScript thuần (ES Modules)
│   ├── main.js                 # Điểm nhập JS
│   ├── data/products.js        # Dữ liệu sản phẩm mẫu
│   ├── utils/storage.js        # LocalStorage & format tiền tệ
│   ├── modules/nav.js          # Menu di động & giỏ hàng
│   └── pages/home.js           # Render trang chủ
├── pages/                      # Khung các trang phân hệ
│   ├── products.html
│   ├── cart.html
│   ├── vouchers.html
│   ├── order-tracking.html
│   └── auction.html
└── docs/                       # Tài liệu thiết kế
    └── architecture.md
```

## 💻 Hướng Dẫn Chạy Local

Vì dự án sử dụng **JavaScript ES Modules** (`import` / `export`), trình duyệt yêu cầu bảo mật CORS nên **không thể mở trực tiếp bằng cách click đúp file `file:///.../index.html`**. Bạn cần chạy thông qua một HTTP Local Server đơn giản:

### Cách 1: Sử dụng VS Code Live Server (Khuyên dùng)
1. Cài đặt tiện ích mở rộng **Live Server** trên VS Code.
2. Mở thư mục dự án `project_webteam13` trong VS Code.
3. Nhấp chuột phải vào `index.html` và chọn **"Open with Live Server"** (hoặc nhấn nút "Go Live" ở góc dưới bên phải).
4. Trình duyệt sẽ tự động mở tại địa chỉ `http://127.0.0.1:5500/index.html`.

### Cách 2: Sử dụng Python
Nếu máy tính đã cài đặt Python, mở terminal tại thư mục dự án và chạy:
```bash
# Python 3
python -m http.server 8000
```
Sau đó truy cập: [http://localhost:8000](http://localhost:8000).

### Cách 3: Sử dụng Node.js (npx)
```bash
npx serve .
# hoặc
npx http-server .
```

## 📱 Hướng Dẫn Kiểm Tra Responsive

1. Mở website trên trình duyệt Chrome / Edge / Firefox.
2. Nhấn phím `F12` (hoặc `Ctrl + Shift + I`) để mở công cụ **Developer Tools**.
3. Nhấn tổ hợp phím `Ctrl + Shift + M` để kích hoạt chế độ **Device Toolbar** (mô phỏng thiết bị).
4. Chọn các mốc thiết bị:
   - **Mobile**: iPhone 14 Pro, Pixel 7, Samsung Galaxy (chiều rộng 360px - 430px) -> Kiểm tra nút bấm Menu Hamburger ☰, thẻ sản phẩm dạng đơn cột, menu trượt xuống.
   - **Tablet**: iPad Mini / iPad Air (chiều rộng 768px - 820px) -> Kiểm tra lưới sản phẩm hiển thị 2 - 3 cột, hero banner cân đối.
   - **Desktop**: 1200px trở lên -> Kiểm tra thanh menu ngang đầy đủ, lưới danh mục 4 - 5 cột, footer 4 cột.
