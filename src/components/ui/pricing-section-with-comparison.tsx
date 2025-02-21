
import { Check, Minus, MoveRight, PhoneCall } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function PricingComparison() {
  const navigate = useNavigate();

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
          <div className="grid text-left w-full grid-cols-3 lg:grid-cols-4 divide-x divide-white/20 pt-20">
            <div className="col-span-3 lg:col-span-1"></div>
            <div className="px-3 py-1 md:px-6 md:py-4 gap-2 flex flex-col">
              <p className="text-2xl text-white">Agent</p>
              <p className="text-sm text-white/80">
                The simplest way to try SureHelp
              </p>
              <p className="flex flex-col lg:flex-row lg:items-center gap-2 text-xl mt-8">
                <span className="text-4xl text-white">Free</span>
              </p>
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
              <p className="text-sm text-white/80">
                For growing agents
              </p>
              <p className="flex flex-col lg:flex-row lg:items-center gap-2 text-xl mt-8">
                <span className="text-4xl text-white">$45</span>
                <span className="text-sm text-white/80"> / month</span>
              </p>
              <Button 
                className="gap-4 mt-8 bg-white text-[#0096C7] hover:bg-white/90"
                onClick={() => navigate('/auth')}
              >
                Get started <MoveRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 gap-2 flex flex-col">
              <p className="text-2xl text-white">Manager Pro</p>
              <p className="text-sm text-white/80">
                For small agencies with a couple of managers and teams
              </p>
              <p className="flex flex-col lg:flex-row lg:items-center gap-2 text-xl mt-8">
                <span className="text-4xl text-white">$250</span>
                <span className="text-sm text-white/80"> / month</span>
              </p>
              <Button 
                variant="outline" 
                className="gap-4 mt-8 text-white border-white hover:bg-white/10"
                onClick={() => navigate('/auth')}
              >
                Contact us <PhoneCall className="w-4 h-4" />
              </Button>
            </div>
            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4">
              <b className="text-white">Features</b>
            </div>
            <div></div>
            <div></div>
            <div></div>
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
            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-white">
              Client Book of Business
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">15 submissions</p>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Unlimited</p>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Unlimited</p>
            </div>
            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-white">
              KPI Insights
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">30 days</p>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Unlimited</p>
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Unlimited</p>
            </div>
            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-white">
              Team Members
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Minus className="w-4 h-4 text-white/60" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <p className="text-white/80 text-sm">Up to 25</p>
            </div>
            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-white">
              Manager Dashboard
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Minus className="w-4 h-4 text-white/60" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Minus className="w-4 h-4 text-white/60" />
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="px-3 lg:px-6 col-span-3 lg:col-span-1 py-4 text-white">
              Team Bulletin
            </div>
            <div className="px-3 py-1 md:px-6 md:py-4 flex justify-center">
              <Minus className="w-4 h-4 text-white/60" />
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
