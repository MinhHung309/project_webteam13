# Nhật Ký Phát Triển & Kiểm Thử (Prompt Log)

## Phiên bản: 0.1.0-alpha (Khởi tạo bộ khung dự án)
**Ngày thực hiện**: 20/10/2026  
**Người thực hiện**: Senior Frontend Developer (AI Pair Programmer) cùng nhóm 2 sinh viên LHU.

---

### 1. Mục Tiêu (Goal)
- Khởi tạo bộ khung chuẩn cho dự án **LHU E-Commerce** của nhóm 2 sinh viên.
- Tuân thủ nghiêm ngặt yêu cầu: Chỉ dùng **HTML5, CSS3, JavaScript thuần theo ES Modules**. Tuyệt đối không dùng React, Vue, jQuery, framework hay thư viện nặng.
- Thiết kế 5 phân hệ dự kiến: Mua sắm & Giỏ hàng, Đánh giá sản phẩm, Voucher, Theo dõi đơn hàng, Đấu giá.
- Tương thích 100% với **GitHub Pages** (đường dẫn tương đối, không dùng đường dẫn tuyệt đối bắt đầu bằng `/`).
- Dữ liệu tĩnh module kết hợp `localStorage`, chưa thêm backend hoặc API key.

---

### 2. Danh Sách Các File Tạo Mới & Chỉnh Sửa
| Tệp / Thư mục | Trạng thái | Mục đích |
|---|---|---|
| `.gitignore` | Cập nhật | Tinh chỉnh bỏ qua file tạm, OS rác, cấu hình IDE |
| `README.md` | Cập nhật | Mô tả tổng quan dự án, công nghệ, hướng dẫn chạy local & test responsive |
| `prompt_log.md` | Tạo mới | Nhật ký ghi nhận prompt, mục tiêu, test case và lỗi đã xử lý |
| `docs/architecture.md` | Tạo mới | Bản thiết kế kiến trúc kỹ thuật và định hướng 5 phân hệ |
| `css/variables.css` | Tạo mới | Design tokens (màu sắc, typography, spacing, shadows) & CSS Reset |
| `css/layout.css` | Tạo mới | Layout header, responsive navigation, footer |
| `css/components.css` | Tạo mới | UI components: hero banner, product cards, category cards, badge dev |
| `css/style.css` | Tạo mới | Entry CSS kết nối tất cả các file css |
| `js/data/products.js` | Tạo mới | Dữ liệu danh mục và sản phẩm mẫu ban đầu |
| `js/utils/storage.js` | Tạo mới | Tiện ích định dạng tiền tệ `formatCurrency` & xử lý an toàn `localStorage` |
| `js/modules/nav.js` | Tạo mới | Xử lý sự kiện mở menu mobile & đọc số lượng giỏ hàng ban đầu |
| `js/pages/home.js` | Tạo mới | Logic render tự động danh mục và sản phẩm nổi bật ra trang chủ |
| `js/main.js` | Tạo mới | Entry point chính của ứng dụng bằng ES Modules |
| `index.html` | Tạo mới | Trang chủ khung đầy đủ semantic HTML |
| `pages/products.html` | Tạo mới | Trang khung Phân hệ Sản phẩm & Đánh giá |
| `pages/cart.html` | Tạo mới | Trang khung Phân hệ Giỏ hàng |
| `pages/vouchers.html` | Tạo mới | Trang khung Phân hệ Voucher |
| `pages/order-tracking.html` | Tạo mới | Trang khung Phân hệ Theo dõi đơn hàng |
| `pages/auction.html` | Tạo mới | Trang khung Phân hệ Đấu giá |

---

### 3. Kết Quả Kiểm Thử (Testing Results)

#### A. Kiểm tra cấu trúc & tính tương thích GitHub Pages
- **Đường dẫn tài nguyên**: Mọi file `index.html` và file trong thư mục `pages/` đều sử dụng đường dẫn tương đối (`./css/style.css`, `../css/style.css`, `./js/main.js`, `../js/main.js`). Khi triển khai trên GitHub Pages dưới đường dẫn sub-directory repo (ví dụ: `https://minhhung309.github.io/project_webteam13/`), đường dẫn không bị gãy như khi dùng root-slash `/css/...`.
- **CORS & ES Modules**: Các file JS đều khai báo dạng `type="module"`. Đã ghi rõ trong tài liệu cần chạy qua Local HTTP Server (Live Server, Python HTTP Server) để tránh bị trình duyệt chặn cross-origin request khi mở file trực tiếp.

