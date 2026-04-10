"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updatePassword } from "@/app/actions/profile-actions";
import { toast } from "sonner";
import { Loader2, KeyRound, ShieldCheck, Mail, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface PasswordFormProps {
  onSuccess?: () => void;
}

export function PasswordForm({ onSuccess }: PasswordFormProps) {
  const [loading, setLoading] = useState(false);
  // Step 1: nhập mật khẩu | Step 2: nhập OTP
  const [step, setStep] = useState<1 | 2>(1);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [pendingValues, setPendingValues] = useState<PasswordFormValues | null>(null);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sendOtp = async () => {
    setSendingOtp(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose: "PASSWORD_CHANGE" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Mã OTP đã được gửi về email của bạn!");
        setCountdown(60);
      } else {
        toast.error(data.error || "Không thể gửi OTP");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setSendingOtp(false);
    }
  };

  async function onSubmit(values: PasswordFormValues) {
    // Bước 1: Xác thực mật khẩu cũ trước, sau đó gửi OTP
    setLoading(true);
    try {
      // Gọi action để kiểm tra mật khẩu cũ (chưa lưu)
      const checkResult = await updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        otpCode: "", // empty → chỉ verify mật khẩu cũ
        checkOnly: true,
      });

      if (!checkResult.success) {
        toast.error(checkResult.error || "Mật khẩu hiện tại không đúng");
        return;
      }

      // Mật khẩu cũ đúng → gửi OTP và chuyển bước 2
      setPendingValues(values);
      await sendOtp();
      setStep(2);
    } catch {
      toast.error("Đã có lỗi hệ thống xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp() {
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Vui lòng nhập mã OTP 6 chữ số");
      return;
    }
    if (!pendingValues) return;

    setVerifyingOtp(true);
    try {
      const result = await updatePassword({
        currentPassword: pendingValues.currentPassword,
        newPassword: pendingValues.newPassword,
        otpCode,
        checkOnly: false,
      });

      if (result.success) {
        toast.success("🎉 Mật khẩu đã được thay đổi thành công!");
        form.reset();
        setStep(1);
        setOtpCode("");
        setPendingValues(null);
        onSuccess?.();
      } else {
        toast.error(result.error || "Có lỗi xảy ra khi đổi mật khẩu.");
      }
    } catch {
      toast.error("Đã có lỗi hệ thống xảy ra.");
    } finally {
      setVerifyingOtp(false);
    }
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu hiện tại</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu mới</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang kiểm tra...</>
                  ) : (
                    <><KeyRound className="mr-2 h-4 w-4" /> Tiếp tục</>
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-5"
          >
            {/* OTP Step Header */}
            <div className="flex items-center gap-3 p-4 bg-violet-500/10 border border-violet-500/20 rounded-2xl">
              <div className="p-2 bg-violet-500/20 rounded-xl">
                <ShieldCheck className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="font-bold text-sm">Xác thực bảo mật</p>
                <p className="text-xs text-muted-foreground">Nhập mã OTP đã được gửi về email của bạn</p>
              </div>
            </div>

            {/* OTP Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Mã OTP (6 chữ số)</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-xl font-bold tracking-[0.5em] h-12 rounded-xl"
                  disabled={verifyingOtp}
                />
              </div>
            </div>

            {/* Resend */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={sendOtp}
                disabled={sendingOtp || countdown > 0}
                className="flex items-center gap-1.5 text-sm text-violet-500 hover:text-violet-400 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {sendingOtp ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại mã"}
              </button>
              <span className="text-muted-foreground text-xs">·</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                Kiểm tra hộp thư đến và spam
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setStep(1); setOtpCode(""); }}
                className="rounded-xl"
              >
                Quay lại
              </Button>
              <Button
                type="button"
                onClick={onVerifyOtp}
                disabled={verifyingOtp || otpCode.length !== 6}
                className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90"
              >
                {verifyingOtp ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xác thực...</>
                ) : (
                  <><ShieldCheck className="mr-2 h-4 w-4" /> Xác nhận đổi mật khẩu</>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
