
import React from 'react';
import { Check, X, MoveRight, PhoneCall } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function PricingComparison() {
  const navigate = useNavigate();

  const calculateMonthlyFromAnnual = (monthlyPrice: number) => {
    return (monthlyPrice * 0.8).toFixed(0); // 20% discount
  };

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
            <div className="px-3 py-1 md:px-6 md:py-4 gap-2 flex flex-col">
              <p className="text-2xl text-white">Agent</p>
              <p className="text-sm text-white/80 h-20">
                Perfect for individual agents looking to streamline their client assessment process.
              </p>
              <div className="flex flex-col md:flex-row gap-4 mt-8 relative">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-center border-b border-white/20 pb-4">
                    <div>
                      <p className="text-sm text-white/80">Monthly</p>
                      <p className="text-2xl text-white">Free</p>
                    </div>
                  </div>
                </div>
                <div className="w-px h-full bg-white/20 absolute left-1/2 top-0 hidden md:block"></div>
                <div className="flex-1 flex flex-col gap-2">
                  <div>
                    <p className="text-sm text-white/80">Annual</p>
                    <p className="text-2xl text-white">Free</p>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="gap-4 mt-8 text-white border-white hover:bg-white/10"
                onClick={() => navigate('/auth')}
              >
                Get started <MoveRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 gap-2 flex flex-col">
              <p className="text-2xl text-white">Agent Pro</p>
              <p className="text-sm text-white/80 h-20">
                Ideal for experienced agents who need unlimited access and advanced features.
              </p>
              <div className="flex flex-col md:flex-row gap-4 mt-8 relative">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-center border-b border-white/20 pb-4">
                    <div>
                      <p className="text-sm text-white/80">Monthly</p>
                      <p className="text-2xl text-white">$45</p>
                    </div>
                  </div>
                </div>
                <div className="w-px h-full bg-white/20 absolute left-1/2 top-0 hidden md:block"></div>
                <div className="flex-1 flex flex-col gap-2">
                  <div>
                    <p className="text-sm text-white/80">Annual</p>
                    <div className="flex flex-col">
                      <p className="text-2xl text-white">${calculateMonthlyFromAnnual(45)}</p>
                      <p className="text-sm text-emerald-400">Save $9/mo</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                className="gap-4 mt-8 bg-white text-[#0096C7] hover:bg-white/90"
                onClick={() => navigate('/auth')}
              >
                Get started <MoveRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 gap-2 flex flex-col">
              <p className="text-2xl text-white">Manager Pro</p>
              <p className="text-sm text-white/80 h-20">
                Perfect for small agencies with a growing team of agents and basic management needs.
              </p>
              <div className="flex flex-col gap-2 mt-8">
                <div className="flex justify-between items-center border-b border-white/20 pb-4">
                  <div>
                    <p className="text-sm text-white/80">Monthly</p>
                    <p className="text-2xl text-white">$250</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/80">Annual</p>
                  <div className="flex flex-col">
                    <p className="text-2xl text-white">${calculateMonthlyFromAnnual(250)}</p>
                    <p className="text-sm text-emerald-400">Save $50/mo</p>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="gap-4 mt-8 text-white border-white hover:bg-white/10"
                onClick={() => navigate('/auth')}
              >
                Contact us <PhoneCall className="w-4 h-4" />
              </Button>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 gap-2 flex flex-col">
              <p className="text-2xl text-white">Manager Pro Gold</p>
              <p className="text-sm text-white/80 h-20">
                Designed for medium agencies with multiple teams and comprehensive management requirements.
              </p>
              <div className="flex flex-col gap-2 mt-8">
                <div className="flex justify-between items-center border-b border-white/20 pb-4">
                  <div>
                    <p className="text-sm text-white/80">Monthly</p>
                    <p className="text-2xl text-white">$500</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/80">Annual</p>
                  <div className="flex flex-col">
                    <p className="text-2xl text-white">${calculateMonthlyFromAnnual(500)}</p>
                    <p className="text-sm text-emerald-400">Save $100/mo</p>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="gap-4 mt-8 text-white border-white hover:bg-white/10"
                onClick={() => navigate('/auth')}
              >
                Contact us <PhoneCall className="w-4 h-4" />
              </Button>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 gap-2 flex flex-col">
              <p className="text-2xl text-white">Manager Pro Platinum</p>
              <p className="text-sm text-white/80 h-20">
                Enterprise solution for large agencies requiring unlimited capabilities and premium support.
              </p>
              <div className="flex flex-col gap-2 mt-8">
                <div className="flex justify-between items-center border-b border-white/20 pb-4">
                  <div>
                    <p className="text-sm text-white/80">Monthly</p>
                    <p className="text-2xl text-white">$1000</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/80">Annual</p>
                  <div className="flex flex-col">
                    <p className="text-2xl text-white">${calculateMonthlyFromAnnual(1000)}</p>
                    <p className="text-sm text-emerald-400">Save $200/mo</p>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="gap-4 mt-8 text-white border-white hover:bg-white/10"
                onClick={() => navigate('/auth')}
              >
                Contact us <PhoneCall className="w-4 h-4" />
              </Button>
            </div>

            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-white">Client Assessment Forms</div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">15/month</p>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Unlimited</p>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Unlimited</p>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Unlimited</p>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Unlimited</p>
            </div>

            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-white">Client Book of Business</div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">15 submissions</p>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Unlimited</p>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Unlimited</p>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Unlimited</p>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Unlimited</p>
            </div>

            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-white">KPI Insights</div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">30 days</p>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Unlimited</p>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Unlimited</p>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Unlimited</p>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Unlimited</p>
            </div>

            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-white">Team Members</div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <X className="w-4 h-4 text-white/60" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Up to 25</p>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Up to 50</p>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Unlimited</p>
            </div>

            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-white">Manager Dashboard</div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <X className="w-4 h-4 text-white/60" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <X className="w-4 h-4 text-white/60" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-white">Team Bulletin</div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <X className="w-4 h-4 text-white/60" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { PricingComparison };
