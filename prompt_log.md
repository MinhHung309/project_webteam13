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
## PROMPT 01 — PHÁT TRIỂN PHÂN HỆ ĐÁNH GIÁ & PHẢN HỒI

Bạn là Senior Frontend Developer, hỗ trợ tôi phát triển dự án học phần Thiết kế Web LHU E-Commerce Hub.

Bối cảnh dự án

Repository dùng chung của nhóm: project_webteam13.

Tôi là thành viên B, chịu trách nhiệm phát triển các phân hệ chức năng.

Công nghệ bắt buộc: HTML5, CSS3, JavaScript thuần và ES Modules.

Dữ liệu demo sử dụng file dữ liệu tĩnh và localStorage; chưa có backend.

Không dùng React hoặc tự ý thêm framework.

Nhiệm vụ hiện tại

Chỉ phát triển phân hệ Đánh giá & Phản hồi khách hàng.

Trước khi code, kiểm tra cấu trúc thư mục, trang chi tiết sản phẩm, CSS dùng chung và module dữ liệu hiện tại.

Tái sử dụng giao diện, quy ước đặt tên, cấu trúc dữ liệu và hàm lưu trữ đã có.

Xây dựng giao diện chọn sao từ 1 đến 5, nhập bình luận và gửi đánh giá.

Khi gửi đánh giá hợp lệ, cập nhật danh sách ngay trên trang mà không tải lại trang.

Hiển thị số lượng đánh giá, điểm trung bình và biểu đồ thanh tỷ lệ đánh giá theo số sao.

Lưu đánh giá demo vào localStorage, gắn với ID sản phẩm và xử lý trường hợp dữ liệu lưu bị lỗi.

Tạo hoặc cập nhật trang lịch sử đánh giá nếu phù hợp với cấu trúc hiện tại.

Đảm bảo responsive, hỗ trợ bàn phím, có nhãn biểu mẫu và thông báo lỗi rõ ràng.

Không tạo đánh giá giả mạo dưới danh nghĩa người dùng thật. Dữ liệu mẫu phải được ghi rõ là dữ liệu demo.

Không chỉnh sửa chức năng giỏ hàng, voucher, theo dõi đơn hàng hoặc đấu giá.

Quy tắc làm việc

Trước khi sửa, hãy báo cáo các file dự kiến tạo hoặc thay đổi.

Giữ nguyên những thay đổi hiện có của nhóm.

Không xóa hoặc viết lại file dùng chung nếu không cần thiết.

Nếu chưa rõ cấu trúc dữ liệu hoặc cách điều hướng, hãy hỏi tôi thay vì tự đoán.

Sau khi code, hãy kiểm tra lỗi JavaScript, đường dẫn, localStorage và các trường hợp nhập liệu không hợp lệ.

Báo cáo các file đã sửa, cách kiểm thử, lỗi còn tồn tại và hướng dẫn chạy.

Không tự commit, push hoặc merge Git.
## PROMPT 02 — XÂY DỰNG MODULE VOUCHER & KHUYẾN MÃI

Bạn là Senior Frontend Developer chuyên HTML5, CSS3, JavaScript ES6 và phát triển website thương mại điện tử.

Tôi đang thực hiện đồ án môn Thiết kế Web tại Đại học Lạc Hồng, với repository project_webteam13.

Công nghệ dự án:

HTML5, CSS3, JavaScript thuần (ES Modules).

Không sử dụng React, Vue, Angular hoặc backend.

Dữ liệu mẫu được quản lý bằng JavaScript/JSON và localStorage.

Website có các module: Smart Shopping Cart, Review & Feedback, Voucher & Khuyến mãi, Order Tracking, Online Auction.

NHIỆM VỤ: Xây dựng module Discount/Voucher Hub — Voucher & Khuyến mãi và tích hợp vào cấu trúc website hiện có.

BƯỚC 1 — PHÂN TÍCH DỰ ÁN TRƯỚC KHI CODE

Kiểm tra toàn bộ cấu trúc thư mục hiện tại.

Xác định các trang, CSS, JavaScript, dữ liệu sản phẩm và giỏ hàng đã có.

Kiểm tra module Review & Feedback để tránh ghi đè hoặc làm hỏng chức năng.

Xác định cách website điều hướng giữa các trang.

Liệt kê các file dự kiến tạo mới hoặc chỉnh sửa trước khi triển khai.

