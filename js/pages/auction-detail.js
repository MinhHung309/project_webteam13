import { initNavigation } from "../modules/nav.js";
import {
  AUCTION_STORAGE_KEY,
  formatAuctionDate,
  getAuctionById,
  getAuctionDemoUser,
  getAuctionStatus,
  placeAuctionBid
} from "../modules/auction.js";
import { formatCurrency } from "../utils/storage.js";
import { AUTH_UPDATED_EVENT, getCurrentUser } from "../modules/auth.js";

const content = document.getElementById("auctionDetailContent");
const historySection = document.getElementById("auctionHistorySection");
const historyBody = document.getElementById("auctionHistoryBody");
const bidCount = document.getElementById("auctionBidCount");
const auctionId = new URLSearchParams(window.location.search).get("id");
let countdownInterval = null;
let lastStatus = null;

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  renderDetail();
  const auction = getAuctionById(auctionId);
  if (auction) {
    updateCountdown();
    if (getAuctionStatus(auction) !== "ended") {
      countdownInterval = window.setInterval(updateCountdown, 1000);
    }
  }
  window.addEventListener("storage", handleStorage);
  window.addEventListener("lhu:auction-updated", renderDetail);
  window.addEventListener(AUTH_UPDATED_EVENT, () => renderDetail());
  window.addEventListener("pagehide", cleanup, { once: true });
});

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderDetail(message = "") {
  const auction = getAuctionById(auctionId);
  if (!auction) {
    historySection.hidden = true;
    const notFound = node("section", "auction-not-found");
    notFound.append(node("h1", "", "Không tìm thấy phiên đấu giá"), node("p", "", "Mã phiên không hợp lệ hoặc phiên không còn trong dữ liệu hiện tại."));
    const back = node("a", "btn btn-primary", "Quay lại sàn đấu giá");
    back.href = "./auction.html";
    notFound.append(back);
    content.replaceChildren(notFound);
    return;
  }

  const status = getAuctionStatus(auction);
  lastStatus = status;
  const article = node("article", "auction-detail");
  const imageWrap = node("div", "auction-detail-image-wrap");
  const image = node("img", "auction-detail-image");
  image.src = auction.image;
  image.alt = auction.title;
  image.addEventListener("error", () => image.classList.add("is-unavailable"), { once: true });
  imageWrap.append(image);

  const information = node("div", "auction-detail-information");
  const topLine = node("div", "auction-detail-topline");
  topLine.append(node("span", `auction-status auction-status-${status}`, { upcoming: "Sắp diễn ra", active: "Đang diễn ra", ended: "Đã kết thúc" }[status]));
  topLine.append(node("span", "auction-session-id", `Mã phiên: ${auction.id}`));
  information.append(topLine, node("h1", "auction-detail-title", auction.title), node("p", "auction-detail-description", auction.description));

  const priceGrid = node("div", "auction-detail-price-grid");
  addDetailValue(priceGrid, "Giá khởi điểm", formatCurrency(auction.startingPrice));
  addDetailValue(priceGrid, "Giá cao nhất hiện tại", formatCurrency(auction.currentPrice), "auction-highlight-value");
  addDetailValue(priceGrid, "Bước giá tối thiểu", formatCurrency(auction.minimumIncrement));
  addDetailValue(priceGrid, "Người đang dẫn đầu", auction.highestBidder?.name || "Chưa có người đặt giá");
  information.append(priceGrid);

  const countdown = node("p", "auction-detail-countdown");
  countdown.id = "auctionDetailCountdown";
  countdown.dataset.start = String(Date.parse(auction.startTime));
  countdown.dataset.end = String(Date.parse(auction.endTime));
  information.append(countdown);

  const timeInfo = node("p", "auction-time-info", `Bắt đầu: ${formatAuctionDate(auction.startTime)} · Kết thúc: ${formatAuctionDate(auction.endTime)}`);
  information.append(timeInfo);
  const form = document.createElement("form");
  form.className = "auction-bid-form";
  form.id = "auctionBidForm";
  form.noValidate = true;
  const label = node("label", "", "Số tiền muốn đặt (VND)");
  label.htmlFor = "auctionBidAmount";
  const input = document.createElement("input");
  input.className = "form-input";
  input.id = "auctionBidAmount";
  input.name = "amount";
  input.type = "number";
  input.min = String(auction.currentPrice + auction.minimumIncrement);
  input.step = "1";
  input.inputMode = "numeric";
  input.setAttribute("aria-describedby", "auctionBidHint auctionBidFeedback");
  input.placeholder = String(auction.currentPrice + auction.minimumIncrement);
  const bidder = getAuctionDemoUser();
  const currentUser = getCurrentUser();
  const hintText = currentUser
    ? `Giá tối thiểu kế tiếp: ${formatCurrency(auction.currentPrice + auction.minimumIncrement)}. Người dùng: ${bidder.name}.`
    : `Giá tối thiểu kế tiếp: ${formatCurrency(auction.currentPrice + auction.minimumIncrement)}. Đăng nhập để gắn lượt đặt giá với hồ sơ demo.`;
  const hint = node("span", "auction-form-hint", hintText);
  hint.id = "auctionBidHint";
  const submit = node("button", "btn btn-primary", "Đặt giá");
  submit.type = "submit";
  submit.disabled = status !== "active" || !currentUser || auction.highestBidder?.id === bidder.id;
  const feedback = node("p", "auction-feedback", message);
  feedback.id = "auctionBidFeedback";
  feedback.setAttribute("role", "status");
  feedback.setAttribute("aria-live", "polite");
  if (!message) feedback.hidden = true;
  form.append(label, input, hint, submit, feedback);
  form.addEventListener("submit", event => {
    event.preventDefault();
    const result = placeAuctionBid(auction.id, input.value);
    renderDetail(result.message);
  });
  information.append(form);
  const notice = node("p", "auction-demo-note", "Phiên đấu giá chỉ mô phỏng trên trình duyệt. Giá đặt không phải cam kết mua bán hoặc giao dịch tiền thật.");
  article.append(imageWrap, information);
  content.replaceChildren(article, notice);
  renderHistory(auction);
}

