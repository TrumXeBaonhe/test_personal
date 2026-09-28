import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { generateAccountNumber } from "@/lib/account-utils";
import { getClientIp, normalizeEmail, checkRateLimit, sanitizeText, validateSameOrigin } from "@/lib/security";

const registerSchema = z.object({
  fullName: z.string().trim().min(1, "Họ và tên không được để trống").max(80),
  email: z.string().trim().email("Email không hợp lệ").max(255),
  password: z.string().min(8, "Mật khẩu phải từ 8 ký tự trở lên").max(128),
});

export async function POST(req: Request) {
  try {
    if (!validateSameOrigin(req as Request)) {
      return NextResponse.json({ message: "Forbidden origin" }, { status: 403 });
    }

    const body = await req.json();
    const ip = getClientIp(req as Request);
    const rateLimit = checkRateLimit(`register:${ip}`, 5, 60_000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
        { status: 429 }
      );
    }

    const { fullName, email, password } = registerSchema.parse(body);
    const normalizedEmail = normalizeEmail(email);
    const safeFullName = sanitizeText(fullName, 80);

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email này đã được sử dụng." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Sử dụng $transaction để bọc toàn bộ khối cập nhật nhằm đảm bảo tính toàn vẹn (Integrity)
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          fullName: safeFullName,
          passwordHash: hashedPassword,
          accountNumber: generateAccountNumber(),
        },
      });

      // 2. Tạo Wallet mặc định ("Tiền mặt")
      await tx.wallet.create({
        data: {
          userId: user.id,
          name: "Tiền mặt",
          balance: 0,
        },
      });

      // 3. Tạo 5 Category mặc định (1 INCOME, 4 EXPENSE)
      const categories = [
        { name: "Lương", type: "INCOME" as const },
        { name: "Ăn uống", type: "EXPENSE" as const },
        { name: "Di chuyển", type: "EXPENSE" as const },
        { name: "Hóa đơn", type: "EXPENSE" as const },
        { name: "Giải trí", type: "EXPENSE" as const },
      ];

      await tx.category.createMany({
        data: categories.map((cat) => ({
          userId: user.id,
          name: cat.name,
          type: cat.type,
        })),
      });

      return user;
    });

    return NextResponse.json(
      { message: "Tạo tài khoản thành công!", userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Lỗi đăng ký:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra từ máy chủ." },
      { status: 500 }
    );
  }
}
