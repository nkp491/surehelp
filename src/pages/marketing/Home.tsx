
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MoveRight, Menu } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A6F97] to-[#2A6F97]/80">
      <nav className="fixed w-full bg-transparent backdrop-blur-sm border-b border-white/10 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white">SureHelp</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/products')}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                Products
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/pricing')}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                Pricing
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                variant="secondary"
                className="bg-white text-[#2A6F97] hover:bg-white/90"
              >
                Login
              </Button>
            </div>
            <Button className="md:hidden" size="icon" variant="ghost">
              <Menu className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>
      </nav>

      <main>
        <div className="container mx-auto px-4">
          <div className="min-h-screen flex items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Insurance Assessment Made Simple
              </h1>
              <p className="text-lg text-white/80 mb-8">
                Streamline your insurance assessment process with our comprehensive platform. 
                Built for insurance professionals who value efficiency and accuracy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate('/auth')} 
                  size="lg"
                  className="group bg-white text-[#2A6F97] hover:bg-white/90"
                >
                  Get Started
                  <MoveRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  onClick={() => navigate('/products')}
                  className="bg-white/10 text-white hover:bg-white/20"
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
