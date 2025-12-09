import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function PurchaseSuccess() {
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setError("No session ID found");
      setVerifying(false);
      return;
    }

    // Verify the purchase
    fetch(`/api/purchase/verify?session_id=${sessionId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSuccess(true);
          setCredits(data.credits || 1);
          // Invalidate user data to update credit count
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        } else {
          setError("Payment verification failed");
        }
      })
      .catch((err) => {
        console.error("Verification error:", err);
        setError("Failed to verify payment");
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [queryClient]);

  if (verifying) {
    return (
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <CardTitle>Verifying Purchase...</CardTitle>
            <CardDescription>
              Please wait while we confirm your payment
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle>Payment Verification Failed</CardTitle>
            <CardDescription className="text-destructive">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              If you were charged, please contact support with your order details.
              Your payment will be refunded if the issue persists.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => setLocation("/analyze")}>
                Go to Analyze
              </Button>
              <Button variant="outline" onClick={() => setLocation("/")}>
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl">Analysis Credit Added!</CardTitle>
          <CardDescription className="text-lg">
            Your purchase was successful
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-primary/10 p-6 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Credits Added
            </p>
            <p className="text-4xl font-bold text-primary">
              {credits} {credits === 1 ? "Credit" : "Credits"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Credits never expire
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">What's next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Your credit has been added to your account</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Use it anytime to analyze any stock</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Get instant bull, bear, and neutral perspectives</span>
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <Button
              className="w-full"
              size="lg"
              onClick={() => setLocation("/analyze")}
            >
              Analyze a Stock Now
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Want unlimited analyses?{" "}
              <button
                onClick={() => setLocation("/pricing")}
                className="text-primary hover:underline"
              >
                Upgrade to Pro for $9/month
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
