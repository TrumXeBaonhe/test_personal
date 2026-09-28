import { getTransactions, getFormOptions } from "@/app/actions/transaction-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowLeftRight, Filter, MapPin } from "lucide-react";
import { DeleteTransactionButton } from "@/components/delete-transaction-button";
import { TransactionFilters } from "@/components/transaction-filters";
import { PaginationNav } from "@/components/pagination-nav";
import { CurrencyDisplay } from "@/components/currency-display";
import type { Transaction, Wallet, Category } from "@prisma/client";
import { FadeIn } from "@/components/fade-in";
import { ExportButton } from "@/components/transactions/export-button";

// Wallet với balance đã được serialize sang number
type SerializedWallet = Omit<Wallet, "balance"> & { balance: number };

// Type chính xác từ Prisma (thay vì any)
type TransactionWithRelations = Omit<Transaction, "amount"> & {
  amount: number;
  wallet: SerializedWallet;
  toWallet: SerializedWallet | null;
  category: Category | null;
  tags: { tag: { id: string, name: string, color: string | null } }[];
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
};
export default async function TransactionsPage(props: {
  searchParams: Promise<{
    page?: string;
    type?: string;
    walletId?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const type = searchParams.type || "ALL";
  const walletId = searchParams.walletId || "ALL";

  const [
    { transactions, totalPages },
    { wallets }
  ] = await Promise.all([
    getTransactions({
      page,
      pageSize: 10,
      type,
      walletId
    }),
    getFormOptions()
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <FadeIn delay={0.05}>
        <div className="relative overflow-hidden rounded-[32px] border border-border/60 bg-gradient-to-br from-violet-600/10 via-background to-cyan-500/10 p-6 shadow-[0_30px_80px_-32px_rgba(76,29,149,0.35)]">
          <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Ledger</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-gradient">Quản lý giao dịch</h1>
              <p className="mt-2 text-sm text-muted-foreground">Xem và quản lý lịch sử thu chi của bạn.</p>
            </div>
            <ExportButton data={transactions} />
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1} direction="up">
        <div className="rounded-[28px] border border-border/60 bg-card/70 p-4 shadow-[0_25px_60px_-30px_rgba(76,29,149,0.35)] backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2 font-semibold text-primary">
            <Filter className="h-4 w-4" />
            Bộ lọc nâng cao
          </div>
          <TransactionFilters wallets={wallets} currentType={type} currentWalletId={walletId} />
        </div>
      </FadeIn>

      <FadeIn delay={0.15} direction="up">
        <div className="overflow-hidden rounded-[28px] border border-border/60 bg-card/75 shadow-[0_25px_60px_-30px_rgba(76,29,149,0.35)] backdrop-blur-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Ngày</TableHead>
                <TableHead>Danh mục / Mô tả</TableHead>
                <TableHead className="hidden md:table-cell">Ví</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Không tìm thấy giao dịch nào.
                  </TableCell>
                </TableRow>
              ) : (
                (transactions as unknown as TransactionWithRelations[]).map((t) => (
                  <TableRow key={t.id} className="group transition-colors hover:bg-violet-500/5">
                    <TableCell className="text-xs font-medium md:text-sm">
                      {format(new Date(t.date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">
                          {t.type === "TRANSFER" ? (
                            <div className="flex items-center gap-1 text-blue-500">
                              <ArrowLeftRight className="h-3 w-3" />
                              Chuyển khoản
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2">
                              {t.category?.name || "N/A"}
                              {t.tags && t.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {t.tags.map(({ tag }) => (
                                    <div
                                      key={tag.id}
                                      className="h-2 w-2 rounded-full"
                                      style={{ backgroundColor: tag.color || '#ccc' }}
                                      title={tag.name}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </span>
                        {t.note && <span className="line-clamp-1 text-[10px] text-muted-foreground md:text-xs">{t.note}</span>}
                        {t.locationName && (
                          <span className="mt-0.5 flex items-center gap-1 text-[9px] text-muted-foreground md:text-xs">
                            <MapPin className="h-2.5 w-2.5" />
                            {t.locationName}
                          </span>
                        )}
                        <div className="mt-0.5 md:hidden">
                          <Badge variant="outline" className="h-4 px-1 py-0 text-[9px]">{t.wallet?.name}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {t.type === "TRANSFER" ? (
                        <div className="flex items-center gap-1 text-xs">
                          <span className="font-medium text-muted-foreground">{t.wallet?.name}</span>
                          <ArrowLeftRight className="h-3 w-3 text-muted-foreground/50" />
                          <span className="font-medium text-foreground">{t.toWallet?.name}</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs font-medium">
                          {t.wallet?.name}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`text-sm font-black md:text-base ${
                        t.type === "INCOME" ? "text-emerald-500" :
                        t.type === "EXPENSE" ? "text-rose-500" :
                        "text-blue-500"
                      }`}>
                        {t.type === "INCOME" ? "+" : t.type === "EXPENSE" ? "-" : ""}
                        <CurrencyDisplay amount={Number(t.amount)} />
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="opacity-0 transition-opacity group-hover:opacity-100">
                        <DeleteTransactionButton transactionId={t.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        {totalPages > 1 && (
          <PaginationNav currentPage={page} totalPages={totalPages} />
        )}
      </FadeIn>
    </div>
  );
}
