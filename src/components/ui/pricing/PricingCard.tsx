
import React from 'react';
import { MoveRight } from "lucide-react";
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
        <p className="text-white whitespace-nowrap text-xl font-semibold">{title}</p>
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
            {savings && <p className="text-sm text-emerald-400 font-medium">{savings}</p>}
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <Button variant="outline" className={`gap-4 mt-8 w-fit px-6 text-[#0096C7] border-[#0096C7] hover:bg-[#0096C7] hover:text-white`} onClick={() => navigate('/auth')}>
          Get started <MoveRight className="w-4 h-4" />
        </Button>
      </div>
    </div>;
}
