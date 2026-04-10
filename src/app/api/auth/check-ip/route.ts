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

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // IP không xác định được → không yêu cầu OTP (localhost/dev)
  if (ip === "unknown" || ip === "::1" || ip === "127.0.0.1") {
    await recordKnownIp(userId, ip);
    return NextResponse.json({ requiresOtp: false });
  }

  const known = await isKnownIp(userId, ip);
  if (known) {
    // Cập nhật lastSeenAt
    await recordKnownIp(userId, ip);
    return NextResponse.json({ requiresOtp: false });
  }

  // IP lạ → gửi OTP
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, fullName: true },
  });

  if (user) {
    const code = await createOtp(userId, "LOGIN");
    await sendOtpEmail(user.email, code, "LOGIN", user.fullName ?? undefined);
  }

  return NextResponse.json({ requiresOtp: true });
}
