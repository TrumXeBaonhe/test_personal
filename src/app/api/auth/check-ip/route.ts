import { auth } from "@/lib/auth";
import { isKnownIp, createOtp, recordKnownIp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientIp = getClientIp(req) || "127.0.0.1";
  const rateLimit = checkRateLimit(`check-ip:${session.user.id}`, 20, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." }, { status: 429 });
  }

  const userId = session.user.id;
  const rawIp = clientIp === "unknown" ? "127.0.0.1" : clientIp;

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
