import { initNavigation } from "../modules/nav.js";
import { AUCTION_STORAGE_KEY, getMyAuctionEntries, getAuctionStatus } from "../modules/auction.js";
import { formatCurrency } from "../utils/storage.js";

const grid = document.getElementById("myAuctionGrid");
const results = document.getElementById("myAuctionResults");
const empty = document.getElementById("myAuctionEmpty");
let countdownInterval = null;

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  renderMyAuctions();
  window.addEventListener("storage", handleStorage);
  window.addEventListener("lhu:auction-updated", renderMyAuctions);
  window.addEventListener("pagehide", cleanup, { once: true });
});

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderMyAuctions() {
  const user = document.getElementById("auctionDemoUser");
  user.textContent = "Các phiên bạn đã tham gia bằng định danh ổn định trên trình duyệt này; không có đăng nhập thật.";
  const entries = getMyAuctionEntries();
  grid.replaceChildren(...entries.map(({ auction, highestOwnBid, leading, status, result }) => {
    const card = element("article", "auction-card auction-my-card");
    const media = element("div", "auction-card-media");
    const image = element("img", "auction-card-image");
    image.src = auction.image;
    image.alt = auction.title;
    image.loading = "lazy";
    image.addEventListener("error", () => image.classList.add("is-unavailable"), { once: true });
    media.append(image, element("span", `auction-status auction-status-${status}`, { upcoming: "Sắp diễn ra", active: "Đang diễn ra", ended: "Đã kết thúc" }[status]));
    const content = element("div", "auction-card-content");
    content.append(element("h2", "auction-card-title", auction.title));
    content.append(element("p", "auction-my-highest", `Mức giá cao nhất của bạn: ${formatCurrency(highestOwnBid)}`));
    content.append(element("p", "auction-card-current-price", `Giá cao nhất phiên: ${formatCurrency(auction.currentPrice)}`));
    content.append(element("p", leading ? "auction-leading-label" : "auction-outbid-label", result));
    if (status === "ended") content.append(element("p", "auction-my-result", leading ? "Kết quả: Bạn thắng phiên demo." : "Kết quả: Bạn không phải người dẫn đầu khi kết thúc."));
    const link = element("a", "btn btn-outline auction-card-action", "Xem chi tiết phiên");
    link.href = `./auction-detail.html?id=${encodeURIComponent(auction.id)}`;
    content.append(link);
    card.append(media, content);
    return card;
  }));
  results.textContent = `Bạn đã tham gia ${entries.length} phiên đấu giá`;
  empty.hidden = entries.length > 0;
  const needsStatusUpdates = entries.some(entry => entry.status !== "ended");
  if (needsStatusUpdates && countdownInterval === null) {
    countdownInterval = window.setInterval(updateStatuses, 1000);
  } else if (!needsStatusUpdates) {
    cleanup();
  }
}

function updateStatuses() {
  const entries = getMyAuctionEntries();
  const hasStatusChange = entries.some(entry => {
    const card = [...grid.querySelectorAll(".auction-my-card")].find(item => item.querySelector("a")?.href.includes(encodeURIComponent(entry.auction.id)));
    return !card || card.querySelector(".auction-status")?.classList.contains(`auction-status-${getAuctionStatus(entry.auction)}`) !== true;
  });
  if (hasStatusChange) renderMyAuctions();
}

function handleStorage(event) {
  if (event.key === AUCTION_STORAGE_KEY) renderMyAuctions();
}

function cleanup() {
  if (countdownInterval !== null) window.clearInterval(countdownInterval);
  countdownInterval = null;
}
