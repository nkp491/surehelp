
import { PricingComparison } from "@/components/ui/pricing-section-with-comparison";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/marketing/Footer";

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-b from-[#0096C7] to-[#002DCB]/90">
      <nav className="border-b border-white/20 backdrop-blur-sm fixed w-full z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/b13a0f6e-9e88-478b-b26d-66c2b71c55c0.png"
                alt="SureHelp Logo"
                className="h-8 cursor-pointer"
                onClick={() => navigate('/')}
              />
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/about')} className="text-white hover:text-white/90">
                About
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
      <Footer />
    </div>
  );
};

export default Pricing;
