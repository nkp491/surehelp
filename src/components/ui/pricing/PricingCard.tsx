import React, { ReactNode, useState } from "react";
import { MoveRight, Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { SUBSCRIPTION_PLANS, TRIAL_DAYS } from "@/integrations/stripe/plans";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
interface PricingCardProps {
  id: string;
  title: string;
  description: string;
  monthlyPrice: string | ReactNode;
  annualPrice: string | ReactNode;
  savings?: ReactNode | null;
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
  const { createCheckoutSession } = useStripeCheckout();
  const [promoCode, setPromoCode] = useState("");
  const [showPromoField, setShowPromoField] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
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
      setIsLoading(true);
      setErrorMessage("");

      // Check if the user is logged in
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setErrorMessage("You must be logged in to subscribe.");
        console.error("User not authenticated:", userError);
        setIsLoading(false);
        return;
      }

      // Validate promo code if provided
    let promotionCode: string | undefined = undefined;
    if (promoCode) {
      const {data: dbPromoCode, error} = await supabase.from("promo_codes")
        .select("*")
        .eq("promo_code", promoCode)
        .eq("status", "active")
        .single();
      if (error || !dbPromoCode) {
        const errorMsg = error?.message || "Invalid or expired promo code";
        toast({
          title: "Error",
          description: "Invalid or expired promo code",
          variant: "destructive",
        });
        setErrorMessage(errorMsg);
        console.error("Error :",error);
        setIsLoading(false);
        return;
      }
      if (dbPromoCode.usage_limit && dbPromoCode.usage_count >= dbPromoCode.usage_limit) {
        toast({
          title: "Error",
          description: "This promo code has reached its usage limit.",
          variant: "destructive",
        });
        setErrorMessage("This promo code has reached its usage limit.");
        setIsLoading(false);
        return;
      }
      promotionCode = dbPromoCode.promo_code;
    }

      const priceId =
        billingInterval === "monthlyPrice"
          ? plan.stripePriceIdMonthly
          : plan.stripePriceIdAnnual;

      await createCheckoutSession({
        priceId,
        userId: "", // handled in the hook
        trialDays: isAgentPro ? TRIAL_DAYS : undefined,
        promotionCode,
      });
      setIsLoading(false);
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
      {!isFree && (
        <div className="flex flex-col gap-2">
          {!showPromoField ? (
            <button
              type="button"
              onClick={() => setShowPromoField(true)}
              className="text-sm text-white/60 hover:text-white/80 flex items-center gap-1 self-start transition-colors"
            >
              <Tag className="w-3 h-3" />
              Have a promotion code?
            </button>
          ) : (
            <div className="space-y-2">
              <Label htmlFor={`promo-${id}`} className="text-sm text-white/80">
                Promotion Code
              </Label>
              <div className="flex gap-2">
                <Input
                  id={`promo-${id}`}
                  type="text"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#0096C7]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowPromoField(false)
                    setPromoCode("")
                  }}
                  className="text-white/60 px-2"
                >
                  ×
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
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


          