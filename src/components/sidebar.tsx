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
    <aside className="fixed top-20 z-30 hidden h-[calc(100vh-5rem)] w-full shrink-0 md:sticky md:block md:w-24">
      <div className="h-full overflow-auto px-3 py-5 lg:py-6">
        <div className="flex h-full flex-col items-center gap-3 rounded-[24px] border border-border/60 bg-card/60 p-2.5 shadow-[0_10px_30px_-18px_rgba(76,29,149,0.18)] backdrop-blur-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/15 to-cyan-500/10 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
            SW
          </div>

          <nav className="mt-2 flex w-full flex-col items-center gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-br from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-500/20'
                      : 'bg-background/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  title={item.name}
                >
                  <Icon className="h-4 w-4" />
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-item"
                      className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500"
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
