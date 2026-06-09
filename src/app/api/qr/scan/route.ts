import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isValidAccountNumber } from "@/lib/account-utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accountNumber } = await request.json();

    if (!accountNumber || !isValidAccountNumber(accountNumber)) {
      return NextResponse.json({ error: "Invalid account number format" }, { status: 400 });
    }

    const recipient = await prisma.user.findUnique({
      where: { accountNumber },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        accountNumber: true,
      },
    });

    if (!recipient) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if (recipient.id === session.user.id) {
      return NextResponse.json({ error: "Cannot transfer to yourself" }, { status: 400 });
    }

    return NextResponse.json({ recipient, success: true });
  } catch (error) {
    console.error("QR scan error:", error);
    return NextResponse.json(
      { error: "Failed to process QR code" },
      { status: 500 }
    );
  }
}
