"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Target, 
  Clock,
  MoreVertical, 
  Pencil, 
  Trash2, 
  ArrowUpCircle,
} from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";
import { 
  createSavingGoal, 
  updateSavingGoal, 
  deleteSavingGoal, 
  addContribution,
  getSavingGoals 
} from "@/app/actions/saving-goal-actions";
import { getFormOptions } from "@/app/actions/transaction-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type SavingGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadlineDate: Date;
  isRoundUp?: boolean;
};

type Wallet = {
  id: string;
  name: string;
  balance: number;
};

import { FadeIn } from "@/components/fade-in";
import { useCurrency } from "@/components/currency-provider";
import { CurrencyDisplay } from "@/components/currency-display";

export default function SavingGoalsPage() {
  const { convert, currency: currentCurrency } = useCurrency();
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isContributionDialogOpen, setIsContributionDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

  // Form states
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isRoundUp, setIsRoundUp] = useState(false);
  
  const [contributionAmount, setContributionAmount] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [goalsData, options] = await Promise.all([
        getSavingGoals(),
        getFormOptions()
      ]);
      const serializedGoals = goalsData.map((g) => ({
        ...g,
        targetAmount: Number(g.targetAmount),
        currentAmount: Number(g.currentAmount),
      }));
      setGoals(serializedGoals as unknown as SavingGoal[]);
      setWallets(options.wallets as Wallet[]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetGoalForm = () => {
    setGoalName("");
    setTargetAmount("");
    setDeadline("");
    setIsRoundUp(false);
    setEditingGoal(null);
  };

  const handleOpenEdit = (goal: SavingGoal) => {
    setEditingGoal(goal);
    setGoalName(goal.name);
    setTargetAmount(convert(Number(goal.targetAmount), "VND", currentCurrency).toString());
    setDeadline(format(new Date(goal.deadlineDate), "yyyy-MM-dd"));
    setIsRoundUp(!!goal.isRoundUp);
    setIsGoalDialogOpen(true);
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !targetAmount || !deadline) {
      return toast.error("Vui lòng điền đầy đủ thông tin");
    }

    const data = {
      name: goalName,
      targetAmount: convert(parseFloat(targetAmount), currentCurrency, "VND"),
      deadlineDate: new Date(deadline),
      currentAmount: editingGoal ? Number(editingGoal.currentAmount) : 0,
      isRoundUp: isRoundUp,
    };

    let result;
    if (editingGoal) {
      result = await updateSavingGoal(editingGoal.id, data);
    } else {
      result = await createSavingGoal(data);
    }

    if (result.success) {
      toast.success(editingGoal ? "Cập nhật mục tiêu thành công" : "Tạo mục tiêu thành công");
      setIsGoalDialogOpen(false);
      resetGoalForm();
      fetchData();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteSavingGoal(id);
    if (result.success) {
      toast.success("Xóa mục tiêu thành công");
      fetchData();
    } else {
      toast.error(result.error);
    }
  };

  const handleContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoalId || !selectedWalletId || !contributionAmount) {
      return toast.error("Vui lòng chọn ví và nhập số tiền");
    }

    const rawAmount = parseFloat(contributionAmount);
    const amount = convert(rawAmount, currentCurrency, "VND");
    const result = await addContribution(activeGoalId, selectedWalletId, amount);

    if (result.success) {
      toast.success("Nạp tiền thành công!");
      setIsContributionDialogOpen(false);
      setContributionAmount("");
      setSelectedWalletId("");
      fetchData();
    } else {
      toast.error(result.error);
    }
  };

  const calculateProgress = (current: number | { toString(): string }, target: number | { toString(): string }) => {
    const curr = Number(current);
    const targ = Number(target);
    if (targ === 0) return 0;
    return Math.min(Math.round((curr / targ) * 100), 100);
  };

  const getDaysRemaining = (date: Date) => {
    const now = new Date();
    const target = new Date(date);
    if (isPast(target)) return "Đã hết hạn";
    const days = differenceInDays(target, now);
    return `${days} ngày còn lại`;
  };

  return (
    <div className="space-y-8 pb-10">
      <FadeIn delay={0.05}>
        <div className="relative overflow-hidden rounded-[32px] border border-border/60 bg-gradient-to-br from-violet-600/10 via-background to-cyan-500/10 p-6 shadow-[0_30px_80px_-32px_rgba(76,29,149,0.35)]">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Savings</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-gradient">Mục tiêu tiết kiệm</h2>
              <p className="mt-2 text-sm text-muted-foreground">Hiện thực hóa những ước mơ của bạn</p>
            </div>
            <Dialog open={isGoalDialogOpen} onOpenChange={(open) => {
              setIsGoalDialogOpen(open);
              if (!open) resetGoalForm();
            }}>
              <DialogTrigger render={<Button className="rounded-full px-6 shadow-lg shadow-violet-500/20" />}>
                <Plus className="mr-2 h-4 w-4" /> Thêm mục tiêu
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] border-none bg-card/90 shadow-[0_30px_80px_-32px_rgba(76,29,149,0.45)] backdrop-blur-xl">
                <form onSubmit={handleGoalSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingGoal ? "Sửa mục tiêu" : "Tạo mục tiêu mới"}</DialogTitle>
                    <DialogDescription>Xác định mục tiêu và thời hạn hoàn thành.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="goal-name">Tên mục tiêu</Label>
                      <Input
                        id="goal-name"
                        value={goalName}
                        onChange={(e) => setGoalName(e.target.value)}
                        placeholder="VD: Mua Macbook, Đi du lịch..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="target-amount">Số tiền cần tiết kiệm ({currentCurrency})</Label>
                      <Input
                        id="target-amount"
                        type="number"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        placeholder="50000000"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="deadline">Hạn hoàn thành</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                      />
                    </div>
                    <div className="mt-2 flex items-center space-x-2 rounded-xl border border-primary/10 bg-primary/5 p-3">
                      <input
                        type="checkbox"
                        id="is-round-up"
                        checked={isRoundUp}
                        onChange={(e) => setIsRoundUp(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="is-round-up"
                          className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Bật Tiết kiệm tự động (Round-up)
                        </label>
                        <p className="text-[10px] text-muted-foreground">
                          Tự động làm tròn chi tiêu đến 10.000đ và bỏ vào mục tiêu này.
                        </p>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full">Lưu mục tiêu</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </FadeIn>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Card key={i} className="h-48 animate-pulse bg-muted" />)}
        </div>
      ) : goals.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed border-2 bg-card/30 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-xl font-semibold">Bạn chưa có mục tiêu nào</h3>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Đặt ra một mục tiêu tiết kiệm sẽ giúp bạn quản lý tài chính có kỷ luật hơn.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const daysLeft = getDaysRemaining(goal.deadlineDate);

            return (
              <Card key={goal.id} className="group relative overflow-hidden border border-border/60 bg-card/75 shadow-[0_25px_60px_-30px_rgba(76,29,149,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-28px_rgba(79,70,229,0.35)]">
                <div className="absolute right-0 top-0 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" />}>
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-none bg-card/90 shadow-[0_30px_60px_-30px_rgba(76,29,149,0.45)] backdrop-blur-xl">
                      <DropdownMenuItem onClick={() => handleOpenEdit(goal)} className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger
                          nativeButton={true}
                          render={<DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer text-destructive" />}
                        >
                          <div className="flex w-full items-center">
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa mục tiêu
                          </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-none bg-card/90 shadow-[0_30px_80px_-32px_rgba(76,29,149,0.45)] backdrop-blur-xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Mục tiêu &quot;{goal.name}&quot; sẽ bị xóa vĩnh viễn. Giao dịch nạp tiền trước đó sẽ không bị thu hồi.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(goal.id)} className="bg-destructive text-destructive-foreground">Xóa</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-violet-500/10 p-2 text-primary">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                        {goal.isRoundUp && (
                          <span className="rounded-full border border-primary/20 bg-primary/20 px-1.5 py-0.5 text-[8px] font-black uppercase text-primary">
                            Round-up
                          </span>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {daysLeft}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tiến độ</span>
                      <span className="font-bold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium uppercase text-muted-foreground">Đã có</p>
                      <p className="text-sm font-semibold text-primary"><CurrencyDisplay amount={Number(goal.currentAmount)} /></p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-medium uppercase text-muted-foreground">Mục tiêu</p>
                      <p className="text-sm font-semibold"><CurrencyDisplay amount={Number(goal.targetAmount)} /></p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Dialog open={isContributionDialogOpen && activeGoalId === goal.id} onOpenChange={(open) => {
                    setIsContributionDialogOpen(open);
                    if (open) setActiveGoalId(goal.id);
                  }}>
                    <DialogTrigger render={<Button className="group/btn w-full" variant="outline" />}>
                      <ArrowUpCircle className="mr-2 h-4 w-4 transition-transform group-hover/btn:-translate-y-1" /> Nạp thêm tiền
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px] border-none bg-card/90 shadow-[0_30px_80px_-32px_rgba(76,29,149,0.45)] backdrop-blur-xl">
                      <form onSubmit={handleContributionSubmit}>
                        <DialogHeader>
                          <DialogTitle>Nạp tiền cho: {goal.name}</DialogTitle>
                          <DialogDescription>
                            Số tiền này sẽ được trừ trực tiếp từ ví bạn chọn.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label>Chọn ví nguồn</Label>
                            <select
                              value={selectedWalletId}
                              onChange={(e) => setSelectedWalletId(e.target.value)}
                              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                              <option value="">-- Chọn ví --</option>
                              {wallets.map(w => (
                                <option key={w.id} value={w.id}>
                                  {w.name} (<CurrencyDisplay amount={Number(w.balance)} />)
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Số tiền nạp ({currentCurrency})</Label>
                            <Input
                              type="number"
                              value={contributionAmount}
                              onChange={(e) => setContributionAmount(e.target.value)}
                              placeholder="1.000.000"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="w-full">Xác nhận nạp tiền</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
