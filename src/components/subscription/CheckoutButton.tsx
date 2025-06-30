import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { BillingInterval } from "@/integrations/stripe/types";
import { TRIAL_DAYS } from "@/integrations/stripe/plans";

interface CheckoutButtonProps {
  priceId: string;
  billingInterval: BillingInterval;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function CheckoutButton({
  priceId,
  billingInterval,
  disabled,
  className,
  children,
}: CheckoutButtonProps) {
  const { createCheckoutSession, isLoading } = useStripeCheckout();

  const handleCheckout = async () => {
    await createCheckoutSession({
      priceId,
      userId: "", // Will be populated in the hook
      trialDays: TRIAL_DAYS,
    });
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className={className}
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
