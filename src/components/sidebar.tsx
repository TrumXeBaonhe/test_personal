"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Wallet,
  Tags,
  Target,
  BarChart3,
  Settings,
  Repeat,
  HandCoins
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Tổng quan", href: "/", icon: LayoutDashboard },
    { name: "Sổ giao dịch", href: "/transactions", icon: ReceiptText },
    { name: "Giao dịch định kỳ", href: "/recurring-transactions", icon: Repeat },
    { name: "Ngân sách", href: "/budgets", icon: PieChart },
    { name: "Ví của tôi", href: "/wallets", icon: Wallet },
    { name: "Danh mục", href: "/categories", icon: Tags },
    { name: "Quản lý Tag", href: "/tags", icon: Tags },
    { name: "Ghi nợ & Cho vay", href: "/debt-loan", icon: HandCoins },
    { name: "Mục tiêu tiết kiệm", href: "/saving-goals", icon: Target },
    { name: "Trung tâm Báo cáo", href: "/reports", icon: BarChart3 },
    { name: "Cài đặt Tài khoản", href: "/profile", icon: Settings },
  ];

  return (
    <aside className="fixed top-20 z-30 hidden h-[calc(100vh-5rem)] w-full shrink-0 md:sticky md:block md:w-72">
      <div className="h-full overflow-auto px-4 py-6 pr-3 lg:py-8">
        <div className="rounded-[28px] border border-border/60 bg-card/65 p-3 shadow-[0_18px_50px_-24px_rgba(76,29,149,0.3)] backdrop-blur-xl">
          <div className="mb-4 px-3 pt-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Menu chính</p>
            <h2 className="mt-2 text-lg font-bold text-foreground">Tổng quan</h2>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-violet-500/20'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
                      isActive
                        ? 'border-white/20 bg-white/10 text-primary-foreground'
                        : 'border-border/80 bg-background/60 text-muted-foreground group-hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-item"
                      className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-violet-600/90 to-indigo-500/90"
                      transition={{ type: "spring", stiffness: 360, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