Không tự ý xóa, thay thế hoặc viết lại toàn bộ website.

BƯỚC 2 — XÂY DỰNG TRANG VOUCHER HUB

Tạo trang Voucher & Khuyến mãi phù hợp với cấu trúc dự án.

Yêu cầu giao diện:

Tiêu đề nổi bật: "Kho Voucher & Ưu Đãi".

Banner khuyến mãi có hiệu ứng chuyển động bằng CSS.

Danh sách voucher hiển thị dạng card/grid responsive.

Mỗi voucher có:

Mã giảm giá.

Tên chương trình.

Mức giảm.

Điều kiện áp dụng.

Ngày hết hạn.

Trạng thái: Còn hạn, Đã hết hạn, Đã lưu.

Nút "Lưu voucher" hoặc "Sao chép mã".

Thiết kế viền voucher kiểu răng cưa/torn-edge bằng CSS hoặc pseudo-elements.

Hiệu ứng hover mượt, phù hợp phong cách website.

Responsive cho desktop, tablet và mobile.

BƯỚC 3 — DỮ LIỆU VOUCHER

Tạo dữ liệu voucher mẫu, tối thiểu gồm:

LHU2026: giảm 10% tổng tiền hàng.

WELCOME50: giảm 50.000đ cho đơn hàng từ 500.000đ.

FREESHIP: miễn phí vận chuyển tối đa 30.000đ.

SALE20: giảm 20%, tối đa 100.000đ, cho đơn hàng từ 300.000đ.

Mỗi voucher phải có cấu trúc dữ liệu rõ ràng, ví dụ:

code

title

description

discountType

discountValue

maxDiscount

minOrderValue

expiryDate

isActive

Sử dụng ngày hết hạn hợp lý để các voucher demo có thể được thử nghiệm. Nếu cần minh họa voucher hết hạn, phải ghi rõ đó là dữ liệu demo.

BƯỚC 4 — XỬ LÝ VOUCHER BẰNG JAVASCRIPT

Triển khai các chức năng:

Hiển thị danh sách voucher bằng JavaScript.

Tìm kiếm voucher theo mã hoặc tên.

Lọc voucher theo trạng thái.

Lưu voucher vào ví cá nhân bằng localStorage.

Không lưu trùng một voucher.

Cho phép sao chép mã voucher.

Hiển thị thông báo khi lưu hoặc sao chép thành công.

Kiểm tra voucher còn hiệu lực và đủ điều kiện áp dụng.

Hiển thị thông báo rõ ràng nếu mã sai, hết hạn hoặc chưa đủ giá trị đơn hàng.

Không cần tải lại trang khi người dùng tương tác.

Dữ liệu localStorage phải được xử lý an toàn khi rỗng, sai định dạng hoặc bị lỗi.

BƯỚC 5 — TÍCH HỢP VỚI GIỎ HÀNG / CHECKOUT

Nếu website đã có trang giỏ hàng hoặc thanh toán, hãy tích hợp ô nhập mã giảm giá.

Yêu cầu bắt buộc: Mã LHU2026 giảm đúng 10% tổng tiền hàng đủ điều kiện.

Ví dụ:

Tạm tính sản phẩm: 1.000.000đ.

Nhập LHU2026.

Tiền giảm: 100.000đ.

Tổng sau giảm (chưa tính phí khác): 900.000đ.

Quy tắc tính toán:

Tính giảm giá dựa trên subtotal sản phẩm, không dựa trên tổng đã cộng phí vận chuyển.

Tính lại tiền giảm khi số lượng sản phẩm thay đổi.

Không cho tổng thanh toán âm.

Mỗi đơn hàng chỉ áp dụng một voucher tại một thời điểm.

Tránh áp dụng giảm giá hai lần.

Đối với FREESHIP, giảm phí vận chuyển thực tế, tối đa 30.000đ.

Không thay đổi công thức thuế hiện tại nếu dự án đã có quy tắc thuế.

Nếu giỏ hàng chưa được triển khai, hãy xây dựng hàm kiểm tra và tính voucher độc lập để nhóm có thể tích hợp sau; không tự tạo lại toàn bộ module giỏ hàng.

BƯỚC 6 — TRANG VÍ VOUCHER CỦA TÔI

Tạo khu vực hoặc trang "Voucher của tôi", phù hợp với cấu trúc website.

