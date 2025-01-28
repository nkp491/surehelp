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
          <div className="flex items-center gap-8">
            <h1 className="text-[#014874] text-[32px] font-bold tracking-wide">
              SureHelp
            </h1>
            <Navigation />
          </div>
          <ProfileMenu />
        </div>
        
        {showMetrics && (
          <div className="relative w-full h-[129px] bg-white shadow-[0px_2px_6px_#ABABAB]">
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