import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const VALID_IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageData } = await request.json();

    if (typeof imageData !== "string" || !imageData.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    const match = imageData.match(/^data:(image\/(png|jpeg|webp));base64,(.*)$/i);
    if (!match) {
      return NextResponse.json({ error: "Unsupported image format" }, { status: 400 });
    }

    const mimeType = match[1].toLowerCase();
    const base64Data = match[3];

    if (base64Data.length === 0 || base64Data.length > (MAX_AVATAR_BYTES * 4) / 3 + 1024) {
      return NextResponse.json({ error: "Image size exceeds the allowed limit" }, { status: 400 });
    }

    const imageBuffer = Buffer.from(base64Data, "base64");
    if (imageBuffer.length === 0 || imageBuffer.length > MAX_AVATAR_BYTES) {
      return NextResponse.json({ error: "Image size exceeds the allowed limit" }, { status: 400 });
    }

    const metadata = await sharp(imageBuffer).metadata();
    if (!metadata.width || !metadata.height || !VALID_IMAGE_MIME_TYPES.has(mimeType)) {
      return NextResponse.json({ error: "Invalid image content" }, { status: 400 });
    }

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
