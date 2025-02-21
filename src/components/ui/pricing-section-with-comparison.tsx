
import { Check, X, MoveRight, PhoneCall } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function PricingComparison() {
  const navigate = useNavigate();

  const calculateMonthlyFromAnnual = (monthlyPrice: number) => {
    return (monthlyPrice * 0.8).toFixed(0); // 20% discount
  };

  const pricingData = [
    {
      title: "Agent",
      description: "Perfect for individual agents looking to streamline their client assessment process.",
      monthlyPrice: "Free",
      yearlyPrice: "Free",
      yearlyPriceSavings: null,
      buttonText: "Get started",
      buttonIcon: MoveRight,
      buttonVariant: "outline" as const,
      features: {
        assessmentForms: "15/month",
        bookOfBusiness: "15 submissions",
        kpiInsights: "30 days",
        teamMembers: false,
        managerDashboard: false,
        teamBulletin: false
      }
    },
    {
      title: "Agent Pro",
      description: "Ideal for experienced agents who need unlimited access and advanced features.",
      monthlyPrice: "45",
      yearlyPrice: "36",
      yearlyPriceSavings: "9",
      buttonText: "Get started",
      buttonIcon: MoveRight,
      buttonVariant: "default" as const,
      features: {
        assessmentForms: "Unlimited",
        bookOfBusiness: "Unlimited",
        kpiInsights: "Unlimited",
        teamMembers: true,
        managerDashboard: false,
        teamBulletin: true
      }
    },
    {
      title: "Manager Pro",
      description: "Perfect for small agencies with a growing team of agents and basic management needs.",
      monthlyPrice: "250",
      yearlyPrice: "200",
      yearlyPriceSavings: "50",
      buttonText: "Contact us",
      buttonIcon: PhoneCall,
      buttonVariant: "outline" as const,
      features: {
        assessmentForms: "Unlimited",
        bookOfBusiness: "Unlimited",
        kpiInsights: "Unlimited",
        teamMembers: "Up to 25",
        managerDashboard: true,
        teamBulletin: true
      }
    },
    {
      title: "Manager Pro Gold",
      description: "Designed for medium agencies with multiple teams and comprehensive management requirements.",
      monthlyPrice: "500",
      yearlyPrice: "400",
      yearlyPriceSavings: "100",
      buttonText: "Contact us",
      buttonIcon: PhoneCall,
      buttonVariant: "outline" as const,
      features: {
        assessmentForms: "Unlimited",
        bookOfBusiness: "Unlimited",
        kpiInsights: "Unlimited",
        teamMembers: "Up to 50",
        managerDashboard: true,
        teamBulletin: true
      }
    },
    {
      title: "Manager Pro Platinum",
      description: "Enterprise solution for large agencies requiring unlimited capabilities and premium support.",
      monthlyPrice: "1000",
      yearlyPrice: "800",
      yearlyPriceSavings: "200",
      buttonText: "Contact us",
      buttonIcon: PhoneCall,
      buttonVariant: "outline" as const,
      features: {
        assessmentForms: "Unlimited",
        bookOfBusiness: "Unlimited",
        kpiInsights: "Unlimited",
        teamMembers: "Unlimited",
        managerDashboard: true,
        teamBulletin: true
      }
    }
  ];

  const features = [
    {
      name: "Client Assessment Forms",
      key: "assessmentForms"
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

  return (
    <div className="w-full py-20">
      <div className="container mx-auto">
        <div className="flex text-center justify-center items-center gap-4 flex-col">
          <Badge className="bg-[#0096c7] hover:bg-[#0096c7]/90">Pricing</Badge>
          <div className="flex gap-2 flex-col">
            <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl text-center font-regular text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg leading-relaxed tracking-tight text-white/80 max-w-xl text-center">
              Choose the plan that works best for you and your team
            </p>
          </div>
          <div className="grid text-left w-full grid-cols-3 lg:grid-cols-6 divide-x divide-white/20 pt-20">
            <div className="col-span-3 lg:col-span-1"></div>
            {pricingData.map((plan, index) => (
              <div key={index} className="px-3 py-1 md:px-6 md:py-4 gap-2 flex flex-col">
                <p className="text-2xl text-white">{plan.title}</p>
                <p className="text-sm text-white/80 h-20">
                  {plan.description}
                </p>
                <div className="flex flex-row justify-between mt-8 gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-white/80">Monthly</p>
                    <p className="text-2xl text-white">
                      {plan.monthlyPrice === "Free" ? "Free" : `$${plan.monthlyPrice}`}
                    </p>
                  </div>
                  <div className="w-px bg-white/20" />
                  <div className="flex-1">
                    <p className="text-sm text-white/80">Annual</p>
                    <div className="flex flex-col">
                      <p className="text-2xl text-white">
                        {plan.yearlyPrice === "Free" ? "Free" : `$${plan.yearlyPrice}`}
                      </p>
                      {plan.yearlyPriceSavings && (
                        <p className="text-sm text-emerald-400">Save ${plan.yearlyPriceSavings}/mo</p>
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  variant={plan.buttonVariant}
                  className={`gap-4 mt-8 ${
                    plan.buttonVariant === "default" 
                      ? "bg-white text-[#0096C7] hover:bg-white/90" 
                      : "text-white border-white hover:bg-white/10"
                  }`}
                  onClick={() => navigate('/auth')}
                >
                  {plan.buttonText} <plan.buttonIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4">
              <b className="text-white">Features</b>
            </div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>

            {features.map((feature, index) => (
              <React.Fragment key={index}>
                <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-white">
                  {feature.name}
                </div>
                {pricingData.map((plan, planIndex) => (
                  <div key={`${index}-${planIndex}`} className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
                    {typeof plan.features[feature.key] === "boolean" ? (
                      plan.features[feature.key] ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-white/60" />
                      )
                    ) : (
                      <p className="text-white/80 text-sm">{plan.features[feature.key]}</p>
                    )}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { PricingComparison };