Hiển thị:

Voucher đã lưu.

Voucher còn sử dụng được.

Voucher đã hết hạn.

Nút sao chép mã.

Trạng thái voucher.

Dữ liệu lưu trong localStorage với khóa có tiền tố riêng cho module voucher để không xung đột dữ liệu giỏ hàng và đánh giá.

BƯỚC 7 — CHẤT LƯỢNG CODE VÀ GIAO DIỆN

Code dễ đọc, chia hàm rõ ràng.

Ưu tiên tái sử dụng CSS, header, footer và component có sẵn.

Không dùng thư viện ngoài nếu không thực sự cần.

Không dùng inline JavaScript.

Hạn chế biến global.

Kiểm tra dữ liệu người dùng nhập vào.

Sử dụng textContent hoặc DOM API an toàn khi hiển thị dữ liệu động.

Bảo đảm các nút hoạt động thực sự.

Có thông báo lỗi/thành công thân thiện.

Không có lỗi JavaScript trong Console.

Bảo đảm khả năng sử dụng bằng bàn phím và nhãn form rõ ràng.

BƯỚC 8 — KIỂM THỬ

Kiểm tra tối thiểu các trường hợp:

Nhập LHU2026 với subtotal 1.000.000đ → giảm 100.000đ.

Nhập mã không tồn tại → thông báo lỗi.

Nhập voucher hết hạn → không cho áp dụng.

Đơn hàng chưa đạt mức tối thiểu → không cho áp dụng.

Lưu voucher hai lần → không bị trùng.

Tải lại trang → voucher đã lưu vẫn tồn tại.

Thay đổi số lượng trong giỏ → tổng giảm được cập nhật.

Xóa voucher đang áp dụng → tổng thanh toán trở lại bình thường.

Kiểm tra giao diện trên mobile.

Kiểm tra Review & Feedback và các trang hiện có vẫn hoạt động.

BƯỚC 9 — BÁO CÁO KẾT QUẢ

Sau khi hoàn thành, hãy cung cấp:

Danh sách file đã tạo hoặc chỉnh sửa.

Giải thích ngắn gọn cách hoạt động của module.

Hướng dẫn mở trang Voucher và kiểm thử.

Danh sách test case đã thực hiện và kết quả.

Những phần cần nhóm trưởng tích hợp thêm (nếu có).

Một đoạn tóm tắt quá trình dùng AI, lỗi phát sinh và cách sửa để tôi ghi vào prompt_log.md.

QUY TẮC QUAN TRỌNG:

Chỉ triển khai module Voucher & Khuyến mãi.

Không tự ý sửa hoặc xóa module Review & Feedback, Auction, Order Tracking.

Không ghi đè code của thành viên khác.

Không tự động commit, push, merge hoặc chuyển nhánh Git.

Nếu có xung đột với cấu trúc hiện tại, hãy hỏi trước khi chỉnh sửa.

Không khẳng định đã kiểm thử nếu chưa thực sự chạy kiểm thử.
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

---
## PROMPT 05 — HOÀN THIỆN SMART SHOPPING CART & CHECKOUT

Bạn là Senior Frontend Developer chuyên HTML5, CSS3, JavaScript ES6 và phát triển website thương mại điện tử.

Tôi đang thực hiện đồ án môn Thiết kế Web tại Đại học Lạc Hồng.

Repository: project_webteam13

Công nghệ:

HTML5, CSS3 responsive.

JavaScript thuần ES Modules.

Dữ liệu sản phẩm bằng JSON/JavaScript.

localStorage để lưu giỏ hàng và đơn hàng.

Không sử dụng React, Vue, Angular hoặc backend.

TÌNH TRẠNG HIỆN TẠI:

Trang "Giỏ Hàng Của Bạn" đang chỉ hiển thị thông báo:

"Phân hệ giỏ hàng và đặt hàng tương tác thông qua LocalStorage đang được nhóm hoàn thiện logic ở bước kế tiếp."

Và nhãn "Phân hệ Mua sắm & Giỏ hàng: Đang phát triển".

Tôi muốn thay thế giao diện tạm này bằng hệ thống giỏ hàng và đặt hàng có thể sử dụng được.

Website có các module:

Smart Shopping Cart.

Review & Feedback.

Voucher & Khuyến mãi.

Order Tracking.

Online Auction.

