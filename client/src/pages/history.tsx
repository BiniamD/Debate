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
        className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200/50 dark:border-amber-700/30 hover:scale-[1.01] hover:shadow-lg transition-all cursor-pointer group"
        data-testid={`card-debate-${debate.id}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-amber-900 dark:text-amber-100" data-testid={`text-symbol-${debate.id}`}>
              ${debate.symbol}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-sm">
            <Calendar className="w-3.5 h-3.5" />
            <span data-testid={`text-date-${debate.id}`}>
              {format(createdAt, "MMM d, yyyy")}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-md p-2 text-center">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
            <span className="text-xs text-emerald-600 dark:text-emerald-400">Bull</span>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-md p-2 text-center">
            <TrendingDown className="w-4 h-4 text-amber-700 dark:text-amber-400 mx-auto mb-1" />
            <span className="text-xs text-amber-700 dark:text-amber-400">Bear</span>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-md p-2 text-center">
            <Minus className="w-4 h-4 text-yellow-700 dark:text-yellow-400 mx-auto mb-1" />
            <span className="text-xs text-yellow-700 dark:text-yellow-400">Neutral</span>
          </div>
        </div>
        
        <div className="mt-3 text-right">
          <span className="text-xs text-amber-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
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
        // Return empty array on auth errors
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
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-amber-950 dark:via-stone-950 dark:to-amber-950">
      <div className="max-w-4xl mx-auto">
        <nav className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-amber-800 dark:text-amber-200" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span className="text-amber-900 dark:text-amber-100 font-semibold">Echo Chamber</span>
          </div>
        </nav>

        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-2" data-testid="text-history-title">
            Your Debate History
          </h1>
          <p className="text-amber-600 dark:text-amber-400">
            Your last 30 AI-generated stock analyses
          </p>
        </header>

        {!isAuthenticated && !authLoading ? (
          <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-xl p-8 text-center border border-amber-200/50 dark:border-amber-700/30">
            <LogIn className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-2">Sign in to view history</h2>
            <p className="text-amber-600 dark:text-amber-400 mb-6">
              Log in to access your debate history and save your analyses.
            </p>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login-history"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Log in
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
          </div>
        ) : debates && debates.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2" data-testid="grid-debates">
            {debates.map((debate) => (
              <DebateCard key={debate.id} debate={debate} />
            ))}
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-xl p-8 text-center border border-amber-200/50 dark:border-amber-700/30">
            <MessageSquare className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-2">No debates yet</h2>
            <p className="text-amber-600 dark:text-amber-400 mb-6">
              Generate your first debate to see it here.
            </p>
            <Link href="/">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" data-testid="button-generate-first">
                Generate a Debate
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
