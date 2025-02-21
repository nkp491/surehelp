
import React from 'react';
import { PricingHeader } from './pricing/PricingHeader';
import { PricingCard } from './pricing/PricingCard';
import { FeatureRow } from './pricing/FeatureRow';

function PricingComparison() {
  const calculateMonthlyFromAnnual = (monthlyPrice: number) => {
    return (monthlyPrice * 0.8).toFixed(0); // 20% discount
  };

  return (
    <div className="w-full py-20">
      <div className="container mx-auto">
        <div className="flex text-center justify-center items-center gap-4 flex-col">
          <PricingHeader />
          <div className="grid text-left w-full grid-cols-3 lg:grid-cols-6 divide-x divide-white/20 pt-20">
            <div className="col-span-3 lg:col-span-1"></div>
            <PricingCard
              title="Agent"
              description="Perfect for individual agents looking to streamline their client assessment process."
              monthlyPrice="Free"
              annualPrice="Free"
            />
            <PricingCard
              title="Agent Pro"
              description="Ideal for experienced agents who need unlimited access and advanced features."
              monthlyPrice={45}
              annualPrice={calculateMonthlyFromAnnual(45)}
              savings="$9"
            />
            <PricingCard
              title="Manager Pro"
              description="Perfect for small agencies with a growing team of agents and basic management needs."
              monthlyPrice={250}
              annualPrice={calculateMonthlyFromAnnual(250)}
              savings="$50"
              isContact
            />
            <PricingCard
              title="Manager Pro Gold"
              description="Designed for medium agencies with multiple teams and comprehensive management requirements."
              monthlyPrice={500}
              annualPrice={calculateMonthlyFromAnnual(500)}
              savings="$100"
              isContact
            />
            <PricingCard
              title="Manager Pro Platinum"
              description="Enterprise solution for large agencies requiring unlimited capabilities and premium support."
              monthlyPrice={1000}
              annualPrice={calculateMonthlyFromAnnual(1000)}
              savings="$200"
              isContact
            />

            <FeatureRow 
              feature="Client Assessment Forms"
              plans={["15/month", "Unlimited", "Unlimited", "Unlimited", "Unlimited"]}
            />
            <FeatureRow
              feature="Client Book of Business"
              plans={["15 submissions", "Unlimited", "Unlimited", "Unlimited", "Unlimited"]}
            />
            <FeatureRow
              feature="KPI Insights"
              plans={["30 days", "Unlimited", "Unlimited", "Unlimited", "Unlimited"]}
            />
            <FeatureRow
              feature="Team Members"
              plans={[false, true, "Up to 25", "Up to 50", "Unlimited"]}
            />
            <FeatureRow
              feature="Manager Dashboard"
              plans={[false, false, true, true, true]}
            />
            <FeatureRow
              feature="Team Bulletin"
              plans={[false, true, true, true, true]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export { PricingComparison };
