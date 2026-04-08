import { getBudgetsWithProgress } from "@/app/actions/budget-actions";
import { AlertCircle, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export async function BudgetAlerts() {
  const budgets = await getBudgetsWithProgress();
  const warningBudgets = budgets.filter(b => b.actualProgress >= 80);

  if (warningBudgets.length === 0) return null;

  return (
    <div className="grid gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
      {warningBudgets.map((budget) => {
        const isExceeded = budget.actualProgress > 100;
        const actualPercent = Math.round(budget.actualProgress);
        
        return (
          <div 
            key={budget.id} 
            className={`flex items-start gap-4 p-4 rounded-2xl border shadow-sm transition-all hover:shadow-md ${
              isExceeded 
                ? "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/20 dark:border-rose-800 dark:text-rose-300" 
                : "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-300"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${
              isExceeded ? "bg-rose-200 text-rose-700 dark:bg-rose-900 dark:text-rose-400" : "bg-amber-200 text-amber-700 dark:bg-amber-900 dark:text-amber-400"
            }`}>
              {isExceeded ? <AlertCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm">
                  {isExceeded ? `Vượt ngân sách: ${budget.category?.name}` : `Sắp chạm ngưỡng: ${budget.category?.name}`}
                </p>
                <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">
                  {actualPercent}% đã dùng
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {isExceeded 
                  ? `Bạn đã chi vượt hạn mức ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.abs(budget.remainingAmount))}. Hãy kiểm tra lại các khoản chi tiêu.`
                  : `Bạn đã sử dụng ${actualPercent}% ngân sách cho danh mục này. Hãy cân đối cho những ngày còn lại!`
                }
              </p>
            </div>

            <Link 
              href="/budgets" 
              className={`p-2 rounded-lg self-center hover:bg-white/50 transition-colors ${
                isExceeded ? "text-rose-600" : "text-amber-600"
              }`}
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
