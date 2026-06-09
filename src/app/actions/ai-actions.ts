"use server";

import { auth } from "@/lib/auth";
import { getFinancialContext, getSystemPrompt, callGroq, isGroqAuthError } from "@/lib/ai-service";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-types";

export interface AIInsights {
  savings: string;
  goals: string;
}

/**
 * Lấy các gợi ý tài chính thông minh hiển thị trong báo cáo
 */
export async function getAIInsights(): Promise<ActionResult<AIInsights>> {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    const context = await getFinancialContext(userId);

    if (!context.hasData) {
      return actionSuccess({
        savings: "Chào mừng! Bạn chưa có dữ liệu giao dịch hoặc ví. Hãy bắt đầu nạp tiền hoặc tạo một khoản chi tiêu để FinBot có thể phân tích thói quen của bạn nhé. ✨",
        goals: "Hãy đặt mục tiêu tiết kiệm đầu tiên! Chúng tôi sẽ giúp bạn theo dõi đà tăng trưởng tài sản ngay khi bạn bắt đầu ghi chép."
      });
    }

    const systemPrompt = getSystemPrompt(context);
    const userPrompt = `Dựa trên dữ liệu trên, hãy đưa ra 2 thông tin GẮN GỌN (tối đa 30 từ mỗi cái) bằng tiếng Việt cho báo cáo tài chính:
1. Gợi ý tiết kiệm (Savings): Chỉ ra một điểm có thể cắt giảm hoặc nhắc nhở thói quen chi tiêu.
2. Mục tiêu/Dự báo (Goal): Dự báo số dư hoặc tiến độ tiết kiệm trong tương lai gần.

Yêu cầu output dạng JSON: {"savings": "...", "goals": "..."}`;

    try {
      const completion = await callGroq([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]);

      const content = completion.choices[0]?.message?.content ?? "";
      // Trích xuất JSON từ nội dung (đôi khi LLM trả về markdown code blocks)
      const jsonStr = content.match(/\{[\s\S]*\}/)?.[0] ?? "";
      if (jsonStr) {
        const insights = JSON.parse(jsonStr);
        return actionSuccess({
          savings: insights.savings || "Tiếp tục duy trì thói quen ghi chép nhé!",
          goals: insights.goals || "Bạn đang đi đúng hướng đấy."
        });
      }
    } catch (apiError) {
      if (isGroqAuthError(apiError)) {
        return actionSuccess({
          savings: "AI hiện chưa khả dụng do khóa API đã hết hạn. Hãy cập nhật GROQ_API_KEY để tiếp tục nhận phân tích tự động.",
          goals: `Tổng tài sản hiện có: ${context.totalBalance.toLocaleString("vi-VN")}đ. Hãy tiếp tục theo dõi mục tiêu tiết kiệm của bạn.`,
        });
      }

      console.error("Groq API error in getAIInsights:", apiError);
    }

    // Heuristic fallback nếu AI lỗi
    return actionSuccess({
      savings: `Bạn đang chi nhiều nhất cho "${context.topCategories[0]?.split(":")[0] || "các danh mục"}". Hãy thử đặt ngân sách cho nó nhé!`,
      goals: `Tổng tài sản hiện có: ${context.totalBalance.toLocaleString("vi-VN")}đ. Hãy cố gắng tăng trưởng nó trong tháng tới!`
    });

  } catch (error) {
    console.error("getAIInsights Error:", error);
    return actionError(error);
  }
}
