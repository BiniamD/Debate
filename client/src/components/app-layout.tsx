import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { SignInButton, SignOutButton, UserButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { MessageSquare, LogIn, History, Sparkles, Crown, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();

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
              <div className="flex items-center gap-2">
                {user.isPremium && (
                  <span className="text-xs bg-gradient-to-r from-[#0052FF] to-[#00D395] text-white px-2 py-0.5 rounded-full font-semibold">
                    PRO
                  </span>
                )}
                {!user.isPremium && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1.5 border-[#00D395] text-[#00D395] hover:bg-[#00D395]/10 font-medium"
                      onClick={async () => {
                        try {
                          const response = await fetch("/api/purchase/analysis", {
                            method: "POST",
                            credentials: "include"
                          });
                          const data = await response.json();
                          if (data.url) {
                            window.location.href = data.url;
                          } else if (data.error) {
                            toast({
                              title: "Error",
                              description: data.error,
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to start checkout",
                            variant: "destructive",
                          });
                        }
                      }}
                      data-testid="button-buy-credit-header"
                    >
                      <Zap className="w-4 h-4" />
                      <span className="hidden md:inline">Buy Credit</span>
                      <span className="md:hidden">$1.99</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 gap-2 text-[#0052FF] hover:text-[#0052FF]/80"
                      onClick={async () => {
                        try {
                          const response = await fetch("/api/checkout", { method: "POST" });
                          const data = await response.json();
                          if (data.url) {
                            window.location.href = data.url;
                          }
                        } catch (error) {
                          console.error("Checkout error:", error);
                        }
                      }}
                      data-testid="button-upgrade"
                    >
                      <Crown className="w-4 h-4" />
                      <span className="hidden sm:inline">Upgrade</span>
                    </Button>
                  </>
                )}
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9"
                    }
                  }}
                />
              </div>
            ) : (
              <SignInButton mode="modal">
                <Button
                  size="sm"
                  className="h-9 bg-[#0052FF] hover:bg-[#0052FF]/90 text-white gap-2 font-medium shadow-md"
                  data-testid="button-login"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log in</span>
                </Button>
              </SignInButton>
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
