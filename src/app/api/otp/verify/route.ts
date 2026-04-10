import { auth } from "@/lib/auth";
import { verifyOtp, recordKnownIp } from "@/lib/otp";
import { NextRequest, NextResponse } from "next/server";
import { OtpPurpose } from "@prisma/client";

// POST /api/otp/verify
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { code, purpose } = await req.json();

    if (!code || !purpose) {
      return NextResponse.json({ error: "Thiếu mã OTP hoặc purpose" }, { status: 400 });
    }

    const valid = await verifyOtp(userId, code, purpose as OtpPurpose);
    if (!valid) {
      return NextResponse.json(
        { error: "Mã OTP không đúng hoặc đã hết hạn." },
        { status: 400 }
      );
    }

    // Nếu xác thực đăng nhập → lưu IP vào known_ips
    if (purpose === "LOGIN") {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";
      if (ip !== "unknown") {
        await recordKnownIp(userId, ip);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
