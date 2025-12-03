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
import { MessageSquare, LogIn, LogOut, History, Sparkles, ChevronDown, Crown } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location.split('?')[0] === path;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 h-[72px] border-b border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          {/* Logo & Nav */}
          <div className="flex items-center gap-8">
            <Link href="/">
              <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity" data-testid="link-logo">
                <div className="w-9 h-9 rounded-xl bg-[#0052FF] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg text-foreground hidden sm:inline">Echo Chamber</span>
              </div>
            </Link>

            {isAuthenticated && (
              <nav className="flex items-center gap-1">
                <Link href="/analyze">
                  <Button
                    variant={isActive("/analyze") ? "secondary" : "ghost"}
                    size="sm"
                    className="h-9 gap-2 font-medium"
                    data-testid="nav-analyze"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze</span>
                  </Button>
                </Link>
                <Link href="/history">
                  <Button
                    variant={isActive("/history") ? "secondary" : "ghost"}
                    size="sm"
                    className="h-9 gap-2 font-medium"
                    data-testid="nav-history"
                  >
                    <History className="w-4 h-4" />
                    <span>History</span>
                  </Button>
                </Link>
              </nav>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 gap-2.5 px-2 hover:bg-muted/80" 
                    data-testid="button-user-menu"
                  >
                    <Avatar className="w-8 h-8 border border-border">
                      <AvatarImage src={user.profileImageUrl || undefined} />
                      <AvatarFallback className="text-sm bg-[#0052FF]/10 text-[#0052FF] font-medium">
                        {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium max-w-[120px] truncate">
                      {user.firstName || user.email?.split("@")[0]}
                    </span>
                    {user.isPremium && (
                      <span className="text-xs bg-gradient-to-r from-[#0052FF] to-[#00D395] text-white px-2 py-0.5 rounded-full font-semibold">
                        PRO
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-foreground">
                      {user.firstName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  {!user.isPremium && (
                    <>
                      <DropdownMenuItem 
                        className="cursor-pointer py-2.5"
                        onClick={() => window.location.href = "/checkout/success"}
                        data-testid="menu-upgrade"
                      >
                        <Crown className="w-4 h-4 mr-2 text-[#0052FF]" />
                        <span className="font-medium text-[#0052FF]">Upgrade to Pro</span>
                        <span className="ml-auto text-xs text-muted-foreground">$9/mo</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => window.location.href = "/api/logout"}
                    className="cursor-pointer text-muted-foreground hover:text-foreground"
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
                className="h-9 bg-[#0052FF] hover:bg-[#0052FF]/90 text-white gap-2 font-medium shadow-md"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-login"
              >
                <LogIn className="w-4 h-4" />
                <span>Log in</span>
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
