import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyOtp, recordKnownIp } from "@/lib/otp";
import { OtpPurpose } from "@prisma/client";

// POST /api/auth/verify-login-otp
// Xác minh OTP đăng nhập — KHÔNG yêu cầu session (pre-auth)
export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    // Tìm user bằng email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Mã OTP không đúng hoặc đã hết hạn." }, { status: 400 });
    }

    // Xác minh OTP
    const valid = await verifyOtp(user.id, otp, OtpPurpose.LOGIN);
    if (!valid) {
      return NextResponse.json({ error: "Mã OTP không đúng hoặc đã hết hạn." }, { status: 400 });
    }

    // Ghi nhận IP là đã biết
    const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const ip = rawIp === "::1" ? "127.0.0.1" : rawIp;
    await recordKnownIp(user.id, ip);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify login OTP error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
