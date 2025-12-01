import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Zap, History, Check } from "lucide-react";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export function PaywallModal({ open, onClose, onUpgrade }: PaywallModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Crown className="w-6 h-6 text-yellow-400" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            You've used all 3 free debates this month. Upgrade to Pro for unlimited access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-1">$9</div>
            <div className="text-slate-400">/month</div>
          </div>

          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-slate-200">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Unlimited debates per month</span>
            </li>
            <li className="flex items-center gap-3 text-slate-200">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Access to debate history</span>
            </li>
            <li className="flex items-center gap-3 text-slate-200">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Priority AI response times</span>
            </li>
            <li className="flex items-center gap-3 text-slate-200">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Cancel anytime</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={onUpgrade}
            className="w-full"
            size="lg"
            data-testid="button-upgrade"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Upgrade to Pro
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full text-slate-400"
            data-testid="button-close-paywall"
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DebateCounterProps {
  remaining: number;
  isPro: boolean;
  onUpgrade: () => void;
}

export function DebateCounter({ remaining, isPro, onUpgrade }: DebateCounterProps) {
  if (isPro) {
    return (
      <div className="flex items-center gap-2 text-sm text-yellow-400" data-testid="text-pro-badge">
        <Crown className="w-4 h-4" />
        Pro Member
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div 
        className={`text-sm ${remaining === 0 ? "text-red-400" : "text-slate-400"}`}
        data-testid="text-debates-remaining"
      >
        <Zap className="w-4 h-4 inline mr-1" />
        {remaining} debate{remaining !== 1 ? "s" : ""} remaining
      </div>
      {remaining <= 1 && !isPro && (
        <Button
          variant="outline"
          size="sm"
          onClick={onUpgrade}
          className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
          data-testid="button-upgrade-inline"
        >
          <Crown className="w-4 h-4 mr-1" />
          Upgrade
        </Button>
      )}
    </div>
  );
}
