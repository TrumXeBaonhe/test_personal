import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accountNumber } = await request.json();

    if (!accountNumber) {
      return NextResponse.json({ error: "Account number is required" }, { status: 400 });
    }

    const qrCode = await QRCode.toDataURL(accountNumber, {
      errorCorrectionLevel: "high",
      type: "image/png",
      width: 300,
      margin: 1,
    });

    return NextResponse.json({ qrCode, success: true });
  } catch (error) {
    console.error("QR generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
