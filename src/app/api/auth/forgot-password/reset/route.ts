import { verifyOtp } from "@/lib/otp";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OtpPurpose } from "@prisma/client";
import bcrypt from "bcryptjs";
import { checkRateLimit, getClientIp, normalizeEmail } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();
    const normalizedEmail = typeof email === "string" ? normalizeEmail(email) : "";

    if (!normalizedEmail || !otp || !newPassword) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      return NextResponse.json({ error: "Mật khẩu phải có từ 8 đến 128 ký tự" }, { status: 400 });
    }

    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`forgot-password-reset:${ip}`, 10, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Mã OTP không đúng hoặc đã hết hạn." }, { status: 400 });
    }

    // Xác minh OTP với purpose là PASSWORD_RESET
    const valid = await verifyOtp(user.id, otp, OtpPurpose.PASSWORD_RESET);
    if (!valid) {
      return NextResponse.json({ error: "Mã OTP không đúng hoặc đã hết hạn." }, { status: 400 });
    }

    // OTP đúng -> hash mật khẩu mới
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Cập nhật mật khẩu
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Xóa tất cả OTP khác của user này để đảm bảo an toàn sau khi đổi pass
    await prisma.otpToken.deleteMany({
      where: { userId: user.id }
    });

    return NextResponse.json({ success: true, message: "Mật khẩu đã được khôi phục thành công." });
  } catch (error) {
    console.error("Forgot password reset error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống. Thử lại sau." }, { status: 500 });
  }
}
