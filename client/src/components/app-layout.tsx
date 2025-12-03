import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageSquare, LogIn, LogOut, User, History, Sparkles, ChevronDown } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path || location.startsWith(path + "?");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer" data-testid="link-logo">
                <MessageSquare className="w-6 h-6 text-[#0052FF]" />
                <span className="font-semibold text-foreground hidden sm:inline">Echo Chamber</span>
              </div>
            </Link>

            {isAuthenticated && (
              <nav className="flex items-center gap-1">
                <Link href="/app">
                  <Button
                    variant={isActive("/app") && !location.includes("tab=history") ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2"
                    data-testid="nav-analyze"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">Analyze</span>
                  </Button>
                </Link>
                <Link href="/app?tab=history">
                  <Button
                    variant={location.includes("tab=history") ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2"
                    data-testid="nav-history"
                  >
                    <History className="w-4 h-4" />
                    <span className="hidden sm:inline">History</span>
                  </Button>
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 px-2" data-testid="button-user-menu">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={user.profileImageUrl || undefined} />
                      <AvatarFallback className="text-xs bg-[#0052FF]/10 text-[#0052FF]">
                        {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm max-w-[100px] truncate">
                      {user.firstName || user.email?.split("@")[0]}
                    </span>
                    {user.isPremium && (
                      <span className="text-xs bg-[#0052FF]/10 text-[#0052FF] px-1.5 py-0.5 rounded font-medium">
                        PRO
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  {!user.isPremium && (
                    <>
                      <DropdownMenuItem className="text-[#0052FF] cursor-pointer" data-testid="menu-upgrade">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Upgrade to Pro
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => window.location.href = "/api/logout"}
                    className="text-destructive cursor-pointer"
                    data-testid="menu-logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white gap-2"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-login"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Log in</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