#### B. Kiểm tra Responsive & Layout
- **CSS Grid & Flexbox**: Sử dụng thuộc tính `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))` cho lưới sản phẩm và `repeat(auto-fill, minmax(180px, 1fr))` cho danh mục giúp tự co giãn linh hoạt mà không bị tràn màn hình (overflow horizontal).
- **Navigation trên Mobile**: Media query `@media (max-width: 768px)` tự động ẩn thanh menu ngang và hiển thị nút toggle ☰, điều khiển bật tắt class `.is-open` qua `js/modules/nav.js`.

#### C. Tính trung thực & Minh bạch chức năng
- Mọi nút bấm chưa có logic nghiệp vụ (như xem chi tiết sản phẩm, giỏ hàng) đều kèm thông báo rõ ràng "Chức năng đang phát triển".
- Trên giao diện có gắn thẻ nhãn `badge-dev` màu xám "Đang phát triển" để người dùng và giảng viên chấm bài biết rõ phạm vi giai đoạn 1.

---

### 4. Lỗi Đã Sửa & Lưu Ý
- **Lưu ý đường dẫn tương đối trong CSS import**: Trong `css/style.css`, các import sử dụng `./variables.css`, `./layout.css`, `./components.css` để bảo đảm trình duyệt nạp đúng stylesheet dù ở cấp thư mục nào.
- **Fallback ảnh hỏng**: Đã thêm thuộc tính `onerror="this.src='...';"` trên thẻ ảnh sản phẩm để hiển thị placeholder chuẩn nếu đường dẫn internet bị gián đoạn.

---

## Phiên bản: 0.1.1-alpha (Tối ưu hóa & Thiết kế lại Hero Section)
**Ngày thực hiện**: 20/10/2026  
**Mục tiêu**: Khắc phục lỗi nội dung banner dính sát mép viền, phối lại màu thương hiệu LHU theo phong cách Modern University E-Commerce và tối ưu responsive từ 375px đến 1440px.

### 1. Nguyên nhân lỗi trước đó
- Class `.hero-section` trước đó dùng `padding: var(--spacing-2xl) 0;` (padding trái và phải bằng `0`), dẫn đến việc nội dung `.hero-content` bị chạm trực tiếp vào cạnh trái của banner.
- Banner dùng gradient xanh dương bão hòa cao (`#0056b3` đến `#1e3a8a`), chưa đúng với bảng màu nhận diện hiện đại.
- Nút CTA phụ dùng inline-style viền trắng đơn giản, chưa đồng bộ chiều cao và thiếu hiệu ứng hover chuẩn design system.

### 2. Các chỉnh sửa đã thực hiện
- `css/variables.css`: Cập nhật bảng màu LHU chuẩn (`--primary: #0D5DB8`, `--deep-blue: #123B75`, `--primary-light: #EAF3FF`, `--light: #F5F8FC`, `--dark: #172B4D`), bổ sung biến `--border-radius-xl: 20px`.
- `index.html`: Cập nhật cấu trúc Hero gồm `hero-badge` mềm mại, tiêu đề, mô tả và hai nút CTA có class chuyên biệt (`hero-btn-primary`, `hero-btn-secondary`).
- `css/components.css`: 
  - Đặt `padding: 3.5rem 3.5rem;` cho desktop, tách hoàn toàn chữ khỏi viền banner.
  - Sử dụng gradient nhẹ nhàng giữa `#0D5DB8` và `#123B75`, bổ sung hiệu ứng ánh sáng mờ radial-gradient nền tăng chiều sâu.
---

## Phiên bản: 0.1.2-alpha (Redesign toàn diện Hero Section - Modern 2-Column Clean UI)
**Ngày thực hiện**: 20/10/2026  
**Mục tiêu**: Redesign Hero Section khắc phục triệt để tình trạng mảng xanh quá khổ, khoảng trống bên phải lớn, ngắt dòng tiêu đề bị xé nhỏ và thiếu tính cân bằng thị giác.

