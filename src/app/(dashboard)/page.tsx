import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BudgetAlerts } from "@/components/dashboard/budget-alerts";
import { FadeIn } from "@/components/fade-in";
import { AIAdvisor } from "@/components/dashboard/ai-advisor";
import { Suspense } from "react";
import { 
  OverviewSection 
} from "@/components/dashboard/overview-section";
import { 
  ChartsSection 
} from "@/components/dashboard/charts-section";
import { 
  SavingGoalsSection 
} from "@/components/dashboard/saving-goals-section";
import { 
  WalletsAndCategoriesSection 
} from "@/components/dashboard/wallets-categories-section";
import { 
  OverviewSkeleton, 
  ChartsSkeleton, 
  SavingGoalsSkeleton,
  WalletListSkeleton
} from "@/components/dashboard/dashboard-skeletons";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  // Lấy User và kiểm tra data cơ bản để render layout ngay lập tức
  const [dbUser, walletCount] = await Promise.all([
    prisma.user.findUnique({ 
      where: { id: userId },
      select: { fullName: true }
    }),
    prisma.wallet.count({ where: { userId } })
  ]);

  const hasWallets = walletCount > 0;

  // Render Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const currentDate = new Intl.DateTimeFormat('vi-VN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(new Date());

  return (
    <div className="flex flex-col space-y-10 pb-10">
      <BudgetAlerts />
      
      {/* Header Chào mừng / Welcome Section */}
      <FadeIn delay={0.1}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{currentDate}</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {getGreeting()}, <span className="text-gradient">{dbUser?.fullName || 'Bạn'}</span> 👋
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="rounded-full shadow-lg shadow-primary/20" asChild>
              <Link href="/transactions">
                <PlusCircle className="mr-2 h-4 w-4" /> Giao dịch mới
              </Link>
            </Button>
          </div>
        </div>
      </FadeIn>

      {!hasWallets ? (
        <FadeIn delay={0.2}>
          <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed rounded-3xl bg-card/50">
             <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 mb-6">
                <PlusCircle className="h-10 w-10 text-primary" />
             </div>
             <h3 className="text-2xl font-bold">Bắt đầu hành trình tài chính</h3>
             <p className="text-muted-foreground max-w-sm mx-auto mb-8">
               Chào mừng bạn đến với SpendWise. Hãy tạo chiếc ví đầu tiên để chúng tôi giúp bạn quản lý dòng tiền nhé!
             </p>
             <Button size="lg" className="rounded-full px-8" asChild>
               <Link href="/wallets">Khởi tạo ngay</Link>
             </Button>
          </div>
        </FadeIn>
      ) : (
        <>
          {/* Overview Stats - Streamed */}
          <Suspense fallback={<OverviewSkeleton />}>
            <OverviewSection />
          </Suspense>

          {/* Charts Section - Streamed */}
          <Suspense fallback={<ChartsSkeleton />}>
            <ChartsSection />
          </Suspense>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <FadeIn delay={0.65} direction="up">
              <div className="h-full">
                <AIAdvisor />
              </div>
            </FadeIn>

            {/* Saving Goals - Streamed */}
            <Suspense fallback={<SavingGoalsSkeleton />}>
              <SavingGoalsSection />
            </Suspense>
          </div>

          {/* Wallets & Categories - Streamed */}
          <Suspense fallback={<WalletListSkeleton />}>
            <WalletsAndCategoriesSection />
          </Suspense>
        </>
      )}
    </div>
  );
}

