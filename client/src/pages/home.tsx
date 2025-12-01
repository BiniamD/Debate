import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { DebateResponse, Perspective } from "@shared/schema";
import {
  MessageSquare,
  Sparkles,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Share2,
  CheckCircle,
} from "lucide-react";

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
      borderColor: "border-green-500/50",
      bgColor: "bg-green-500/5",
      iconColor: "text-green-400",
      titleColor: "text-green-400",
    },
    bear: {
      icon: TrendingDown,
      borderColor: "border-red-500/50",
      bgColor: "bg-red-500/5",
      iconColor: "text-red-400",
      titleColor: "text-red-400",
    },
    neutral: {
      icon: Minus,
      borderColor: "border-blue-500/50",
      bgColor: "bg-blue-500/5",
      iconColor: "text-blue-400",
      titleColor: "text-blue-400",
    },
  };

  const { icon: Icon, borderColor, bgColor, iconColor, titleColor } = config[type];

  return (
    <div
      className={`glass rounded-md p-6 ${borderColor} ${bgColor} ${animationClass} transition-transform duration-300 hover:scale-[1.02]`}
      data-testid={`card-perspective-${type}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`w-6 h-6 ${iconColor}`} />
        <h3 className={`text-xl font-semibold ${titleColor}`}>{perspective.title}</h3>
      </div>

      <div className="space-y-4 mb-6">
        {perspective.argument.split("\n\n").map((paragraph, idx) => (
          <p key={idx} className="text-slate-300 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
          Key Points
        </h4>
        <ul className="space-y-2">
          {perspective.keyPoints.map((point, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-slate-300"
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
  const [debate, setDebate] = useState<DebateResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const debateMutation = useMutation({
    mutationFn: async (data: { symbol: string; context?: string }) => {
      const response = await apiRequest("POST", "/api/debate", data);
      const json = await response.json();
      return json as DebateResponse;
    },
    onSuccess: (data) => {
      setDebate(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error generating debate",
        description: error.message || "Failed to generate debate. Please try again.",
        variant: "destructive",
      });
    },
  });

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
    setDebate(null);
    debateMutation.mutate({
      symbol: symbol.toUpperCase().trim(),
      context: context.trim() || undefined,
    });
  };

  const handleShare = async () => {
    if (!debate) return;

    const shareText = `Debate on ${symbol.toUpperCase()}:\n\nBull: ${debate.bull.keyPoints[0]}\n\nBear: ${debate.bear.keyPoints[0]}\n\nNeutral: ${debate.neutral.keyPoints[0]}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Debate on ${symbol.toUpperCase()}`,
          text: shareText,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          await copyToClipboard(shareText);
        }
      }
    } else {
      await copyToClipboard(shareText);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Debate summary copied successfully!",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="gradient-bg min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageSquare className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-white" data-testid="text-app-title">
              Debate
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-slate-300 mb-2" data-testid="text-tagline">
            AI that argues with itself about your investments
          </p>
          <p className="text-slate-400" data-testid="text-subtitle">
            Get bull, bear, and neutral perspectives on any stock
          </p>
        </header>

        {/* Input Section */}
        <div className="glass rounded-md p-6 md:p-8 mb-8 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="symbol"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Stock Symbol
              </label>
              <Input
                id="symbol"
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="AAPL, TSLA, NVDA..."
                className="bg-white/5 border-white/20 text-white placeholder:text-slate-500 uppercase"
                disabled={debateMutation.isPending}
                data-testid="input-symbol"
              />
            </div>

            <div>
              <label
                htmlFor="context"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Context (Optional)
              </label>
              <Textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="E.g., 'Considering buying for long-term hold'..."
                rows={3}
                className="bg-white/5 border-white/20 text-white placeholder:text-slate-500 resize-none"
                disabled={debateMutation.isPending}
                data-testid="input-context"
              />
            </div>

            <Button
              type="submit"
              disabled={debateMutation.isPending || !symbol.trim()}
              className="w-full"
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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">
                Analysis for{" "}
                <span className="text-primary" data-testid="text-analyzed-symbol">
                  {symbol.toUpperCase()}
                </span>
              </h2>
              <Button
                variant="outline"
                onClick={handleShare}
                className="border-white/20 text-white"
                data-testid="button-share"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </>
                )}
              </Button>
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
          <p className="text-slate-400 text-sm" data-testid="text-pricing">
            Free: 3 debates/month | Pro ($9/mo): Unlimited debates
          </p>
          <p className="text-slate-500 text-xs" data-testid="text-disclaimer">
            Not financial advice. AI-generated perspectives for educational purposes only.
          </p>
        </footer>
      </div>
    </div>
  );
}
