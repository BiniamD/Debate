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
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-slate-300">Loading debate...</p>
        </div>
      </div>
    );
  }

  if (error || !debate) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="glass rounded-md p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Debate Not Found</h2>
          <p className="text-slate-300 mb-6">
            This debate doesn't exist or has been removed.
          </p>
          <Link href="/">
            <Button data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Create Your Own
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-bg min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <Link href="/">
            <div className="flex items-center justify-center gap-3 mb-4 cursor-pointer group">
              <MessageSquare className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
              <h1 className="text-4xl md:text-5xl font-bold text-white" data-testid="text-app-title">
                Echo Chamber
              </h1>
            </div>
          </Link>
          <p className="text-xl md:text-2xl text-slate-300 mb-2">
            Break the echo. See every angle.
          </p>
        </header>

        {/* Analysis Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Analysis for{" "}
              <span className="text-primary" data-testid="text-analyzed-symbol">
                ${debate.symbol}
              </span>
            </h2>
            {debate.createdAt && (
              <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(debate.createdAt), "MMMM d, yyyy 'at' h:mm a")}
              </div>
            )}
            {debate.context && (
              <p className="text-slate-400 mt-2 text-sm italic">
                Context: "{debate.context}"
              </p>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleTwitterShare}
              className="border-white/20 text-white"
              data-testid="button-share-twitter"
            >
              <SiX className="w-4 h-4 mr-2" />
              Share on X
            </Button>
            <Link href="/">
              <Button data-testid="button-create-new">
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
        <div className="mt-12 text-center glass rounded-md p-8">
          <h3 className="text-2xl font-semibold text-white mb-4">
            Want AI perspectives on your stocks?
          </h3>
          <p className="text-slate-300 mb-6">
            Get bull, bear, and neutral analysis on any stock in seconds.
          </p>
          <Link href="/">
            <Button size="lg" data-testid="button-cta">
              Try Echo Chamber Free
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center space-y-3">
          <p className="text-slate-400 text-sm">
            Free: 3 debates/month | Pro ($9/mo): Unlimited debates
          </p>
          <p className="text-slate-500 text-xs">
            Not financial advice. AI-generated perspectives for educational purposes only.
          </p>
        </footer>
      </div>
    </div>
  );
}
