import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Mail, Wallet, CreditCard, QrCode } from "lucide-react";
import Image from "next/image";
import { ProfileForm } from "@/components/profile/profile-form";
import { SecuritySettings } from "@/components/profile/security-settings";
import { AvatarUploadWrapper } from "@/components/profile/avatar-upload-wrapper";
import { QRGenerator } from "@/components/qr/qr-generator";
import { FadeIn } from "@/components/fade-in";
import { ensureAccountNumber } from "@/app/actions/profile-actions";

export default async function ProfilePage() {
  const session = await auth();
  const userId = session!.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          wallets: true,
          transactions: true,
        }
      }
    }
  });

  if (!user) return null;

  let accountNumber = user.accountNumber;
  if (!accountNumber) {
    const result = await ensureAccountNumber();
    if (result.success && result.accountNumber) {
      accountNumber = result.accountNumber;
    }
  }

  return (
    <div className="flex flex-col space-y-8 pb-10">
      <FadeIn delay={0.1}>
        <div className="relative overflow-hidden rounded-[32px] border border-border/60 bg-gradient-to-br from-violet-600/10 via-background to-cyan-500/10 p-6 shadow-[0_30px_80px_-32px_rgba(76,29,149,0.35)]">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Profile</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-gradient">Hồ sơ cá nhân</h2>
            <p className="mt-2 text-sm text-muted-foreground">Quản lý thông tin tài khoản và thiết lập cá nhân của bạn</p>
          </div>
        </div>
      </FadeIn>

      <div className="grid gap-6 md:grid-cols-3">
        <FadeIn delay={0.2} direction="left" className="md:col-span-1">
          <Card className="h-full overflow-hidden border-none bg-card/75 shadow-[0_25px_60px_-30px_rgba(76,29,149,0.35)] backdrop-blur-xl">
            <div className="relative h-24 w-full bg-gradient-to-r from-violet-600/20 via-primary/10 to-cyan-500/10">
              <div className="absolute -bottom-10 left-6">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border-4 border-background bg-card shadow-xl">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt="Avatar"
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-primary" />
                  )}
                </div>
              </div>
            </div>
            <CardHeader className="pb-4 pt-14">
              <CardTitle className="text-xl font-bold">{user.fullName || "Người dùng SpendWise"}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> {user.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2">
                    <Wallet className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Số ví</span>
                </div>
                <span className="font-bold">{user._count.wallets}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-500/10 p-2">
                    <CreditCard className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span className="text-sm font-medium">Giao dịch</span>
                </div>
                <span className="font-bold">{user._count.transactions}</span>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.3} direction="up" className="md:col-span-2">
          <Card className="h-full border-none bg-card/75 shadow-[0_25px_60px_-30px_rgba(76,29,149,0.35)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Chỉnh sửa thông tin</CardTitle>
              <CardDescription>Cập nhật họ tên và các thiết lập tài khoản</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm user={{
                fullName: user.fullName,
                email: user.email,
                avatarUrl: user.avatarUrl,
                currency: user.currency
              }} />
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={0.35}>
        <Card className="border-none bg-primary/5 shadow-[0_25px_60px_-30px_rgba(76,29,149,0.35)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <User className="h-5 w-5" />
              Ảnh đại diện
            </CardTitle>
            <CardDescription>Tải lên hoặc cập nhật ảnh đại diện của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarUploadWrapper
              currentAvatarUrl={user.avatarUrl}
            />
          </CardContent>
        </Card>
      </FadeIn>

      {accountNumber && (
        <FadeIn delay={0.4}>
          <Card className="border-none bg-primary/5 shadow-[0_25px_60px_-30px_rgba(76,29,149,0.35)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <QrCode className="h-5 w-5" />
                Mã QR thanh toán
              </CardTitle>
              <CardDescription>Chia sẻ mã QR này để nhận chuyển khoản từ người khác</CardDescription>
            </CardHeader>
            <CardContent>
              <QRGenerator
                accountNumber={accountNumber}
                userName={user.fullName || "Người dùng"}
              />
            </CardContent>
          </Card>
        </FadeIn>
      )}

      <FadeIn delay={0.45}>
        <Card className="border-none bg-primary/5 shadow-[0_25px_60px_-30px_rgba(76,29,149,0.35)]">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Bảo mật & Quyền riêng tư</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <SecuritySettings />
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
