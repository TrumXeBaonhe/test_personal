"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut } from "lucide-react";

export function UserNav() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) return null;

  const userInitial = session.user.name?.[0] || session.user.email?.[0] || "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button 
            variant="ghost" 
            className="relative h-9 w-9 rounded-full ring-offset-background transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
          />
        }
      >
        <Avatar className="h-9 w-9 border">
          <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
          <AvatarFallback className="bg-primary/10 text-primary">{userInitial.toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mt-2" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal px-2 py-1.5 cursor-default">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none">{session.user.name}</p>
              <p className="text-xs leading-none text-muted-foreground pt-1">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer py-2 px-2" 
          onClick={() => router.push("/profile")}
        >
          <User className="mr-3 h-4 w-4 text-muted-foreground" />
          <span>Hồ sơ cá nhân</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer py-2 px-2" 
          onClick={() => router.push("/profile")}
        >
          <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
          <span>Cài đặt hệ thống</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer py-2 px-2 text-rose-500 focus:text-rose-600 focus:bg-rose-50" 
          onClick={(e) => {
            e.preventDefault();
            signOut({ callbackUrl: "/login" });
          }}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="font-medium">Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
