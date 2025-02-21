
import React from 'react';
import { Check, X } from "lucide-react";

interface FeatureRowProps {
  feature: string;
  plans: (string | boolean)[];
}

export function FeatureRow({ feature, plans }: FeatureRowProps) {
  return (
    <>
      <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-white">{feature}</div>
      {plans.map((value, index) => (
        <div key={index} className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
          {typeof value === 'boolean' ? (
            value ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <X className="w-4 h-4 text-white/60" />
            )
          ) : (
            <p className="text-white/80 text-sm">{value}</p>
          )}
        </div>
      ))}
    </>
  );
}
