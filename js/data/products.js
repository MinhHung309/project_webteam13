/**
 * Dữ liệu sản phẩm mẫu và danh mục cho dự án LHU E-Commerce.
 * Giai đoạn đầu: Quản lý qua static module kết hợp LocalStorage.
 */

export const INITIAL_CATEGORIES = [
  {
    id: "cat_laptop",
    name: "Laptop & PC",
    icon: "💻",
    itemCount: 4
  },
  {
    id: "cat_accessory",
    name: "Phụ kiện công nghệ",
    icon: "🎧",
    itemCount: 6
  },
  {
    id: "cat_books",
    name: "Sách & Giáo trình",
    icon: "📚",
    itemCount: 8
  },
  {
    id: "cat_stationery",
    name: "Dụng cụ học tập",
    icon: "✏️",
    itemCount: 12
  },
  {
    id: "cat_fashion",
    name: "Đồng phục & Thời trang",
    icon: "👕",
    itemCount: 5
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: "lhu_prod_001",
    name: "Balo Sinh Viên LHU Chống Nước - Phiên Bản 2026",
    category: "Đồng phục & Thời trang",
    categoryId: "cat_fashion",
    price: 249000,
    originalPrice: 320000,
    rating: 4.8,
    reviewCount: 36,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    badge: "Bán chạy",
    inStock: true,
    description: "Balo phong cách năng động cho sinh viên Đại học Lạc Hồng, vải Oxford chống thấm."
  },
  {
    id: "lhu_prod_002",
    name: "Chuột Không Dây Silent Click Ergonomic",
    category: "Phụ kiện công nghệ",
    categoryId: "cat_accessory",
    price: 189000,
    originalPrice: 250000,
    rating: 4.6,
    reviewCount: 22,
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80",
    badge: "Hot",
    inStock: true,
    description: "Chuột không dây click êm ái, phù hợp sử dụng trong thư viện và phòng học nhóm."
  },
  {
    id: "lhu_prod_003",
    name: "Tai Nghe Chống Ồn On-Ear Bluetooth 5.3",
    category: "Phụ kiện công nghệ",
    categoryId: "cat_accessory",
    price: 499000,
    originalPrice: 650000,
    rating: 4.9,
    reviewCount: 15,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    badge: "Mới",
    inStock: true,
    description: "Tai nghe thời lượng pin 30h liên tục, âm thanh trung thực phục vụ học tập trực tuyến."
  },
  {
    id: "lhu_prod_004",
    name: "Sổ Tay Kế Hoạch Học Tập Bullet Journal A5",
    category: "Dụng cụ học tập",
    categoryId: "cat_stationery",
    price: 75000,
    originalPrice: 95000,
    rating: 4.7,
    reviewCount: 48,
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    badge: "Ưu đãi",
    inStock: true,
    description: "Giấy dày 100gsm chống thấm mực, thiết kế khoa học giúp quản lý đồ án hiệu quả."
  }
];
