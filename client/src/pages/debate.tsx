import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import type { DebateResponse, Perspective, MultiDebateResponse } from "@shared/schema";
import {
  MessageSquare,
  Loader2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowLeft,
  Calendar,
  Copy,
  Check,
} from "lucide-react";
import { SiX } from "react-icons/si";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface DebateWithMeta {
  id: string;
  symbol: string;
  symbols: string[];
  context?: string;
  createdAt: string;
  result: MultiDebateResponse;
}

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

export default function DebatePage() {
  const [, params] = useRoute("/debate/:id");
  const debateId = params?.id;
  const { toast } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeSymbol, setActiveSymbol] = useState<string>("");

  const { data: debate, isLoading, error } = useQuery<DebateWithMeta>({
    queryKey: ["/api/debate", debateId],
    enabled: !!debateId,
  });

  // Set active symbol when debate loads
  if (debate && !activeSymbol && debate.symbols?.length > 0) {
    setActiveSymbol(debate.symbols[0]);
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast({
      title: "Link Copied",
      description: "Share link copied to clipboard.",
    });
  };

  const handleTwitterShare = () => {
    if (!debate) return;
    
    const shareUrl = window.location.href;
    const symbolText = debate.symbols.length > 1 
      ? debate.symbols.map(s => `$${s}`).join(', ')
      : `$${debate.symbols[0]}`;
    const text = `Check out this Echo Chamber analysis on ${symbolText} - bull, bear, and neutral perspectives in one place!`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#0052FF]" />
          <p className="text-muted-foreground">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !debate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="rounded-xl border bg-card p-8 max-w-md text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Analysis Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This analysis doesn't exist or has been removed.
          </p>
          <Link href="/analyze">
            <Button className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Create Your Own
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const symbols = debate.symbols || [debate.symbol];
  const isMultiSymbol = symbols.length > 1;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <Link href="/">
            <div className="flex items-center justify-center gap-3 mb-4 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-[#0052FF] flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground" data-testid="text-app-title">
                Echo Chamber
              </h1>
            </div>
          </Link>
          <p className="text-lg text-muted-foreground">
            Break the echo. See every angle.
          </p>
        </header>

        {/* Analysis Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Analysis for{" "}
              <span className="text-[#0052FF] font-mono" data-testid="text-analyzed-symbol">
                {symbols.map(s => `$${s}`).join(', ')}
              </span>
            </h2>
            {debate.createdAt && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(debate.createdAt), "MMMM d, yyyy 'at' h:mm a")}
              </div>
            )}
            {debate.context && (
              <p className="text-muted-foreground mt-2 text-sm italic">
                Context: "{debate.context}"
              </p>
            )}
          </div>
          
          <div className="flex gap-3">
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
              onClick={handleTwitterShare}
              data-testid="button-share-twitter"
            >
              <SiX className="w-4 h-4 mr-2" />
              Share on X
            </Button>
            <Link href="/analyze">
              <Button className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white" size="sm" data-testid="button-create-new">
                Create Your Own
              </Button>
            </Link>
          </div>
        </div>

        {/* Perspective Cards with Tabs for Multi-Symbol */}
        {isMultiSymbol ? (
          <Tabs value={activeSymbol} onValueChange={setActiveSymbol} className="w-full">
            <TabsList className="w-full justify-start mb-6 h-auto flex-wrap gap-1 bg-muted/50 p-1">
              {symbols.map((sym) => (
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
            
            {symbols.map((sym) => (
              <TabsContent key={sym} value={sym} className="mt-0">
                {debate.result[sym] && <PerspectiveCards data={debate.result[sym]} symbol={sym} />}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          debate.result[symbols[0]] && <PerspectiveCards data={debate.result[symbols[0]]} symbol={symbols[0]} />
        )}

        {/* CTA */}
        <div className="mt-12 text-center rounded-xl border bg-card p-8">
          <h3 className="text-2xl font-semibold text-foreground mb-4">
            Want AI perspectives on your stocks?
          </h3>
          <p className="text-muted-foreground mb-6">
            Get bull, bear, and neutral analysis on any stock in seconds.
          </p>
          <Link href="/analyze">
            <Button size="lg" className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white" data-testid="button-cta">
              Try Echo Chamber Free
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center space-y-3">
          <p className="text-muted-foreground text-sm">
            Free: 3 analyses/month | Pro ($9/mo): Unlimited analyses
          </p>
          <p className="text-muted-foreground/60 text-xs">
            Not financial advice. AI-generated perspectives for educational purposes only.
          </p>
        </footer>
      </div>
    </div>
  );
}
