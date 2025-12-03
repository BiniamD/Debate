import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { DebateResponse, Perspective } from "@shared/schema";
import {
  MessageSquare,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { SiX } from "react-icons/si";
import { format } from "date-fns";

interface DebateWithMeta extends DebateResponse {
  id: string;
  symbol: string;
  context?: string;
  createdAt: string;
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

export default function DebatePage() {
  const [, params] = useRoute("/debate/:id");
  const debateId = params?.id;

  const { data: debate, isLoading, error } = useQuery<DebateWithMeta>({
    queryKey: ["/api/debate", debateId],
    enabled: !!debateId,
  });

  const handleTwitterShare = () => {
    if (!debate) return;
    
    const shareUrl = window.location.href;
    const text = `Check out this Echo Chamber analysis on $${debate.symbol}:\n\nBull: ${debate.bull.keyPoints[0]}\nBear: ${debate.bear.keyPoints[0]}\n\n`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#0052FF]" />
          <p className="text-muted-foreground">Loading debate...</p>
        </div>
      </div>
    );
  }

  if (error || !debate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="rounded-xl border bg-card p-8 max-w-md text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Debate Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This debate doesn't exist or has been removed.
          </p>
          <Link href="/">
            <Button className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Create Your Own
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <Link href="/">
            <div className="flex items-center justify-center gap-3 mb-4 cursor-pointer group">
              <MessageSquare className="w-10 h-10 text-[#0052FF] group-hover:scale-105 transition-transform" />
              <h1 className="text-4xl md:text-5xl font-semibold text-foreground" data-testid="text-app-title">
                Echo Chamber
              </h1>
            </div>
          </Link>
          <p className="text-xl md:text-2xl text-foreground mb-2">
            Break the echo. See every angle.
          </p>
        </header>

        {/* Analysis Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Analysis for{" "}
              <span className="text-[#0052FF] font-mono" data-testid="text-analyzed-symbol">
                ${debate.symbol}
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
              onClick={handleTwitterShare}
              data-testid="button-share-twitter"
            >
              <SiX className="w-4 h-4 mr-2" />
              Share on X
            </Button>
            <Link href="/">
              <Button className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white" data-testid="button-create-new">
                Create Your Own
              </Button>
            </Link>
          </div>
        </div>

        {/* Perspective Cards */}
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

        {/* CTA */}
        <div className="mt-12 text-center rounded-xl border bg-card p-8">
          <h3 className="text-2xl font-semibold text-foreground mb-4">
            Want AI perspectives on your stocks?
          </h3>
          <p className="text-muted-foreground mb-6">
            Get bull, bear, and neutral analysis on any stock in seconds.
          </p>
          <Link href="/">
            <Button size="lg" className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white" data-testid="button-cta">
              Try Echo Chamber Free
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center space-y-3">
          <p className="text-muted-foreground text-sm">
            Free: 3 debates/month | Pro ($9/mo): Unlimited debates
          </p>
          <p className="text-muted-foreground/60 text-xs">
            Not financial advice. AI-generated perspectives for educational purposes only.
          </p>
        </footer>
      </div>
    </div>
  );
}
