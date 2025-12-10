import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AppLayout } from "@/components/app-layout";
import type { User, DebateResponse, MultiDebateResponse } from "@shared/schema";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Share2,
  Copy,
  Check,
  Loader2,
  ChevronRight,
  Info,
  Crown
} from "lucide-react";
import { SiX } from "react-icons/si";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function PerspectiveCards({ data, symbol }: { data: DebateResponse; symbol: string }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Bull Card */}
      <Card className="p-6 border-l-4 border-l-[#00D395] bg-[#00D395]/[0.02] shadow-md hover:shadow-lg transition-shadow" data-testid={`card-bull-${symbol}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[#00D395]/10">
            <TrendingUp className="w-5 h-5 text-[#00D395]" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{data.bull.title}</h3>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
          {data.bull.argument.split('\n\n').map((para, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed mb-3">{para}</p>
          ))}
        </div>
        <div className="space-y-2 pt-4 border-t border-border/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Points</p>
          <ul className="space-y-2">
            {data.bull.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-[#00D395] mt-0.5">+</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Bear Card */}
      <Card className="p-6 border-l-4 border-l-[#FF5F57] bg-[#FF5F57]/[0.02] shadow-md hover:shadow-lg transition-shadow" data-testid={`card-bear-${symbol}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[#FF5F57]/10">
            <TrendingDown className="w-5 h-5 text-[#FF5F57]" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{data.bear.title}</h3>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
          {data.bear.argument.split('\n\n').map((para, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed mb-3">{para}</p>
          ))}
        </div>
        <div className="space-y-2 pt-4 border-t border-border/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Points</p>
          <ul className="space-y-2">
            {data.bear.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-[#FF5F57] mt-0.5">-</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Neutral Card */}
      <Card className="p-6 border-l-4 border-l-[#0052FF] bg-[#0052FF]/[0.02] shadow-md hover:shadow-lg transition-shadow" data-testid={`card-neutral-${symbol}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[#0052FF]/10">
            <BarChart3 className="w-5 h-5 text-[#0052FF]" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{data.neutral.title}</h3>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
          {data.neutral.argument.split('\n\n').map((para, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed mb-3">{para}</p>
          ))}
        </div>
        <div className="space-y-2 pt-4 border-t border-border/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Points</p>
          <ul className="space-y-2">
            {data.neutral.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-[#0052FF] mt-0.5">=</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}

export default function Analyze() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [symbolInput, setSymbolInput] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<MultiDebateResponse | null>(null);
  const [analyzedSymbols, setAnalyzedSymbols] = useState<string[]>([]);
  const [activeSymbol, setActiveSymbol] = useState<string>("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [debateId, setDebateId] = useState<string | null>(null);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: { symbols: string[]; context?: string }) => {
      const response = await apiRequest("POST", "/api/debate", data);
      return response.json();
    },
    onSuccess: async (data) => {
      setResult(data.result);
      setAnalyzedSymbols(data.symbols);
      setActiveSymbol(data.symbols[0]);
      setDebateId(data.id);

      // Store previous credit balance before invalidating queries
      const previousCreditBalance = user?.purchasedAnalyses || 0;

      // Invalidate queries to refresh user data
      await queryClient.invalidateQueries({ queryKey: ["/api/user/debates"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

      // Wait a moment for the query to refetch, then check if credit was used
      setTimeout(() => {
        const currentUser = queryClient.getQueryData<User>(["/api/auth/user"]);
        const newCreditBalance = currentUser?.purchasedAnalyses || 0;

        if (previousCreditBalance > 0 && newCreditBalance < previousCreditBalance) {
          // Credit was consumed
          const creditsUsed = previousCreditBalance - newCreditBalance;
          toast({
            title: "Credit Used",
            description: `${creditsUsed} credit${creditsUsed !== 1 ? 's' : ''} used. ${newCreditBalance} credit${newCreditBalance !== 1 ? 's' : ''} remaining.`,
            variant: "default",
          });
        } else if (data.cached) {
          // Show cache hit feedback
          toast({
            title: "Instant Result",
            description: "Analysis retrieved from cache (no credit used).",
            variant: "default",
          });
        }
      }, 500);
    },
    onError: (error: Error) => {
      if (error.message.includes("limit")) {
        setShowPaywall(true);
      } else {
        toast({
          title: "Analysis Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const parseSymbols = (input: string): string[] => {
    return input
      .toUpperCase()
      .split(/[,\s]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length <= 10)
      .slice(0, 5);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const symbols = parseSymbols(symbolInput);
    if (symbols.length === 0) {
      toast({
        title: "Enter a Symbol",
        description: "Please enter one or more stock ticker symbols to analyze (comma-separated).",
        variant: "destructive",
      });
      return;
    }
    setResult(null);
    setDebateId(null);
    setAnalyzedSymbols([]);
    setActiveSymbol("");
    analyzeMutation.mutate({ 
      symbols, 
      context: context.trim() || undefined 
    });
  };

  const shareUrl = debateId ? `${window.location.origin}/debate/${debateId}` : "";
  const currentResult = result && activeSymbol ? result[activeSymbol] : null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast({
      title: "Link Copied",
      description: "Share link copied to clipboard.",
    });
  };

  const handleShareTwitter = () => {
    const symbolText = analyzedSymbols.length > 1 
      ? analyzedSymbols.map(s => `$${s}`).join(', ')
      : `$${analyzedSymbols[0]}`;
    const text = `Check out this AI-powered stock analysis for ${symbolText} on Echo Chamber - bull, bear, and neutral perspectives in one place!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  };

  const debatesUsed = user?.debatesThisMonth || 0;
  const remaining = Math.max(0, 3 - debatesUsed);
  const creditBalance = user?.purchasedAnalyses || 0;

  const getRemainingText = () => {
    if (user?.isPremium) return "Unlimited";
    if (creditBalance > 0) {
      return `${creditBalance} credit${creditBalance !== 1 ? 's' : ''} + ${remaining} free`;
    }
    return `${remaining} free`;
  };

  const remainingDebates = getRemainingText();

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-72px)] bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Stock Analysis
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enter a stock symbol to get AI-powered perspectives from all sides
            </p>
          </div>

          {/* Upsell Banner for Multi-Buyers */}
          {user && !user.isPremium && (user.lifetimePurchases || 0) >= 4 && (
            <div className="mb-4 p-4 bg-gradient-to-r from-[#0052FF]/10 to-[#00D395]/10 border border-[#0052FF]/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0052FF] to-[#00D395] flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      💡 You've purchased {user.lifetimePurchases} credits (${((user.lifetimePurchases || 0) * 1.99).toFixed(2)})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Upgrade to Pro for $9/month and get unlimited analyses—better value!
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/checkout", { method: "POST" });
                      const data = await response.json();
                      if (data.url) window.location.href = data.url;
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to start checkout",
                        variant: "destructive",
                      });
                    }
                  }}
                  data-testid="button-upgrade-upsell"
                >
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          )}

          {/* Credit Balance Info (for non-Pro users) */}
          {user && !user.isPremium && creditBalance > 0 && (user.lifetimePurchases || 0) < 4 && (
            <div className="mb-4 p-4 bg-[#00D395]/10 border border-[#00D395]/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00D395]/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#00D395]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      You have {creditBalance} purchased credit{creditBalance !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Plus {remaining} free analysis{remaining !== 1 ? 'es' : ''} this month • Credits never expire
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#00D395] text-[#00D395] hover:bg-[#00D395]/10"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/purchase/analysis", {
                        method: "POST",
                        credentials: "include"
                      });
                      const data = await response.json();
                      if (data.url) window.location.href = data.url;
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to start checkout",
                        variant: "destructive",
                      });
                    }
                  }}
                  data-testid="button-buy-more-credits"
                >
                  Buy More
                </Button>
              </div>
            </div>
          )}

          {/* Analysis Input Card */}
          <Card className="p-6 sm:p-8 mb-8 shadow-lg border-border/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-[1fr,auto]">
                <div className="space-y-2">
                  <label htmlFor="symbol" className="text-sm font-semibold text-foreground">
                    Stock Symbols
                  </label>
                  <Input
                    id="symbol"
                    type="text"
                    placeholder="e.g., AAPL, TSLA, NVDA (comma-separated, max 5)"
                    value={symbolInput}
                    onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
                    className="h-14 text-lg font-mono uppercase tracking-wider"
                    data-testid="input-stock-symbol"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter up to 5 symbols separated by commas for comparative analysis
                  </p>
                </div>
                <div className="flex items-end">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={analyzeMutation.isPending || !symbolInput.trim()}
                    className="h-14 px-8 bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-semibold shadow-md"
                    data-testid="button-submit-analysis"
                  >
                    {analyzeMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="context" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Additional Context
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Textarea
                  id="context"
                  placeholder="Add any specific concerns, recent news, or focus areas for the analysis..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="min-h-[100px] resize-none"
                  data-testid="input-context"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="w-4 h-4" />
                  <span>{remainingDebates} this month</span>
                </div>
                {!user?.isPremium && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-[#0052FF] hover:text-[#0052FF]/80"
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/checkout", { method: "POST" });
                        const data = await response.json();
                        if (data.url) {
                          window.location.href = data.url;
                        }
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to start checkout",
                          variant: "destructive",
                        });
                      }
                    }}
                    data-testid="button-upgrade-inline"
                  >
                    Upgrade to Pro
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {/* Loading State */}
          {analyzeMutation.isPending && (
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              {[0, 1, 2].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                    <div className="h-4 bg-muted rounded w-4/6" />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Results */}
          {result && !analyzeMutation.isPending && (
            <>
              {/* Share Actions */}
              {debateId && (
                <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    data-testid="button-copy-link"
                  >
                    {copiedLink ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    {copiedLink ? "Copied!" : "Copy Link"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareTwitter}
                    data-testid="button-share-twitter"
                  >
                    <SiX className="w-4 h-4 mr-2" />
                    Share on X
                  </Button>
                </div>
              )}

              {/* Symbol Tabs (only show if multiple symbols) */}
              {analyzedSymbols.length > 1 ? (
                <Tabs value={activeSymbol} onValueChange={setActiveSymbol} className="w-full">
                  <TabsList className="w-full justify-start mb-6 h-auto flex-wrap gap-1 bg-muted/50 p-1">
                    {analyzedSymbols.map((sym) => (
                      <TabsTrigger 
                        key={sym} 
                        value={sym}
                        className="px-4 py-2 font-mono font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        data-testid={`tab-symbol-${sym}`}
                      >
                        ${sym}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {analyzedSymbols.map((sym) => (
                    <TabsContent key={sym} value={sym} className="mt-0">
                      {result[sym] && <PerspectiveCards data={result[sym]} symbol={sym} />}
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                /* Single symbol - no tabs needed */
                currentResult && <PerspectiveCards data={currentResult} symbol={analyzedSymbols[0]} />
              )}

              {/* Post-Analysis Engagement CTAs */}
              <Card className="mt-8 p-6 bg-gradient-to-br from-muted/30 to-muted/10 border-border/50">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    What's next?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Make your next move with confidence
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setResult(null);
                        setSymbolInput("");
                        setContext("");
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="gap-2"
                      data-testid="button-analyze-another"
                    >
                      <Sparkles className="w-4 h-4" />
                      Analyze Another Stock
                    </Button>
                    {debateId && (
                      <Button
                        variant="outline"
                        onClick={handleShareTwitter}
                        className="gap-2"
                        data-testid="button-share-analysis"
                      >
                        <Share2 className="w-4 h-4" />
                        Share This Analysis
                      </Button>
                    )}
                    {!user?.isPremium && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#0052FF] hover:text-[#0052FF]/80"
                        onClick={async () => {
                          try {
                            const response = await fetch("/api/checkout", { method: "POST" });
                            const data = await response.json();
                            if (data.url) window.location.href = data.url;
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to start checkout",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <Crown className="w-4 h-4 mr-1" />
                        Get Unlimited Analyses
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Empty State */}
          {!result && !analyzeMutation.isPending && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-6">
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Ready to Analyze
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter a stock symbol above to get AI-powered bull, bear, and neutral perspectives.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Paywall Dialog */}
      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Choose How to Continue</DialogTitle>
            <DialogDescription className="text-base">
              You've used all 3 free analyses this month. Select an option below:
            </DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-4 pt-4">
            {/* Pay-Per-Use Option */}
            <div className="p-5 rounded-xl bg-[#00D395]/5 border-2 border-[#00D395] relative">
              <Badge className="absolute -top-3 left-4 bg-[#00D395] text-white hover:bg-[#00D395]">
                Try Once
              </Badge>
              <div className="mb-4 mt-2">
                <div className="text-3xl font-bold text-foreground mb-1">
                  $1.99
                </div>
                <p className="text-sm text-muted-foreground">One-time purchase</p>
              </div>
              <ul className="space-y-2.5 text-sm text-foreground mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00D395] flex-shrink-0" />
                  <span>1 stock analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00D395] flex-shrink-0" />
                  <span>Never expires</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00D395] flex-shrink-0" />
                  <span>Use anytime</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00D395] flex-shrink-0" />
                  <span>No commitment</span>
                </li>
              </ul>
              <Button
                type="button"
                className="w-full h-11 bg-[#00D395] hover:bg-[#00D395]/90 text-white font-semibold"
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
                data-testid="button-buy-credit"
              >
                Buy 1 Analysis
              </Button>
            </div>

            {/* Pro Subscription */}
            <div className="p-5 rounded-xl bg-muted/50 border border-border relative">
              <Badge className="absolute -top-3 left-4 bg-[#0052FF] text-white hover:bg-[#0052FF]">
                Best Value
              </Badge>
              <div className="mb-4 mt-2">
                <div className="text-3xl font-bold text-foreground mb-1">
                  $9<span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">Subscription</p>
              </div>
              <ul className="space-y-2.5 text-sm text-foreground mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00D395] flex-shrink-0" />
                  <span className="font-medium">Unlimited analyses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00D395] flex-shrink-0" />
                  <span>Priority AI responses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00D395] flex-shrink-0" />
                  <span>Full analysis history</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00D395] flex-shrink-0" />
                  <span>Export & share features</span>
                </li>
              </ul>
              <Button
                type="button"
                className="w-full h-11 bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-semibold"
                onClick={async () => {
                  try {
                    const response = await fetch("/api/checkout", { method: "POST" });
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
                data-testid="button-upgrade-modal"
              >
                Upgrade to Pro
              </Button>
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground pt-2">
            Both options include bull, bear, and neutral perspectives
          </p>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
