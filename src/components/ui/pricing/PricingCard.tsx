
import React from 'react';
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PricingCardProps {
  title: string;
  description: string;
  monthlyPrice: string | number;
  annualPrice: string | number;
  savings?: string;
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

  return (
    <div className="px-3 py-1 md:px-6 md:py-4 gap-2 flex flex-col">
      <p className="text-2xl text-white">{title}</p>
      <p className="text-sm text-white/80 h-20">{description}</p>
      <div className="flex flex-col md:flex-row gap-4 mt-8 relative">
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-center border-b border-white/20 pb-4">
            <div>
              <p className="text-sm text-white/80">Monthly</p>
              <p className="text-2xl text-white">{typeof monthlyPrice === 'number' ? `$${monthlyPrice}` : monthlyPrice}</p>
            </div>
          </div>
        </div>
        <div className="w-px h-full bg-white/20 absolute left-1/2 top-0 hidden md:block"></div>
        <div className="flex-1 flex flex-col gap-2">
          <div>
            <p className="text-sm text-white/80">Annual</p>
            <div className="flex flex-col">
              <p className="text-2xl text-white">{typeof annualPrice === 'number' ? `$${annualPrice}` : annualPrice}</p>
              {savings && <p className="text-sm text-emerald-400">Save {savings}/mo</p>}
            </div>
          </div>
        </div>
      </div>
      <Button 
        variant={isContact ? "outline" : title === "Agent" ? "outline" : "default"}
        className={`gap-4 mt-8 ${
          isContact ? "text-white border-white hover:bg-white/10" :
          title === "Agent" ? "text-white border-white hover:bg-white/10" :
          "bg-white text-[#0096C7] hover:bg-white/90"
        }`}
        onClick={() => navigate('/auth')}
      >
        {isContact ? "Contact us " : "Get started "} 
        {isContact ? <PhoneCall className="w-4 h-4" /> : <MoveRight className="w-4 h-4" />}
      </Button>
    </div>
  );
}
