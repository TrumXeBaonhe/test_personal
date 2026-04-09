import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format số tiền theo locale Việt Nam.
 * @param amount - Số tiền cần format
 * @param currency - Mã tiền tệ (mặc định: VND)
 */
export function formatCurrency(amount: number, currency = "VND"): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "VND" ? 0 : 2,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(amount);
}

/**
 * Format số tiền ngắn gọn cho biểu đồ (ví dụ: 1,500,000 → 1.5M)
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}k`;
  }
  return amount.toString();
}

/**
 * Lấy khoảng thời gian của một tháng theo múi giờ GMT+7 (Asia/Ho_Chi_Minh)
 * Trả về start và end dưới dạng Date object (UTC) để query database chính xác.
 */
export function getGMT7MonthRange(year?: number, month?: number) {
  const now = new Date();
  
  // Nếu có year/month truyền vào thì dùng, không thì lấy hiện tại theo GMT+7
  let targetYear = year;
  let targetMonth = month;
  
  if (targetYear === undefined || targetMonth === undefined) {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "numeric",
    });
    const parts = formatter.formatToParts(now);
    targetYear = parseInt(parts.find(p => p.type === "year")!.value);
    targetMonth = parseInt(parts.find(p => p.type === "month")!.value) - 1; // 0-indexed
  }

  // Tạo start của tháng trong GMT+7
  // April 1st 00:00:00 GMT+7 -> UTC là March 31st 17:00:00 (nếu offset là +7)
  const start = new Date(Date.UTC(targetYear, targetMonth, 1, 0 - 7, 0, 0));
  
  // Tạo end của tháng trong GMT+7 (ngày cuối tháng lúc 23:59:59.999)
  const end = new Date(Date.UTC(targetYear, targetMonth + 1, 0, 23 - 7, 59, 59, 999));

  return { start, end, targetYear, targetMonth };
}

/**
 * Normalize một ngày về đầu tháng UTC để lưu vào database (field @db.Date)
 * Đảm bảo tính nhất quán cho các bản ghi Budget.
 */
export function normalizeToGMT7Month(date: Date) {
  // Trích xuất year/month theo GMT+7
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = formatter.formatToParts(date);
  const year = parseInt(parts.find(p => p.type === "year")!.value);
  const month = parseInt(parts.find(p => p.type === "month")!.value) - 1;
  
  // Trả về ngày mùng 1 của tháng đó ở 00:00:00 UTC (phù hợp với Prisma @db.Date)
  return new Date(Date.UTC(year, month, 1));
}