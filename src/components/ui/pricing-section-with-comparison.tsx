
import React from 'react';
import { PricingHeader } from './pricing/PricingHeader';
import { PricingCard } from './pricing/PricingCard';
import { FeatureRow } from './pricing/FeatureRow';

const features = [
  {
    name: "Client Assessment Form",
    key: "assessmentForm"
  },
  {
    name: "Client Book of Business",
    key: "bookOfBusiness"
  },
  {
    name: "KPI Insights",
    key: "kpiInsights"
  },
  {
    name: "Team Members",
    key: "teamMembers"
  },
  {
    name: "Manager Dashboard",
    key: "managerDashboard"
  },
  {
    name: "Team Bulletin",
    key: "teamBulletin"
  }
];

function PricingComparison() {
  const calculateMonthlyFromAnnual = (monthlyPrice: number) => {
    return (monthlyPrice * 0.8).toFixed(0); // 20% discount
  };

  const getFeatureValues = (key: string) => {
    switch (key) {
      case 'assessmentForm':
        return ["15/month", "Unlimited", "Unlimited", "Unlimited", "Unlimited"];
      case 'bookOfBusiness':
        return ["15 submissions", "Unlimited", "Unlimited", "Unlimited", "Unlimited"];
      case 'kpiInsights':
        return ["30 days", "Unlimited", "Unlimited", "Unlimited", "Unlimited"];
      case 'teamMembers':
        return [false, true, "Up to 25", "Up to 50", "Unlimited"];
      case 'managerDashboard':
        return [false, false, true, true, true];
      case 'teamBulletin':
        return [false, true, true, true, true];
      default:
        return [false, false, false, false, false];
    }
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
              annualPrice={36}
              savings="$9"
            />
            <PricingCard
              title="Manager Pro"
              description="Perfect for small agencies with a growing team of agents and basic management needs."
              monthlyPrice={250}
              annualPrice={200}
              savings="$50"
              isContact
            />
            <PricingCard
              title="Manager Pro Gold"
              description="Designed for medium agencies with multiple teams and comprehensive management requirements."
              monthlyPrice={500}
              annualPrice={400}
              savings="$100"
              isContact
            />
            <PricingCard
              title="Manager Pro Platinum"
              description="Enterprise solution for large agencies requiring unlimited capabilities and premium support."
              monthlyPrice={1000}
              annualPrice={800}
              savings="$200"
              isContact
            />

            {features.map((feature) => (
              <FeatureRow 
                key={feature.key}
                feature={feature.name}
                plans={getFeatureValues(feature.key)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { PricingComparison };
