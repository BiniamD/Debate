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
  ArrowRight,
  BarChart3,
  Shield,
  Zap,
} from "lucide-react";
import { SiX } from "react-icons/si";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

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
      borderColor: "border-[#00D395]/40",
      bgColor: "bg-[#00D395]/5",
      iconColor: "text-[#00D395]",
      titleColor: "text-[#00D395]",
      dotColor: "bg-[#00D395]",
    },
    bear: {
      icon: TrendingDown,
      borderColor: "border-[#FF5F57]/40",
      bgColor: "bg-[#FF5F57]/5",
      iconColor: "text-[#FF5F57]",
      titleColor: "text-[#FF5F57]",
      dotColor: "bg-[#FF5F57]",
    },
    neutral: {
      icon: Minus,
      borderColor: "border-[#0052FF]/40",
      bgColor: "bg-[#0052FF]/5",
      iconColor: "text-[#0052FF]",
      titleColor: "text-[#0052FF]",
      dotColor: "bg-[#0052FF]",
    },
  };

  const { icon: Icon, borderColor, bgColor, iconColor, titleColor, dotColor } = config[type];

  return (
    <div
      className={`rounded-xl border p-6 ${borderColor} ${bgColor} ${animationClass} transition-all duration-200 hover:border-opacity-60`}
      data-testid={`card-perspective-${type}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <h3 className={`text-lg font-semibold ${titleColor}`}>{perspective.title}</h3>
      </div>

      <div className="space-y-4 mb-6">
        {perspective.argument.split("\n\n").map((paragraph, idx) => (
          <p key={idx} className="text-muted-foreground leading-relaxed text-sm">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Key Points
        </h4>
        <ul className="space-y-2">
          {perspective.keyPoints.map((point, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-foreground text-sm"
              data-testid={`text-keypoint-${type}-${idx}`}
            >
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`} />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, description, testId }: { icon: any; title: string; description: string; testId: string }) {
  return (
    <div className="flex items-start gap-3" data-testid={testId}>
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#0052FF]/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#0052FF]" />
      </div>
      <div>
        <h4 className="font-medium text-foreground" data-testid={`${testId}-title`}>{title}</h4>
        <p className="text-sm text-muted-foreground" data-testid={`${testId}-desc`}>{description}</p>
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
  
  const serverIsPro = isAuthenticated && user?.isPremium;
  const { remaining: localRemaining, canGenerate: localCanGenerate, isPro: localIsPro, recordDebate } = useDebateLimit();
  
  const serverDebatesThisMonth = user?.debatesThisMonth ?? 0;
  const serverRemaining = FREE_TIER_LIMIT - serverDebatesThisMonth;
  
  const effectiveRemaining = isAuthenticated ? Math.max(0, serverRemaining) : localRemaining;
  const authBusy = authLoading || (isAuthenticated && authFetching);
  const effectiveCanGenerate = authBusy
    ? false
    : (serverIsPro || (isAuthenticated ? serverRemaining > 0 : localCanGenerate));
  const effectiveIsPro = serverIsPro || localIsPro;

  const debateMutation = useMutation({
    mutationFn: async (data: { symbol: string; context?: string }) => {
      const response = await apiRequest("POST", "/api/debate", data);
      const json = await response.json();
      
      if (response.status === 429) {
        throw new Error("RATE_LIMIT_EXCEEDED");
      }
      
      if (!json.bull?.title || !json.bear?.title || !json.neutral?.title || !json.id) {
        throw new Error("Invalid response structure from AI");
      }
      
      return json as DebateWithId;
    },
    onSuccess: (data) => {
      setDebate(data);
      if (!isAuthenticated) {
        recordDebate();
      } else if (!serverIsPro) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }
    },
    onError: (error: Error) => {
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

  const scrollToAnalysis = () => {
    document.getElementById('analysis-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative border-b bg-gradient-to-b from-[#0052FF]/5 to-background">
        {/* Top Navigation */}
        <nav className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#0052FF]" />
            <span className="font-semibold text-foreground">Echo Chamber</span>
          </div>
          
          {authLoading ? (
            <div className="h-10" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link href="/history">
                <Button variant="ghost" size="sm" data-testid="button-history">
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
              <Button
                variant="ghost"
                size="sm"
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
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Log in
            </Button>
          )}
        </nav>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-tight" data-testid="text-hero-title">
            Break the echo.<br />
            <span className="text-[#0052FF]">See every angle.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
            AI-powered stock analysis that gives you bull, bear, and neutral perspectives on any investment. Make informed decisions by seeing the full picture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white"
              onClick={scrollToAnalysis}
              data-testid="button-get-started"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-16 border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureItem
              icon={BarChart3}
              title="Multi-Perspective Analysis"
              description="Get bull, bear, and neutral viewpoints powered by Claude AI"
              testId="feature-multi-perspective"
            />
            <FeatureItem
              icon={Zap}
              title="Instant Insights"
              description="Analyze any stock symbol in seconds with detailed key points"
              testId="feature-instant-insights"
            />
            <FeatureItem
              icon={Shield}
              title="Shareable Debates"
              description="Share your analysis on social media or copy a public link"
              testId="feature-shareable"
            />
          </div>
        </div>
      </section>

      {/* Auth Status & Analysis Section */}
      <section id="analysis-section" className="py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Account Status Card */}
          <Card>
            <CardContent className="p-6">
              {authLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : isAuthenticated && user ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.profileImageUrl || undefined} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground" data-testid="text-user-name">
                        {user.firstName || user.email || "User"}
                      </p>
                      <div className="flex items-center gap-2">
                        {effectiveIsPro ? (
                          <span className="text-xs bg-[#0052FF]/10 text-[#0052FF] px-2 py-0.5 rounded font-medium" data-testid="badge-pro">
                            Pro Member
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Free Plan</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <DebateCounter remaining={effectiveRemaining} isPro={effectiveIsPro} onUpgrade={handleUpgrade} />
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Sign in to save your debates</h3>
                    <p className="text-sm text-muted-foreground">Track your analysis history and access debates across devices</p>
                  </div>
                  <Button
                    onClick={() => window.location.href = "/api/login"}
                    className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white"
                    data-testid="button-login-cta"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign in with Replit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Form Card */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0052FF]" />
                Analyze a Stock
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="symbol"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Stock Symbol
                  </label>
                  <Input
                    id="symbol"
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="AAPL, TSLA, NVDA..."
                    className="font-mono uppercase"
                    disabled={debateMutation.isPending}
                    data-testid="input-symbol"
                  />
                </div>

                <div>
                  <label
                    htmlFor="context"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Context (Optional)
                  </label>
                  <Textarea
                    id="context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="E.g., 'Considering buying for long-term hold'..."
                    rows={3}
                    className="resize-none"
                    disabled={debateMutation.isPending}
                    data-testid="input-context"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={debateMutation.isPending || !symbol.trim() || !effectiveCanGenerate}
                  className="w-full bg-[#0052FF] hover:bg-[#0052FF]/90 text-white"
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

                {!isAuthenticated && (
                  <div className="flex justify-center">
                    <DebateCounter remaining={effectiveRemaining} isPro={effectiveIsPro} onUpgrade={handleUpgrade} />
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results Section */}
      {debate && (
        <section className="py-8 px-4">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Analysis for{" "}
                <span className="text-[#0052FF] font-mono" data-testid="text-analyzed-symbol">
                  {debate.symbol}
                </span>
              </h2>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleTwitterShare}
                  data-testid="button-share-twitter"
                >
                  <SiX className="w-4 h-4 mr-2" />
                  Share on X
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
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
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-[#0052FF]" />
            <span className="font-semibold text-foreground">Echo Chamber</span>
          </div>
          <p className="text-muted-foreground text-sm" data-testid="text-pricing">
            Free: 3 debates/month | Pro ($9/mo): Unlimited debates
          </p>
          <p className="text-muted-foreground/60 text-xs" data-testid="text-disclaimer">
            Not financial advice. AI-generated perspectives for educational purposes only.
          </p>
        </div>
      </footer>

      {/* Paywall Modal */}
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}
