import { getRecurringTransactions } from "@/app/actions/recurring-actions";
import { getFormOptions } from "@/app/actions/transaction-actions";
import { RecurringList } from "@/components/recurring-transactions/recurring-list";
import { RecurringForm } from "@/components/recurring-transactions/recurring-form";
import { Repeat } from "lucide-react";

export const metadata = {
  title: "Giao dịch định kỳ | Quản lý Chi tiêu",
};

export default async function RecurringTransactionsPage() {
  const [recurringData, options] = await Promise.all([
    getRecurringTransactions(),
    getFormOptions(),
  ]);

  return (
    <div className="flex-1 space-y-6 pb-10">
      <div className="relative overflow-hidden rounded-[32px] border border-border/60 bg-gradient-to-br from-violet-600/10 via-background to-cyan-500/10 p-6 shadow-[0_30px_80px_-32px_rgba(76,29,149,0.35)]">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Automation</p>
            <h2 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-gradient">
              <Repeat className="h-8 w-8 text-primary" />
              Giao dịch định kỳ
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <RecurringForm wallets={options.wallets} categories={options.categories} />
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-border/60 bg-card/75 p-5 shadow-[0_25px_60px_-30px_rgba(76,29,149,0.35)]">
        <p className="mb-4 text-muted-foreground">
          Thiết lập các khoản thu/chi tự động lặp lại theo chu kỳ (Lương, tiện ích, hóa đơn mạng, trả góp...).
          Hệ thống sẽ tự động cập nhật số dư ví và ghi nhận lịch sử vào đúng ngày định kỳ.
        </p>
        <RecurringList data={recurringData} />
      </div>
    </div>
  );
}
