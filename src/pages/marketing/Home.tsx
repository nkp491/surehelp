
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import TypedText from "@/components/ui/typed-text";
import { BarChart, BookOpen, ClipboardList, LayoutDashboard } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Home = () => {
  const navigate = useNavigate();

  const workflowStages = [
    {
      icon: ClipboardList,
      title: "Client Assessment Form",
      description: "Streamline client onboarding with our comprehensive assessment form",
      bgColor: "bg-[#D3E4FD]",
    },
    {
      icon: BookOpen,
      title: "Client Book of Business",
      description: "Manage your entire client portfolio in one centralized location",
      bgColor: "bg-[#F2FCE2]",
    },
    {
      icon: BarChart,
      title: "KPI Insights",
      description: "Track performance metrics and identify growth opportunities",
      bgColor: "bg-[#FEF7CD]",
    },
    {
      icon: LayoutDashboard,
      title: "Manager Dashboard",
      description: "Monitor team performance and optimize sales operations",
      bgColor: "bg-[#9b87f5]/10",
    },
  ];

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-b from-[#0096C7] to-[#002DCB]/90">
      <nav className="border-b border-white/20 backdrop-blur-sm fixed w-full z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
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

      <main className="w-screen">
        <div className="relative isolate pt-24 w-full">
          <div className="w-full px-6 py-24 sm:py-32 lg:px-8">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
              <div className="text-left">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                  Supercharge your
                  <br />
                  <span className="border-b-4 border-white px-2"><TypedText words={["leadflow", "workflow", "cashflow"]} /></span>.
                </h1>
                <p className="mt-6 text-lg leading-8 text-white/80">
                  Agent Hub is the first all-in-one platform specifically designed for insurance underwriters and IMOs to streamline their entire sales process. Built for insurance professionals who value efficiency and accuracy.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
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
              <div className="relative w-full h-full flex justify-center items-center lg:-mr-4">
                <img 
                  src="/lovable-uploads/1988b835-79ca-409a-9adc-d3a1794b7286.png"
                  alt="SureHelp Dashboard"
                  className="w-[85%] md:w-[90%] h-auto rounded-lg shadow-2xl transform lg:scale-105"
                />
                <div className="absolute -inset-x-20 -top-20 -bottom-20 bg-gradient-to-t from-[#002DCB]/30 to-transparent opacity-30 blur-3xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Section */}
        <div className="relative w-full py-24">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
                Streamlined Sales Workflow
              </h2>
              <p className="text-lg leading-8 text-white/80 max-w-2xl mx-auto">
                Experience a seamlessly integrated platform designed to optimize every step of your insurance sales process
              </p>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block relative h-[600px]">
              {/* SVG Connector Lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600">
                <path
                  d="M400,150 A150,150 0 0,1 650,300 A150,150 0 0,1 400,450 A150,150 0 0,1 150,300 A150,150 0 0,1 400,150"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                />
              </svg>
              
              {workflowStages.map((stage, index) => {
                const angle = (index * 90 * Math.PI) / 180;
                const radius = 200;
                const centerX = 400;
                const centerY = 300;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);

                return (
                  <div
                    key={stage.title}
                    className="absolute w-64 animate-fade-in"
                    style={{
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                      animationDelay: `${index * 150}ms`,
                    }}
                  >
                    <div className="p-6 rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 transition-all duration-300 hover:scale-105 group">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-3 rounded-full bg-white/10 shadow-md group-hover:shadow-lg transition-shadow">
                          <stage.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">
                          {stage.title}
                        </h3>
                        <p className="text-white/80">
                          {stage.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile/Tablet Carousel View */}
            <div className="lg:hidden">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {workflowStages.map((stage, index) => (
                    <CarouselItem key={stage.title} className="md:basis-1/2">
                      <div
                        className={`relative group p-6 rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 transition-all duration-300 hover:scale-105 animate-fade-in h-full`}
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className="p-3 rounded-full bg-white/10 shadow-md group-hover:shadow-lg transition-shadow">
                            <stage.icon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold text-white">
                            {stage.title}
                          </h3>
                          <p className="text-white/80">
                            {stage.description}
                          </p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            </div>

            <div className="mt-16 text-center">
              <Button 
                onClick={() => navigate('/auth')} 
                size="lg"
                className="bg-white text-[#0096C7] hover:bg-white/90"
              >
                Start Your Journey
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
