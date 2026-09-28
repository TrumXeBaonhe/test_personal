"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Send } from "lucide-react";
import { QRGenerator } from "@/components/qr/qr-generator";
import { QRScanner } from "@/components/qr/qr-scanner";
import { TransferForm } from "@/components/qr/transfer-form";
import { FadeIn } from "@/components/fade-in";
import { ensureAccountNumber } from "@/app/actions/profile-actions";

export default function QRCodePage() {
  const [scannedAccount, setScannedAccount] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState<string | null>(null);
  const [userName, setUserName] = useState("Người dùng");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const result = await ensureAccountNumber();
        if (result.success && result.accountNumber) {
          setAccountNumber(result.accountNumber);
        }
      } catch (error) {
        console.error("Failed to load account number:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <div className="flex flex-col space-y-8 pb-10">
      <FadeIn delay={0.1}>
        <div className="relative overflow-hidden rounded-[32px] border border-border/60 bg-gradient-to-br from-violet-600/10 via-background to-cyan-500/10 p-6 shadow-[0_30px_80px_-32px_rgba(76,29,149,0.35)]">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Payments</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-gradient">Mã QR Thanh toán</h2>
            <p className="mt-2 text-sm text-muted-foreground">Tạo mã QR để nhận tiền hoặc quét mã QR để gửi tiền</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-full border bg-muted/40 p-1">
            <TabsTrigger value="generate" className="rounded-full">
              <QrCode className="mr-2 h-4 w-4" />
              Tạo QR
            </TabsTrigger>
            <TabsTrigger value="scan" className="rounded-full">
              <QrCode className="mr-2 h-4 w-4" />
              Quét QR
            </TabsTrigger>
            <TabsTrigger value="transfer" disabled={!scannedAccount} className="rounded-full">
              <Send className="mr-2 h-4 w-4" />
              Chuyển khoản
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-6">
            {accountNumber && !loading ? (
              <QRGenerator accountNumber={accountNumber} userName={userName} />
            ) : (
              <Card className="border-none bg-card/75 shadow-[0_25px_60px_-30px_rgba(76,29,149,0.35)]">
                <CardContent className="pt-6">
                  <div className="py-8 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                    <p className="mt-4 text-muted-foreground">Đang tải thông tin...</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="scan" className="mt-6">
            <QRScanner
              onScanSuccess={(data) => {
                setScannedAccount(data);
              }}
            />
          </TabsContent>

          <TabsContent value="transfer" className="mt-6">
            {scannedAccount ? (
              <TransferForm
                recipientAccountNumber={scannedAccount}
                onTransferSuccess={() => {
                  setScannedAccount(null);
                }}
              />
            ) : (
              <Card className="border-none bg-card/75 shadow-[0_25px_60px_-30px_rgba(76,29,149,0.35)]">
                <CardHeader>
                  <CardTitle>Chưa quét mã QR</CardTitle>
                  <CardDescription>Vui lòng quét mã QR trước để tiếp tục chuyển khoản</CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-none bg-blue-500/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">📲 Tạo mã QR</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Tạo mã QR từ số tài khoản của bạn. Chia sẻ mã QR này với những người muốn gửi tiền cho bạn.
            </CardContent>
          </Card>

          <Card className="border-none bg-emerald-500/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">🔍 Quét mã QR</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Quét mã QR của người khác bằng camera hoặc chọn ảnh từ máy. Hệ thống sẽ lấy thông tin người nhận.
            </CardContent>
          </Card>

          <Card className="border-none bg-purple-500/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">💰 Nhập số tiền</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Sau khi quét QR, nhập số tiền muốn gửi và thêm ghi chú (nếu cần). Kiểm tra lại trước khi xác nhận.
            </CardContent>
          </Card>

          <Card className="border-none bg-amber-500/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">✅ Xác nhận</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Xác nhận thông tin người nhận và số tiền. Giao dịch sẽ được hoàn tất ngay lập tức.
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </div>
  );
}
