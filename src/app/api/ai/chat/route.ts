import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Groq from "groq-sdk";
import { subDays, startOfDay, startOfMonth } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Lấy ngữ cảnh tài chính thực của user song song
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

    // Tính toán số liệu
    const totalBalance = wallets.reduce((s, w) => s + Number(w.balance), 0);

    const monthlyTransactions = transactions.filter((t) => t.date >= monthStart);
    const monthlyIncome = monthlyTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((s, t) => s + Number(t.amount), 0);
    const monthlyExpense = monthlyTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((s, t) => s + Number(t.amount), 0);

    // Top 5 danh mục chi tiêu
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

    // Tiến độ ngân sách
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
        return `${b.category?.name || "Khác"}: đã dùng ${spentAmount.toLocaleString("vi-VN")}đ/${limit.toLocaleString("vi-VN")}đ (${percent}%)`;
      })
    );

    // Tạo system prompt với ngữ cảnh thực
    const systemPrompt = `Bạn là FinBot — trợ lý tài chính cá nhân thông minh, thân thiện và chuyên nghiệp.
Bạn có quyền truy cập dữ liệu tài chính THỰC của người dùng (tính đến ${now.toLocaleDateString("vi-VN")}):

📊 TỔNG QUAN TÀI SẢN:
- Tổng số dư tất cả ví: ${totalBalance.toLocaleString("vi-VN")}đ
- Danh sách ví: ${wallets.map((w) => `${w.name} (${Number(w.balance).toLocaleString("vi-VN")}đ)`).join(", ") || "Chưa có ví"}

📅 THÁNG NÀY:
- Tổng thu nhập: ${monthlyIncome.toLocaleString("vi-VN")}đ
- Tổng chi tiêu: ${monthlyExpense.toLocaleString("vi-VN")}đ
- Tiết kiệm ròng: ${(monthlyIncome - monthlyExpense).toLocaleString("vi-VN")}đ

🏷️ TOP DANH MỤC CHI TIÊU (30 ngày):
${topCategories.length > 0 ? topCategories.join("\n") : "Chưa có dữ liệu"}

💰 NGÂN SÁCH:
${budgetStatus.length > 0 ? budgetStatus.join("\n") : "Chưa thiết lập ngân sách"}

HƯỚNG DẪN:
- Trả lời ngắn gọn, thân thiện, dùng số liệu thực ở trên khi được hỏi
- Dùng emoji phù hợp để dễ đọc
- Ngôn ngữ: Tiếng Việt
- Nếu được hỏi về dữ liệu không có, hãy nói thẳng là không có thông tin
- Không bịa đặt số liệu`;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: "Xin lỗi, dịch vụ AI hiện không khả dụng. Hãy kiểm tra cấu hình API key.",
      });
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10), // Giữ 10 tin nhắn gần nhất
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content ?? "Xin lỗi, tôi không thể trả lời lúc này.";
    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const status = (error as { status?: number })?.status;
    if (status === 429) {
      return NextResponse.json({
        reply: "⏳ Đang bận xử lý quá nhiều yêu cầu. Hãy thử lại sau vài giây nhé!",
      });
    }
    console.error("Chat AI Error:", error);
    return NextResponse.json({
      reply: "Có lỗi xảy ra, vui lòng thử lại sau.",
    });
  }
}
