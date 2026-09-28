import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getBudgetsWithProgress } from "@/app/actions/budget-actions";
import { BudgetForm } from "@/components/budgets/budget-form";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DeleteBudgetButton } from "@/components/budgets/delete-budget-button";
import { TrendingUp, CheckCircle2, AlertTriangle, XCircle, Info, LayoutList } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { FadeIn } from "@/components/fade-in";
import { CurrencyDisplay } from "@/components/currency-display";

export default async function BudgetsPage() {
  const authSession = await auth();
  const userId = authSession!.user!.id;

  const [budgets, categories] = await Promise.all([
    getBudgetsWithProgress(),
    prisma.category.findMany({
      where: { userId, type: 'EXPENSE', isDeleted: false },
    })
  ]);

  // Lấy tên tháng theo GMT+7
  const now = new Date();
  const gmt7Month = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    month: "long",
    year: "numeric",
  }).format(now);

  return (
    <div className="flex flex-col space-y-8 pb-10">
      <FadeIn delay={0.1}>
        <div className="relative overflow-hidden rounded-[32px] border border-border/60 bg-gradient-to-br from-violet-600/10 via-background to-cyan-500/10 p-6 shadow-[0_30px_80px_-32px_rgba(76,29,149,0.35)]">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Planning</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-gradient">Quản lý Ngân sách</h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <LayoutList className="h-4 w-4" /> {gmt7Month}
              </p>
            </div>
            <BudgetForm categories={categories} />
          </div>
        </div>
      </FadeIn>

      {budgets.length === 0 ? (
        <FadeIn delay={0.2}>
          <Card className="flex flex-col items-center justify-center rounded-[28px] border-dashed border-2 bg-muted/10 p-16 text-center backdrop-blur-sm">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/10">
              <TrendingUp className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Kiểm soát tài chính thông minh!</h3>
            <p className="mt-2 max-w-md text-muted-foreground">
              Bạn chưa thiết lập hạn mức ngân sách nào cho tháng này. Hãy lập kế hoạch ngay để tối ưu hóa dòng tiền của bạn.
            </p>
          </Card>
        </FadeIn>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {budgets.map((budget, index) => {
            const actualPercent = Math.round(budget.actualProgress);
            const isOverBudget = actualPercent > 100;
            const isCritical = actualPercent >= 90;
            const isWarning = actualPercent >= 70 && actualPercent < 90;

            const progressColorClass = isOverBudget || isCritical
              ? "[&>div]:bg-rose-500"
              : isWarning
                ? "[&>div]:bg-amber-500"
                : "[&>div]:bg-emerald-500";

            return (
              <FadeIn key={budget.id} delay={0.1 + (index * 0.05)} direction="up">
                <Card className={`group relative overflow-hidden rounded-[28px] border border-border/60 bg-card/75 shadow-[0_25px_60px_-30px_rgba(76,29,149,0.35)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_80px_-28px_rgba(79,70,229,0.35)] ${isOverBudget ? 'ring-2 ring-rose-500/20' : ''}`}>
                  <CardHeader className="relative pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-bold">
                          {budget.category?.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1.5 font-medium">
                          Hạn mức: <span className="font-bold text-foreground"><CurrencyDisplay amount={Number(budget.limitAmount)} /></span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`rounded-xl p-2 transition-transform group-hover:scale-110 ${isOverBudget ? 'bg-rose-500/10 text-rose-600' : isCritical ? 'bg-rose-500/10 text-rose-600' : isWarning ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                          {isOverBudget ? (
                            <XCircle className="h-5 w-5" />
                          ) : isWarning || isCritical ? (
                            <AlertTriangle className="h-5 w-5" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5" />
                          )}
                        </div>
                        <DeleteBudgetButton budgetId={budget.id} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 rounded-[22px] bg-muted/30 p-4 text-sm">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Đã chi tiêu</p>
                        <p className={`text-xl font-black ${isOverBudget ? 'text-rose-600' : 'text-primary'}`}>
                          <CurrencyDisplay amount={budget.spentAmount} />
                        </p>
                      </div>
                      <div className="space-y-1.5 border-l border-border/60 pl-4 text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          {isOverBudget ? "Vượt mức" : "Còn lại"}
                        </p>
                        <p className={`text-xl font-black ${isOverBudget ? 'text-rose-600' : 'text-emerald-500'}`}>
                          <CurrencyDisplay amount={Math.abs(budget.remainingAmount)} />
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Tiến độ sử dụng</span>
                        <span className={`text-sm font-black ${isOverBudget || isCritical ? "text-rose-600" : isWarning ? "text-amber-600" : "text-emerald-600"}`}>
                          {actualPercent}%
                        </span>
                      </div>
                      <Progress
                        value={budget.progress}
                        className={`h-2.5 overflow-hidden rounded-full bg-muted/50 ${progressColorClass}`}
                      />
                    </div>

                    {isOverBudget && (
                      <div className="flex items-center gap-3 rounded-2xl border border-rose-200/50 bg-rose-500/10 p-3 text-[11px] font-bold text-rose-700 animate-pulse">
                        <Info className="h-4 w-4 shrink-0" />
                        <p className="leading-relaxed">
                          Bạn đã chi tiêu quá hạn mức cho phép ({actualPercent}%).
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      )}
    </div>
  );
}
