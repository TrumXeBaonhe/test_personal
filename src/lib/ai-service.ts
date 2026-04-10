import prisma from "@/lib/prisma";
import { subDays, startOfDay, startOfMonth } from "date-fns";
import Groq from "groq-sdk";

export interface FinancialContext {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  topCategories: string[];
  budgetStatus: string[];
  hasData: boolean;
  wallets: { name: string; balance: number }[];
}

/**
 * Lấy ngữ cảnh tài chính thực tế của người dùng
 */
export async function getFinancialContext(userId: string): Promise<FinancialContext> {
  const now = new Date();
  const thirtyDaysAgo = startOfDay(subDays(now, 30));
  const monthStart = startOfMonth(now);

  const [wallets, transactions, budgets] = await Promise.all([
    prisma.wallet.findMany({
      where: { userId },
      select: { name: true, balance: true },
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
      include: { category: { select: { name: true, type: true } } },
      orderBy: { date: "desc" },
      take: 50,
    }),
    prisma.budget.findMany({
      where: { userId },
      include: { category: { select: { name: true } } },
    }),
  ]);

  const hasData = wallets.length > 0 || transactions.length > 0;
  const totalBalance = wallets.reduce((s, w) => s + Number(w.balance), 0);

  const monthlyTransactions = transactions.filter((t) => t.date >= monthStart);
  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + Number(t.amount), 0);
  const monthlyExpense = monthlyTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + Number(t.amount), 0);

  const categoryMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "EXPENSE" && t.category?.name)
    .forEach((t) => {
      const cat = t.category!.name!;
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(t.amount);
    });
  
  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, amount]) => `${name}: ${amount.toLocaleString("vi-VN")}đ`);

  const budgetStatus = await Promise.all(
    budgets.map(async (b) => {
      const spent = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: b.categoryId,
          type: "EXPENSE",
          date: { gte: monthStart },
        },
        _sum: { amount: true },
      });
      const spentAmount = Number(spent._sum.amount || 0);
      const limit = Number(b.limitAmount);
      const percent = limit > 0 ? Math.round((spentAmount / limit) * 100) : 0;
      return `${b.category?.name || "Khác"}: ${spentAmount.toLocaleString("vi-VN")}đ/${limit.toLocaleString("vi-VN")}đ (${percent}%)`;
    })
  );

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    topCategories,
    budgetStatus,
    hasData,
    wallets: wallets.map(w => ({ name: w.name, balance: Number(w.balance) })),
  };
}

/**
 * Tạo prompt hệ thống cho AI dựa trên ngữ cảnh tài chính
 */
export function getSystemPrompt(context: FinancialContext): string {
  const { totalBalance, monthlyIncome, monthlyExpense, topCategories, budgetStatus, wallets } = context;
  const now = new Date();

  return `Bạn là FinBot — trợ lý tài chính cá nhân thông minh. 
Dữ liệu thực tế của người dùng tính đến ${now.toLocaleDateString("vi-VN")}:

📊 TỔNG QUAN:
- Tổng số dư: ${totalBalance.toLocaleString("vi-VN")}đ
- Ví: ${wallets.map((w) => `${w.name} (${w.balance.toLocaleString("vi-VN")}đ)`).join(", ") || "Chưa có"}

📅 THÁNG NÀY:
- Thu: ${monthlyIncome.toLocaleString("vi-VN")}đ | Chi: ${monthlyExpense.toLocaleString("vi-VN")}đ
- Tiết kiệm ròng: ${(monthlyIncome - monthlyExpense).toLocaleString("vi-VN")}đ

🏷️ CHI TIÊU NHIỀU NHẤT (30 ngày):
${topCategories.length > 0 ? topCategories.join("\n") : "Chưa có dữ liệu"}

💰 NGÂN SÁCH:
${budgetStatus.length > 0 ? budgetStatus.join("\n") : "Chưa thiết lập"}

HƯỚNG DẪN:
- Luôn dựa trên số liệu thực ở trên.
- Ngôn ngữ: Tiếng Việt, thân thiện, súc tích.
- Nếu dữ liệu trống, hãy hướng dẫn người dùng bắt đầu nạp tiền hoặc tạo giao dịch.`;
}

/**
 * Gọi Groq API
 */
export async function callGroq(messages: { role: string; content: string }[]) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY");

  const groq = new Groq({ apiKey });
  return groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: messages as any,
    temperature: 0.7,
    max_tokens: 500,
  });
}