MỤC TIÊU: Hoàn thiện giỏ hàng, tính tiền, áp dụng voucher, checkout và tạo đơn hàng demo để người dùng có thể theo dõi đơn hàng sau khi đặt.

BƯỚC 1 — KIỂM TRA CODE HIỆN CÓ

Trước khi sửa code:

Kiểm tra cấu trúc thư mục dự án.

Xác định trang giỏ hàng đang hiển thị giao diện "Đang phát triển".

Xác định trang Home, Shop và Product Detail.

Kiểm tra nguồn dữ liệu sản phẩm hiện có.

Kiểm tra chức năng nút "Thêm vào giỏ hàng" nếu đã tồn tại.

Kiểm tra module Voucher và hàm tính giảm giá.

Kiểm tra module Order Tracking và cấu trúc dữ liệu đơn hàng.

Kiểm tra cách dự án đang sử dụng localStorage.

Liệt kê những file cần tạo hoặc chỉnh sửa trước khi triển khai.

Ưu tiên tái sử dụng code hiện có, không tạo hệ thống giỏ hàng thứ hai gây xung đột.

Không tự ý xóa hoặc ghi đè code của thành viên khác.

BƯỚC 2 — CHỨC NĂNG THÊM VÀO GIỎ HÀNG

Tích hợp chức năng "Thêm vào giỏ hàng" trên trang Shop và trang chi tiết sản phẩm.

Yêu cầu:

Nhấn "Thêm vào giỏ" thì sản phẩm được thêm ngay.

Không tải lại trang.

Nếu sản phẩm đã tồn tại, tăng số lượng thay vì tạo dòng trùng.

Lưu giỏ hàng vào localStorage.

Hiển thị thông báo thêm thành công.

Cập nhật số lượng sản phẩm trên biểu tượng giỏ hàng ở header.

Không cho thêm sản phẩm không hợp lệ hoặc vượt quá tồn kho nếu dữ liệu có quản lý tồn kho.

Không dùng tên sản phẩm làm khóa định danh; sử dụng productId ổn định.

BƯỚC 3 — GIAO DIỆN GIỎ HÀNG

Thay thế hoàn toàn phần thông báo "Đang phát triển" bằng giao diện giỏ hàng thực tế.

Mỗi sản phẩm hiển thị:

Hình ảnh.

Tên sản phẩm.

Giá bán.

Giá gốc và mức giảm nếu có.

Số lượng.

Thành tiền.

Nút tăng số lượng.

Nút giảm số lượng.

Nút xóa sản phẩm.

Yêu cầu:

Thay đổi số lượng thì tổng tiền cập nhật ngay.

Không cần F5.

Xóa sản phẩm phải cập nhật giỏ hàng và localStorage.

Có trạng thái giỏ hàng trống với nút "Tiếp tục mua sắm".

Giao diện responsive trên desktop, tablet và mobile.

Sử dụng thiết kế đồng bộ với website hiện có.

BƯỚC 4 — TÍNH TOÁN GIỎ HÀNG

Xây dựng hoặc tái sử dụng một hàm tính tổng tiền tập trung.

Các thành phần:

Subtotal: tổng giá các sản phẩm nhân số lượng.

Discount: số tiền giảm từ voucher.

Tax: thuế theo cấu hình của dự án.

Shipping Fee: phí vận chuyển.

Grand Total: tổng thanh toán.

Công thức đề xuất:

Grand Total = max(0, Subtotal - Discount + Tax + Shipping Fee)

Nếu voucher miễn phí vận chuyển, phần giảm phí ship phải được tính đúng một lần và không bị trừ trùng.

Không tự đặt thuế suất nếu dự án chưa có quy định; hãy hỏi tôi trước khi bổ sung thuế mới.

Sử dụng Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }) để định dạng tiền.

Không cho tổng thanh toán âm.

Không sử dụng giá sản phẩm lấy trực tiếp từ dữ liệu không tin cậy trong localStorage làm nguồn giá chính; đối chiếu với danh mục sản phẩm hiện có.

BƯỚC 5 — TÍCH HỢP VOUCHER

Tái sử dụng module Voucher & Khuyến mãi đã xây dựng.

Yêu cầu:

Có ô nhập mã giảm giá.

Có nút "Áp dụng".

Có nút "Hủy voucher".

Hiển thị mã đang áp dụng.

Kiểm tra voucher còn hạn.

