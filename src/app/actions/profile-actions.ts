"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ActionResult, actionSuccess, actionError } from "@/lib/action-types";
import { z } from "zod";
import bcrypt from "bcryptjs";

const profileSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ").optional(),
  preferredCurrency: z.string().optional(),
});

export async function updateProfile(data: z.infer<typeof profileSchema>): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const userId = session.user.id;

    const validatedData = profileSchema.parse(data);

    await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: validatedData.fullName,
        // email: validatedData.email, // Thường không cho đổi email trực tiếp nếu dùng AuthProvider
      },
    });

    // Cập nhật currency trong metadata hoặc bảng User nếu có
    // Giả sử ta thêm field này vào User sau
    
    revalidatePath("/profile");
    revalidatePath("/");
    return actionSuccess();
  } catch (error) {
    return actionError(error);
  }
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
});

export async function updatePassword(data: z.infer<typeof passwordSchema>): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const userId = session.user.id;

    const validatedData = passwordSchema.parse(data);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true }
    });

    if (!user) return { success: false, error: "Không tìm thấy người dùng" };

    const isMatch = await bcrypt.compare(validatedData.currentPassword, user.passwordHash);
    if (!isMatch) return { success: false, error: "Mật khẩu hiện tại không đúng" };

    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedNewPassword
      },
    });

    revalidatePath("/profile");
    return actionSuccess();
  } catch (error) {
    return actionError(error);
  }
}
}