### 1. Phân tích & Vấn đề giải quyết
- **Khối màu xanh đậm khổng lồ**: Đã chuyển sang nền sáng tinh tế `linear-gradient(135deg, #ffffff 0%, var(--primary-light) 100%)` với viền mảnh `rgba(13, 93, 184, 0.12)`, hòa hợp hoàn hảo với background trang `#F4F7FB`.
- **Khoảng trống vô nghĩa bên phải**: Xây dựng bố cục 2 cột cân bằng (`grid-template-columns: 1.15fr 0.85fr`) với cột phải là showcase sản phẩm sinh viên LHU (Balo LHU thực tế từ dataset) kèm thẻ nổi bật Voucher sinh viên chồng lớp (layering) tạo chiều sâu UI SaaS/E-commerce chuyên nghiệp.
- **Tiêu đề bị xé đôi**: Cấu trúc lại tiêu đề với dòng 1 `"Chào mừng bạn đến với"` và dòng 2 nổi bật `<span class="hero-brand-name">LHU E-Commerce</span>` với `white-space: nowrap` trên màn hình lớn, giải quyết dứt điểm lỗi ngắt dòng bất hợp lý.
- **Chiều cao quá lớn**: Giảm chiều cao tổng thể của Hero từ hơn 550px xuống khoảng 380px–420px trên desktop, tạo sự thông thoáng kết nối liền mạch với danh mục sản phẩm bên dưới.
---

## Phiên bản: 0.1.3-alpha (Hoàn thiện hệ thống giao diện dùng chung - Shared Design System)
**Ngày thực hiện**: 20/10/2026  
**Mục tiêu**: Chuẩn hóa toàn bộ Design Tokens (CSS Variables), Typography, Header/Navigation, Footer, Product Cards, Buttons, Badges và Form Controls theo phong cách Modern University E-Commerce.

### 1. Nội dung chuẩn hóa
- **CSS Variables & Typography**:
  - Bổ sung tokens đầy đủ cho font weights (`regular`, `medium`, `semibold`, `bold`, `extrabold`).
  - Bổ sung tokens cho line-height (`tight`, `snug`, `base`, `relaxed`).
  - Thiết lập hệ thống shadows đa tầng (`--shadow-xs` đến `--shadow-xl`).
- **Hệ thống Nút bấm (Button System)**:
  - Cung cấp các biến thể: `.btn-primary`, `.btn-secondary`, `.btn-outline`.
  - Cung cấp các kích thước: `.btn-sm` (34px), mặc định (42px), `.btn-lg` (48px).
  - Trạng thái `:focus-visible`, hover nhấc nhẹ `transform: translateY(-1px)` và `:disabled` / `.btn-disabled`.
- **Hệ thống Nhãn (Badge System)**:
  - Cung cấp: `.badge-primary`, `.badge-dev`, `.badge-success`, `.badge-warning`, `.badge-accent`.
- **Hệ thống Biểu mẫu (Form Controls System)**:
  - Cung cấp: `.form-group`, `.form-label`, `.form-input`, `.form-select`, `.form-textarea`, `.form-help`, `.form-error` sẵn sàng cho các trang voucher, tracking, checkout và login mà không cần thư viện ngoài.
- **Header & Navigation**:
  - Nâng cấp logo LHU có icon bóng đổ gradient, active link highlight rõ ràng, menu hamburger toggle mượt mà và tự ẩn chữ giỏ hàng khi màn hình hẹp (< 600px).
- **Product Card & Category Card**:
  - Chuẩn hóa tỉ lệ ảnh 72% (~4:3), giới hạn độ dài tên sản phẩm 2 dòng với `-webkit-line-clamp`, xếp hạng sao nổi bật, nút "Chi tiết" đồng bộ `.btn-outline.btn-sm`.
---

## Phiên bản: 0.1.4-alpha (Thiết kế cấu trúc dữ liệu dùng chung 5 phân hệ)
**Ngày thực hiện**: 20/10/2026  
**Mục tiêu**: Xây dựng kiến trúc dữ liệu chuẩn cho 5 phân hệ (Sản phẩm, Đánh giá, Voucher, Đơn hàng, Đấu giá), tạo dataset mẫu nhỏ, quy ước ID, giao tiếp module, quy tắc LocalStorage và tiêu chí kiểm thử.

