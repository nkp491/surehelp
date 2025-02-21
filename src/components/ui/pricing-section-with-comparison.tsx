
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

const pricingData = [
  {
    name: "Agent",
    monthlyPrice: "free",
    yearlyPrice: "free",
    description: "The simplest way to try SureHelp",
    features: [
      "Up to 15 client assessment forms/month",
      "Client book of business for 15 submissions",
      "KPI insights up to 30 days"
    ]
  },
  {
    name: "Agent Pro",
    monthlyPrice: "45",
    yearlyPrice: "25",
    description: "For growing agents",
    features: [
      "Unlimited client assessment forms/month",
      "Unlimited client book of business",
      "Unlimited KPI insights",
      "Team bulletin"
    ]
  },
  {
    name: "Manager Pro",
    monthlyPrice: "250",
    yearlyPrice: "150",
    description: "For small agencies with a couple of managers and teams",
    features: [
      "Unlimited client assessment forms/month",
      "Unlimited client book of business",
      "Unlimited KPI insights",
      "Up to 25 linked team member accounts",
      "Manager dashboard with ratios cards",
      "Team bulletin"
    ]
  },
  {
    name: "Manager Pro Gold",
    monthlyPrice: "500",
    yearlyPrice: "300",
    description: "For medium agencies with multiple managers and teams",
    features: [
      "Unlimited client assessment forms/month",
      "Unlimited client book of business",
      "Unlimited KPI insights",
      "Up to 500 linked team member accounts",
      "Manager dashboard with ratios cards",
      "Team bulletin"
    ]
  },
  {
    name: "Manager Pro Platinum",
    monthlyPrice: "1,000",
    yearlyPrice: "600",
    description: "For large agencies with multiple levels of managers and teams",
    features: [
      "Unlimited client assessment forms/month",
      "Unlimited client book of business",
      "Unlimited KPI insights",
      "Up to 1,000 linked team member accounts",
      "Manager dashboard with ratios cards",
      "Team bulletin"
    ]
  }
];

function PricingComparison() {
  const getFeatureValues = (key: string) => {
    switch (key) {
      case 'assessmentForm':
        return ["15/month", "Unlimited", "Unlimited", "Unlimited", "Unlimited"];
      case 'bookOfBusiness':
        return ["15 submissions", "Unlimited", "Unlimited", "Unlimited", "Unlimited"];
      case 'kpiInsights':
        return ["30 days", "Unlimited", "Unlimited", "Unlimited", "Unlimited"];
      case 'teamMembers':
        return [false, true, "Up to 25", "Up to 500", "Up to 1,000"];
      case 'managerDashboard':
        return [false, false, true, true, true];
      case 'teamBulletin':
        return [false, true, true, true, true];
      default:
        return [false, false, false, false, false];
    }
  };

  const calculateSavings = (monthly: string, yearly: string) => {
    if (monthly === "free" || yearly === "free") return null;
    const monthlyCost = parseFloat(monthly.replace(',', ''));
    const yearlyCost = parseFloat(yearly.replace(',', ''));
    const savingsPercentage = ((monthlyCost - yearlyCost) / monthlyCost) * 100;
    return `Save ${savingsPercentage.toFixed(0)}%`;
  };

  const formatPrice = (price: string) => {
    return price.toLowerCase() === "free" ? "Free" : `$${price}/mo`;
  };

  return (
    <div className="w-full py-20">
      <div className="container mx-auto">
        <div className="flex text-center justify-center items-center gap-4 flex-col">
          <PricingHeader />
          <div className="grid text-left w-full grid-cols-3 lg:grid-cols-6 divide-x divide-white/20 pt-20">
            <div className="col-span-3 lg:col-span-1"></div>
            {pricingData.map((plan) => (
              <PricingCard
                key={plan.name}
                title={plan.name}
                description={plan.description}
                monthlyPrice={formatPrice(plan.monthlyPrice)}
                annualPrice={formatPrice(plan.yearlyPrice)}
                savings={calculateSavings(plan.monthlyPrice, plan.yearlyPrice)}
                isContact={plan.name.toLowerCase().includes('manager')}
              />
            ))}

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
