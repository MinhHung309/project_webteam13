/**
 * Module quản lý Header, Mobile Navigation và đồng bộ trạng thái giỏ hàng (Cart Badge)
 */

import { STORAGE_KEYS } from "../utils/storage.js";
import { getCartTotalQuantity, CART_UPDATED_EVENT } from "../utils/cart.js";
import { AUTH_UPDATED_EVENT, getCurrentUser, logout } from "./auth.js";

const NAV_ITEMS = [
  { label: "Trang chủ", path: "index.html", pages: ["index.html"] },
  { label: "Sản phẩm", path: "pages/products.html", pages: ["products.html", "product-detail.html"] },
  { label: "Voucher", path: "pages/vouchers.html", pages: ["vouchers.html"] },
  { label: "Theo dõi đơn", path: "pages/order-tracking.html", pages: ["order-tracking.html"] },
  { label: "Đấu giá", path: "pages/auction.html", pages: ["auction.html", "auction-detail.html", "my-auctions.html"] },
  { label: "Đánh giá", path: "pages/reviews.html", pages: ["reviews.html"] }
];

function sitePageUrl(path) {
  return new URL(path, new URL("../../", import.meta.url)).href;
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderHeader() {
  const header = document.querySelector(".site-header");
  if (!header) {
    throw new Error("Không tìm thấy phần tử .site-header để khởi tạo điều hướng.");
  }

  const container = createElement("div", "container header-container");
  const logo = createElement("a", "brand-logo");
  logo.href = sitePageUrl("index.html");
  logo.setAttribute("aria-label", "LHU E-Shop Trang chủ");
  logo.append(
    createElement("span", "logo-icon", "LHU"),
    createElement("span", "", "E-Shop")
  );

  const menuToggle = createElement("button", "menu-toggle", "☰");
  menuToggle.type = "button";
  menuToggle.id = "menuToggle";
  menuToggle.setAttribute("aria-label", "Mở menu điều hướng");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-controls", "mainNav");

  const mainNav = createElement("nav", "main-nav");
  mainNav.id = "mainNav";
  mainNav.setAttribute("aria-label", "Điều hướng chính");
  const navList = createElement("ul", "nav-list");
  const currentPage = window.location.pathname.split("/").pop().toLowerCase();

  NAV_ITEMS.forEach(item => {
    const listItem = document.createElement("li");
    const link = createElement("a", "nav-link", item.label);
    link.href = sitePageUrl(item.path);
    if (item.pages.includes(currentPage)) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
    listItem.append(link);
    navList.append(listItem);
  });
  mainNav.append(navList);

  const headerActions = createElement("div", "header-actions");
  const cartLink = createElement("a", "action-link");
  cartLink.href = sitePageUrl("pages/cart.html");
  cartLink.setAttribute("aria-label", "Giỏ hàng của bạn");
  cartLink.append(
    createElement("span", "", "🛒"),
    createElement("span", "", "Giỏ hàng"),
    createElement("span", "cart-counter", "0")
  );
  cartLink.lastElementChild.id = "cartCount";
  headerActions.append(cartLink);

  container.append(logo, menuToggle, mainNav, headerActions);
  header.replaceChildren(container);
}

/**
 * Cập nhật số lượng hiển thị trên icon giỏ hàng (cart badge)
 */
export function updateCartBadge() {
  const cartCountEl = document.getElementById("cartCount");
  if (!cartCountEl) return;

  const totalQty = getCartTotalQuantity();
  cartCountEl.textContent = totalQty;
}

/**
 * Khởi tạo navigation, sự kiện menu mobile và đồng bộ badge giỏ hàng thời gian thực
 */
export function initNavigation() {
  renderHeader();
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const headerActions = document.querySelector(".header-actions");

  if (menuToggle && mainNav) {
    menuToggle.setAttribute("aria-controls", mainNav.id);
    menuToggle.addEventListener("click", () => {
      setNavigationOpen(mainNav, menuToggle, !mainNav.classList.contains("is-open"));
    });
    mainNav.addEventListener("click", event => {
      if (event.target.closest("a")) setNavigationOpen(mainNav, menuToggle, false);
    });
    mainNav.addEventListener("keydown", event => {
      if (event.key === "Escape" && mainNav.classList.contains("is-open")) {
        setNavigationOpen(mainNav, menuToggle, false);
        menuToggle.focus();
      }
    });
  }

  if (headerActions) {
    renderAccountActions(headerActions);
    window.addEventListener(AUTH_UPDATED_EVENT, () => renderAccountActions(headerActions));
    window.addEventListener("storage", event => {
      if ([STORAGE_KEYS.DEMO_USERS, STORAGE_KEYS.DEMO_SESSION, STORAGE_KEYS.DEMO_REMEMBERED_SESSION].includes(event.key)) {
        renderAccountActions(headerActions);
      }
    });
  }

  // 1. Cập nhật số lượng giỏ hàng ban đầu khi tải trang
  updateCartBadge();

  // 2. Lắng nghe CustomEvent khi giỏ hàng được thêm/sửa/xóa trong cùng tab
  window.addEventListener(CART_UPDATED_EVENT, () => {
    updateCartBadge();
  });

  // 3. Lắng nghe storage event khi giỏ hàng được thay đổi từ một tab trình duyệt khác
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEYS.CART) {
      updateCartBadge();
    }
  });
}

