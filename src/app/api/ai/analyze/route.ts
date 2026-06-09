import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Groq from "groq-sdk";
import { subDays, startOfDay } from "date-fns";
import { NextResponse } from "next/server";
import { isGroqAuthError } from "@/lib/ai-service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));

  try {
    // 1. Lấy giao dịch trong 30 ngày gần nhất
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
            gte: thirtyDaysAgo,
        },
      },
      include: {
        category: true,
      },
    });

    if (transactions.length === 0) {
      return NextResponse.json({ 
        advice: [
          "Bạn chưa có giao dịch nào trong 30 ngày qua. Hãy bắt đầu ghi chép để AI có thể phân tích nhé!",
          "Ghi chép chi tiêu hàng ngày giúp bạn quản lý tài chính tốt hơn.",
          "Hãy thử thêm một ví mới để bắt đầu quản lý dòng tiền của mình."
        ] 
      });
    }

    // 2. Tóm tắt dữ liệu (Ẩn danh hóa)
    const summary = transactions.reduce((acc, t) => {
      const catName = t.category?.name || "Khác";
      if (!acc[catName]) acc[catName] = { income: 0, expense: 0 };
      if (t.type === "INCOME") acc[catName].income += Number(t.amount);
      if (t.type === "EXPENSE") acc[catName].expense += Number(t.amount);
      return acc;
    }, {} as Record<string, { income: number, expense: number }>);

    const dataString = JSON.stringify(summary);

    // 3. Kiểm tra API key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        advice: [
          "💡 Mẹo: Bạn nên dành ra 20% thu nhập để tiết kiệm trước khi chi tiêu.",
          "📊 Cảnh báo: Chi tiêu cho ăn uống đang chiếm tỉ trọng lớn, hãy thử nấu ăn tại nhà.",
          "🎯 Gợi ý: Hãy thiết lập Ngân sách cho các danh mục không thiết yếu để tối ưu dòng tiền."
        ] 
      });
    }

    // 4. Gọi Groq AI (Llama 3.3 70B)
    const groq = new Groq({ apiKey });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Bạn là một chuyên gia cố vấn tài chính cá nhân thông minh. Trả lời ngắn gọn, súc tích, có tính hành động cao. Ngôn ngữ: Tiếng Việt.",
        },
        {
          role: "user",
          content: `Dưới đây là tóm tắt chi tiêu của người dùng trong 30 ngày qua (dạng JSON):
${dataString}

Dựa trên dữ liệu này, hãy đưa ra đúng 3 lời khuyên tài chính. Mỗi lời khuyên không quá 25 từ. Tập trung vào tiết kiệm và tối ưu hóa dựa trên các danh mục chi tiêu nhiều nhất. Trả về danh sách 3 dòng văn bản, không có số thứ tự, không có tiêu đề.`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 300,
    });

    const text = chatCompletion.choices[0]?.message?.content ?? "";

    // 5. Xử lý chuỗi văn bản trả về thành mảng
    const advice = text
      .split('\n')
      .map(s => s.replace(/^[-*0-9.]+\s*/, '').trim())
      .filter(s => s.length > 0)
      .slice(0, 3);

    return NextResponse.json({ advice });
  } catch (error: unknown) {
    if (isGroqAuthError(error)) {
      return NextResponse.json({
        advice: [
          "AI hiện chưa khả dụng do khóa API đã hết hạn. Hãy cập nhật GROQ_API_KEY để bật phân tích tự động.",
          "Trong lúc chờ, hãy ưu tiên theo dõi các khoản chi lớn nhất để kiểm soát ngân sách.",
          "Đặt một mục tiêu tiết kiệm cố định mỗi tháng để giữ đà tài chính ổn định.",
        ],
      });
    }

    // Xử lý lỗi quota / rate limit - không log để tránh spam console
    const status = (error as { status?: number })?.status;
    if (status === 429) {
      return NextResponse.json({
        advice: [
          "Không thể kết nối với AI ngay lúc này. Hãy thử lại sau.",
          "Kiểm định ngân sách hàng tuần giúp bạn tránh chi tiêu quá mức.",
          "Hãy luôn duy trì một khoản dự phòng khẩn cấp tương đương 3-6 tháng chi tiêu.",
        ],
      });
    }
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ 
      advice: [
        "Không thể kết nối với AI ngay lúc này. Hãy thử lại sau.",
        "Kiểm định ngân sách hàng tuần giúp bạn tránh chi tiêu quá mức.",
        "Hãy luôn duy trì một khoản dự phòng khẩn cấp tương đương 3-6 tháng chi tiêu."
      ] 
    });
  }
}
