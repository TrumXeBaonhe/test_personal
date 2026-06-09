import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    const optimizedImage = await sharp(imageBuffer)
      .resize(400, 400, { fit: "cover", position: "center" })
      .webp({ quality: 80 })
      .toBuffer();

    const optimizedBase64 = optimizedImage.toString("base64");
    const avatarUrl = `data:image/webp;base64,${optimizedBase64}`;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl },
    });

    return NextResponse.json({ url: avatarUrl, success: true });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}
