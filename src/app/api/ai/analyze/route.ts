import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { subDays, startOfDay } from "date-fns";
import { NextResponse } from "next/server";

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

    // 3. Gọi Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Mock advice if API key is missing
      return NextResponse.json({ 
        advice: [
          "💡 Mẹo: Bạn nên dành ra 20% thu nhập để tiết kiệm trước khi chi tiêu.",
          "📊 Cảnh báo: Chi tiêu cho ăn uống đang chiếm tỉ trọng lớn, hãy thử nấu ăn tại nhà.",
          "🎯 Gợi ý: Hãy thiết lập Ngân sách cho các danh mục không thiết yếu để tối ưu dòng tiền."
        ] 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Bạn là một chuyên gia cố vấn tài chính cá nhân thông minh. 
      Dưới đây là tóm tắt chi tiêu của người dùng trong 30 ngày qua (dữ liệu dạng JSON, đơn vị tiền tệ do người dùng chọn):
      ${dataString}

      Dựa trên dữ liệu này, hãy đưa ra đúng 3 lời khuyên tài chính ngắn gọn, súc tích và có tính hành động cao.
      Mỗi lời khuyên không quá 25 từ. Tập trung vào việc tiết kiệm và tối ưu hóa dựa trên các danh mục chi tiêu nhiều nhất.
      Trả về kết quả dưới dạng danh sách 3 dòng văn bản, không có số thứ tự, không có tiêu đề.
      Ngôn ngữ: Tiếng Việt.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Xử lý chuỗi văn bản trả về thành mảng
    const advice = text
      .split('\n')
      .map(s => s.replace(/^[-*0-9.]+\s*/, '').trim())
      .filter(s => s.length > 0)
      .slice(0, 3);

    return NextResponse.json({ advice });
  } catch (error) {
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
