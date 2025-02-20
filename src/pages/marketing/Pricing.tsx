
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();

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

              <div className="mx-auto mt-16 grid max-w-lg gap-8 lg:max-w-none lg:grid-cols-5">
                {[
                  {
                    name: "Agent",
                    price: "49",
                    description: "Perfect for independent agents",
                    features: [
                      "Up to 50 assessments/month",
                      "Basic analytics",
                      "Email support",
                      "1 team member"
                    ]
                  },
                  {
                    name: "Agent Pro",
                    price: "99",
                    description: "For growing agent practices",
                    features: [
                      "Up to 150 assessments/month",
                      "Advanced analytics",
                      "Priority email support",
                      "Up to 3 team members"
                    ]
                  },
                  {
                    name: "Manager Pro",
                    price: "199",
                    description: "For small agency managers",
                    features: [
                      "Up to 500 assessments/month",
                      "Team analytics & reporting",
                      "Priority support",
                      "Up to 10 team members"
                    ]
                  },
                  {
                    name: "Manager Pro Gold",
                    price: "399",
                    description: "For medium agencies",
                    features: [
                      "1000 assessments/month",
                      "Advanced team analytics",
                      "24/7 priority support",
                      "Up to 25 team members"
                    ]
                  },
                  {
                    name: "Manager Pro Platinum",
                    price: "799",
                    description: "For large agencies",
                    features: [
                      "Unlimited assessments",
                      "Custom reporting & API access",
                      "Dedicated support team",
                      "Unlimited team members"
                    ]
                  }
                ].map((tier) => (
                  <div
                    key={tier.name}
                    className="flex flex-col justify-between rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 p-8 xl:p-10"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-x-4">
                        <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-white/80">
                        {tier.description}
                      </p>
                      <p className="mt-6 flex items-baseline gap-x-1">
                        <span className="text-4xl font-bold tracking-tight text-white">${tier.price}</span>
                        <span className="text-sm font-semibold leading-6 text-white/80">/month</span>
                      </p>
                      <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-white/80">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex gap-3">
                            <CheckCircle className="h-6 w-6 text-white" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      onClick={() => navigate('/auth')}
                      variant={tier.name === "Manager Pro" ? "default" : "outline"}
                      className={`mt-8 ${
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
