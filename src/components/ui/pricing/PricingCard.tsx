import React, { useState } from "react";
import { MoveRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { SUBSCRIPTION_PLANS, TRIAL_DAYS } from "@/integrations/stripe/plans";

interface PricingCardProps {
  title: string;
  description: string;
  monthlyPrice: string | JSX.Element;
  annualPrice: string | JSX.Element;
  savings?: JSX.Element | null;
  isContact?: boolean;
}

export function PricingCard({
  title,
  description,
  monthlyPrice,
  annualPrice,
  savings,
  isContact = false,
}: PricingCardProps) {
  const navigate = useNavigate();
  const { createCheckoutSession, isLoading } = useStripeCheckout();
  const [billingInterval, setBillingInterval] = useState<
    "monthly" | "annually"
  >("monthly");

  const agentProPlan = SUBSCRIPTION_PLANS.find(
    (plan) => plan.id === "agent_pro"
  );
  const isAgentPro = title === "Agent Pro";
  const isFree = title === "Agent";

  const handleGetStarted = async () => {
    if (isFree) {
      navigate("/auth");
      return;
    }

    if (isAgentPro && agentProPlan) {
      const priceId =
        billingInterval === "monthly"
          ? agentProPlan.stripePriceIdMonthly
          : agentProPlan.stripePriceIdAnnual;

      await createCheckoutSession({
        priceId,
        userId: "", // Will be handled in the hook
        trialDays: TRIAL_DAYS,
      });
    } else {
      // For manager plans, navigate to contact or auth
      navigate("/auth");
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Processing...";
    if (isFree) return "Get started";
    if (isAgentPro) return `Start ${TRIAL_DAYS}-day free trial`;
    if (isContact) return "Contact sales";
    return "Get started";
  };

  return (
    <div className="px-3 py-1 gap-2 flex flex-col h-full md:py-0 mx-0 md:px-[10px]">
      <div>
        <p className="text-white whitespace-nowrap text-xl font-semibold">
          {title}
        </p>
        <p className="text-sm text-white/80 h-20 mt-2">{description}</p>
      </div>
      <div className="flex flex-col gap-4 relative flex-grow">
        {isAgentPro && (
          <div className="flex items-center justify-center space-x-2 mb-2">
            <button
              onClick={() => setBillingInterval("monthly")}
              className={`px-3 py-1 text-xs rounded ${
                billingInterval === "monthly"
                  ? "bg-white text-[#0096C7]"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("annually")}
              className={`px-3 py-1 text-xs rounded ${
                billingInterval === "annually"
                  ? "bg-white text-[#0096C7]"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Annual
            </button>
          </div>
        )}
        <div>
          <p className="text-sm text-white/80">Monthly</p>
          <p className="text-2xl text-white font-semibold">{monthlyPrice}</p>
        </div>
        <div className="h-px w-full bg-white/20"></div>
        <div>
          <p className="text-sm text-white/80">Annual</p>
          <div className="flex flex-col">
            <p className="text-2xl text-white font-semibold">{annualPrice}</p>
            {savings && (
              <div className="text-sm text-emerald-400 font-medium">
                {savings}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <Button
          variant="outline"
          className="gap-4 mt-8 w-fit px-6 text-[#0096C7] border-[#0096C7] hover:bg-[#0096C7] hover:text-white"
          onClick={handleGetStarted}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {getButtonText()} <MoveRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
