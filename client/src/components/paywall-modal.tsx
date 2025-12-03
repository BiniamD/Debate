import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Zap, Check } from "lucide-react";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => Promise<void>;
}

export function PaywallModal({ open, onClose, onUpgrade }: PaywallModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-[#0052FF]" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            You've used all 3 free debates this month. Upgrade to Pro for unlimited access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <div className="text-4xl font-semibold text-foreground mb-1">$9</div>
            <div className="text-muted-foreground">/month</div>
          </div>

          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-foreground">
              <Check className="w-5 h-5 text-[#00D395] flex-shrink-0" />
              <span>Unlimited debates per month</span>
            </li>
            <li className="flex items-center gap-3 text-foreground">
              <Check className="w-5 h-5 text-[#00D395] flex-shrink-0" />
              <span>Access to debate history</span>
            </li>
            <li className="flex items-center gap-3 text-foreground">
              <Check className="w-5 h-5 text-[#00D395] flex-shrink-0" />
              <span>Priority AI response times</span>
            </li>
            <li className="flex items-center gap-3 text-foreground">
              <Check className="w-5 h-5 text-[#00D395] flex-shrink-0" />
              <span>Cancel anytime</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={onUpgrade}
            className="w-full bg-[#0052FF] hover:bg-[#0052FF]/90 text-white"
            size="lg"
            data-testid="button-upgrade"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Upgrade to Pro
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full"
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
  onUpgrade: () => Promise<void>;
}

export function DebateCounter({ remaining, isPro, onUpgrade }: DebateCounterProps) {
  if (isPro) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#0052FF] font-medium" data-testid="text-pro-badge">
        <Crown className="w-4 h-4" />
        Pro Member
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div 
        className={`text-sm ${remaining === 0 ? "text-[#FF5F57]" : "text-muted-foreground"}`}
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
          className="border-[#0052FF]/50 text-[#0052FF] hover:bg-[#0052FF]/10"
          data-testid="button-upgrade-inline"
        >
          <Crown className="w-4 h-4 mr-1" />
          Upgrade
        </Button>
      )}
    </div>
  );
}