### 1. Các file tạo mới & cập nhật
- `js/data/reviews.js`: Tạo mới dữ liệu mẫu nhận xét và đánh giá sao (liên kết khóa ngoại `productId`).
- `js/data/vouchers.js`: Tạo mới danh sách voucher sinh viên hỗ trợ giảm giá cố định (`fixed`) và theo phần trăm (`percent`).
- `js/data/orders.js`: Tạo mới dữ liệu đơn hàng và lịch trình vận chuyển nội bộ các cơ sở LHU (CS1, CS2, KTX).
- `js/data/auctions.js`: Tạo mới dữ liệu phiên đấu giá đồ dùng sinh viên với bước giá tối thiểu (`stepPrice`) và lịch sử đặt giá thầu (`bids`).
- `js/utils/storage.js`: Mở rộng toàn bộ `STORAGE_KEYS` cho 5 phân hệ, bổ sung hàm `initializeStorageItem` và xử lý an toàn lỗi `QuotaExceededError`.
- `docs/data_architecture.md`: Bản đặc tả chi tiết toàn bộ Schema, sơ đồ Mermaid giao tiếp giữa các module, danh sách hàm giao tiếp và 6 test cases chuẩn.

---

## Prompt 03 — Phân hệ Theo dõi đơn hàng
**Ngày thực hiện**: 23/10/2026
**Mục tiêu**: Hoàn thiện tra cứu đơn hàng và lịch sử mua hàng demo, dùng lại khóa lưu `lhu_orders` và giữ nguyên dữ liệu các phân hệ khác.

### 1. File tạo mới và chỉnh sửa
- Tạo `js/pages/order-tracking.js`: kiểm tra/chuẩn hóa dữ liệu đơn hàng hiện có và legacy, tra cứu mã không tải lại trang, hiển thị timeline trạng thái, đếm ngược giao hàng và lọc lịch sử.
- Chỉnh `pages/order-tracking.html`: thay placeholder bằng khu vực tra cứu, kết quả chi tiết và lịch sử mua hàng có nhãn dữ liệu demo.
- Chỉnh `js/data/orders.js`: thêm năm đơn demo `LHU-2026-001` đến `LHU-2026-005` với dữ liệu và lịch sử trạng thái nhất quán; giữ lại các đơn legacy.
- Chỉnh `css/components.css`: bổ sung style riêng responsive cho trang, timeline trạng thái và lịch sử.
- Chỉnh `docs/data_architecture.md`: ghi lại cách tương thích schema legacy, snapshot giá và điểm tích hợp checkout tương lai.

### 2. Luồng hoạt động
- Lần đầu truy cập, dữ liệu mẫu được lưu ở `lhu_orders`; các lần sau chỉ bổ sung mã demo còn thiếu, không ghi đè đơn đang có.
- Trang chuẩn hóa cả schema mới và schema legacy; đơn lỗi được bỏ qua có cảnh báo và không dùng giá sản phẩm/voucher hiện tại để tính lại tổng tiền.
- Tra cứu bằng nút hoặc Enter, bỏ khoảng trắng thừa, hiển thị trạng thái lỗi rõ ràng khi trống/không tìm thấy; lịch sử hỗ trợ tìm mã, lọc trạng thái và mở đơn đã chọn.
- Countdown cập nhật mỗi giây, được dọn trước lần tra cứu mới và khi rời trang; đơn giao thành công hiển thị thông báo hoàn tất, đơn hủy ẩn countdown và không hiển thị tiếp các mốc giao hàng.
- Checkout chưa có trong repository; cần tích hợp sau bằng cách lưu snapshot đơn hoàn tất vào `lhu_orders`. Không chỉnh giỏ hàng hoặc công thức voucher.

---

### 3. Dữ liệu demo và kiểm thử
- Trạng thái mẫu: `LHU-2026-001` đang vận chuyển; `LHU-2026-002` đã xác nhận; `LHU-2026-003` đã giao; `LHU-2026-004` đang chuẩn bị; `LHU-2026-005` đã hủy.
- `git diff --check`: đạt, không phát hiện lỗi khoảng trắng trong diff.
- Chưa chạy test tương tác trình duyệt, responsive hoặc đối chiếu Cart/Review/Voucher; không đánh dấu các test này đạt khi chưa thực thi.

---

## Prompt 04 — Phân hệ Online Auction
**Ngày thực hiện**: 23/10/2026
**Mục tiêu**: Hoàn thiện sàn đấu giá demo tích hợp vào website hiện có; giữ nguyên dữ liệu và nghiệp vụ các phân hệ khác.

