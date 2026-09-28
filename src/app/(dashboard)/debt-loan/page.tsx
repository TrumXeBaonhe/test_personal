import { Metadata } from 'next';
import { getDebtsLoans } from '@/app/actions/debt-loan-actions';
import { getWallets } from '@/app/actions/wallet-actions';
import { DebtLoanList } from '@/components/debt-loan/debt-loan-list';
import { DebtLoanForm } from '@/components/debt-loan/debt-loan-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CurrencyDisplay } from '@/components/currency-display';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ghi nợ & Cho vay | Quản lý Chi tiêu',
  description: 'Theo dõi các khoản vay và cho mượn của bạn',
};

export default async function DebtLoanPage() {
  const [debtsLoansRes, walletsRes] = await Promise.all([
    getDebtsLoans(),
    getWallets(),
  ]);

  if (!debtsLoansRes.success || !walletsRes.success) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <h1 className="text-2xl font-bold">Ghi nợ & Cho vay</h1>
        <p className="text-muted-foreground">Đã xảy ra lỗi khi tải dữ liệu.</p>
      </div>
    );
  }

  const items = debtsLoansRes.data || [];
  const wallets = walletsRes.wallets || [];

  const totalDebt = items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((i: any) => i.type === 'DEBT' && i.status === 'OPEN')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .reduce((acc: number, i: any) => acc + Number(i.remainingAmount), 0);

  const totalLoan = items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((i: any) => i.type === 'LOAN' && i.status === 'OPEN')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .reduce((acc: number, i: any) => acc + Number(i.remainingAmount), 0);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="relative overflow-hidden rounded-[32px] border border-border/60 bg-gradient-to-br from-violet-600/10 via-background to-cyan-500/10 p-6 shadow-[0_30px_80px_-32px_rgba(76,29,149,0.35)]">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Debt & Loan</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-gradient">Ghi nợ & Cho vay</h1>
          </div>
          <DebtLoanForm wallets={wallets} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-red-100 bg-red-50/60 dark:border-red-900/50 dark:bg-red-950/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bạn đang nợ (Debt)</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              <CurrencyDisplay amount={totalDebt} />
            </div>
            <p className="text-xs text-muted-foreground">Tổng các khoản bạn cần phải trả</p>
          </CardContent>
        </Card>
        <Card className="border-green-100 bg-green-50/60 dark:border-green-900/50 dark:bg-green-950/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người khác nợ bạn (Loan)</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              <CurrencyDisplay amount={totalLoan} />
            </div>
            <p className="text-xs text-muted-foreground">Tổng các khoản bạn sẽ được nhận lại</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="rounded-full border bg-muted/50 p-1">
            <TabsTrigger value="active" className="rounded-full">Đang thực hiện</TabsTrigger>
            <TabsTrigger value="paid" className="rounded-full">Đã hoàn thành</TabsTrigger>
            <TabsTrigger value="all" className="rounded-full">Tất cả</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="active" className="space-y-4">
          <DebtLoanList items={items.filter((i: any) => i.status === 'OPEN')} />
        </TabsContent>
        <TabsContent value="paid" className="space-y-4">
          <DebtLoanList items={items.filter((i: any) => i.status === 'PAID')} />
        </TabsContent>
        <TabsContent value="all" className="space-y-4">
          <DebtLoanList items={items} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
