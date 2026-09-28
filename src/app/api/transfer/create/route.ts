import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Decimal } from "@prisma/client/runtime/library";
import { sanitizeText, validateSameOrigin } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    if (!validateSameOrigin(request)) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { toUserId, amount, note } = await request.json();

    if (!toUserId || typeof toUserId !== "string" || !toUserId.trim()) {
      return NextResponse.json({ error: "Invalid transfer data" }, { status: 400 });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > 1_000_000_000) {
      return NextResponse.json({ error: "Invalid transfer data" }, { status: 400 });
    }

    const safeNote = typeof note === "string" ? sanitizeText(note, 500) : null;

    if (session.user.id === toUserId) {
      return NextResponse.json({ error: "Cannot transfer to yourself" }, { status: 400 });
    }

    const recipient = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { id: true, email: true },
    });

    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    const transfer = await prisma.transfer.create({
      data: {
        fromUserId: session.user.id,
        toUserId: toUserId,
        amount: new Decimal(numericAmount),
        note: safeNote,
        status: "completed",
      },
      include: {
        fromUser: {
          select: { id: true, fullName: true, email: true },
        },
        toUser: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    return NextResponse.json({ transfer, success: true });
  } catch (error) {
    console.error("Transfer creation error:", error);
    return NextResponse.json(
      { error: "Failed to create transfer" },
      { status: 500 }
    );
  }
}
