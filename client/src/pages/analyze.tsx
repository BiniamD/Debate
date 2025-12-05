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
  Info
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
    onSuccess: (data) => {
      setResult(data.result);
      setAnalyzedSymbols(data.symbols);
      setActiveSymbol(data.symbols[0]);
      setDebateId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/user/debates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
  const remainingDebates = user?.isPremium ? "Unlimited" : `${remaining} remaining`;

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
                    onClick={() => navigate("/checkout/success")}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Monthly Limit Reached</DialogTitle>
            <DialogDescription className="text-base">
              You've used all 3 free analyses this month. Upgrade to Pro for unlimited access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Pro Plan</span>
                <span className="text-2xl font-bold">$9<span className="text-sm font-normal text-muted-foreground">/month</span></span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00D395]" />
                  Unlimited analyses
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00D395]" />
                  Priority AI responses
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00D395]" />
                  Export & share features
                </li>
              </ul>
            </div>
            <Button
              className="w-full h-12 bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-semibold"
              onClick={() => {
                setShowPaywall(false);
                navigate("/checkout/success");
              }}
              data-testid="button-upgrade-modal"
            >
              Upgrade to Pro
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