### 1. File tạo mới và chỉnh sửa
- Tạo `pages/auction-detail.html` và `pages/my-auctions.html`; thay nội dung placeholder tại `pages/auction.html` bằng danh sách phiên, tìm kiếm, lọc trạng thái và sắp xếp.
- Tạo `js/data/auction-demo.js` với sáu phiên demo có thời gian tương đối tại lần khởi tạo.
- Tạo `js/modules/auction.js` để chuẩn hóa dữ liệu, lưu biệt lập bằng `lhu_auction_sessions_v1`, tính trạng thái theo thời gian và kiểm tra/lưu giá đặt.
- Tạo `js/pages/auction-list.js`, `js/pages/auction-detail.js`, `js/pages/my-auctions.js` và `css/auction.css` cho giao diện responsive, countdown, lịch sử và kết quả người dùng demo.
- Không sửa `js/data/auctions.js` hay khóa cũ `lhu_auctions`; không thay đổi Cart, Review, Voucher hoặc Order Tracking.

### 2. Cấu trúc dữ liệu và quy tắc đặt giá
- Mỗi phiên gồm `id`, `productId`, `title`, `description`, `image`, `startingPrice`, `currentPrice`, `minimumIncrement`, `startTime`, `endTime`, `highestBidder` và `bidHistory`; trạng thái được tính từ `startTime`/`endTime`, không lưu trạng thái có thể hết hạn.
- Định danh `lhu-demo-user` ổn định trong trình duyệt. Giá phải là số nguyên an toàn, hữu hạn và dương; phải vượt giá hiện tại, đạt ít nhất `currentPrice + minimumIncrement`, phiên phải đang diễn ra và người dùng không được tự nâng giá khi đang dẫn đầu.
- Giá hiện tại và người dẫn đầu được chuẩn hóa từ mức giá cao nhất trong lịch sử. JSON hỏng/bản ghi không hợp lệ không ghi đè dữ liệu có sẵn; lỗi ghi localStorage được thông báo.
- Countdown tính lại từ timestamp tuyệt đối mỗi giây, cập nhật trạng thái khi hết hạn, và interval được dọn khi không còn cần thiết hoặc rời trang. Các tab cùng origin lắng nghe sự kiện `storage`.

### 3. Lỗi/điểm được khắc phục
- Dữ liệu auction legacy chỉ có hai phiên và thời điểm cố định; giữ nguyên schema cũ nhưng tách dữ liệu demo mới, tránh phiên mẫu đồng loạt hết hạn hoặc ghi đè storage cũ.
- Tránh việc refresh làm đặt lại giá/lịch sử: khởi tạo một lần và tái sử dụng phiên đã lưu; trạng thái luôn được tính lại từ thời gian bắt đầu/kết thúc.
- Chặn giá thập phân/không hữu hạn/không hợp lệ, giá dưới bước tối thiểu, tự nâng giá khi đang dẫn đầu và đặt giá sau hạn; đối chiếu current price với lịch sử đã lưu.
- Dùng `textContent`/DOM API khi render dữ liệu động để không diễn giải tên người đặt giá hoặc nội dung phiên thành HTML.

### 4. Kiểm thử đã thực hiện
- Kiểm tra chẩn đoán VS Code trên các file JavaScript, HTML và CSS của module: không phát hiện lỗi.
- Chưa chạy kiểm thử tương tác trình duyệt, reload/countdown, localStorage đa tab, đặt giá, responsive mobile hoặc hồi quy Cart/Review/Voucher/Order Tracking; các nội dung này chưa được đánh dấu đạt.

### 5. Hạn chế và tích hợp tiếp theo
- Đây là mô phỏng phía trình duyệt, không có đăng nhập thật, backend, khóa giao dịch đồng thời, đồng bộ thiết bị hoặc bảo đảm chống chỉnh sửa localStorage.
- Nhóm có thể bổ sung liên kết "Đấu giá của tôi" vào điều hướng chung nếu muốn hiển thị trên mọi trang; hiện người dùng truy cập mục này từ trang Sàn đấu giá.
- Giao diện hiện dùng ảnh demo từ Unsplash; có thể thay bằng tài sản nội bộ trước khi triển khai nếu cần hoạt động hoàn toàn offline.
