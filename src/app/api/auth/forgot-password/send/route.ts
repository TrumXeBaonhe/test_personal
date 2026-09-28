import { createOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OtpPurpose } from "@prisma/client";
import { checkRateLimit, getClientIp, normalizeEmail } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normalizedEmail = typeof email === "string" ? normalizeEmail(email) : "";

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: "Vui lòng nhập email hợp lệ" }, { status: 400 });
    }

    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`forgot-password:${ip}`, 5, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, fullName: true },
    });

    if (!user) {
      // Vì lý do bảo mật, không báo là email không tồn tại.
      // Cứ báo là đã gửi nếu thành công (hoặc lỗi hệ thống)
      return NextResponse.json({ success: true });
    }

    const userId = user.id;
    const purpose = OtpPurpose.PASSWORD_RESET;

    // Rate limit: không gửi lại trong 60 giây
    const recentOtp = await prisma.otpToken.findFirst({
      where: {
        userId,
        purpose,
        used: false,
        createdAt: { gte: new Date(Date.now() - 60_000) },
      },
    });
    
    if (recentOtp) {
      return NextResponse.json(
        { error: "Vui lòng đợi 60 giây trước khi gửi lại mã." },
        { status: 429 }
      );
    }

    const code = await createOtp(userId, purpose);
    await sendOtpEmail(user.email, code, "PASSWORD_RESET", user.fullName ?? undefined);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password send error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống. Thử lại sau." }, { status: 500 });
  }
}
