import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useDebateLimit } from "@/hooks/use-debate-limit";
import { PaywallModal, DebateCounter } from "@/components/paywall-modal";
import type { DebateResponse, Perspective } from "@shared/schema";
import {
  MessageSquare,
  Sparkles,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Link2,
  CheckCircle,
  LogIn,
  LogOut,
  User,
  History,
} from "lucide-react";
import { SiX } from "react-icons/si";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DebateWithId extends DebateResponse {
  id: string;
  symbol: string;
}

function PerspectiveCard({
  perspective,
  type,
  animationClass,
}: {
  perspective: Perspective;
  type: "bull" | "bear" | "neutral";
  animationClass: string;
}) {
  const config = {
    bull: {
      icon: TrendingUp,
      borderColor: "border-emerald-600/40",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      titleColor: "text-emerald-700 dark:text-emerald-400",
    },
    bear: {
      icon: TrendingDown,
      borderColor: "border-amber-600/40",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      iconColor: "text-amber-700 dark:text-amber-400",
      titleColor: "text-amber-800 dark:text-amber-400",
    },
    neutral: {
      icon: Minus,
      borderColor: "border-yellow-600/40",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
      iconColor: "text-yellow-700 dark:text-yellow-400",
      titleColor: "text-yellow-800 dark:text-yellow-400",
    },
  };

  const { icon: Icon, borderColor, bgColor, iconColor, titleColor } = config[type];

  return (
    <div
      className={`rounded-xl p-6 border ${borderColor} ${bgColor} ${animationClass} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
      data-testid={`card-perspective-${type}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`w-6 h-6 ${iconColor}`} />
        <h3 className={`text-xl font-semibold ${titleColor}`}>{perspective.title}</h3>
      </div>

      <div className="space-y-4 mb-6">
        {perspective.argument.split("\n\n").map((paragraph, idx) => (
          <p key={idx} className="text-amber-800 dark:text-amber-100 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">
          Key Points
        </h4>
        <ul className="space-y-2">
          {perspective.keyPoints.map((point, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-amber-800 dark:text-amber-100"
              data-testid={`text-keypoint-${type}-${idx}`}
            >
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${iconColor.replace("text-", "bg-")} flex-shrink-0`} />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Home() {
  const [symbol, setSymbol] = useState("");
  const [context, setContext] = useState("");
  const [debate, setDebate] = useState<DebateWithId | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading, isFetching: authFetching } = useAuth();
  
  const FREE_TIER_LIMIT = 3;
  
  // Use server-side rate limiting for logged-in users, localStorage for anonymous
  const serverIsPro = isAuthenticated && user?.isPremium;
  const { remaining: localRemaining, canGenerate: localCanGenerate, isPro: localIsPro, recordDebate } = useDebateLimit();
  
  // For logged-in users: use server's debatesThisMonth directly
  // No optimistic tracking needed - just check server state + disable while loading
  const serverDebatesThisMonth = user?.debatesThisMonth ?? 0;
  const serverRemaining = FREE_TIER_LIMIT - serverDebatesThisMonth;
  
  // Determine if user can generate based on their status
  // Block while auth is loading OR refetching to prevent race conditions
  // authLoading = true during initial load
  // authFetching = true during initial load AND during refetch after mutation
  const effectiveRemaining = isAuthenticated ? Math.max(0, serverRemaining) : localRemaining;
  const authBusy = authLoading || (isAuthenticated && authFetching);
  const effectiveCanGenerate = authBusy
    ? false // Block while loading/refetching to prevent race conditions
    : (serverIsPro || (isAuthenticated ? serverRemaining > 0 : localCanGenerate));
  const effectiveIsPro = serverIsPro || localIsPro;

  const debateMutation = useMutation({
    mutationFn: async (data: { symbol: string; context?: string }) => {
      const response = await apiRequest("POST", "/api/debate", data);
      const json = await response.json();
      
      // Check for rate limit error
      if (response.status === 429) {
        throw new Error("RATE_LIMIT_EXCEEDED");
      }
      
      // Validate the response has the expected structure
      if (!json.bull?.title || !json.bear?.title || !json.neutral?.title || !json.id) {
        throw new Error("Invalid response structure from AI");
      }
      
      return json as DebateWithId;
    },
    onSuccess: (data) => {
      setDebate(data);
      // Track usage based on auth status
      if (!isAuthenticated) {
        // Anonymous users: track in localStorage
        recordDebate();
      } else if (!serverIsPro) {
        // Refresh user data to sync with server
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }
    },
    onError: (error: Error) => {
      // Show paywall for rate limit errors (check both custom code and HTTP status)
      if (error.message === "RATE_LIMIT_EXCEEDED" || error.message.includes("429")) {
        setShowPaywall(true);
        return;
      }
      toast({
        title: "Error generating debate",
        description: error.message || "Failed to generate debate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = async () => {
    try {
      const response = await fetch("/api/checkout", { method: "POST" });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "Failed to start checkout. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to connect to payment service.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) {
      toast({
        title: "Symbol required",
        description: "Please enter a stock symbol to analyze.",
        variant: "destructive",
      });
      return;
    }
    
    // Check rate limit
    if (!effectiveCanGenerate) {
      setShowPaywall(true);
      return;
    }
    
    setDebate(null);
    debateMutation.mutate({
      symbol: symbol.toUpperCase().trim(),
      context: context.trim() || undefined,
    });
  };

  const getShareUrl = () => {
    if (!debate) return "";
    return `${window.location.origin}/debate/${debate.id}`;
  };

  const handleTwitterShare = () => {
    if (!debate) return;
    
    const shareUrl = getShareUrl();
    const text = `Check out this Echo Chamber analysis on $${debate.symbol}:\n\nBull: ${debate.bull.keyPoints[0]}\nBear: ${debate.bear.keyPoints[0]}\n\n`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
  };

  const handleCopyLink = async () => {
    const shareUrl = getShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share this link with anyone to show them this debate.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-amber-950 dark:via-stone-950 dark:to-amber-950">
      <div className="max-w-6xl mx-auto">
        {/* Top Navigation */}
        <nav className="flex justify-end mb-4">
          {authLoading ? (
            <div className="h-10" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link href="/history">
                <Button variant="ghost" size="sm" className="text-amber-800 dark:text-amber-200" data-testid="button-history">
                  <History className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">History</span>
                </Button>
              </Link>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-amber-800 dark:text-amber-200 text-sm hidden sm:inline" data-testid="text-user-name">
                {user.firstName || user.email || "User"}
              </span>
              {effectiveIsPro && (
                <span className="text-xs bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full" data-testid="badge-pro">
                  Pro
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-800 dark:text-amber-200"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="border-amber-600/30 text-amber-800 dark:border-amber-400/30 dark:text-amber-200"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Log in
            </Button>
          )}
        </nav>

        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageSquare className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-amber-900 dark:text-amber-100" data-testid="text-app-title">
              Echo Chamber
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-amber-700 dark:text-amber-300 mb-2" data-testid="text-tagline">
            Break the echo. See every angle.
          </p>
          <p className="text-amber-600 dark:text-amber-400 mb-4" data-testid="text-subtitle">
            AI-powered bull, bear, and neutral perspectives on any stock
          </p>
          <div className="flex justify-center">
            <DebateCounter remaining={effectiveRemaining} isPro={effectiveIsPro} onUpgrade={handleUpgrade} />
          </div>
        </header>

        {/* Input Section */}
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-xl p-6 md:p-8 mb-8 max-w-2xl mx-auto border border-amber-200/50 dark:border-amber-700/30 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="symbol"
                className="block text-sm font-medium text-amber-800 dark:text-amber-200 mb-2"
              >
                Stock Symbol
              </label>
              <Input
                id="symbol"
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="AAPL, TSLA, NVDA..."
                className="bg-amber-50/50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 placeholder:text-amber-500 dark:placeholder:text-amber-500 uppercase focus:ring-amber-400"
                disabled={debateMutation.isPending}
                data-testid="input-symbol"
              />
            </div>

            <div>
              <label
                htmlFor="context"
                className="block text-sm font-medium text-amber-800 dark:text-amber-200 mb-2"
              >
                Context (Optional)
              </label>
              <Textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="E.g., 'Considering buying for long-term hold'..."
                rows={3}
                className="bg-amber-50/50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 placeholder:text-amber-500 dark:placeholder:text-amber-500 resize-none focus:ring-amber-400"
                disabled={debateMutation.isPending}
                data-testid="input-context"
              />
            </div>

            <Button
              type="submit"
              disabled={debateMutation.isPending || !symbol.trim() || !effectiveCanGenerate}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              data-testid="button-generate"
            >
              {debateMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Debate...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Debate
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Results Section */}
        {debate && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-amber-900 dark:text-amber-100">
                Analysis for{" "}
                <span className="text-emerald-600 dark:text-emerald-400" data-testid="text-analyzed-symbol">
                  {debate.symbol}
                </span>
              </h2>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleTwitterShare}
                  className="border-amber-600/30 text-amber-800 dark:border-amber-400/30 dark:text-amber-200"
                  data-testid="button-share-twitter"
                >
                  <SiX className="w-4 h-4 mr-2" />
                  Share on X
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="border-amber-600/30 text-amber-800 dark:border-amber-400/30 dark:text-amber-200"
                  data-testid="button-copy-link"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PerspectiveCard
                perspective={debate.bull}
                type="bull"
                animationClass="animate-fadeIn"
              />
              <PerspectiveCard
                perspective={debate.bear}
                type="bear"
                animationClass="animate-fadeIn-delay-1"
              />
              <PerspectiveCard
                perspective={debate.neutral}
                type="neutral"
                animationClass="animate-fadeIn-delay-2"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center space-y-3">
          <p className="text-amber-600 dark:text-amber-400 text-sm" data-testid="text-pricing">
            Free: 3 debates/month | Pro ($9/mo): Unlimited debates
          </p>
          <p className="text-amber-500 dark:text-amber-500 text-xs" data-testid="text-disclaimer">
            Not financial advice. AI-generated perspectives for educational purposes only.
          </p>
        </footer>
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}
