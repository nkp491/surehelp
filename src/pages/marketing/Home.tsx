
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="border-b bg-white/50 backdrop-blur-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-[#2A6F97]">SureHelp</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/products')}>
                Products
              </Button>
              <Button variant="ghost" onClick={() => navigate('/pricing')}>
                Pricing
              </Button>
              <Button onClick={() => navigate('/auth')}>
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
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Insurance Assessment Made Simple
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Streamline your insurance assessment process with our comprehensive platform. 
                Built for insurance professionals who value efficiency and accuracy.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button onClick={() => navigate('/auth')} size="lg">
                  Get Started
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/products')}>
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
