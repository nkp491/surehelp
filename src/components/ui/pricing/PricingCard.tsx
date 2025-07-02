import React, { useState } from "react";
import { MoveRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { SUBSCRIPTION_PLANS, TRIAL_DAYS } from "@/integrations/stripe/plans";

interface PricingCardProps {
  id: string;
  title: string;
  description: string;
  monthlyPrice: string | JSX.Element;
  annualPrice: string | JSX.Element;
  savings?: JSX.Element | null;
  isContact?: boolean;
  billingInterval?: "monthlyPrice" | "yearlyPrice";
}

export function PricingCard({
  id,
  title,
  description,
  monthlyPrice,
  annualPrice,
  savings,
  isContact = false,
  billingInterval
}: PricingCardProps) {
  const navigate = useNavigate();
  const { createCheckoutSession, isLoading } = useStripeCheckout();

  // Find the plan by id
  const plan = SUBSCRIPTION_PLANS.find((plan) => plan.id === id);
  const isAgentPro = id === "agent_pro";
  const isFree = title === "Agent";
  const isManagerPlan = ["manager_pro", "manager_pro_gold", "manager_pro_platinum"].includes(id);

  const handleGetStarted = async (id: string) => {
    if (isFree) {
      navigate("/auth");
      return;
    }

    if (plan) {
      const priceId =
        billingInterval === "monthlyPrice"
          ? plan.stripePriceIdMonthly
          : plan.stripePriceIdAnnual;

      await createCheckoutSession({
        priceId,
        userId: "", // handled in the hook
        trialDays: isAgentPro ? TRIAL_DAYS : undefined,
      });
    } else {
      // fallback: navigate to auth if plan not found
      navigate("/auth");
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Processing...";
    if (isFree) return "Get started";
    if (isAgentPro) return `Start ${TRIAL_DAYS}-day free trial`;
    if (isContact) return "Subscribed Now";
    if (isManagerPlan) return "Start subscription";
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

        {billingInterval === "monthlyPrice" ? (
          <div>
            <p className="text-sm text-white/80">Monthly</p>
            <p className="text-2xl text-white font-semibold">{monthlyPrice}</p>
          </div>
        ) : (
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
        )}
      </div>
      <div className="flex justify-center">
        <Button
          variant="outline"
          className="gap-4 mt-8 w-fit px-6 text-[#0096C7] border-[#0096C7] hover:bg-[#0096C7] hover:text-white"
          onClick={() => handleGetStarted(id)}
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


          