Kiểm tra giá trị đơn hàng tối thiểu.

Tính đúng mức giảm.

Chỉ áp dụng một voucher cho một đơn.

Khi thay đổi số lượng sản phẩm, tiền giảm tự tính lại.

Khi voucher không còn đủ điều kiện, thông báo và cập nhật tổng đúng.

Test bắt buộc:

Subtotal = 1.000.000đ.

Áp dụng LHU2026 giảm 10%.

Discount = 100.000đ.

Nếu phí ship là 30.000đ và thuế bằng 0 thì tổng thanh toán = 930.000đ.

Nếu dự án đã có quy tắc thuế hoặc phí ship khác, phải sử dụng quy tắc hiện có và giải thích kết quả.

Không viết lại module Voucher nếu đã có hàm xử lý đúng; hãy tái sử dụng.

BƯỚC 6 — TRANG CHECKOUT / THANH TOÁN

Tạo hoặc hoàn thiện trang Checkout.

Form thông tin gồm:

Họ tên người nhận.

Số điện thoại.

Email (tùy chọn).

Địa chỉ nhận hàng.

Tỉnh/thành phố.

Ghi chú đơn hàng.

Phương thức thanh toán demo.

Phương thức thanh toán:

Thanh toán khi nhận hàng (COD).

Chuyển khoản mô phỏng nếu giao diện cần.

Không tích hợp thanh toán thật, không yêu cầu nhập số thẻ hoặc dữ liệu ngân hàng nhạy cảm.

Kiểm tra:

Không được bỏ trống thông tin bắt buộc.

Số điện thoại có định dạng hợp lệ.

Giỏ hàng không được rỗng.

Không tạo đơn hàng hai lần khi nhấn nút liên tục.

Hiển thị thông báo lỗi cụ thể cho từng trường.

BƯỚC 7 — TẠO ĐƠN HÀNG SAU CHECKOUT

Khi người dùng xác nhận đặt hàng:

Kiểm tra dữ liệu checkout.

Kiểm tra lại sản phẩm, số lượng và tổng tiền.

Tạo mã đơn hàng demo duy nhất, ví dụ LHU-2026-XXXXXX.

Tạo đối tượng đơn hàng theo cấu trúc đang dùng trong Order Tracking.

Lưu snapshot sản phẩm, số lượng, đơn giá, voucher, tiền giảm, thuế, phí ship và tổng thanh toán tại thời điểm đặt.

Lưu thông tin giao hàng demo.

Gán trạng thái ban đầu "Đặt hàng thành công" hoặc trạng thái tương ứng trong module Tracking.

Lưu đơn hàng vào localStorage bằng cơ chế hiện có.

Chỉ xóa giỏ hàng sau khi lưu đơn thành công.

Hiển thị trang "Đặt hàng thành công".

Cho phép nhấn "Theo dõi đơn hàng" để chuyển đến đúng đơn vừa tạo.

Không tạo cấu trúc dữ liệu mới không tương thích với Order Tracking.

Nếu module Order Tracking đã có khóa localStorage và hàm quản lý đơn hàng, hãy tái sử dụng.

BƯỚC 8 — ĐỒNG BỘ GIỮA CÁC TRANG

Bảo đảm:

Thêm sản phẩm từ Shop → Cart hiển thị đúng.

Số lượng giỏ hàng trên header được cập nhật.

Thay đổi Cart → Checkout nhận tổng mới.

Áp dụng Voucher → Checkout hiển thị đúng giảm giá.

Đặt hàng → Order Tracking tìm được đơn.

Đặt hàng → Lịch sử mua hàng hiển thị đơn mới.

F5 không mất giỏ hàng chưa đặt.

Không tự xóa lịch sử đánh giá, voucher hoặc đấu giá.

Sử dụng sự kiện hoặc cơ chế đồng bộ phù hợp với JavaScript thuần.

BƯỚC 9 — CHẤT LƯỢNG UI/UX

Đồng bộ màu sắc và bố cục website.

Có loading/disabled state khi xác nhận đặt hàng.

Có thông báo thành công/thất bại.

Có xác nhận trước khi xóa toàn bộ giỏ nếu cần.

Form có label rõ ràng.

Hỗ trợ thao tác bàn phím.

Dùng DOM API an toàn, không chèn trực tiếp dữ liệu người dùng vào innerHTML.

