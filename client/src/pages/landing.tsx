import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import {
  MessageSquare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Shield,
  Zap,
  LogIn,
  LogOut,
  History,
  Sparkles,
  Check,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Landing() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0052FF]/8 via-background to-[#00D395]/5" />
        
        {/* Top Navigation */}
        <nav className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0052FF] flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">Echo Chamber</span>
          </div>
          
          {authLoading ? (
            <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link href="/history">
                <Button variant="ghost" size="sm" className="gap-2" data-testid="button-history">
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">History</span>
                </Button>
              </Link>
              <Link href="/analyze">
                <Button size="sm" className="gap-2 bg-[#0052FF] hover:bg-[#0052FF]/90 text-white" data-testid="button-analyze">
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login"
            >
              <LogIn className="h-4 w-4" />
              Log in
            </Button>
          )}
        </nav>

        {/* Hero Content */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pt-24 md:pb-32 text-center">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm font-medium">
            AI-Powered Stock Analysis
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight" data-testid="text-hero-title">
            Break the echo.
            <br />
            <span className="bg-gradient-to-r from-[#0052FF] to-[#00D395] bg-clip-text text-transparent">
              See every angle.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-subtitle">
            Get bull, bear, and neutral perspectives on any stock in seconds. Make informed investment decisions by understanding all sides of the story.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/analyze">
              <Button
                size="lg"
                className="h-14 px-8 text-base bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-semibold shadow-lg shadow-[#0052FF]/20"
                data-testid="button-get-started"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Analyzing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-base font-medium"
              onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-learn-more"
            >
              See How It Works
            </Button>
          </div>

          {/* Mini Preview */}
          <div className="mt-16 flex justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#00D395]/10 text-[#00D395]">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Bull Case</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF5F57]/10 text-[#FF5F57]">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm font-medium">Bear Case</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0052FF]/10 text-[#0052FF]">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Neutral View</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 bg-muted/30 border-y border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Echo Chamber?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stop relying on one-sided analysis. Get the complete picture before making your next investment.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 bg-card shadow-md border-border/50" data-testid="feature-multi-perspective">
              <div className="w-12 h-12 rounded-xl bg-[#0052FF]/10 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6 text-[#0052FF]" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Multi-Perspective Analysis</h3>
              <p className="text-muted-foreground">
                Get bull, bear, and neutral viewpoints powered by Claude AI. No more one-sided research.
              </p>
            </Card>

            <Card className="p-6 bg-card shadow-md border-border/50" data-testid="feature-instant-insights">
              <div className="w-12 h-12 rounded-xl bg-[#00D395]/10 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6 text-[#00D395]" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Instant Insights</h3>
              <p className="text-muted-foreground">
                Analyze any stock symbol in seconds. Get detailed key points for each perspective.
              </p>
            </Card>

            <Card className="p-6 bg-card shadow-md border-border/50" data-testid="feature-shareable">
              <div className="w-12 h-12 rounded-xl bg-[#FF5F57]/10 flex items-center justify-center mb-5">
                <Shield className="w-6 h-6 text-[#FF5F57]" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Share & Discuss</h3>
              <p className="text-muted-foreground">
                Share your analysis on social media or copy a public link. Start better conversations.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-pricing-title">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free. Upgrade when you need unlimited access.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Tier */}
            <Card className="p-8 bg-card shadow-md border-border/50">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-1">Free</h3>
                <p className="text-muted-foreground text-sm">Perfect for trying it out</p>
              </div>
              <p className="text-4xl font-bold text-foreground mb-6">
                $0
                <span className="text-base font-normal text-muted-foreground">/month</span>
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-[#00D395] flex-shrink-0" />
                  <span>3 analyses per month</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-[#00D395] flex-shrink-0" />
                  <span>Bull, bear & neutral views</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-[#00D395] flex-shrink-0" />
                  <span>Shareable links</span>
                </li>
              </ul>
              <Link href="/analyze">
                <Button variant="outline" className="w-full h-12 font-medium" data-testid="button-start-free">
                  Get Started Free
                </Button>
              </Link>
            </Card>
            
            {/* Pro Tier */}
            <Card className="p-8 bg-card shadow-lg border-2 border-[#0052FF] relative">
              <Badge className="absolute -top-3 right-6 bg-[#0052FF] text-white hover:bg-[#0052FF]">
                Most Popular
              </Badge>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-1">Pro</h3>
                <p className="text-muted-foreground text-sm">For serious investors</p>
              </div>
              <p className="text-4xl font-bold text-foreground mb-6">
                $9
                <span className="text-base font-normal text-muted-foreground">/month</span>
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-[#00D395] flex-shrink-0" />
                  <span className="font-medium">Unlimited analyses</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-[#00D395] flex-shrink-0" />
                  <span>Bull, bear & neutral views</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-[#00D395] flex-shrink-0" />
                  <span>Shareable links</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-[#00D395] flex-shrink-0" />
                  <span>Full analysis history</span>
                </li>
              </ul>
              <Link href="/analyze">
                <Button className="w-full h-12 bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-medium" data-testid="button-start-pro">
                  Upgrade to Pro
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border/50 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0052FF] flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">Echo Chamber</span>
            </div>
            <p className="text-sm text-muted-foreground text-center" data-testid="text-disclaimer">
              Not financial advice. AI-generated perspectives for educational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
