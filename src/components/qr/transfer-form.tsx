"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Send, AlertCircle } from "lucide-react";
import Image from "next/image";

interface TransferFormProps {
  recipientAccountNumber: string;
  onTransferSuccess?: () => void;
}

interface RecipientInfo {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  accountNumber: string;
}

export function TransferForm({ recipientAccountNumber, onTransferSuccess }: TransferFormProps) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [recipient, setRecipient] = useState<RecipientInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleGetRecipientInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/qr/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountNumber: recipientAccountNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không tìm thấy tài khoản");
      }

      setRecipient(data.recipient);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi lấy thông tin người nhận");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (!recipient) {
      toast.error("Vui lòng lấy thông tin người nhận");
      return;
    }

    setIsConfirming(true);
    try {
      const response = await fetch("/api/transfer/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUserId: recipient.id,
          amount: parseFloat(amount),
          note: note || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Chuyển khoản thất bại");
      }

      toast.success("Chuyển khoản thành công!");
      setAmount("");
      setNote("");
      setRecipient(null);
      onTransferSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi chuyển khoản");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Recipient Info */}
      {!recipient ? (
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle>Thông tin người nhận</CardTitle>
            <CardDescription>Nhấn nút bên dưới để lấy thông tin từ số tài khoản</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-xs font-bold uppercase text-muted-foreground">
                  Số tài khoản
                </Label>
                <Input
                  id="accountNumber"
                  value={recipientAccountNumber}
                  disabled
                  className="h-12 bg-muted/40 border-none rounded-2xl"
                />
              </div>

              <Button
                onClick={handleGetRecipientInfo}
                disabled={isLoading || !recipientAccountNumber}
                className="w-full rounded-full shadow-lg shadow-primary/20 h-12"
              >
                {isLoading ? "Đang tải..." : "Lấy thông tin người nhận"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card border-none bg-emerald-500/5 border-emerald-500/20">
          <CardHeader>
            <CardTitle className="text-emerald-600">Người nhận</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {recipient.avatarUrl ? (
                <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-emerald-500/20">
                  <Image
                    src={recipient.avatarUrl}
                    alt={recipient.fullName || "User"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-muted/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-muted-foreground">
                    {recipient.fullName?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{recipient.fullName || "Người dùng"}</p>
                <p className="font-mono text-sm text-muted-foreground">{recipient.accountNumber}</p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRecipient(null)}
              className="rounded-full text-xs"
            >
              Thay đổi người nhận
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Transfer Form */}
      {recipient && (
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle>Chi tiết chuyển khoản</CardTitle>
            <CardDescription>Nhập số tiền và ghi chú</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs font-bold uppercase text-muted-foreground">
                Số tiền (VND)
              </Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="h-12 bg-muted/20 border-none rounded-2xl text-lg font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-xs font-bold uppercase text-muted-foreground">
                Ghi chú (tùy chọn)
              </Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Lý do chuyển khoản..."
                className="h-12 bg-muted/20 border-none rounded-2xl"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">{note.length}/100</p>
            </div>

            {/* Warning */}
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-600">
                Hãy kiểm tra thông tin người nhận trước khi xác nhận chuyển khoản
              </p>
            </div>

            <Button
              onClick={handleTransfer}
              disabled={isConfirming || !amount || parseFloat(amount) <= 0}
              className="w-full rounded-full shadow-lg shadow-primary/20 h-12 text-base font-bold"
            >
              <Send className="h-4 w-4 mr-2" />
              {isConfirming ? "Đang xử lý..." : "Xác nhận chuyển khoản"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
