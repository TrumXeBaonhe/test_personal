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
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl border border-border bg-card/80 p-2 text-foreground shadow-sm transition hover:bg-accent md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <Link href="/" className="flex items-center gap-2.5 group" aria-label="SpendWise home">
              <motion.div
                whileHover={{ scale: 1.08, rotate: 12 }}
                className="relative flex h-9 w-9 items-center justify-center"
              >
                <svg className="h-9 w-9" viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="SpendWise logo icon">
                  <path d="M56 5.5L98.8 30.25V81.75L56 106.5L13.2 81.75V30.25L56 5.5Z" fill="#0B2341" />
                  <path d="M29 38.25L48.25 27.25L65 36.9L47.75 46.9L61.7 54.95L78.75 45.1V63.65L61.7 73.5L47.75 65.45L29 76.3V57.7L42.25 50.05L29 42.4V38.25Z" fill="#0D8B8A" />
                  <path d="M61.7 73.5L78.75 63.65V75.15L61.7 85L47.75 76.95V65.45L61.7 73.5Z" fill="#76C893" />
                </svg>
              </motion.div>

              <div className="flex items-end gap-2 leading-none">
                <span className="text-lg font-black tracking-[-0.06em] md:text-xl">
                  <span className="text-slate-900 dark:text-slate-100">Spend</span>
                  <span className="text-[#0D8B8A]">Wise</span>
                </span>
                <span className="hidden text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground md:inline-block">
                  Finance OS
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden items-center gap-1 rounded-full border border-border/70 bg-card/80 p-1 md:flex">
              {menuItems.slice(0, 3).map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-2.5 py-1.5 text-xs font-medium transition ${
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2 md:gap-2.5">
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
              <div className="flex items-center gap-2.5">
                <svg className="h-8 w-8" viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="SpendWise logo icon">
                  <path d="M56 5.5L98.8 30.25V81.75L56 106.5L13.2 81.75V30.25L56 5.5Z" fill="#0B2341" />
                  <path d="M29 38.25L48.25 27.25L65 36.9L47.75 46.9L61.7 54.95L78.75 45.1V63.65L61.7 73.5L47.75 65.45L29 76.3V57.7L42.25 50.05L29 42.4V38.25Z" fill="#0D8B8A" />
                  <path d="M61.7 73.5L78.75 63.65V75.15L61.7 85L47.75 76.95V65.45L61.7 73.5Z" fill="#76C893" />
                </svg>
                <span className="text-lg font-black tracking-[-0.06em]">
                  <span className="text-slate-900 dark:text-slate-100">Spend</span>
                  <span className="text-[#0D8B8A]">Wise</span>
                </span>
              </div>
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