function setNavigationOpen(mainNav, menuToggle, isOpen) {
  mainNav.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng");
}

function renderAccountActions(headerActions) {
  headerActions.querySelector("#accountActions")?.remove();
  const accountActions = document.createElement("div");
  accountActions.id = "accountActions";
  accountActions.className = "account-actions";
  const user = getCurrentUser();
  const pageUrl = path => new URL(`../../pages/${path}`, import.meta.url).href;

  if (!user) {
    const login = document.createElement("a");
    login.className = "action-link account-auth-link";
    login.href = pageUrl("login.html");
    login.textContent = "Đăng nhập";
    const register = document.createElement("a");
    register.className = "action-link account-auth-link account-register-link";
    register.href = pageUrl("register.html");
    register.textContent = "Đăng ký";
    accountActions.append(login, register);
  } else {
    const menu = document.createElement("details");
    menu.className = "account-menu";
    menu.addEventListener("keydown", event => {
      if (event.key === "Escape" && menu.open) {
        menu.open = false;
        summary.focus();
      }
    });
    const summary = document.createElement("summary");
    summary.setAttribute("aria-label", `Tài khoản: ${user.fullName}`);
    const avatar = document.createElement("span");
    avatar.className = "account-menu-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = user.fullName.charAt(0).toLocaleUpperCase("vi");
    const name = document.createElement("span");
    name.className = "account-menu-name";
    name.textContent = user.fullName;
    summary.append(avatar, name);

    const panel = document.createElement("div");
    panel.className = "account-menu-panel";
    [
      ["Tài khoản của tôi", "profile.html"],
      ["Đơn hàng của tôi", "order-tracking.html"],
      ["Lịch sử mua hàng", "order-tracking.html#order-history"],
      ["Voucher của tôi", "vouchers.html?tab=wallet"],
      ["Đấu giá của tôi", "my-auctions.html"]
    ].forEach(([label, path]) => {
      const link = document.createElement("a");
      link.href = pageUrl(path);
      link.textContent = label;
      panel.append(link);
    });
    const signOut = document.createElement("button");
    signOut.type = "button";
    signOut.className = "account-logout";
    signOut.textContent = "Đăng xuất";
    signOut.addEventListener("click", () => {
      if (!logout()) {
        window.alert("Không thể đăng xuất vào lúc này. Vui lòng thử lại.");
        return;
      }
      menu.open = false;
    });
    panel.append(signOut);
    menu.append(summary, panel);
    accountActions.append(menu);
  }

  headerActions.append(accountActions);
}
