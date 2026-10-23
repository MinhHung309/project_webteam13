import { initNavigation } from "../modules/nav.js";
import { AUCTION_STORAGE_KEY, formatAuctionDate, getAuctions, getAuctionStatus } from "../modules/auction.js";
import { formatCurrency } from "../utils/storage.js";

const statusLabels = { upcoming: "Sắp diễn ra", active: "Đang diễn ra", ended: "Đã kết thúc" };
const grid = document.getElementById("auctionGrid");
const searchInput = document.getElementById("auctionSearch");
const statusFilter = document.getElementById("auctionStatusFilter");
const sortSelect = document.getElementById("auctionSort");
const results = document.getElementById("auctionResults");
const empty = document.getElementById("auctionEmpty");
let countdownInterval = null;

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  renderAuctions();
  searchInput.addEventListener("input", renderAuctions);
  statusFilter.addEventListener("change", renderAuctions);
  sortSelect.addEventListener("change", renderAuctions);
  countdownInterval = window.setInterval(updateCountdowns, 1000);
  window.addEventListener("storage", handleStorage);
  window.addEventListener("lhu:auction-updated", renderAuctions);
  window.addEventListener("pagehide", cleanup, { once: true });
});

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function formatRemaining(targetTime, now = Date.now()) {
  const remaining = Math.max(0, targetTime - now);
  const seconds = Math.floor(remaining / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return `${days} ngày ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function renderAuctions() {
  const query = searchInput.value.trim().toLocaleLowerCase("vi");
  const wantedStatus = statusFilter.value;
  const now = Date.now();
  let auctions = getAuctions().filter(auction => {
    const status = getAuctionStatus(auction, now);
    const matchesStatus = wantedStatus === "all" || status === wantedStatus;
    const matchesQuery = `${auction.title} ${auction.description}`.toLocaleLowerCase("vi").includes(query);
    return matchesStatus && matchesQuery;
  });

  if (sortSelect.value === "price-asc") auctions.sort((a, b) => a.currentPrice - b.currentPrice);
  else if (sortSelect.value === "price-desc") auctions.sort((a, b) => b.currentPrice - a.currentPrice);
  else auctions.sort((a, b) => Date.parse(a.endTime) - Date.parse(b.endTime));

  grid.replaceChildren(...auctions.map(auction => createAuctionCard(auction, now)));
  results.textContent = `Hiển thị ${auctions.length} phiên đấu giá`;
  empty.hidden = auctions.length > 0;
}

function createAuctionCard(auction, now) {
  const status = getAuctionStatus(auction, now);
  const card = createElement("article", "auction-card");
  const media = createElement("div", "auction-card-media");
  const image = createElement("img", "auction-card-image");
  image.src = auction.image;
  image.alt = auction.title;
  image.loading = "lazy";
  image.addEventListener("error", () => image.classList.add("is-unavailable"), { once: true });
  media.append(image);

  if (status === "active" && Date.parse(auction.endTime) - now <= 60 * 60 * 1000) {
    media.append(createElement("span", "auction-ending-badge", "Sắp kết thúc"));
  }
  const badge = createElement("span", `auction-status auction-status-${status}`, statusLabels[status]);
  media.append(badge);

  const content = createElement("div", "auction-card-content");
  content.append(createElement("h2", "auction-card-title", auction.title));
  content.append(createElement("p", "auction-card-description", auction.description));
  const prices = createElement("div", "auction-card-prices");
  prices.append(createElement("span", "auction-muted", "Giá khởi điểm"), createElement("strong", "", formatCurrency(auction.startingPrice)));
  prices.append(createElement("span", "auction-muted", "Giá cao nhất"), createElement("strong", "auction-card-current-price", formatCurrency(auction.currentPrice)));
  content.append(prices);

  const details = createElement("div", "auction-card-meta");
  details.append(createElement("span", "", `Dẫn đầu: ${auction.highestBidder?.name || "Chưa có"}`));
  details.append(createElement("span", "", `${auction.bidHistory.length} lượt đặt giá`));
  content.append(details);
  content.append(createElement("p", "auction-card-endtime", `Kết thúc: ${formatAuctionDate(auction.endTime)}`));
  if (status === "upcoming") content.append(createElement("p", "auction-card-endtime", `Bắt đầu: ${formatAuctionDate(auction.startTime)}`));
  const countdownTarget = status === "upcoming" ? auction.startTime : auction.endTime;
  const countdown = createElement("p", "auction-card-countdown", status === "ended" ? "Phiên đã kết thúc" : "");
  countdown.dataset.target = String(Date.parse(countdownTarget));
  countdown.dataset.status = status;
  if (status !== "ended") countdown.textContent = status === "upcoming" ? `Bắt đầu sau ${formatRemaining(Date.parse(auction.startTime), now)}` : `Còn lại ${formatRemaining(Date.parse(auction.endTime), now)}`;
  content.append(countdown);

  const action = document.createElement("a");
  action.className = status === "active" ? "btn btn-primary auction-card-action" : "btn btn-outline auction-card-action";
  action.href = `./auction-detail.html?id=${encodeURIComponent(auction.id)}`;
  action.textContent = status === "active" ? "Tham gia đấu giá" : "Xem chi tiết";
  content.append(action);
  card.append(media, content);
  return card;
}

function updateCountdowns() {
  const now = Date.now();
  let statusChanged = false;
  grid.querySelectorAll(".auction-card-countdown").forEach(node => {
    const oldStatus = node.dataset.status;
    const targetTime = Number(node.dataset.target);
    const auctionStatus = oldStatus === "upcoming" && now >= targetTime ? "active" : oldStatus === "active" && now >= targetTime ? "ended" : oldStatus;
    if (auctionStatus !== oldStatus) {
      statusChanged = true;
      return;
    }
    if (auctionStatus === "upcoming") node.textContent = `Bắt đầu sau ${formatRemaining(targetTime, now)}`;
    if (auctionStatus === "active") {
      node.textContent = `Còn lại ${formatRemaining(targetTime, now)}`;
      if (targetTime - now <= 60 * 60 * 1000) {
        const card = node.closest(".auction-card");
        const media = card?.querySelector(".auction-card-media");
        if (media && !media.querySelector(".auction-ending-badge")) media.append(createElement("span", "auction-ending-badge", "Sắp kết thúc"));
      }
    }
  });
  if (statusChanged) renderAuctions();
  if (getAuctions().every(auction => getAuctionStatus(auction, now) === "ended")) cleanup();
}

function handleStorage(event) {
  if (event.key === AUCTION_STORAGE_KEY) renderAuctions();
}

function cleanup() {
  if (countdownInterval !== null) window.clearInterval(countdownInterval);
  countdownInterval = null;
}
