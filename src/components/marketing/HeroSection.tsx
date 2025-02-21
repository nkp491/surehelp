
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import TypedText from "@/components/ui/typed-text";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative isolate pt-24 w-full">
      <div className="w-full px-6 py-24 sm:py-32 lg:px-8">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
          <div className="text-left">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Supercharge your
              <br />
              <span className="border-b-4 border-white px-2">
                <TypedText words={["leadflow", "workflow", "cashflow"]} />
              </span>.
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/80">
              Agent Hub is the first all-in-one platform specifically designed for insurance underwriters and IMOs to streamline their entire sales process. Built for insurance professionals who value efficiency and accuracy.
            </p>
            <div className="mt-10">
              <Button 
                onClick={() => navigate('/auth')} 
                size="lg"
                className="bg-white/25 text-[#33C3F0] hover:bg-white"
              >
                Get Started
              </Button>
            </div>
          </div>
          <div className="relative w-full h-full flex justify-center items-center lg:-ml-4">
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
  );
};

export default HeroSection;