function addDetailValue(container, label, value, valueClass = "") {
  const item = node("div", "auction-detail-price-item");
  item.append(node("span", "", label), node("strong", valueClass, value));
  container.append(item);
}

function renderHistory(auction) {
  historySection.hidden = false;
  const bids = [...auction.bidHistory].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  bidCount.textContent = `${bids.length} lượt đặt giá`;
  historyBody.replaceChildren();
  bids.forEach((bid, index) => {
    const row = document.createElement("tr");
    row.append(node("td", "", String(index + 1)), node("td", "", bid.bidderName), node("td", "auction-history-amount", formatCurrency(bid.amount)), node("td", "", formatAuctionDate(bid.timestamp)));
    const statusCell = document.createElement("td");
    statusCell.append(node("span", auction.highestBidder?.id === bid.bidderId && auction.currentPrice === bid.amount ? "auction-leading-label" : "auction-outbid-label", auction.highestBidder?.id === bid.bidderId && auction.currentPrice === bid.amount ? "Đang dẫn đầu" : "Đã bị vượt giá"));
    row.append(statusCell);
    historyBody.append(row);
  });
  if (!bids.length) {
    const row = document.createElement("tr");
    const cell = node("td", "auction-history-empty", "Chưa có lượt đặt giá trong phiên này.");
    cell.colSpan = 5;
    row.append(cell);
    historyBody.append(row);
  }
}

function updateCountdown() {
  const countdown = document.getElementById("auctionDetailCountdown");
  if (!countdown) return;
  const now = Date.now();
  const start = Number(countdown.dataset.start);
  const end = Number(countdown.dataset.end);
  const status = now < start ? "upcoming" : now >= end ? "ended" : "active";
  if (status !== lastStatus) {
    renderDetail(status === "ended" ? "Phiên đấu giá đã kết thúc." : "");
    if (status === "ended") cleanup();
    return;
  }
  if (status === "ended") {
    countdown.textContent = "Phiên đấu giá đã kết thúc";
    cleanup();
    return;
  }
  const remaining = Math.max(0, (status === "upcoming" ? start : end) - now);
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  countdown.textContent = `${status === "upcoming" ? "Bắt đầu sau" : "Thời gian còn lại"}: ${days} ngày ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function handleStorage(event) {
  if (event.key === AUCTION_STORAGE_KEY) renderDetail();
}

function cleanup() {
  if (countdownInterval !== null) window.clearInterval(countdownInterval);
  countdownInterval = null;
}
