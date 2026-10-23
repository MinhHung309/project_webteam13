import { DEMO_AUCTIONS } from "../data/auction-demo.js";
import { formatCurrency, getStorageItem, setStorageItem } from "../utils/storage.js";

export const AUCTION_STORAGE_KEY = "lhu_auction_sessions_v1";
export const AUCTION_UPDATED_EVENT = "lhu:auction-updated";
export const DEMO_AUCTION_USER = Object.freeze({ id: "lhu-demo-user", name: "Người dùng demo" });

export function getAuctionStatus(auction, now = Date.now()) {
  const start = Date.parse(auction.startTime);
  const end = Date.parse(auction.endTime);
  if (now < start) return "upcoming";
  if (now >= end) return "ended";
  return "active";
}

function normalizeBid(bid) {
  if (!bid || typeof bid !== "object" || Array.isArray(bid)) return null;
  const amount = Number(bid.amount);
  const timestamp = Date.parse(bid.timestamp);
  if (!Number.isSafeInteger(amount) || amount <= 0 || !Number.isFinite(timestamp)) return null;
  const bidderId = typeof bid.bidderId === "string" && bid.bidderId.trim() ? bid.bidderId.trim() : "unknown-demo";
  const bidderName = typeof bid.bidderName === "string" && bid.bidderName.trim() ? bid.bidderName.trim() : "Người dùng demo";
  return {
    id: typeof bid.id === "string" && bid.id ? bid.id : `${bidderId}-${timestamp}-${amount}`,
    bidderId,
    bidderName,
    amount,
    timestamp: new Date(timestamp).toISOString()
  };
}

function normalizeAuction(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const start = Date.parse(raw.startTime);
  const end = Date.parse(raw.endTime);
  const startingPrice = Number(raw.startingPrice);
  const minimumIncrement = Number(raw.minimumIncrement);
  if (
    typeof raw.id !== "string" || !raw.id.trim() ||
    typeof raw.productId !== "string" || !raw.productId.trim() ||
    typeof raw.title !== "string" || !raw.title.trim() ||
    typeof raw.description !== "string" ||
    typeof raw.image !== "string" ||
    !Number.isFinite(start) || !Number.isFinite(end) || end <= start ||
    !Number.isSafeInteger(startingPrice) || startingPrice <= 0 ||
    !Number.isSafeInteger(minimumIncrement) || minimumIncrement <= 0
  ) return null;

  const bidHistory = Array.isArray(raw.bidHistory)
    ? raw.bidHistory.map(normalizeBid).filter(Boolean)
    : [];
  const topBid = bidHistory.reduce((top, bid) => {
    if (!top || bid.amount > top.amount || (bid.amount === top.amount && Date.parse(bid.timestamp) > Date.parse(top.timestamp))) return bid;
    return top;
  }, null);
  const declaredPrice = Number(raw.currentPrice);
  const currentPrice = topBid ? topBid.amount : startingPrice;
  if (!topBid && declaredPrice !== startingPrice) {
    console.warn(`[Auction] Phiên ${raw.id} không có lịch sử tương ứng với giá hiện tại; dùng giá khởi điểm.`);
  }
  return {
    id: raw.id.trim(),
    productId: raw.productId.trim(),
    title: raw.title.trim(),
    description: raw.description,
    image: raw.image,
    startingPrice,
    currentPrice,
    minimumIncrement,
    startTime: new Date(start).toISOString(),
    endTime: new Date(end).toISOString(),
    highestBidder: topBid ? { id: topBid.bidderId, name: topBid.bidderName } : null,
    bidHistory,
  };
}

function normalizeStore(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || raw.version !== 1 || !Array.isArray(raw.auctions)) return null;
  const seen = new Set();
  const auctions = [];
  for (const item of raw.auctions) {
    const auction = normalizeAuction(item);
    if (!auction || seen.has(auction.id)) {
      console.warn("[Auction] Bỏ qua bản ghi phiên đấu giá không hợp lệ hoặc trùng mã.", item);
      continue;
    }
    seen.add(auction.id);
    auctions.push(auction);
  }
  if (auctions.length === 0) return null;
  return {
    version: 1,
    demoUser: DEMO_AUCTION_USER,
    auctions
  };
}

function createDemoStore() {
  return normalizeStore({ version: 1, auctions: DEMO_AUCTIONS });
}

function persistStore(store) {
  return setStorageItem(AUCTION_STORAGE_KEY, store);
}

