"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, RefreshCw, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const purpose = searchParams.get("purpose") ?? "LOGIN";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Đếm ngược 60 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");
    // Auto focus next
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
    }
  };

  const handleSubmit = useCallback(async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode, purpose: "LOGIN" }),
      });
      const data = await res.json();

      if (data.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "Mã OTP không đúng");
        setCode(["", "", "", "", "", ""]);
        inputsRef.current[0]?.focus();
      }
    } catch {
      setError("Lỗi kết nối. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [code, purpose, router]);

  // Auto submit khi nhập đủ 6 số
  useEffect(() => {
    if (code.every((d) => d !== "")) {
      handleSubmit();
    }
  }, [code, handleSubmit]);

  const handleResend = async () => {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose: "LOGIN" }),
      });
      const data = await res.json();
      if (data.success) {
        setCountdown(60);
        setCanResend(false);
        setCode(["", "", "", "", "", ""]);
        inputsRef.current[0]?.focus();
        // Restart countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) { setCanResend(true); clearInterval(timer); return 0; }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.error || "Không thể gửi lại mã");
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Card */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/30 to-cyan-500/30 rounded-3xl blur-md" />
          <div className="relative bg-card border border-border/40 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">

            {/* Icon */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <div className="p-4 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl shadow-lg shadow-violet-500/30">
                  <ShieldCheck className="h-8 w-8 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-400 rounded-full border-2 border-background animate-pulse" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-center">Xác thực 2 bước</h1>
              <p className="text-muted-foreground text-sm text-center mt-2 max-w-xs leading-relaxed">
                Mã OTP đã được gửi đến email của bạn.
                <br />
                <span className="text-violet-500 font-semibold">Có hiệu lực trong 10 phút.</span>
              </p>
            </div>

            {/* Mail hint */}
            <div className="flex items-center gap-2 bg-muted/50 rounded-2xl px-4 py-3 mb-6 border border-border/30">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground">Kiểm tra hộp thư đến (và thư mục spam)</p>
            </div>

            {/* OTP Input Grid */}
            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputsRef.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-2xl font-black rounded-2xl border-2 bg-muted/50 outline-none transition-all duration-200
                    ${digit ? "border-violet-500 text-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.3)]" : "border-border/40"}
                    focus:border-violet-500 focus:bg-background focus:shadow-[0_0_12px_rgba(139,92,246,0.2)]`}
                  disabled={loading}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-sm text-center mb-4 font-medium"
              >
                {error}
              </motion.p>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading || code.some((d) => !d)}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 font-bold text-base shadow-lg shadow-violet-500/20 mb-4"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xác thực...</>
              ) : (
                <><ShieldCheck className="mr-2 h-4 w-4" /> Xác nhận</>
              )}
            </Button>

            {/* Resend */}
            <div className="text-center">
              {canResend ? (
                <button
                  onClick={handleResend}
                  disabled={sending}
                  className="flex items-center gap-1.5 mx-auto text-sm text-violet-500 hover:text-violet-400 font-semibold transition-colors"
                >
                  {sending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Gửi lại mã OTP
                </button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Gửi lại sau{" "}
                  <span className="font-bold text-foreground tabular-nums">{countdown}s</span>
                </p>
              )}
            </div>

            {/* Back to login */}
            <div className="mt-6 pt-4 border-t border-border/20 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3 w-3" /> Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
