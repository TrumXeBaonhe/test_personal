"use client";

import { useState, useTransition, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Loader2, ShieldCheck, Mail, RefreshCw, ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP state
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // Countdown for resending OTP
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpCode];
    next[index] = value.slice(-1);
    setOtpCode(next);
    setOtpError("");
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) setOtpCode(pasted.split(""));
  };

  async function onResendOtp() {
    setResending(true);
    try {
      const res = await fetch("/api/auth/forgot-password/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("Mã OTP mới đã được gửi.");
        setCountdown(60);
        setCanResend(false);
        setOtpCode(["", "", "", "", "", ""]);
        inputsRef.current[0]?.focus();
      } else {
        toast.error("Không thể gửi lại mã.");
      }
    } catch {
      toast.error("Lỗi kết nối.");
    } finally {
      setResending(false);
    }
  }

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    const code = otpCode.join("");
    if (code.length !== 6) {
      setOtpError("Vui lòng nhập đủ 6 chữ số mã OTP");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/forgot-password/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            otp: code,
            newPassword: values.password,
          }),
        });
        const data = await res.json();

        if (res.ok) {
          toast.success("Mật khẩu của bạn đã được cập nhật thành công.");
          router.push("/login");
        } else {
          toast.error(data.error || "Không thể đặt lại mật khẩu.");
          if (data.error?.includes("OTP")) {
            setOtpError(data.error);
          }
        }
      } catch {
        toast.error("Lỗi kết nối đến máy chủ.");
      }
    });
  }

  if (!email) {
    return (
      <Card className="w-full max-w-md p-6 text-center space-y-4">
        <p className="text-muted-foreground">URL không hợp lệ hoặc thiếu email.</p>
        <Button variant="outline" className="w-full" onClick={() => router.push("/forgot-password")}>
          Quay lại
        </Button>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md overflow-hidden relative border-border/50 shadow-xl shadow-primary/5">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500" />
      
      <CardHeader className="space-y-4 pt-10 text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Cài đặt mật khẩu mới</CardTitle>
          <CardDescription>
            Nhập mã OTP đã được gửi đến <span className="font-semibold text-foreground">{email}</span>
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* OTP Input Section */}
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center block w-full">
            Mã xác thực OTP
          </label>
          <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
            {otpCode.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputsRef.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                disabled={isPending}
                className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 bg-muted/30 outline-none transition-all
                  ${digit ? "border-primary text-primary" : "border-border/40"}
                  focus:border-primary focus:bg-background`}
              />
            ))}
          </div>
          {otpError && <p className="text-destructive text-[11px] text-center font-medium">{otpError}</p>}
          
          <div className="flex justify-center">
            {canResend ? (
              <button 
                onClick={onResendOtp} 
                disabled={resending}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                {resending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                Gửi lại mã
              </button>
            ) : (
              <p className="text-xs text-muted-foreground">Gửi lại mã sau <span className="font-bold tabular-nums text-foreground">{countdown}s</span></p>
            )}
          </div>
        </div>

        <div className="h-px bg-border/40" />

        {/* New Password Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mật khẩu mới</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="bg-muted/30 border-border/40 pl-10 pr-10 h-11 focus-visible:ring-primary"
                        {...field} 
                        disabled={isPending} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Xác nhận mật khẩu</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="bg-muted/30 border-border/40 pl-10 h-11 focus-visible:ring-primary"
                        {...field} 
                        disabled={isPending} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-bold mt-2" 
              disabled={isPending}
            >
              {isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang cập nhật...</>
              ) : (
                "Xác nhận đổi mật khẩu"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex justify-center pb-10">
        <Link href="/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
          Quay lại Đăng nhập
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
