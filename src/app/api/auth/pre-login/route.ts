import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { isKnownIp, createOtp, recordKnownIp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

// POST /api/auth/pre-login
// Xác minh credentials + kiểm tra IP — KHÔNG tạo session
// Trả về: requiresOtp (boolean)
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    // 1. Tìm user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true, fullName: true },
    });

    // Trả lỗi chung để tránh user enumeration
    if (!user) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không chính xác." }, { status: 401 });
    }

    // 2. Kiểm tra mật khẩu
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không chính xác." }, { status: 401 });
    }

    // 3. Lấy IP
    const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const ip = rawIp === "::1" ? "127.0.0.1" : rawIp;

    // 4. Kiểm tra IP
    const known = await isKnownIp(user.id, ip);
    if (known) {
      // IP quen → cập nhật lastSeenAt, cho qua ngay
      await recordKnownIp(user.id, ip);
      return NextResponse.json({ requiresOtp: false });
    }

    // 5. IP lạ → tạo OTP và gửi email
    const code = await createOtp(user.id, "LOGIN");
    await sendOtpEmail(user.email, code, "LOGIN", user.fullName ?? undefined);

    return NextResponse.json({ requiresOtp: true });
  } catch (error) {
    console.error("Pre-login error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
