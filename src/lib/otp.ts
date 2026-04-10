import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { OtpPurpose } from "@prisma/client";

/** Tạo mã OTP 6 số ngẫu nhiên */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Tạo và lưu OTP vào DB.
 * Xoá các OTP cũ cùng purpose của user trước khi tạo mới.
 * Trả về raw code (6 chữ số) để gửi qua email.
 */
export async function createOtp(userId: string, purpose: OtpPurpose): Promise<string> {
  // Xoá OTP cũ cùng purpose
  await prisma.otpToken.deleteMany({ where: { userId, purpose } });

  const code = generateOtpCode();
  const codeHash = await bcrypt.hash(code, 6); // salt=6 để nhanh hơn
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

  await prisma.otpToken.create({
    data: { userId, codeHash, purpose, expiresAt },
  });

  return code;
}

/**
 * Xác minh OTP. Trả về true nếu hợp lệ, false nếu sai/hết hạn.
 */
export async function verifyOtp(
  userId: string,
  code: string,
  purpose: OtpPurpose
): Promise<boolean> {
  const token = await prisma.otpToken.findFirst({
    where: {
      userId,
      purpose,
      used: false,
      expiresAt: { gte: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!token) return false;

  const isMatch = await bcrypt.compare(code, token.codeHash);
  if (!isMatch) return false;

  // Đánh dấu đã dùng
  await prisma.otpToken.update({
    where: { id: token.id },
    data: { used: true },
  });

  return true;
}

/** Lưu IP vào danh sách đã biết của user */
export async function recordKnownIp(userId: string, ipAddress: string): Promise<void> {
  await prisma.knownIp.upsert({
    where: { userId_ipAddress: { userId, ipAddress } },
    create: { userId, ipAddress },
    update: { lastSeenAt: new Date() },
  });
}

/** Kiểm tra IP có trong danh sách đã biết không */
export async function isKnownIp(userId: string, ipAddress: string): Promise<boolean> {
  const record = await prisma.knownIp.findUnique({
    where: { userId_ipAddress: { userId, ipAddress } },
  });
  return !!record;
}
