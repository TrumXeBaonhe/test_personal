"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Loader2, Mail, ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/forgot-password/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: values.email }),
        });
        const data = await res.json();

        if (res.ok) {
          toast.success("Mã OTP đã được gửi đến email của bạn.");
          router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
        } else {
          toast.error(data.error || "Không thể gửi yêu cầu.");
        }
      } catch {
        toast.error("Lỗi kết nối đến máy chủ.");
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden relative border-border/50 shadow-xl shadow-primary/5">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500" />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <CardHeader className="space-y-4 pt-10 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">Quên mật khẩu?</CardTitle>
              <CardDescription>
                Nhập email của bạn để nhận mã khôi phục mật khẩu tài khoản.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Địa chỉ Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="email" 
                            placeholder="your@email.com" 
                            className="bg-muted/30 border-border/40 pl-10 h-11 focus-visible:ring-primary focus-visible:border-primary"
                            {...field} 
                            disabled={isPending} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-bold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/20" 
                  disabled={isPending}
                >
                  {isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang chuẩn bị...</>
                  ) : (
                    "Gửi mã xác thực"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-center flex-col gap-4 pb-10">
            <Link 
              href="/login" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
              Quay lại Đăng nhập
            </Link>
          </CardFooter>
        </motion.div>
      </Card>
    </div>
  );
}
