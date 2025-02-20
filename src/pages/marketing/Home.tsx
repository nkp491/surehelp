
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import TypedText from "@/components/ui/typed-text";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0096C7] to-[#002DCB]/90">
      <nav className="border-b border-white/20 backdrop-blur-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white">SureHelp</span>
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

      <main>
        <div className="relative isolate pt-24">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Supercharge your{" "}
                <span className="border-b-4 border-white"><TypedText words={["leadflow", "workflow", "cashflow"]} /></span>.
              </h1>
              <p className="mt-6 text-lg leading-8 text-white/80">
                Streamline your insurance assessment process with our comprehensive platform. 
                Built for insurance professionals who value efficiency and accuracy.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button 
                  onClick={() => navigate('/auth')} 
                  size="lg"
                  className="bg-white text-[#0096C7] hover:bg-white/90"
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => navigate('/products')}
                  className="text-white border-white hover:bg-white/10"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
