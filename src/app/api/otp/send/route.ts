import { auth } from "@/lib/auth";
import { createOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OtpPurpose } from "@prisma/client";

// POST /api/otp/send
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { purpose } = await req.json();
    if (!["LOGIN", "PASSWORD_CHANGE"].includes(purpose)) {
      return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
    }

    // Rate limit: không gửi lại trong 60 giây
    const recentOtp = await prisma.otpToken.findFirst({
      where: {
        userId,
        purpose: purpose as OtpPurpose,
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const code = await createOtp(userId, purpose as OtpPurpose);
    await sendOtpEmail(user.email, code, purpose as "LOGIN" | "PASSWORD_CHANGE", user.fullName ?? undefined);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Không thể gửi email. Thử lại sau." }, { status: 500 });
  }
}
