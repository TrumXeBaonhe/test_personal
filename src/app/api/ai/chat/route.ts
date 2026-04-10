import { auth } from "@/lib/auth";
import { getFinancialContext, getSystemPrompt, callGroq } from "@/lib/ai-service";
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

    // Lấy ngữ cảnh tài chính thực thông qua service tập trung
    const context = await getFinancialContext(userId);
    const systemPrompt = getSystemPrompt(context);

    try {
      const completion = await callGroq([
        { role: "system", content: systemPrompt },
        ...messages.slice(-10),
      ]);

      const reply = completion.choices[0]?.message?.content ?? "Xin lỗi, tôi không thể trả lời lúc này.";
      return NextResponse.json({ reply });
    } catch (apiError: any) {
      if (apiError?.status === 429) {
        return NextResponse.json({
          reply: "⏳ Đang bận xử lý quá nhiều yêu cầu. Hãy thử lại sau vài giây nhé!",
        });
      }
      throw apiError;
    }
  } catch (error: unknown) {
    console.error("Chat AI Error:", error);
    return NextResponse.json({
      reply: "Có lỗi xảy ra, vui lòng thử lại sau.",
    });
  }
}