export function loadAuctionStore() {
  let rawStored;
  try {
    rawStored = localStorage.getItem(AUCTION_STORAGE_KEY);
  } catch (error) {
    console.error("[Auction] Không thể đọc localStorage; phiên demo chỉ dùng trong bộ nhớ trang hiện tại.", error);
    return createDemoStore();
  }

  if (rawStored === null) {
    const initialStore = createDemoStore();
    if (!persistStore(initialStore)) console.error("[Auction] Không thể khởi tạo dữ liệu demo trong localStorage.");
    return initialStore;
  }

  const stored = getStorageItem(AUCTION_STORAGE_KEY, null);
  const normalized = normalizeStore(stored);
  if (!normalized) {
    console.error(`[Auction] Dữ liệu tại '${AUCTION_STORAGE_KEY}' không hợp lệ; dùng dữ liệu demo trong bộ nhớ và không ghi đè dữ liệu hiện có.`);
    return createDemoStore();
  }
  return normalized;
}

export function getAuctions() {
  return loadAuctionStore().auctions;
}

export function getAuctionById(id) {
  return getAuctions().find(auction => auction.id === id) || null;
}

export function placeAuctionBid(auctionId, inputValue) {
  const store = loadAuctionStore();
  const auction = store.auctions.find(item => item.id === auctionId);
  if (!auction) return { success: false, message: "Không tìm thấy phiên đấu giá." };

  const now = Date.now();
  const status = getAuctionStatus(auction, now);
  if (status === "upcoming") return { success: false, message: "Phiên đấu giá chưa bắt đầu, bạn chưa thể đặt giá." };
  if (status === "ended") return { success: false, message: "Phiên đấu giá đã kết thúc, không thể đặt giá." };

  if (!DEMO_AUCTION_USER.id || !DEMO_AUCTION_USER.name) {
    return { success: false, message: "Chưa xác định người dùng demo để ghi nhận lượt đặt giá." };
  }

  const rawAmount = typeof inputValue === "number" ? String(inputValue) : String(inputValue ?? "").trim();
  if (!rawAmount || !/^\d+$/.test(rawAmount)) {
    return { success: false, message: "Giá đặt phải là số nguyên dương hợp lệ, không nhập số thập phân." };
  }
  const amount = Number(rawAmount);
  if (!Number.isSafeInteger(amount) || !Number.isFinite(amount) || amount <= 0) {
    return { success: false, message: "Giá đặt phải là số nguyên dương hữu hạn và lớn hơn 0." };
  }
  if (auction.highestBidder?.id === DEMO_AUCTION_USER.id) {
    return { success: false, message: "Bạn đang dẫn đầu phiên này nên không thể tự nâng giá." };
  }
  if (amount <= auction.currentPrice) {
    return { success: false, message: `Giá đặt phải lớn hơn giá hiện tại ${formatCurrency(auction.currentPrice)}.` };
  }
  const minimumBid = auction.currentPrice + auction.minimumIncrement;
  if (amount < minimumBid) {
    return { success: false, message: `Giá đặt tối thiểu là ${formatCurrency(minimumBid)} (đã gồm bước giá ${formatCurrency(auction.minimumIncrement)}).` };
  }
  if (Date.now() >= Date.parse(auction.endTime)) {
    return { success: false, message: "Phiên đấu giá vừa kết thúc, không thể đặt giá." };
  }

  const bid = {
    id: `bid-${DEMO_AUCTION_USER.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    bidderId: DEMO_AUCTION_USER.id,
    bidderName: DEMO_AUCTION_USER.name,
    amount,
    timestamp: new Date().toISOString()
  };
  auction.bidHistory.push(bid);
  auction.currentPrice = amount;
  auction.highestBidder = { id: bid.bidderId, name: bid.bidderName };
  if (!persistStore(store)) {
    auction.bidHistory.pop();
    const previousTop = auction.bidHistory.reduce((top, item) => !top || item.amount > top.amount ? item : top, null);
    auction.currentPrice = previousTop ? previousTop.amount : auction.startingPrice;
    auction.highestBidder = previousTop ? { id: previousTop.bidderId, name: previousTop.bidderName } : null;
    return { success: false, message: "Không thể lưu giá đặt vào localStorage. Vui lòng kiểm tra bộ nhớ trình duyệt và thử lại." };
  }

  window.dispatchEvent(new CustomEvent(AUCTION_UPDATED_EVENT, { detail: { auctionId } }));
  return { success: true, message: `Đặt giá thành công: ${formatCurrency(amount)}.`, auction };
}

export function getMyAuctionEntries() {
  const auctions = getAuctions();
  return auctions.map(auction => {
    const ownBids = auction.bidHistory.filter(bid => bid.bidderId === DEMO_AUCTION_USER.id);
    if (!ownBids.length) return null;
    const highestOwnBid = ownBids.reduce((highest, bid) => Math.max(highest, bid.amount), 0);
    const status = getAuctionStatus(auction);
    const leading = auction.highestBidder?.id === DEMO_AUCTION_USER.id;
    let result;
    if (status === "ended") result = leading ? "Đã thắng" : "Đã thua";
    else result = leading ? "Bạn đang dẫn đầu" : "Đã bị vượt giá";
    return { auction, highestOwnBid, leading, status, result };
  }).filter(Boolean);
}

export function formatAuctionDate(value) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