Không có lỗi JavaScript trong Console.

Responsive trên điện thoại.

Không sử dụng thư viện ngoài nếu không cần thiết.

BƯỚC 10 — KIỂM THỬ TOÀN BỘ LUỒNG

Thực hiện các test case:

Thêm sản phẩm từ Shop vào giỏ.

Thêm lại cùng sản phẩm → tăng số lượng.

Tăng/giảm số lượng → thành tiền đúng.

Xóa sản phẩm → tổng cập nhật.

F5 → giỏ hàng vẫn tồn tại.

Giỏ hàng trống → không checkout được.

Áp dụng LHU2026 → giảm đúng 10%.

Nhập voucher sai → hiển thị lỗi.

Thay đổi số lượng → tính lại voucher.

Checkout thiếu thông tin → không tạo đơn.

Checkout hợp lệ → tạo đúng một đơn.

Mã đơn hàng không bị trùng.

Đơn mới hiển thị trong Order Tracking.

Đơn mới xuất hiện trong lịch sử mua hàng.

Tổng tiền của đơn không thay đổi sau khi đặt.

Không ảnh hưởng Review, Voucher và Auction.

Không có lỗi Console.

Giao diện hoạt động tốt trên mobile.

Chỉ báo cáo test case đã thực sự chạy.

BƯỚC 11 — BÁO CÁO KẾT QUẢ

Sau khi hoàn thành:

Liệt kê các file đã tạo và chỉnh sửa.

Giải thích cấu trúc dữ liệu giỏ hàng.

Giải thích cách tính tiền.

Giải thích cách tích hợp Voucher.

Giải thích cách tạo đơn và tích hợp Tracking.

Hướng dẫn chạy thử từ Shop đến đặt hàng thành công.

Báo cáo test case đạt/chưa đạt.

Nêu các vấn đề còn tồn tại.

Viết nội dung tóm tắt Prompt 05 để tôi ghi vào prompt_log.md.

Gợi ý ảnh chụp minh chứng cho báo cáo đồ án.

QUY TẮC BẮT BUỘC:

Không tạo một website mới.

Không tự ý xóa hoặc ghi đè code của thành viên khác.

Không tự động commit, push, merge hoặc chuyển nhánh Git.

Không thay đổi kiến trúc dự án khi chưa cần thiết.

Ưu tiên tái sử dụng module Voucher và Tracking hiện có.

Nếu phát hiện xung đột, hãy hỏi tôi trước khi sửa.

Chỉ xác nhận hoàn thành khi các chức năng đã thực sự hoạt động.
## Prompt 06 — Hồ sơ và phiên người dùng demo
**Ngày thực hiện**: 24/10/2026

### Mục tiêu
- Bổ sung đăng ký, đăng nhập, hồ sơ cá nhân và đăng xuất bằng HTML/CSS/JavaScript thuần.
- Liên kết userId ổn định với hoạt động mới ở Review, Order, Voucher và Auction; bảo toàn giỏ khách và dữ liệu lịch sử hiện có.

### Thay đổi
- Thêm các trang login/register/profile, CSS tài khoản, module quản lý hồ sơ/phiên demo và controller cho từng trang.
- Hồ sơ lưu ở `lhu_demo_users` không có trường mật khẩu. Phiên không ghi nhớ dùng `sessionStorage`; phiên ghi nhớ dùng `localStorage`. Mật khẩu biểu mẫu chỉ được kiểm tra có nội dung và xác nhận khớp, không được lưu hoặc xác minh khi đăng nhập.
- Header hiển thị đăng nhập/đăng ký hoặc menu hồ sơ, đơn hàng, voucher, đấu giá và đăng xuất.
- Cart khách vẫn dùng `lhu_cart_items`; dữ liệu lịch sử cũ chưa có userId không được tự gán; ví voucher legacy được giữ nguyên và không migrate.

### Kiểm thử và giới hạn xác minh
- Đã rà soát tĩnh cấu trúc thư mục, các khóa lưu trữ, các controller navigation và điểm ghi dữ liệu của những module liên quan.
- VS Code Problems không báo lỗi trên workspace sau khi cập nhật.
- Chưa chạy test tương tác 1–13 trong trình duyệt. Quyền mở trình duyệt và chạy test runner trong phiên này bị từ chối; không đánh dấu các luồng tương tác, console, responsive hoặc hồi quy module là đạt.
