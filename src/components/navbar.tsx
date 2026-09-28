"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { UserNav } from "./user-nav";
import { NotificationBell } from "./notification-bell";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: "Tổng quan", href: "/" },
    { name: "Sổ giao dịch", href: "/transactions" },
    { name: "Ngân sách", href: "/budgets" },
    { name: "Ví của tôi", href: "/wallets" },
    { name: "Danh mục", href: "/categories" },
    { name: "Mục tiêu tiết kiệm", href: "/saving-goals" },
    { name: "Trung tâm Báo cáo", href: "/reports" },
    { name: "Cài đặt Tài khoản", href: "/profile" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl border border-border bg-card/80 p-2.5 text-foreground shadow-sm transition hover:bg-accent md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.08, rotate: 12 }}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 text-sm font-black text-white shadow-lg shadow-violet-500/20"
              >
                $$
              </motion.div>
              <div className="flex flex-col leading-none">
                <span className="hidden text-lg font-black tracking-tight text-foreground md:block">SpendWise</span>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Finance OS</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <nav className="hidden items-center gap-2 rounded-full border border-border bg-card/70 p-1.5 shadow-sm md:flex">
              {menuItems.slice(0, 5).map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                      active
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-violet-500/20'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 md:gap-3">
              <NotificationBell />
              <ModeToggle />
              <UserNav />
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col border-r border-border bg-card/95 py-6 shadow-2xl backdrop-blur-xl md:hidden"
          >
            <div className="mb-6 flex items-center justify-between px-6">
              <span className="text-xl font-black text-primary">SpendWise</span>
              <button
                className="rounded-full p-2 hover:bg-accent"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-4">
              {menuItems.map((item, idx) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                      pathname === item.href
                        ? 'bg-primary text-primary-foreground shadow-md shadow-violet-500/20'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto px-4">
              <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Version</p>
                <p className="mt-2 text-sm font-semibold text-foreground">SpendWise App v2.0</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
