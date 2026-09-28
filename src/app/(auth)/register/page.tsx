"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const registerSchema = z.object({
  fullName: z.string().min(1, { message: "Vui lòng nhập họ và tên" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu tối thiểu 6 ký tự" }),
});

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setError("");
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Đăng ký thất bại");
          return;
        }

        // Tự động Login sau khi đăng ký thành công
        const signInResult = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (signInResult?.error) {
          setError("Lỗi Auto-login: " + signInResult.error);
        } else {
          router.push("/");
          router.refresh();
        }
      } catch (err: any) {
        console.error("Registration error:", err);
        setError(`Lỗi kết nối đến máy chủ: ${err.message || 'Unknown error'}`);
      }
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="absolute inset-x-0 top-8 z-10 flex justify-center">
        <div className="flex items-center gap-3 rounded-full border border-border/60 bg-card/70 px-4 py-2 shadow-[0_22px_50px_-24px_rgba(20,30,60,0.55)] backdrop-blur-xl">
          <svg className="h-9 w-9" viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="SpendWise logo icon">
            <path d="M56 5.5L98.8 30.25V81.75L56 106.5L13.2 81.75V30.25L56 5.5Z" fill="#0B2341" />
            <path d="M29 38.25L48.25 27.25L65 36.9L47.75 46.9L61.7 54.95L78.75 45.1V63.65L61.7 73.5L47.75 65.45L29 76.3V57.7L42.25 50.05L29 42.4V38.25Z" fill="#0D8B8A" />
            <path d="M61.7 73.5L78.75 63.65V75.15L61.7 85L47.75 76.95V65.45L61.7 73.5Z" fill="#76C893" />
          </svg>
          <div className="text-left leading-none">
            <div className="text-2xl font-black tracking-[-0.06em]">
              <span className="text-slate-900 dark:text-slate-100">Spend</span>
              <span className="text-[#0D8B8A]">Wise</span>
            </div>
          </div>
        </div>
      </div>

      <Card className="relative z-10 w-full max-w-md border-border/60 bg-card/80 shadow-[0_30px_80px_-32px_rgba(76,29,149,0.45)]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Tạo tài khoản</CardTitle>
          <CardDescription className="text-center">
            Điền thông tin bên dưới để bắt đầu quản lý chi tiêu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và Tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyễn Văn A" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      <Input type="password" placeholder="******" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {error && <div className="text-sm font-medium text-destructive">{error}</div>}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Đang xử lý..." : "Đăng ký"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Đăng nhập ngay
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
