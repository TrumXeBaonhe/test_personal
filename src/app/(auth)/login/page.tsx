"use client";

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
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
import { Loader2, ShieldCheck, Mail, RefreshCw, ArrowLeft } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(1, { message: "Vui lòng nhập mật khẩu" }),
});

type Step = "credentials" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // OTP step state
  const [step, setStep] = useState<Step>("credentials");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPassword, setPendingPassword] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Đếm ngược gửi lại
  useEffect(() => {
    if (step !== "otp") return;
    setCountdown(60);
    setCanResend(false);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { setCanResend(true); clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  // ── BƯỚC 1: Kiểm tra credentials + IP ──────────────────────────
  async function onSubmitCredentials(values: z.infer<typeof loginSchema>) {
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/pre-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: values.email, password: values.password }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Email hoặc mật khẩu không chính xác.");
          return;
        }

        if (data.requiresOtp) {
          // IP lạ → OTP đã được gửi → chuyển sang bước nhập OTP
          setPendingEmail(values.email);
          setPendingPassword(values.password);
          setStep("otp");
        } else {
          // IP quen → đăng nhập ngay
          await doSignIn(values.email, values.password);
        }
      } catch {
        setError("Lỗi kết nối đến máy chủ.");
      }
    });
  }

  // ── Thực sự tạo session (chỉ gọi khi đã xác minh) ─────────────
  async function doSignIn(email: string, password: string) {
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Đăng nhập thất bại. Vui lòng thử lại.");
      setStep("credentials");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  // ── OTP input handlers ──────────────────────────────────────────
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

  // ── BƯỚC 2: Xác minh OTP → đăng nhập ──────────────────────────
  const verifyOtp = useCallback(async () => {
    const code = otpCode.join("");
    if (code.length !== 6) { setOtpError("Vui lòng nhập đủ 6 chữ số"); return; }

    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/verify-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, otp: code }),
      });
      const data = await res.json();

      if (data.success) {
        // OTP đúng → bây giờ mới tạo session
        await doSignIn(pendingEmail, pendingPassword);
      } else {
        setOtpError(data.error || "Mã OTP không đúng");
        setOtpCode(["", "", "", "", "", ""]);
        setTimeout(() => inputsRef.current[0]?.focus(), 50);
      }
    } catch {
      setOtpError("Lỗi kết nối. Thử lại sau.");
    } finally {
      setOtpLoading(false);
    }
  }, [otpCode, pendingEmail, pendingPassword]);

  // Auto-submit khi nhập đủ 6 số
  useEffect(() => {
    if (step === "otp" && otpCode.every((d) => d !== "")) verifyOtp();
  }, [otpCode, step, verifyOtp]);

  const handleResend = async () => {
    setResending(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/pre-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, password: pendingPassword }),
      });
      if (res.ok) {
        setCountdown(60);
        setCanResend(false);
        setOtpCode(["", "", "", "", "", ""]);
        setTimeout(() => inputsRef.current[0]?.focus(), 50);
      } else {
        setOtpError("Không thể gửi lại mã.");
      }
    } catch {
      setOtpError("Lỗi kết nối");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ── BƯỚC 1: Nhập email + password ── */}
          {step === "credentials" && (
            <motion.div
              key="credentials"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Chào mừng trở lại</CardTitle>
                <CardDescription className="text-center">
                  Đăng nhập vào tài khoản của bạn để tiếp tục
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitCredentials)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@example.com" {...field} disabled={isPending} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} disabled={isPending} />
                          </FormControl>
                          <FormMessage />
                          <div className="flex justify-end">
                            <Link
                              href="/forgot-password"
                              className="text-xs text-primary hover:underline font-medium"
                            >
                              Quên mật khẩu?
                            </Link>
                          </div>
                        </FormItem>
                      )}
                    />
                    {error && <div className="text-sm font-medium text-destructive">{error}</div>}
                    <Button type="submit" className="w-full" disabled={isPending}>
                      {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang kiểm tra...</> : "Đăng nhập"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <div className="text-sm text-muted-foreground">
                  Chưa có tài khoản?{" "}
                  <Link href="/register" className="text-primary hover:underline font-medium">
                    Đăng ký tại đây
                  </Link>
                </div>
              </CardFooter>
            </motion.div>
          )}

          {/* ── BƯỚC 2: Nhập OTP ── */}
          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <CardHeader className="space-y-1">
                <div className="flex flex-col items-center mb-2">
                  <div className="p-3 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl shadow-lg shadow-violet-500/30 mb-3 relative">
                    <ShieldCheck className="h-7 w-7 text-white" />
                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-emerald-400 rounded-full border-2 border-background animate-pulse" />
                  </div>
                  <CardTitle className="text-xl font-bold text-center">Xác thực 2 bước</CardTitle>
                  <CardDescription className="text-center mt-1">
                    Phát hiện đăng nhập từ <strong className="text-violet-500">thiết bị mới</strong>.<br />
                    Mã OTP đã được gửi đến email của bạn.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Mail hint */}
                <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2.5 border border-border/30">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground">Kiểm tra hộp thư và thư mục spam</p>
                </div>

                {/* OTP Grid */}
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
                      disabled={otpLoading}
                      autoFocus={i === 0}
                      className={`w-11 h-13 text-center text-xl font-black rounded-xl border-2 bg-muted/50 outline-none transition-all
                        ${digit ? "border-violet-500 text-violet-500" : "border-border/40"}
                        focus:border-violet-500 focus:bg-background`}
                      style={{ height: "52px" }}
                    />
                  ))}
                </div>

                {/* Error */}
                {otpError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-destructive text-sm text-center font-medium"
                  >
                    {otpError}
                  </motion.p>
                )}

                {/* Verify button */}
                <Button
                  onClick={verifyOtp}
                  disabled={otpLoading || otpCode.some((d) => !d)}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 font-bold"
                >
                  {otpLoading
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xác thực...</>
                    : <><ShieldCheck className="mr-2 h-4 w-4" /> Xác nhận & Đăng nhập</>
                  }
                </Button>

                {/* Resend */}
                <div className="flex items-center justify-between text-sm">
                  <button
                    onClick={() => setStep("credentials")}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Quay lại
                  </button>

                  {canResend ? (
                    <button
                      onClick={handleResend}
                      disabled={resending}
                      className="flex items-center gap-1 text-violet-500 hover:text-violet-400 font-medium transition-colors"
                    >
                      {resending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      Gửi lại mã
                    </button>
                  ) : (
                    <span className="text-muted-foreground">
                      Gửi lại sau <strong className="text-foreground tabular-nums">{countdown}s</strong>
                    </span>
                  )}
                </div>
              </CardContent>
            </motion.div>
          )}

        </AnimatePresence>
      </Card>
    </div>
  );
}
