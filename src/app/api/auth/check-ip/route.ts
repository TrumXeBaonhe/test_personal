import { auth } from "@/lib/auth";
import { isKnownIp, createOtp, recordKnownIp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/auth/check-ip
// Gọi ngay sau khi đăng nhập thành công để kiểm tra IP
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Lấy IP — trên localhost sẽ là "::1" hoặc "127.0.0.1"
  const rawIp =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  // Chuẩn hoá localhost IPv6 → IPv4
  const ip = rawIp === "::1" ? "127.0.0.1" : rawIp;

  const known = await isKnownIp(userId, ip);
  if (known) {
    // IP quen → cập nhật lastSeenAt, cho qua
    await recordKnownIp(userId, ip);
    return NextResponse.json({ requiresOtp: false });
  }

  // IP lạ (kể cả localhost lần đầu) → gửi OTP
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, fullName: true },
  });

  if (user) {
    const code = await createOtp(userId, "LOGIN");
    // Trong dev: OTP sẽ in ra terminal thay vì gửi email
    await sendOtpEmail(user.email, code, "LOGIN", user.fullName ?? undefined);
  }

  return NextResponse.json({ requiresOtp: true });
}
