import React from 'react';
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
interface PricingCardProps {
  title: string;
  description: string;
  monthlyPrice: string | JSX.Element;
  annualPrice: string | JSX.Element;
  savings?: string | null;
  isContact?: boolean;
}
export function PricingCard({
  title,
  description,
  monthlyPrice,
  annualPrice,
  savings,
  isContact = false
}: PricingCardProps) {
  const navigate = useNavigate();
  return <div className="px-3 py-1 gap-2 flex flex-col h-full md:py-0 mx-0 md:px-[10px]">
      <div>
        <p className="text-2xl text-white whitespace-nowrap font-medium">{title}</p>
        <p className="text-sm text-white/80 h-20 mt-2">{description}</p>
      </div>
      <div className="flex flex-col gap-4 relative flex-grow">
        <div>
          <p className="text-sm text-white/80">Monthly</p>
          <p className="text-2xl text-white font-semibold">{monthlyPrice}</p>
        </div>
        <div className="h-px w-full bg-white/20"></div>
        <div>
          <p className="text-sm text-white/80">Annual</p>
          <div className="flex flex-col">
            <p className="text-2xl text-white font-semibold">{annualPrice}</p>
            {savings && <p className="text-sm text-emerald-400">{savings}</p>}
          </div>
        </div>
      </div>
      <Button variant={isContact ? "outline" : title === "Agent" ? "outline" : "default"} className={`gap-4 mt-8 ${isContact ? "text-white border-white hover:bg-white/10" : title === "Agent" ? "text-white border-white hover:bg-white/10" : "bg-white text-[#0096C7] hover:bg-white/90"}`} onClick={() => navigate('/auth')}>
        {isContact ? "Contact us " : "Get started "} 
        {isContact ? <PhoneCall className="w-4 h-4" /> : <MoveRight className="w-4 h-4" />}
      </Button>
    </div>;
}