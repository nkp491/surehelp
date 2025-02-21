import React from 'react';
import { Badge } from "@/components/ui/badge";
export function PricingHeader() {
  return <>
      <Badge className="bg-[#0096c7] hover:bg-[#0096c7]/90">Pricing</Badge>
      <div className="flex gap-2 flex-col px-0">
        <h2 className="text-3xl tracking-tighter max-w-xl font-regular text-white text-left px-0 font-semibold md:text-6xl">
          Simple, Transparent Pricing
        </h2>
        <p className="text-lg leading-relaxed tracking-tight text-white/80 max-w-xl text-center">
          Choose the plan that works best for you and your team
        </p>
      </div>
    </>;
}