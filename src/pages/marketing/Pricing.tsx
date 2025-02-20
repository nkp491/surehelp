
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Pricing = () => {
  const navigate = useNavigate();

  const calculateSavings = (monthlyPrice: string, yearlyPrice: string) => {
    if (monthlyPrice === "free" || yearlyPrice === "free") return 0;
    const monthly = parseFloat(monthlyPrice.replace(",", ""));
    const yearly = parseFloat(yearlyPrice.replace(",", ""));
    // Calculate total yearly cost if paying monthly
    const yearlyTotal = monthly * 12;
    // Calculate total yearly cost if paying yearly rate
    const yearlyRateTotal = yearly * 12;
    // Calculate percentage saved
    return Math.round(((yearlyTotal - yearlyRateTotal) / yearlyTotal) * 100);
  };

  const pricingData = [
    {
      name: "Agent",
      monthlyPrice: "free",
      yearlyPrice: "free",
      description: "The simplest way to try SureHelp",
      features: [
        "Up to 15 client assessment forms/month",
        "Client book of business",
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
        "Client book of business",
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
        "Client book of business",
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
        "Client book of business",
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
      description: "For large agencies with multiple levels of teams",
      features: [
        "Unlimited client assessment forms/month",
        "Client book of business",
        "Unlimited KPI insights",
        "Up to 1,000 linked team member accounts",
        "Manager dashboard with ratios cards",
        "Team bulletin"
      ]
    }
  ];

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-b from-[#0096C7] to-[#002DCB]/90">
      <nav className="border-b border-white/20 backdrop-blur-sm fixed w-full z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white cursor-pointer" 
                onClick={() => navigate('/')}>SureHelp</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/products')} className="text-white hover:text-white/90">
                Products
              </Button>
              <Button variant="ghost" onClick={() => navigate('/pricing')} className="text-white hover:text-white/90">
                Pricing
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-white text-[#0096C7] hover:bg-white/90"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="w-screen">
        <div className="relative isolate pt-24 w-full">
          <div className="w-full px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-[1440px]">
              <div className="mx-auto max-w-4xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                  Simple, Transparent Pricing
                </h1>
                <p className="mt-6 text-lg leading-8 text-white/80">
                  Choose the plan that works best for you and your team
                </p>
              </div>

              <div className="mx-auto mt-16 grid max-w-lg gap-6 lg:max-w-none lg:grid-cols-5">
                {pricingData.map((tier) => (
                  <div
                    key={tier.name}
                    className="flex flex-col justify-between rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 xl:p-8 hover:border-white/40 transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-x-4">
                        <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-white/80 min-h-[48px]">
                        {tier.description}
                      </p>
                      
                      <div className="mt-5 grid grid-cols-2 divide-x divide-white/20">
                        <div className="text-center pr-3">
                          <p className="text-sm font-medium text-white/80">Monthly</p>
                          {tier.monthlyPrice === "free" ? (
                            <p className="text-xl font-bold text-white mt-1">Free</p>
                          ) : (
                            <p className="text-xl font-bold text-white mt-1">
                              ${tier.monthlyPrice}
                              <span className="text-xs font-medium text-white/80">/mo</span>
                            </p>
                          )}
                        </div>
                        <div className="text-center pl-3">
                          <p className="text-sm font-medium text-white/80">Yearly</p>
                          {tier.yearlyPrice === "free" ? (
                            <p className="text-xl font-bold text-white mt-1">Free</p>
                          ) : (
                            <div>
                              <p className="text-xl font-bold text-white mt-1">
                                ${tier.yearlyPrice}
                                <span className="text-xs font-medium text-white/80">/mo</span>
                              </p>
                              {calculateSavings(tier.monthlyPrice, tier.yearlyPrice) > 0 && (
                                <p className="text-[11px] font-medium text-emerald-400 mt-0.5">
                                  Save {calculateSavings(tier.monthlyPrice, tier.yearlyPrice)}%
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator className="my-5 bg-white/20" />
                      
                      <ul role="list" className="mt-6 space-y-2.5 text-sm leading-6 text-white/80">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 mt-1 flex-shrink-0 text-emerald-400" />
                            <span className="flex-1">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      onClick={() => navigate('/auth')}
                      variant={tier.name === "Manager Pro" ? "default" : "outline"}
                      className={`mt-8 w-full ${
                        tier.name === "Manager Pro" 
                          ? "bg-white text-[#0096C7] hover:bg-white/90"
                          : "text-white border-white hover:bg-white/10"
                      }`}
                    >
                      Get started
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
