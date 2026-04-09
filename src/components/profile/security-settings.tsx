"use client";

import { useState } from "react";
import { 
  Shield, 
  ChevronRight, 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PasswordForm } from "./password-form";

export function SecuritySettings() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger 
          render={
            <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-primary/10 hover:border-primary/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">Đổi mật khẩu</p>
                  <p className="text-xs text-muted-foreground">Bảo vệ tài khoản của bạn bằng mật khẩu mạnh</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          } 
        />
        <DialogContent className="sm:max-w-[500px] glass-card border-none">
          <DialogHeader>
            <DialogTitle>Thay đổi mật khẩu</DialogTitle>
            <DialogDescription>
              Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật bảo mật tài khoản.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <PasswordForm onSuccess={() => setOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
