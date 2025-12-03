import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import type { Debate } from "@shared/schema";
import {
  MessageSquare,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Loader2,
  LogIn,
} from "lucide-react";
import { format } from "date-fns";

function DebateCard({ debate }: { debate: Debate }) {
  const createdAt = debate.createdAt ? new Date(debate.createdAt) : new Date();
  
  return (
    <Link href={`/debate/${debate.id}`}>
      <div 
        className="rounded-xl border bg-card p-4 hover:border-[#0052FF]/40 transition-colors cursor-pointer group"
        data-testid={`card-debate-${debate.id}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-foreground font-mono" data-testid={`text-symbol-${debate.id}`}>
              ${debate.symbol}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Calendar className="w-3.5 h-3.5" />
            <span data-testid={`text-date-${debate.id}`}>
              {format(createdAt, "MMM d, yyyy")}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#00D395]/10 rounded-lg p-2 text-center">
            <TrendingUp className="w-4 h-4 text-[#00D395] mx-auto mb-1" />
            <span className="text-xs text-[#00D395]">Bull</span>
          </div>
          <div className="bg-[#FF5F57]/10 rounded-lg p-2 text-center">
            <TrendingDown className="w-4 h-4 text-[#FF5F57] mx-auto mb-1" />
            <span className="text-xs text-[#FF5F57]">Bear</span>
          </div>
          <div className="bg-[#0052FF]/10 rounded-lg p-2 text-center">
            <Minus className="w-4 h-4 text-[#0052FF] mx-auto mb-1" />
            <span className="text-xs text-[#0052FF]">Neutral</span>
          </div>
        </div>
        
        <div className="mt-3 text-right">
          <span className="text-xs text-muted-foreground group-hover:text-[#0052FF] transition-colors">
            View debate →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function History() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const { data: debates, isLoading: debatesLoading, error } = useQuery<Debate[]>({
    queryKey: ["/api/user/debates"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/user/debates");
        return response.json();
      } catch (e) {
        if (e instanceof Error && e.message.includes("401")) {
          return [];
        }
        throw e;
      }
    },
    enabled: isAuthenticated,
    retry: 1,
  });

  const isLoading = authLoading || debatesLoading;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <nav className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#0052FF]" />
            <span className="text-foreground font-semibold">Echo Chamber</span>
          </div>
        </nav>

        <header className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-history-title">
            Your Debate History
          </h1>
          <p className="text-muted-foreground">
            Your last 30 AI-generated stock analyses
          </p>
        </header>

        {!isAuthenticated && !authLoading ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <LogIn className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Sign in to view history</h2>
            <p className="text-muted-foreground mb-6">
              Log in to access your debate history and save your analyses.
            </p>
            <Button 
              className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login-history"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Log in
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#0052FF]" />
          </div>
        ) : debates && debates.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2" data-testid="grid-debates">
            {debates.map((debate) => (
              <DebateCard key={debate.id} debate={debate} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-8 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No debates yet</h2>
            <p className="text-muted-foreground mb-6">
              Generate your first debate to see it here.
            </p>
            <Link href="/analyze">
              <Button className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white" data-testid="button-generate-first">
                Generate a Debate
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
