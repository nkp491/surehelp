import Navigation from "./Navigation";
import ProfileMenu from "./ProfileMenu";
import MetricsSection from "../dashboard/MetricsSection";
import { useLocation } from "react-router-dom";
import { MetricsProvider } from "@/contexts/MetricsContext";

const Header = () => {
  const location = useLocation();
  const showMetrics = location.pathname === '/assessment';

  return (
    <header className="bg-white">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex justify-between items-center h-[98px] px-8">
          <div>
            <img 
              src="/lovable-uploads/dcabcc30-0eb6-4b0b-9ff2-fbc393e364c8.png" 
              alt="SureHelp" 
              className="h-[40px] w-auto"
            />
          </div>
          <div className="flex items-center gap-8">
            <Navigation />
            <ProfileMenu />
          </div>
        </div>
        
        {showMetrics && (
          <div className="relative w-full h-[129px] bg-white">
            <div className="max-w-[1200px] mx-auto">
              <MetricsProvider>
                <MetricsSection />
              </MetricsProvider>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;