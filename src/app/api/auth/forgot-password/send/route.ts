import { createOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OtpPurpose } from "@prisma/client";

// POST /api/auth/forgot-password/send
// Gửi mã OTP khôi phục mật khẩu - KHÔNG yêu cầu session
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Vui lòng nhập email" }, { status: 400 });
    }

    // Kiểm tra user có tồn tại không
    const user = await prisma.user.findUnique({
      where: { email },
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
