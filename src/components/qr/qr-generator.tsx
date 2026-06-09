"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Copy, RefreshCw } from "lucide-react";
import Image from "next/image";

interface QRGeneratorProps {
  accountNumber: string;
  userName: string;
}

export function QRGenerator({ accountNumber, userName }: QRGeneratorProps) {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateQR();
  }, []);

  const generateQR = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Lỗi tạo mã QR");
      }

      setQrImage(data.qrCode);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi tạo mã QR");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(accountNumber);
    toast.success("Đã sao chép số tài khoản!");
  };

  const handleDownload = () => {
    if (!qrImage) return;

    const link = document.createElement("a");
    link.href = qrImage;
    link.download = `qr-${accountNumber}.png`;
    link.click();
    toast.success("Đã tải xuống mã QR!");
  };

  return (
    <Card className="glass-card border-none">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Mã QR của bạn</CardTitle>
        <CardDescription>Chia sẻ mã QR này để nhận chuyển khoản</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Account Info */}
        <div className="p-4 bg-muted/40 rounded-2xl space-y-2">
          <p className="text-xs font-bold uppercase text-muted-foreground">Số tài khoản</p>
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono font-bold text-lg">{accountNumber}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyAccountNumber}
              className="rounded-full"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Tên: {userName}</p>
        </div>

        {/* QR Code Display */}
        <div className="flex justify-center">
          {qrImage ? (
            <div className="relative h-64 w-64 border-4 border-primary/20 rounded-2xl overflow-hidden bg-white p-4">
              <Image
                src={qrImage}
                alt="QR Code"
                fill
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <div className="h-64 w-64 bg-muted/40 rounded-2xl animate-pulse" />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={generateQR}
            disabled={isLoading}
            className="flex-1 rounded-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tạo lại
          </Button>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={!qrImage || isLoading}
            className="flex-1 rounded-full shadow-lg shadow-primary/20"
          >
            <Download className="h-4 w-4 mr-2" />
            Tải xuống
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          💡 Chia sẻ mã QR này để những người khác có thể quét và chuyển tiền cho bạn
        </p>
      </CardContent>
    </Card>
  );
}
