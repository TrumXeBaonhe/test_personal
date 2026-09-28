"use client";

import { useState, useEffect } from "react";
import { Plus, Wallet, Pencil, Trash2, CreditCard, Landmark, Banknote } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createWallet, updateWallet, deleteWallet } from "@/app/actions/wallet-actions";
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
import { getFormOptions } from "@/app/actions/transaction-actions";
import { useCurrency } from "@/components/currency-provider";
import { CurrencyDisplay } from "@/components/currency-display";

type WalletItem = {
  id: string;
  name: string;
  balance: number;
  icon?: string | null;
};

const WALLET_ICONS = [
  { name: "Wallet", icon: Wallet },
  { name: "CreditCard", icon: CreditCard },
  { name: "Landmark", icon: Landmark },
  { name: "Banknote", icon: Banknote },
];

import { FadeIn } from "@/components/fade-in";

export default function WalletsPage() {
  const { convert, currency: currentCurrency } = useCurrency();
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletItem | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("0");
  const [icon, setIcon] = useState("Wallet");

  const fetchWallets = async () => {
    setIsLoading(true);
    try {
      const data = await getFormOptions();
      setWallets(data.wallets.map((w: { balance: number | string } & Record<string, unknown>) => ({ 
        ...w, 
        balance: Number(w.balance) 
      } as WalletItem)));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const resetForm = () => {
    setName("");
    setBalance("0");
    setIcon("Wallet");
    setEditingWallet(null);
  };

  const handleOpenEdit = (wallet: WalletItem) => {
    setEditingWallet(wallet);
    setName(wallet.name);
    // Convert VND from DB to current display currency
    const displayBalance = convert(wallet.balance, "VND", currentCurrency);
    setBalance(displayBalance.toString());
    setIcon(wallet.icon || "Wallet");
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return toast.error("Vui lòng nhập tên ví");

    // Convert input amount (in current currency) back to VND base for storage
    const amountInVND = convert(parseFloat(balance), currentCurrency, "VND");

    const data = {
      name,
      balance: amountInVND,
      icon,
    };

    let result;
    if (editingWallet) {
      result = await updateWallet(editingWallet.id, data);
    } else {
      result = await createWallet(data);
    }

    if (result.success) {
      toast.success(editingWallet ? "Cập nhật ví thành công" : "Tạo ví thành công");
      setIsDialogOpen(false);
      resetForm();
      fetchWallets();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteWallet(id);
    if (result.success) {
      toast.success("Xóa ví thành công");
      fetchWallets();
    } else {
      toast.error(result.error);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconObj = WALLET_ICONS.find(i => i.name === iconName);
    const IconComp = iconObj ? iconObj.icon : Wallet;
    return <IconComp className="h-5 w-5" />;
  };

  return (
    <div className="space-y-8 pb-10">
      <FadeIn delay={0.1}>
        <div className="relative overflow-hidden rounded-[32px] border border-border/60 bg-gradient-to-br from-violet-600/10 via-background to-cyan-500/10 p-6 shadow-[0_30px_80px_-32px_rgba(76,29,149,0.35)]">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Tài khoản</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-gradient">Ví của tôi</h2>
              <p className="mt-2 text-sm text-muted-foreground">Quản lý các tài khoản và nguồn tiền của bạn</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger render={<Button className="rounded-full px-6 shadow-lg shadow-violet-500/20" />}>
                <Plus className="mr-2 h-4 w-4" /> Thêm ví mới
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] border-none bg-card/90 shadow-[0_30px_80px_-32px_rgba(76,29,149,0.45)] backdrop-blur-xl">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingWallet ? "Sửa ví" : "Thêm ví mới"}</DialogTitle>
                    <DialogDescription>
                      Nhập thông tin ví của bạn. Số dư này sẽ được cộng vào tổng tài sản.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Tên ví</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="VD: Techcombank, Tiền mặt..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="balance">Số dư ban đầu</Label>
                      <Input
                        id="balance"
                        type="number"
                        value={balance}
                        onChange={(e) => setBalance(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Biểu tượng</Label>
                      <div className="flex flex-wrap gap-2">
                        {WALLET_ICONS.map((i) => (
                          <Button
                            key={i.name}
                            type="button"
                            variant={icon === i.name ? "default" : "outline"}
                            size="icon"
                            onClick={() => setIcon(i.name)}
                            className="h-10 w-10"
                          >
                            <i.icon className="h-5 w-5" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Lưu thay đổi</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </FadeIn>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-32 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : wallets.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed border-2 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">Bạn chưa có ví nào</h3>
          <p className="mb-4 mt-2 max-w-xs text-sm text-muted-foreground">
            Hãy thêm ví đầu tiên để bắt đầu quản lý các giao dịch tài chính của bạn.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {wallets.map((wallet) => (
            <Card key={wallet.id} className="group relative overflow-hidden border-none bg-card/70 shadow-[0_25px_60px_-30px_rgba(76,29,149,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-28px_rgba(79,70,229,0.35)]">
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-violet-500 via-indigo-500 to-cyan-500" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pl-5 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 transition-transform group-hover:scale-110">
                    {getIconComponent(wallet.icon || "Wallet")}
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">{wallet.name}</CardTitle>
                    <CardDescription className="text-xs">Tài khoản chính</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                    onClick={() => handleOpenEdit(wallet)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger
                      nativeButton={true}
                      render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive" />}
                    >
                      <Trash2 className="h-4 w-4" />
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-none bg-card/90 shadow-[0_30px_80px_-32px_rgba(76,29,149,0.45)] backdrop-blur-xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc muốn xóa ví này?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Hành động này sẽ xóa vĩnh viễn ví &quot;{wallet.name}&quot; và TẤT CẢ giao dịch liên quan. Không thể hoàn tác.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(wallet.id)}
                          className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Xác nhận xóa
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="pl-5 pb-4">
                <div className="text-2xl font-black tracking-tight text-foreground">
                  <CurrencyDisplay amount={wallet.balance} />
                </div>
              </CardContent>
              <CardFooter className="border-t border-border/60 bg-muted/20 px-5 py-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Cập nhật gần đây
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
