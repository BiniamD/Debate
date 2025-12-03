import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/app-layout";
import type { User, Debate } from "@shared/schema";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Clock,
  ArrowRight,
  History as HistoryIcon,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";

export default function History() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data: debates, isLoading } = useQuery<Debate[]>({
    queryKey: ["/api/user/debates"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-[calc(100vh-72px)] bg-background flex items-center justify-center">
          <Card className="p-8 max-w-md text-center shadow-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-6">
              <HistoryIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Sign In to View History
            </h2>
            <p className="text-muted-foreground mb-6">
              Your saved analyses will appear here after you sign in.
            </p>
            <Button
              asChild
              className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white"
              data-testid="button-login-history"
            >
              <a href="/api/login">Sign In</a>
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-72px)] bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Analysis History
              </h1>
              <p className="text-lg text-muted-foreground">
                {debates?.length || 0} saved {debates?.length === 1 ? 'analysis' : 'analyses'}
              </p>
            </div>
            <Button
              asChild
              className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white"
              data-testid="button-new-analysis"
            >
              <Link href="/analyze">
                <Sparkles className="w-4 h-4 mr-2" />
                New Analysis
              </Link>
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-8 bg-muted rounded w-24 mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!debates || debates.length === 0) && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted mb-6">
                <HistoryIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                No Analyses Yet
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Start analyzing stocks to build your history. Each analysis is saved automatically.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white"
                data-testid="button-start-analyzing"
              >
                <Link href="/analyze">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Analyzing
                </Link>
              </Button>
            </div>
          )}

          {/* Debates Grid */}
          {!isLoading && debates && debates.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {debates.map((debate) => (
                <Link key={debate.id} href={`/debate/${debate.id}`}>
                  <Card 
                    className="p-6 h-full hover:shadow-lg transition-all duration-200 cursor-pointer group border-border/50"
                    data-testid={`card-debate-${debate.id}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <Badge 
                        variant="outline" 
                        className="text-lg font-mono font-semibold px-3 py-1"
                      >
                        ${debate.symbol}
                      </Badge>
                      <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Mini Perspective Summary */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-[#00D395]" />
                        <span className="text-muted-foreground truncate">
                          {debate.result?.bull?.keyPoints?.[0] || "Bull case analysis"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingDown className="w-4 h-4 text-[#FF5F57]" />
                        <span className="text-muted-foreground truncate">
                          {debate.result?.bear?.keyPoints?.[0] || "Bear case analysis"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <BarChart3 className="w-4 h-4 text-[#0052FF]" />
                        <span className="text-muted-foreground truncate">
                          {debate.result?.neutral?.keyPoints?.[0] || "Neutral analysis"}
                        </span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border/50">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(debate.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
