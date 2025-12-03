import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import {
  MessageSquare,
  ArrowRight,
  BarChart3,
  Shield,
  Zap,
  LogIn,
  LogOut,
  User,
  History,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function FeatureItem({ icon: Icon, title, description, testId }: { icon: any; title: string; description: string; testId: string }) {
  return (
    <div className="flex items-start gap-3" data-testid={testId}>
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#0052FF]/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#0052FF]" />
      </div>
      <div>
        <h4 className="font-medium text-foreground" data-testid={`${testId}-title`}>{title}</h4>
        <p className="text-sm text-muted-foreground" data-testid={`${testId}-desc`}>{description}</p>
      </div>
    </div>
  );
}

export default function Landing() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative border-b bg-gradient-to-b from-[#0052FF]/5 to-background">
        {/* Top Navigation */}
        <nav className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#0052FF]" />
            <span className="font-semibold text-foreground">Echo Chamber</span>
          </div>
          
          {authLoading ? (
            <div className="h-10" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link href="/history">
                <Button variant="ghost" size="sm" data-testid="button-history">
                  <History className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">History</span>
                </Button>
              </Link>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Log in
            </Button>
          )}
        </nav>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-tight" data-testid="text-hero-title">
            Break the echo.<br />
            <span className="text-[#0052FF]">See every angle.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
            AI-powered stock analysis that gives you bull, bear, and neutral perspectives on any investment. Make informed decisions by seeing the full picture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/analyze">
              <Button
                size="lg"
                className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white"
                data-testid="button-get-started"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-16 border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureItem
              icon={BarChart3}
              title="Multi-Perspective Analysis"
              description="Get bull, bear, and neutral viewpoints powered by Claude AI"
              testId="feature-multi-perspective"
            />
            <FeatureItem
              icon={Zap}
              title="Instant Insights"
              description="Analyze any stock symbol in seconds with detailed key points"
              testId="feature-instant-insights"
            />
            <FeatureItem
              icon={Shield}
              title="Shareable Debates"
              description="Share your analysis on social media or copy a public link"
              testId="feature-shareable"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4" data-testid="text-pricing-title">
            Simple Pricing
          </h2>
          <p className="text-muted-foreground mb-8">
            Start for free, upgrade when you need more.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free Tier */}
            <div className="rounded-xl border bg-card p-6 text-left">
              <h3 className="text-lg font-semibold text-foreground mb-2">Free</h3>
              <p className="text-3xl font-bold text-foreground mb-4">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>3 debates per month</li>
                <li>All three perspectives</li>
                <li>Shareable links</li>
              </ul>
              <Link href="/analyze">
                <Button variant="outline" className="w-full" data-testid="button-start-free">
                  Start Free
                </Button>
              </Link>
            </div>
            
            {/* Pro Tier */}
            <div className="rounded-xl border-2 border-[#0052FF] bg-card p-6 text-left relative">
              <span className="absolute -top-3 left-4 bg-[#0052FF] text-white text-xs px-2 py-1 rounded font-medium">
                Popular
              </span>
              <h3 className="text-lg font-semibold text-foreground mb-2">Pro</h3>
              <p className="text-3xl font-bold text-foreground mb-4">$9<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>Unlimited debates</li>
                <li>All three perspectives</li>
                <li>Shareable links</li>
                <li>Debate history</li>
              </ul>
              <Link href="/analyze">
                <Button className="w-full bg-[#0052FF] hover:bg-[#0052FF]/90 text-white" data-testid="button-start-pro">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-[#0052FF]" />
            <span className="font-semibold text-foreground">Echo Chamber</span>
          </div>
          <p className="text-muted-foreground/60 text-xs" data-testid="text-disclaimer">
            Not financial advice. AI-generated perspectives for educational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
