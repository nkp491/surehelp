
import { PricingComparison } from "@/components/ui/pricing-section-with-comparison";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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

      <main className="w-screen pt-16">
        <PricingComparison />
      </main>
    </div>
  );
};

export default Pricing;
