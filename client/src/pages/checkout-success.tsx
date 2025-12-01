import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useDebateLimit } from "@/hooks/use-debate-limit";
import { MessageSquare, CheckCircle, Loader2, Crown } from "lucide-react";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const { upgradeSuccess } = useDebateLimit();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setStatus("error");
      return;
    }

    fetch(`/api/checkout/verify?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          upgradeSuccess();
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [upgradeSuccess]);

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center py-8 px-4">
      <div className="glass rounded-md p-8 max-w-md text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-6 text-primary animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Verifying your subscription...
            </h2>
            <p className="text-slate-300">Please wait while we confirm your payment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Welcome to Pro!
            </h2>
            <div className="flex items-center justify-center gap-2 text-yellow-400 mb-4">
              <Crown className="w-5 h-5" />
              <span className="font-semibold">Pro Member</span>
            </div>
            <p className="text-slate-300 mb-6">
              You now have unlimited debates. Start exploring every angle of your investments!
            </p>
            <Link href="/">
              <Button size="lg" className="w-full" data-testid="button-start-debating">
                <MessageSquare className="w-5 h-5 mr-2" />
                Start Debating
              </Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Something went wrong
            </h2>
            <p className="text-slate-300 mb-6">
              We couldn't verify your subscription. Please contact support if you were charged.
            </p>
            <Link href="/">
              <Button variant="outline" className="w-full border-white/20 text-white">
                Return Home
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
